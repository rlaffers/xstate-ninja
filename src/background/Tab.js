import { log } from '../utils'
import { EventTypes } from '../EventTypes'

export class Tab {
  constructor(id, port, devPort = null) {
    if (port.name !== 'xstate-ninja.page') {
      throw new Error(`Invalid port.name: ${port.name}`)
    }
    this.id = id
    this.port = port
    this.devPort = devPort
    this.actors = {}
    this.sendUpdatesToDevPanel = this.sendUpdatesToDevPanel.bind(this)
    this.registerActor = this.registerActor.bind(this)
    this.unregisterActor = this.unregisterActor.bind(this)
    port.onMessage.addListener(this.sendUpdatesToDevPanel)
    port.onMessage.addListener(this.registerActor)
    port.onMessage.addListener(this.unregisterActor)
    port.onDisconnect.removeListener(this.sendUpdatesToDevPanel)
    port.onDisconnect.removeListener(this.unregisterActor)
  }

  sendUpdatesToDevPanel(message) {
    log(`→ message from tab ${this.id}:`, message)
    if (this.devPort == null) {
      log(`No dev port for tab ${this.id}. Devtools not open?`)
      return
    }
    if (message.type === EventTypes.update) {
      this.devPort.postMessage(message)
    }
  }

  registerActor(message) {
    if (message.type === EventTypes.register) {
      this.actors[message.data.sessionId] = message.data.id
      if (this.devPort != null) {
        this.devPort.postMessage(message)
      }
    }
  }

  unregisterActor(message) {
    if (message.type === EventTypes.unregister) {
      delete this.actors[message.data.sessionId]
      if (this.devPort != null) {
        this.devPort.postMessage(message)
      }
    }
  }
}
