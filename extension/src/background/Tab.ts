import type {
  XStateInspectReadEvent,
  XStateInspectSendEvent,
} from 'xstate-ninja'
import { isInitMessage, isLogMessage } from '../messages'
import type { InitMessage, LogMessage } from '../messages'

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
    if (devPort) {
      this.setDevPort(devPort)
    }

    // set up message forwarding from page -> devtools
    port.onMessage.addListener((message) => {
      this.devPort?.postMessage(message)
    })

    this.setDevPort = this.setDevPort.bind(this)
    this.unsetDevPort = this.unsetDevPort.bind(this)
    this.forwardMessageToTab = this.forwardMessageToTab.bind(this)
  }

  setDevPort(port: chrome.runtime.Port) {
    this.devPort = port
    // set up message forwarding devtools -> page
    this.devPort.onMessage.addListener(this.forwardMessageToTab)
  }

  forwardMessageToTab(
    message:
      | InitMessage
      | LogMessage
      | XStateInspectSendEvent
      | XStateInspectReadEvent,
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
