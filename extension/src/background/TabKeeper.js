import { log } from '../utils'
import { EventTypes } from '../EventTypes'

export class TabKeeper {
  constructor(id, port, devPort = null) {
    if (port.name !== 'xstate-ninja.page') {
      throw new Error(`Invalid port.name: ${port.name}`)
    }
    this.id = id
    this.port = port
    this.devPort = devPort
    this.actors = new Map()
    this.onUpdateMessage = this.onUpdateMessage.bind(this)
    this.registerActor = this.registerActor.bind(this)
    this.unregisterActor = this.unregisterActor.bind(this)
    this.connectDevPort = this.connectDevPort.bind(this)
    port.onMessage.addListener(this.onUpdateMessage)
    port.onMessage.addListener(this.registerActor)
    port.onMessage.addListener(this.unregisterActor)
    port.onDisconnect.removeListener(this.onUpdateMessage)
    port.onDisconnect.removeListener(this.unregisterActor)
  }

  connectDevPort(port) {
    this.devPort = port
  }

  onUpdateMessage(message) {
    log(`→ message from tab ${this.id}:`, message)
    if (message.type !== EventTypes.update) {
      return
    }
    const { sessionId } = message.data
    const actor = this.actors.get(sessionId)
    if (!actor) {
      console.error(`No actor sessionId=${sessionId} registered in this tab!`)
      return
    }
    actor.history.push(message)
    actor.stateValue = message.data.stateValue
    actor.initialized = message.data.initialized
    actor.status = message.data.status
    this.actors.set(sessionId, actor)

    if (this.devPort == null) {
      log(`No dev port for tab ${this.id}. Devtools not open?`)
    } else {
      this.devPort.postMessage(message)
    }
  }

  registerActor(message) {
    if (message.type === EventTypes.register) {
      const { id, sessionId, initialized, status } = message.data
      this.actors.set(message.data.sessionId, {
        id,
        sessionId,
        initialized,
        status,
        stateValue: undefined,
        history: [],
      })
      if (this.devPort != null) {
        this.devPort.postMessage(message)
      }
    }
  }

  unregisterActor(message) {
    if (message.type === EventTypes.unregister) {
      this.actors.delete(message.data.sessionId)
      if (this.devPort != null) {
        this.devPort.postMessage(message)
      }
    }
  }
}
