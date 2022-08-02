import { InterpreterStatus } from 'xstate'
import type { AnyEventObject, AnyActorRef, AnyInterpreter } from 'xstate'
import {
  InspectedEventObject,
  InspectedActorObject,
  SerializedExtendedInspectedActorObject,
  SerializedInspectedActorObject,
} from './types'
import { isInterpreterLike, serializeActor } from './utils'

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
    [sessionId: string]: SerializedInspectedActorObject
    // [sessionId: string]: {
    //   sessionId: string
    //   parent?: string
    //   machine?: string // JSON-stringified
    //   snapshot: string // JSON-stringified
    //   createdAt: number
    // }
  }

  // custom xstate-ninja events
  inspectedActors: {
    [sessionId: string]: SerializedExtendedInspectedActorObject
  }
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
// TODO we need to include serialized inspected actor just like in actors event
export interface XStateInspectActorEvent {
  type: '@xstate/inspect.actor'
  sessionId: string
  machine?: string // JSON-stringified machine definition
  createdAt: number
  // custom xstate-ninja events
  history: XStateInspectUpdateEvent[]
  inspectedActor: SerializedExtendedInspectedActorObject
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

// custom xstate-ninja event to notify client about an un registered actor (no more updates will be coming)
// Inspector -> Client
export interface XStateNinjaUnregisterEvent {
  type: '@xstate-ninja/unregister'
  sessionId: string
  snapshot: string
  status: 0 | 1 | 2
  dead: boolean
  createdAt: number
}

export type XStateInspectAnyEvent =
  | XStateInspectReadEvent
  | XStateInspectSendEvent
  | XStateInspectUpdateEvent
  | XStateInspectActorEvent
  | XStateInspectActorsEvent
  | XStateInspectConnectEvent
  | XStateInspectConnectedEvent
  | XStateNinjaUnregisterEvent

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

export class ActorEvent extends CustomEvent<XStateInspectActorEvent> {
  type: EventTypes.actor = EventTypes.actor

  constructor(actor: InspectedActorObject) {
    super(EventTypes.actor, {
      detail: {
        type: EventTypes.actor,
        sessionId: actor.sessionId,
        history: actor.history,
        createdAt: Date.now(),
        machine: isInterpreterLike(actor.actorRef)
          ? JSON.stringify(actor.actorRef.machine)
          : undefined,
        inspectedActor: serializeActor(actor),
      },
    })
  }
}

export class UpdateEvent extends CustomEvent<XStateInspectUpdateEvent> {
  type: EventTypes.update = EventTypes.update

  constructor(actor: InspectedActorObject) {
    super(EventTypes.update, {
      detail: {
        type: EventTypes.update,
        sessionId: actor.sessionId,
        snapshot: JSON.stringify(actor.actorRef.getSnapshot()),
        createdAt: Date.now(),
        // TODO how to get status and event from actors which are not interpreters?
        status: isInterpreterLike(actor.actorRef) ? actor.actorRef.status : 0,
        event: isInterpreterLike(actor.actorRef)
          ? createInspectedEventObject(
              actor.actorRef.state.event,
              actor.sessionId,
            )
          : createInspectedEventObject({ type: '' }, actor.sessionId),
      },
    })
  }
}

export class UnregisterEvent extends CustomEvent<XStateNinjaUnregisterEvent> {
  type: EventTypes.unregister = EventTypes.unregister

  constructor(actor: InspectedActorObject) {
    super(EventTypes.actor, {
      detail: {
        type: EventTypes.unregister,
        sessionId: actor.sessionId,
        snapshot: JSON.stringify(actor.actorRef.getSnapshot()),
        createdAt: Date.now(),
        // TODO how to get status and event from actors which are not interpreters?
        status: isInterpreterLike(actor.actorRef) ? actor.actorRef.status : 0,
        dead: actor.dead,
      },
    })
  }
}

export class ConnectEvent extends CustomEvent<XStateInspectConnectEvent> {
  type: EventTypes.connect = EventTypes.connect

  constructor() {
    super(EventTypes.connect, {
      detail: {
        type: EventTypes.connect,
      },
    })
  }
}

export class ConnectedEvent extends CustomEvent<XStateInspectConnectedEvent> {
  type: EventTypes.connected = EventTypes.connected

  constructor() {
    super(EventTypes.connected, {
      detail: {
        type: EventTypes.connected,
      },
    })
  }
}

export class ReadEvent extends CustomEvent<XStateInspectReadEvent> {
  type: EventTypes.read = EventTypes.read

  constructor() {
    super(EventTypes.read, {
      detail: {
        type: EventTypes.read,
      },
    })
  }
}

export class SendEvent extends CustomEvent<XStateInspectSendEvent> {
  type: EventTypes.send = EventTypes.send

  constructor(event: AnyEventObject, sessionId: string) {
    super(EventTypes.send, {
      detail: {
        type: EventTypes.send,
        sessionId: sessionId,
        event: event,
        createdAt: Date.now(),
      },
    })
  }
}

export class ActorsEvent extends CustomEvent<XStateInspectActorsEvent> {
  type: EventTypes.actors = EventTypes.actors

  constructor(actors: InspectedActorObject[]) {
    super(EventTypes.actors, {
      detail: {
        type: EventTypes.actors,
        actors: actors.reduce(
          (result: Record<string, SerializedInspectedActorObject>, actor) => {
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
        ),
        inspectedActors: actors.reduce(
          (
            result: Record<string, SerializedExtendedInspectedActorObject>,
            actor,
          ) => {
            result[actor.sessionId] = serializeActor(actor)
            return result
          },
          {},
        ),
      },
    })
  }
}

export function isXStateInspectActorsEvent(
  event: XStateInspectAnyEvent,
): event is XStateInspectActorsEvent {
  return event.type === EventTypes.actors
}

export function isXStateInspectActorEvent(
  event: XStateInspectAnyEvent,
): event is XStateInspectActorEvent {
  return event.type === EventTypes.actor
}

export function isXStateNinjaUnregisterEvent(
  event: XStateInspectAnyEvent,
): event is XStateNinjaUnregisterEvent {
  return event.type === EventTypes.unregister
}

export function isXStateInspectUpdateEvent(
  event: XStateInspectAnyEvent,
): event is XStateInspectUpdateEvent {
  return event.type === EventTypes.update
}

// TODO move them to utils
export function createInspectedActorObject(
  actor: AnyActorRef | AnyInterpreter,
): InspectedActorObject {
  const inspectedActor: InspectedActorObject = {
    actorRef: actor,
    sessionId: '',
    parent: undefined,
    snapshot: actor.getSnapshot(),
    machine: undefined,
    events: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 0,
    history: [],
    dead: isInterpreterLike(actor)
      ? actor.state.done || actor.status === InterpreterStatus.Stopped
      : false,
  }

  if (isInterpreterLike(actor)) {
    inspectedActor.sessionId = actor.sessionId
    inspectedActor.parent = actor.parent?.sessionId
    inspectedActor.status = actor.status
    inspectedActor.machine = actor.machine.definition
  } else {
    inspectedActor.sessionId =
      globalThis.crypto?.randomUUID() ?? String(Math.round(Math.random() * 1e6))
  }
  return inspectedActor
}

export function createInspectedEventObject(
  event: AnyEventObject,
  originSessionId: string,
): InspectedEventObject {
  return {
    name: event.type,
    data: event,
    origin: originSessionId,
    createdAt: Date.now(),
  }
}
