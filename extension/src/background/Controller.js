import { TabKeeper } from './TabKeeper'
import { log, error } from '../utils'
import { EventTypes } from '../EventTypes'

export class Controller {
  constructor() {
    this.tabs = new Map()
    this.devPorts = new Map()
    this.isKeptAlive = false

    this.handleMessageFromDevtoolPanel =
      this.handleMessageFromDevtoolPanel.bind(this)
    this.removeDevPort = this.removeDevPort.bind(this)
    this.removeTab = this.removeTab.bind(this)
    this.keepAlive = this.keepAlive.bind(this)
  }

  start() {
    chrome.runtime.onConnect.addListener((port) => {
      if (
        port.name !== 'xstate-ninja.devtools' &&
        port.name !== 'xstate-ninja.panel' &&
        port.name !== 'xstate-ninja.page'
      ) {
        return
      }
      log('connecting port:', port.name)

      if (port.name === 'xstate-ninja.panel') {
        port.onMessage.addListener(this.handleMessageFromDevtoolPanel)
        port.onDisconnect.addListener(this.removeDevPort)
        port.onDisconnect.removeListener(this.handleMessageFromDevtoolPanel)
      }

      if (port.name === 'xstate-ninja.page') {
        const tab = new TabKeeper(
          port.sender.tab.id,
          port,
          this.devPorts.get(port.sender.tab.id),
        )
        this.tabs.set(tab.id, tab)
        port.onDisconnect.addListener(this.removeTab)
      }

      if (!this.isKeptAlive && port.name === 'xstate-ninja.page') {
        this.keepAlive(port)
      }
      log(
        `Connected tabs: ${this.tabs.size}\nDev panels: ${this.devPorts.size}`,
      )
    })
  }

  handleMessageFromDevtoolPanel(message, port) {
    if (port.name === 'xstate-ninja.panel') {
      this.logDevtoolsMessage(message, port.name)
      if (message.type === EventTypes.init) {
        this.devPorts.set(message.tabId, port)
        const tab = this.tabs.get(message.tabId)
        if (tab) {
          tab.connectDevPort(port)
          port.postMessage({
            type: EventTypes.initDone,
            data: {
              actors: [...tab.actors.entries()],
            },
          })
        }
      }
    } else {
      error(`Invalid port.name: ${port.name}`)
    }
  }

  removeDevPort(port) {
    log('disconnecting port:', port.name)
    for (const [tabId, value] of this.devPorts.entries()) {
      if (value === port) {
        this.devPorts.delete(tabId)
        if (this.tabs.has(tabId)) {
          this.tabs.get(tabId).devPort = null
        }
        break
      }
    }
  }

  removeTab(port) {
    log('disconnecting tab port', port.name)
    for (const [id, tab] of this.tabs.entries()) {
      if (tab.port === port) {
        this.tabs.delete(id)
        break
      }
    }
  }

  // periodically reconnect the page port to keep the background service worker alive
  keepAlive(port) {
    port._timer = setTimeout(this.forceReconnect, 250e3, port)
    // triggered when the tab is closed
    port.onDisconnect.addListener((disconnectedPort) => {
      this.deleteTimer(disconnectedPort)
      if (this.tabs.size > 0) {
        this.keepAlive(this.tabs.values().next().value.port)
      }
    })
    this.isKeptAlive = true
  }

  forceReconnect(port) {
    log('reconnecting the page to keep service worker alive')
    this.deleteTimer(port)
    this.isKeptAlive = false
    port.disconnect()
  }

  deleteTimer(port) {
    if (port._timer) {
      clearTimeout(port._timer)
      delete port._timer
    }
  }

  logDevtoolsMessage({ type, ...msg }, senderName) {
    let bkg = 'gray'
    let args = [msg]
    switch (type) {
      case 'log':
        bkg = 'fuchsia'
        args = [msg.text]
        if (msg.data !== undefined) {
          args.push(msg.data)
        }
        break

      case 'init':
        bkg = 'lime'
        break
    }
    console.log(
      `%c${senderName}:${type}`,
      `background-color: ${bkg}; color: black; padding: 1px 4px;`,
      ...args,
    )
  }
}
