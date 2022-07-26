import { log } from '../utils'
import {
  MessageTypes,
  type UpdateMessage,
  type RegisterMessage,
  type UnregisterMessage,
} from '../messages'
import type { Actor } from '../actor'

export class TabKeeper {
  id: number
  port: chrome.runtime.Port
  devPort: chrome.runtime.Port
  actors: Map<string, Actor>

  constructor(
    id: number,
    port: chrome.runtime.Port,
    devPort: chrome.runtime.Port = null,
  ) {
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
  }

  connectDevPort(port: chrome.runtime.Port) {
    this.devPort = port
  }

  onUpdateMessage(message: UpdateMessage) {
    log(`→ message from tab ${this.id}:`, message)
    if (message.type !== MessageTypes.update) {
      return
    }
    const { sessionId } = message.data
    const actor = this.actors.get(sessionId)
    if (!actor) {
      console.error(`No actor sessionId=${sessionId} registered in this tab!`)
      return
    }
    actor.history.push(message.data)
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

  registerActor(message: RegisterMessage) {
    if (message.type === MessageTypes.register) {
      const { id, sessionId, initialized, status, done } = message.data
      this.actors.set(message.data.sessionId, {
        id,
        sessionId,
        initialized,
        status,
        done,
        stateValue: null,
        dead: status === 2 || done,
        history: [],
      })
      if (this.devPort != null) {
        this.devPort.postMessage(message)
      }
    }
  }

  unregisterActor(message: UnregisterMessage) {
    if (message.type === MessageTypes.unregister) {
      this.actors.delete(message.data.sessionId)
      if (this.devPort != null) {
        this.devPort.postMessage(message)
      }
    }
  }
}
