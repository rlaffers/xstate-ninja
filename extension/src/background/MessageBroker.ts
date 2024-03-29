import { ConnectEvent, isXStateNinjaDeadActorsClearedEvent } from 'xstate-ninja'
import { Tab } from './Tab'
import { error, log } from '../utils'
import {
  type AnyMessage,
  isInitMessage,
  isLogMessage,
  type KeepAliveMessage,
  MessageTypes,
} from '../messages'

/**
 * Connects the devtools script with the page. Keeps the background service worker alive.
 * There is a single message broker for serving all tabs.
 */
export class MessageBroker {
  tabs: Map<number, Tab>
  devPorts: Map<number, chrome.runtime.Port>
  isKeptAlive: boolean

  constructor() {
    this.tabs = new Map()
    this.devPorts = new Map()
    this.isKeptAlive = false

    this.onInitMessageFromDevtoolsPanel = this.onInitMessageFromDevtoolsPanel.bind(this)
    this.logDevtoolsMessage = this.logDevtoolsMessage.bind(this)
    this.removeDevPort = this.removeDevPort.bind(this)
    this.removeTab = this.removeTab.bind(this)
    this.keepAlive = this.keepAlive.bind(this)
    this.forwardDeadActorsClearedMessage = this.forwardDeadActorsClearedMessage.bind(this)
  }

  start() {
    chrome.runtime.onConnect.addListener((port) => {
      if (
        port.name !== 'xstate-ninja.devtools' &&
        port.name !== 'xstate-ninja.panel' &&
        port.name !== 'xstate-ninja.page'
      ) {
        return false
      }
      log('connecting port:', port.name)

      if (port.name === 'xstate-ninja.page') {
        if (port.sender?.tab?.id == null) {
          console.error('Missing sender id in the port object', port)
          return false
        }
        const tab = new Tab(port.sender.tab.id, port, this.devPorts.get(port.sender.tab.id))
        this.tabs.set(tab.id, tab)
        port.onDisconnect.addListener(this.removeTab)

        // if the devtools are open already, send the connect event
        if (tab.devPort) {
          tab.port.postMessage(new ConnectEvent().detail)
        }
      }

      if (port.name === 'xstate-ninja.panel') {
        port.onMessage.addListener(this.logDevtoolsMessage)
        port.onMessage.addListener(this.onInitMessageFromDevtoolsPanel)
        port.onMessage.addListener(this.forwardDeadActorsClearedMessage)
        port.onDisconnect.addListener((port) => {
          this.removeDevPort(port)
          port.onMessage.removeListener(this.logDevtoolsMessage)
          port.onMessage.removeListener(this.onInitMessageFromDevtoolsPanel)
          port.onMessage.removeListener(this.forwardDeadActorsClearedMessage)
        })
      }

      if (!this.isKeptAlive && port.name === 'xstate-ninja.page') {
        this.keepAlive(port)
      }
      log(`Connected tabs: ${this.tabs.size}\nDev panels: ${this.devPorts.size}`)
    })
  }

  onInitMessageFromDevtoolsPanel(message: AnyMessage, devPort: chrome.runtime.Port) {
    if (devPort.name !== 'xstate-ninja.panel') {
      error(`Invalid port.name: ${devPort.name}`)
      return
    }

    if (isInitMessage(message)) {
      this.devPorts.set(message.tabId, devPort)
      const tab = this.tabs.get(message.tabId)
      if (tab) {
        tab.setDevPort(devPort)
        tab.port.postMessage(new ConnectEvent().detail)
      }
    }
  }

  forwardDeadActorsClearedMessage(message: AnyMessage, devPort: chrome.runtime.Port) {
    if (isXStateNinjaDeadActorsClearedEvent(message)) {
      const tab = this.getTab(devPort)
      if (tab) {
        tab.port.postMessage(message)
      }
    }
  }

  /**
   * Returns tab corresponding to the given devPort.
   */
  getTab(devPort: chrome.runtime.Port): Tab | null {
    for (const [tabId, value] of this.devPorts.entries()) {
      if (value === devPort) {
        return this.tabs.get(tabId) ?? null
      }
    }
    return null
  }

  removeDevPort(port: chrome.runtime.Port) {
    log('disconnecting port:', port.name)
    for (const [tabId, value] of this.devPorts.entries()) {
      if (value === port) {
        this.devPorts.delete(tabId)
        const tab = this.tabs.get(tabId)
        if (tab) {
          tab.unsetDevPort()
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
  keepAlive(port: chrome.runtime.Port) {
    if (this.isKeptAlive) {
      return
    }
    const timer = setInterval(
      () => {
        const msg: KeepAliveMessage = {
          type: MessageTypes.keepAlive,
        }
        port.postMessage(msg)
      },
      10e3,
      port,
    )
    // triggered when the tab is closed
    port.onDisconnect.addListener(() => {
      clearTimeout(timer)
      this.isKeptAlive = false
      if (this.tabs.size > 0) {
        this.keepAlive(this.tabs.values().next().value.port)
      }
    })
    this.isKeptAlive = true
  }

  logDevtoolsMessage(message: AnyMessage, port: chrome.runtime.Port) {
    let bkg = 'gray'
    let args: any[] = []
    const { type, ...rest } = message
    if (isLogMessage(message)) {
      bkg = 'fuchsia'
      const { text, data, color } = rest as {
        text: string
        data?: any
        color?: string
      }
      args = [text]
      if (data !== undefined) {
        args.push(data)
      }
      if (color) {
        bkg = color
      }
    } else if (isInitMessage(message)) {
      bkg = 'lime'
      args = [rest]
    }
    console.log(
      `%c${port.name}:${type}`,
      `background-color: ${bkg}; color: black; padding: 1px 4px;`,
      ...args,
    )
  }
}
