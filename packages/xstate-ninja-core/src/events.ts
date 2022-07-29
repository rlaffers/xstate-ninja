import type { AnyEventObject } from 'xstate'
import { InspectedEventObject, InspectedActorObject } from './types'
import { isInterpreterLike } from './utils'

// client -> inspector
export interface XStateInspectConnectEvent {
  type: '@xstate/inspect.connect'
}

// inspector -> client response to connect event
export interface XStateInspectConnectedEvent {
  type: '@xstate/inspect.connected'
}

// inspector -> client upon connection
export interface XStateInspectActorsEvent {
  type: '@xstate/inspect.actors'
  actors: {
    [sessionId: string]: {
      sessionId: string
      parent?: string
      machine?: string // JSON-stringified
      snapshot: string // JSON-stringified
      createdAt: number
    }
  }
}

// inspector -> client when actor is registered
export interface XStateInspectActorEvent {
  type: '@xstate/inspect.actor'
  sessionId: string
  machine?: string // JSON-stringified machine definition
  createdAt: number
}

// inspector -> client on actor updates
export interface XStateInspectUpdateEvent {
  type: '@xstate/inspect.update'
  sessionId: string
  snapshot: string // JSON-stringified snapshot
  event: InspectedEventObject
  status: 0 | 1 | 2 // Actor status
  createdAt: number
}

// Client -> Inspector
// The client may send events directly to inspected actors.
export interface XStateInspectSendEvent {
  type: '@xstate/inspect.send'
  sessionId: string
  event: AnyEventObject
  createdAt: number
}

// Client -> Inspector Client may request the ActorsEvent if it goes out of sync.
export interface XStateInspectReadEvent {
  type: '@xstate/inspect.read'
}

// -----------------------------
// TODO implement these changes in the extension
export enum EventTypes {
  // update = 'xstate-ninja.update',
  update = '@xstate/inspect.update',
  // register = 'xstate-ninja.register',
  actor = '@xstate/inspect.actor',

  // custom xstate-ninja events
  unregister = '@xstate-ninja/unregister',
  init = '@xstate-ninja/init',
  initDone = '@xstate-ninja/initDone',
}

export class ActorEvent extends Event implements XStateInspectActorEvent {
  type: EventTypes.actor = EventTypes.actor
  sessionId: string
  createdAt: number
  machine?: string

  constructor(actor: InspectedActorObject) {
    super(EventTypes.actor)
    this.sessionId = actor.sessionId
    if (isInterpreterLike(actor.actorRef)) {
      this.machine = JSON.stringify(actor.actorRef.machine)
    }
    this.createdAt = Date.now()
  }
}

export class UpdateEvent extends Event implements XStateInspectUpdateEvent {
  type: EventTypes.update = EventTypes.update
  sessionId: string
  snapshot: string // JSON-stringified snapshot
  event: InspectedEventObject
  status: 0 | 1 | 2 // Actor status
  createdAt: number

  constructor(actor: InspectedActorObject) {
    super(EventTypes.actor)
    this.createdAt = Date.now()
    this.sessionId = actor.sessionId
    this.snapshot = actor.actorRef.getSnapshot()
    if (isInterpreterLike(actor.actorRef)) {
      this.status = actor.actorRef.status
      const event = actor.actorRef.state.event
      this.event = {
        name: event.type,
        data: event,
        origin: actor.sessionId,
        createdAt: Date.now(),
      }
    } else {
      // TODO how to get status and event from actors which are not interpreters?
      this.status = 0
      this.event = {
        name: '???',
        data: { type: '???' },
        origin: actor.sessionId,
        createdAt: Date.now(),
      }
    }
  }
}

export class UnregisterEvent extends Event {
  type: EventTypes.unregister = EventTypes.unregister
  sessionId: string
  snapshot: string
  status: 0 | 1 | 2
  createdAt: number

  constructor(actor: InspectedActorObject) {
    super(EventTypes.unregister)
    this.createdAt = Date.now()
    this.sessionId = actor.sessionId
    this.snapshot = actor.actorRef.getSnapshot()
    if (isInterpreterLike(actor.actorRef)) {
      this.status = actor.actorRef.status
    } else {
      // TODO how to get status from actors which are not interpreters?
      this.status = 0
    }
  }
}
