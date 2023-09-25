import type { AnyEventObject, SCXML } from 'xstate'
import {
  type ExtensionSettings,
  InspectedActorObject,
  InspectedEventObject,
  SerializedExtendedInspectedActorObject,
  SerializedInspectedActorObject,
} from './types'
import {
  createInspectedEventObject,
  isInterpreterLike,
  serializeInspectedActor,
  serializeMachine,
  serializeSnapshot,
} from './utils'

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
  snapshot?: string // JSON-stringified snapshot
  event: InspectedEventObject
  status: 0 | 1 | 2 // Actor status
  createdAt: number
  // xstate-ninja custom props
  actorId: string
}

// inspector -> client when actor is registered
export interface XStateInspectActorEvent {
  type: '@xstate/inspect.actor'
  sessionId: string
  machine?: string // JSON-stringified machine definition
  createdAt: number
  // custom xstate-ninja props
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
  snapshot?: string
  status: 0 | 1 | 2
  dead: boolean
  diedAt?: number
  createdAt: number
}

// Client -> Inspector Client may notify when dead actors have been cleared.
export interface XStateNinjaDeadActorsClearedEvent {
  type: '@xstate-ninja/deadActorsCleared'
}

export interface XStateNinjaSettingsChangedEvent {
  type: '@xstate-ninja/settingsChanged'
  settings: ExtensionSettings
}

export interface XStateNinjaInspectorCreatedEvent {
  type: '@xstate-ninja/inspectorCreated'
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
  | XStateNinjaDeadActorsClearedEvent
  | XStateNinjaSettingsChangedEvent
  | XStateNinjaInspectorCreatedEvent

// -----------------------------
export enum EventTypes {
  update = '@xstate/inspect.update',
  actor = '@xstate/inspect.actor',
  actors = '@xstate/inspect.actors',
  connect = '@xstate/inspect.connect',
  connected = '@xstate/inspect.connected',
  send = '@xstate/inspect.send',
  read = '@xstate/inspect.read',

  // custom xstate-ninja events
  unregister = '@xstate-ninja/unregister',
  deadActorsCleared = '@xstate-ninja/deadActorsCleared',
  settingsChanged = '@xstate-ninja/settingsChanged',
  inspectorCreated = '@xstate-ninja/inspectorCreated',
}

export class ActorEvent extends CustomEvent<XStateInspectActorEvent> {
  type: EventTypes.actor = EventTypes.actor

  constructor(actor: InspectedActorObject) {
    let machine: string | undefined = undefined
    if (actor.machine != null) {
      machine = serializeMachine(actor.machine)
    }

    super(EventTypes.actor, {
      detail: {
        type: EventTypes.actor,
        sessionId: actor.sessionId,
        createdAt: Date.now(),
        machine,
        inspectedActor: serializeInspectedActor(actor),
      },
    })
  }
}

export class UpdateEvent extends CustomEvent<XStateInspectUpdateEvent> {
  type: EventTypes.update = EventTypes.update

  constructor(
    actor: InspectedActorObject,
    scxmlEvent: SCXML.Event<AnyEventObject>,
  ) {
    super(EventTypes.update, {
      detail: {
        type: EventTypes.update,
        sessionId: actor.sessionId,
        actorId: actor.actorRef.id,
        snapshot: serializeSnapshot(actor.actorRef.getSnapshot()),
        createdAt: Date.now(),
        status: isInterpreterLike(actor.actorRef) ? actor.actorRef.status : 0,
        event: createInspectedEventObject(scxmlEvent, actor.actorRef),
      },
    })
  }
}

export class UnregisterEvent extends CustomEvent<XStateNinjaUnregisterEvent> {
  type: EventTypes.unregister = EventTypes.unregister

  constructor(actor: InspectedActorObject) {
    super(EventTypes.unregister, {
      detail: {
        type: EventTypes.unregister,
        sessionId: actor.sessionId,
        snapshot: serializeSnapshot(actor.actorRef.getSnapshot()),
        createdAt: Date.now(),
        status: isInterpreterLike(actor.actorRef) ? actor.actorRef.status : 0,
        dead: actor.dead,
        diedAt: actor.diedAt,
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
        sessionId,
        event,
        createdAt: Date.now(),
      },
    })
  }
}

export class DeadActorsClearedEvent
  extends CustomEvent<XStateNinjaDeadActorsClearedEvent> {
  type: EventTypes.deadActorsCleared = EventTypes.deadActorsCleared

  constructor() {
    super(EventTypes.deadActorsCleared, {
      detail: {
        type: EventTypes.deadActorsCleared,
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
              machine: actor.machine != null
                ? serializeMachine(actor.machine)
                : undefined,
              snapshot: serializeSnapshot(actor.snapshot),
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
            result[actor.sessionId] = serializeInspectedActor(actor)
            return result
          },
          {},
        ),
      },
    })
  }
}

export class SettingsChangedEvent
  extends CustomEvent<XStateNinjaSettingsChangedEvent> {
  type: EventTypes.settingsChanged = EventTypes.settingsChanged

  constructor(settings: ExtensionSettings) {
    super(EventTypes.settingsChanged, {
      detail: {
        type: EventTypes.settingsChanged,
        settings,
      },
    })
  }
}

export class InspectorCreatedEvent
  extends CustomEvent<XStateNinjaInspectorCreatedEvent> {
  type: EventTypes.inspectorCreated = EventTypes.inspectorCreated

  constructor() {
    super(EventTypes.inspectorCreated, {
      detail: {
        type: EventTypes.inspectorCreated,
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

export function isXStateNinjaDeadActorsClearedEvent(
  event: XStateInspectAnyEvent,
): event is XStateNinjaDeadActorsClearedEvent {
  return event.type === EventTypes.deadActorsCleared
}

export function isXStateNinjaSettingsChangedEvent(
  event: XStateInspectAnyEvent,
): event is XStateNinjaSettingsChangedEvent {
  return event.type === EventTypes.settingsChanged
}

export function isXStateInspectConnectedEvent(
  event: XStateInspectAnyEvent,
): event is XStateInspectConnectedEvent {
  return event.type === EventTypes.connected
}

export function isXStateNinjaInspectorCreatedEvent(
  event: XStateInspectAnyEvent,
): event is XStateNinjaInspectorCreatedEvent {
  return event.type === EventTypes.inspectorCreated
}
