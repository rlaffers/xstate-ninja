import {
  SettingsChangedEvent,
  isXStateInspectConnectedEvent,
} from 'xstate-ninja'
import type {
  XStateInspectAnyEvent,
  XStateInspectSendEvent,
  XStateInspectReadEvent,
  ExtensionSettings,
} from 'xstate-ninja'
import { isInitMessage, isLogMessage } from '../messages'
import type { AnyMessage } from '../messages'

export class Tab {
  id: number
  port: chrome.runtime.Port
  devPort?: chrome.runtime.Port

  constructor(
    id: number,
    port: chrome.runtime.Port,
    devPort?: chrome.runtime.Port,
  ) {
    if (port.name !== 'xstate-ninja.page') {
      throw new Error(`Invalid port.name: ${port.name}`)
    }
    this.id = id
    this.port = port
    if (devPort) {
      this.setDevPort(devPort)
    }

    // set up message forwarding from page -> devtools
    port.onMessage.addListener((message: XStateInspectAnyEvent) => {
      // TODO test this
      // console.log(
      //   '%creceived msg from page',
      //   'background: orangered; color: black; padding: 1px 5px',
      //   message.type,
      // )
      this.devPort?.postMessage(message)
      if (isXStateInspectConnectedEvent(message)) {
        // console.log(
        //   '%csending settings',
        //   'background: orangered; color: black; padding: 1px 5px',
        // )
        chrome.storage.sync.get('settings', ({ settings }) => {
          this.sendSettingsToTab(settings)
        })
      }
    })

    this.setDevPort = this.setDevPort.bind(this)
    this.unsetDevPort = this.unsetDevPort.bind(this)
    this.forwardMessageToTab = this.forwardMessageToTab.bind(this)
    this.sendSettingsToTab = this.sendSettingsToTab.bind(this)

    // set up extension settings sync -> page
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.settings != null) {
        this.sendSettingsToTab(changes.settings.newValue)
      }
    })
  }

  sendSettingsToTab(settings: ExtensionSettings) {
    this.port.postMessage(new SettingsChangedEvent(settings).detail)
  }

  setDevPort(port: chrome.runtime.Port) {
    this.devPort = port
    // set up message forwarding devtools -> page
    this.devPort.onMessage.addListener(this.forwardMessageToTab)
  }

  forwardMessageToTab(
    message: AnyMessage | XStateInspectSendEvent | XStateInspectReadEvent,
  ) {
    if (isInitMessage(message) || isLogMessage(message)) {
      // these events are handled by the MessageBroker
      return
    }
    this.port.postMessage(message)
  }

  unsetDevPort() {
    this.devPort.onMessage.removeListener(this.forwardMessageToTab)
    this.devPort = null
  }
}
