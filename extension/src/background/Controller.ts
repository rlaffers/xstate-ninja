import { TabKeeper } from './TabKeeper'
import { log, error } from '../utils'
import {
  MessageTypes,
  isInitMessage,
  isLogMessage,
  type InitMessage,
  type LogMessage,
} from '../messages'

interface IKeptAlivePort extends chrome.runtime.Port {
  _timer: NodeJS.Timeout
}

export class Controller {
  tabs: Map<number, TabKeeper>
  devPorts: Map<number, chrome.runtime.Port>
  isKeptAlive: boolean

  constructor() {
    this.tabs = new Map()
    this.devPorts = new Map()
    this.isKeptAlive = false

    this.handleMessageFromDevtoolPanel =
      this.handleMessageFromDevtoolPanel.bind(this)
    this.removeDevPort = this.removeDevPort.bind(this)
    this.removeTab = this.removeTab.bind(this)
    this.keepAlive = this.keepAlive.bind(this)
    this.forceReconnect = this.forceReconnect.bind(this)
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
        port.onDisconnect.addListener((port) => {
          this.removeDevPort(port)
          port.onMessage.removeListener(this.handleMessageFromDevtoolPanel)
        })
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
        this.keepAlive(port as IKeptAlivePort)
      }
      log(
        `Connected tabs: ${this.tabs.size}\nDev panels: ${this.devPorts.size}`,
      )
    })
  }

  handleMessageFromDevtoolPanel(
    message: InitMessage | LogMessage,
    port: chrome.runtime.Port,
  ) {
    if (port.name === 'xstate-ninja.panel') {
      this.logDevtoolsMessage(message, port.name)
      if (isInitMessage(message)) {
        this.devPorts.set(message.tabId, port)
        const tab = this.tabs.get(message.tabId)
        if (tab) {
          tab.connectDevPort(port)
          port.postMessage({
            type: MessageTypes.initDone,
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

  removeDevPort(port: chrome.runtime.Port) {
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

  removeTab(port: chrome.runtime.Port) {
    log('disconnecting tab port', port.name)
    for (const [id, tab] of this.tabs.entries()) {
      if (tab.port === port) {
        this.tabs.delete(id)
        break
      }
    }
  }

  // periodically reconnect the page port to keep the background service worker alive
  keepAlive(port: IKeptAlivePort) {
    port._timer = setTimeout(this.forceReconnect, 250e3, port)
    // triggered when the tab is closed
    port.onDisconnect.addListener((disconnectedPort) => {
      this.deleteTimer(disconnectedPort as IKeptAlivePort)
      if (this.tabs.size > 0) {
        this.keepAlive(this.tabs.values().next().value.port)
      }
    })
    this.isKeptAlive = true
  }

  forceReconnect(port: IKeptAlivePort) {
    this.deleteTimer(port)
    this.isKeptAlive = false
    port.disconnect()
  }

  deleteTimer(port: IKeptAlivePort) {
    if (port._timer) {
      clearTimeout(port._timer)
      delete port._timer
    }
  }

  logDevtoolsMessage(message: InitMessage | LogMessage, senderName: string) {
    let bkg = 'gray'
    let args: any[]
    const { type, ...rest } = message
    if (isLogMessage(message)) {
      bkg = 'fuchsia'
      const { text, data } = rest as { text: string; data?: any }
      args = [text]
      if (data !== undefined) {
        args.push(data)
      }
    } else if (isInitMessage(message)) {
      bkg = 'lime'
      args = [rest]
    }
    console.log(
      `%c${senderName}:${type}`,
      `background-color: ${bkg}; color: black; padding: 1px 4px;`,
      ...args,
    )
  }
}
