import type { AnyEventObject } from 'xstate'
import {
  InspectedEventObject,
  InspectedActorObject,
  SerializedInspectedActorObject,
  SerializedInspectedActorObjectSimple,
} from './types'
import { isInterpreterLike, omit } from './utils'

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

  // custom xstate-ninja events
  inspectedActors: SerializedInspectedActorObject[]
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

// inspector -> client when actor is registered
export interface XStateInspectActorEvent {
  type: '@xstate/inspect.actor'
  sessionId: string
  machine?: string // JSON-stringified machine definition
  createdAt: number
  // custom xstate-ninja events
  history: XStateInspectUpdateEvent[]
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

export type XStateInspectAnyEvent =
  | XStateInspectReadEvent
  | XStateInspectSendEvent
  | XStateInspectUpdateEvent
  | XStateInspectActorEvent
  | XStateInspectActorsEvent
  | XStateInspectConnectEvent
  | XStateInspectConnectedEvent

// -----------------------------
// TODO implement these changes in the extension
export enum EventTypes {
  // update = 'xstate-ninja.update',
  update = '@xstate/inspect.update',
  // register = 'xstate-ninja.register',
  actor = '@xstate/inspect.actor',
  actors = '@xstate/inspect.actors',
  connect = '@xstate/inspect.connect',
  connected = '@xstate/inspect.connected',
  send = '@xstate/inspect.send',
  read = '@xstate/inspect.read',

  // custom xstate-ninja events
  unregister = '@xstate-ninja/unregister',
}

export class ActorEvent extends Event implements XStateInspectActorEvent {
  type: EventTypes.actor = EventTypes.actor
  sessionId: string
  createdAt: number
  machine?: string
  history: XStateInspectUpdateEvent[]

  constructor(actor: InspectedActorObject) {
    super(EventTypes.actor)
    this.sessionId = actor.sessionId
    this.history = actor.history
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

export class ConnectEvent extends Event implements XStateInspectConnectEvent {
  type: EventTypes.connect = EventTypes.connect

  constructor() {
    super(EventTypes.connect)
  }
}

export class ConnectedEvent
  extends Event
  implements XStateInspectConnectedEvent
{
  type: EventTypes.connected = EventTypes.connected

  constructor() {
    super(EventTypes.connected)
  }
}

export class ReadEvent extends Event implements XStateInspectReadEvent {
  type: EventTypes.read = EventTypes.read

  constructor() {
    super(EventTypes.read)
  }
}

export class SendEvent extends Event implements XStateInspectSendEvent {
  type: EventTypes.send = EventTypes.send
  sessionId: string
  event: AnyEventObject
  createdAt: number

  constructor(event: AnyEventObject, sessionId: string) {
    super(EventTypes.send)
    this.createdAt = Date.now()
    this.sessionId = sessionId
    this.event = event
  }
}

export class ActorsEvent extends Event implements XStateInspectActorsEvent {
  type: EventTypes.actors = EventTypes.actors
  actors: {
    [sessionId: string]: SerializedInspectedActorObjectSimple
  }

  // custom xstate-ninja events
  inspectedActors: SerializedInspectedActorObject[]

  constructor(actors: InspectedActorObject[]) {
    super(EventTypes.actors)

    this.actors = actors.reduce(
      (result: Record<string, SerializedInspectedActorObjectSimple>, actor) => {
        result[actor.sessionId] = {
          sessionId: actor.sessionId,
          parent: actor.parent,
          machine: JSON.stringify(actor.machine),
          snapshot: JSON.stringify(actor.snapshot),
          createdAt: actor.createdAt,
        }
        return result
      },
      {},
    )

    this.inspectedActors = actors.reduce(
      (result: SerializedInspectedActorObject[], actor) => {
        result.push(this.serializeActor(actor))
        return result
      },
      [],
    )
  }

  serializeActor(actor: InspectedActorObject): SerializedInspectedActorObject {
    const serialized = omit(['actorRef', 'subscription'], actor)
    serialized.snapshot = JSON.stringify(serialized.snapshot)
    if (serialized.machine !== undefined) {
      serialized.machine = JSON.stringify(serialized.machine)
    }
    return serialized as SerializedInspectedActorObject
  }
}
