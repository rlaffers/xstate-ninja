import { InterpreterStatus, StateNode } from 'xstate'
import type {
  AnyEventObject,
  AnyActorRef,
  AnyInterpreter,
  EventObject,
  TransitionConfig,
  TransitionsConfig,
  SCXML,
} from 'xstate'
import {
  InspectedEventObject,
  InspectedActorObject,
  SerializedExtendedInspectedActorObject,
  SerializedInspectedActorObject,
  TransitionTypes,
  AnyActorRefWithParent,
} from './types'
import {
  isInterpreterLike,
  serializeActor,
  sanitizeEvent,
  getActorType,
} from './utils'
import { ActorTypes } from './XStateNinja'

// from xstate
// TODO move to types
type TransitionsConfigArray<TContext, TEvent extends EventObject> = Array<
  | (TEvent extends EventObject
      ? TransitionConfig<TContext, TEvent> & {
          event: TEvent['type']
        }
      : never)
  | (TransitionConfig<TContext, TEvent> & {
      event: ''
    })
  | (TransitionConfig<TContext, TEvent> & {
      event: '*'
    })
>

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
  createdAt: number
}

// Client -> Inspector Client may notify when dead actors have been cleared.
export interface XStateNinjaDeadActorsClearedEvent {
  type: '@xstate-ninja/deadActorsCleared'
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
}

export class ActorEvent extends CustomEvent<XStateInspectActorEvent> {
  type: EventTypes.actor = EventTypes.actor

  constructor(actor: InspectedActorObject) {
    super(EventTypes.actor, {
      detail: {
        type: EventTypes.actor,
        sessionId: actor.sessionId,
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

  constructor(
    actor: InspectedActorObject,
    scxmlEvent: SCXML.Event<AnyEventObject>,
  ) {
    const snapshot = actor.actorRef.getSnapshot()
    super(EventTypes.update, {
      detail: {
        type: EventTypes.update,
        sessionId: actor.sessionId,
        actorId: actor.actorRef.id,
        snapshot: snapshot != null ? JSON.stringify(snapshot) : undefined,
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
    const snapshot = actor.actorRef.getSnapshot()
    super(EventTypes.unregister, {
      detail: {
        type: EventTypes.unregister,
        sessionId: actor.sessionId,
        snapshot: snapshot != null ? JSON.stringify(snapshot) : undefined,
        createdAt: Date.now(),
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

export class DeadActorsClearedEvent extends CustomEvent<XStateNinjaDeadActorsClearedEvent> {
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
              machine: JSON.stringify(actor.machine),
              snapshot:
                actor.snapshot != null
                  ? JSON.stringify(actor.snapshot)
                  : undefined,
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

export function isXStateNinjaDeadActorsClearedEvent(
  event: XStateInspectAnyEvent,
): event is XStateNinjaDeadActorsClearedEvent {
  return event.type === EventTypes.deadActorsCleared
}

// TODO move them to utils
export function createInspectedActorObject(
  actor: AnyActorRefWithParent | AnyInterpreter,
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
    status: undefined,
    history: [],
    type: ActorTypes.unknown,
    dead: isInterpreterLike(actor)
      ? actor.initialized &&
        (actor.getSnapshot?.().done ||
          actor.status === InterpreterStatus.Stopped)
      : false,
  }

  inspectedActor.parent = actor.parent?.sessionId
  if (isInterpreterLike(actor)) {
    inspectedActor.sessionId = actor.sessionId
    inspectedActor.status = actor.status
    inspectedActor.machine = actor.machine.definition
    inspectedActor.type = ActorTypes.machine
  } else {
    inspectedActor.sessionId =
      globalThis.crypto?.randomUUID() ?? String(Math.round(Math.random() * 1e6))
    inspectedActor.type = getActorType(actor)
  }
  return inspectedActor
}

export function createInspectedEventObject(
  event: SCXML.Event<AnyEventObject>,
  actor: AnyInterpreter | AnyActorRef,
): InspectedEventObject {
  return {
    name: event.name,
    data: sanitizeEvent(event.data),
    origin: event.origin,
    createdAt: Date.now(),
    transitionType: getTransitionInfo(actor),
  }
}

function getTransitionInfo(
  actor: AnyInterpreter | AnyActorRef,
): TransitionTypes {
  if (isInterpreterLike(actor)) {
    // TODO how does configuration look for parallel states?
    const { configuration, event } = actor.state
    const sortedStateNodes = sortStateNodes(configuration)
    switch (true) {
      case actor.state.changed:
        return TransitionTypes.taken
      case isTransitionGuarded(event.type, sortedStateNodes):
        return TransitionTypes.guardedAndNoChange
      case isTransitionForbidden(event.type, sortedStateNodes):
        return TransitionTypes.forbidden
      default:
        return TransitionTypes.missing
    }
  }
  return TransitionTypes.unknown
}

// Sorts state nodes. The lowest one (the highest order) comes first.
function sortStateNodes(stateNodes: StateNode[]): StateNode[] {
  return stateNodes.slice().sort((a, b) => (a.order < b.order ? -1 : 1))
}

function isTransitionGuarded(eventType: string, sortedStateNodes: StateNode[]) {
  for (const stateNode of sortedStateNodes) {
    if (stateNode.config.on === undefined) {
      continue
    }
    const transitionsConfig = stateNode.config.on
    if (isTransitionsConfigArray(transitionsConfig)) {
      const transitions = transitionsConfig.filter((x) => x.event === eventType)
      return (
        transitions.length > 0 && transitions.every((x) => x.cond !== undefined)
      )
    } else if (transitionsConfig[eventType] !== undefined) {
      const transition = transitionsConfig[eventType]
      if (typeof transition === 'string') {
        return false
      } else if (Array.isArray(transition)) {
        return transition.every(
          (x) => isTransitionConfig(x) && x.cond !== undefined,
        )
      } else if (isTransitionConfig(transition)) {
        return transition.cond !== undefined
      }
    } else if (
      transitionsConfig[eventType] === undefined &&
      Object.prototype.hasOwnProperty.call(transitionsConfig, eventType)
    ) {
      // forbidden transition
      return false
    }
  }
  return false
}

function isTransitionForbidden(
  eventType: string,
  sortedStateNodes: StateNode[],
) {
  for (const stateNode of sortedStateNodes) {
    const transitionsConfig = stateNode.config.on
    if (transitionsConfig === undefined) {
      continue
    }
    if (isTransitionsConfigArray(transitionsConfig)) {
      if (transitionsConfig.some((x) => x.event === eventType)) {
        return false
      }
      continue
    }

    if (
      Object.prototype.hasOwnProperty.call(transitionsConfig, eventType) &&
      transitionsConfig[eventType] === undefined
    ) {
      return true
    }
    if (transitionsConfig[eventType] !== undefined) {
      return false
    }
  }
  return false
}

// TODO move to types
function isTransitionConfig(
  entity: any,
): entity is TransitionConfig<any, EventObject> {
  return (
    (entity as TransitionConfig<any, EventObject>).target != null ||
    (entity as TransitionConfig<any, EventObject>).actions != null
  )
}

function isTransitionsConfigArray(
  transitionsConfig: TransitionsConfig<any, EventObject>,
): transitionsConfig is TransitionsConfigArray<any, EventObject> {
  return Array.isArray(transitionsConfig)
}
