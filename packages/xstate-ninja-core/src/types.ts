import type {
  AnyActorRef,
  StateNodeDefinition as StateMachineDefinition,
  EventObject,
  AnyEventObject,
  Subscription,
  TransitionConfig,
  TransitionsConfig,
} from 'xstate'
import type { XStateInspectUpdateEvent } from './events'

export enum ActorTypes {
  unknown,
  machine,
  callback,
  promise,
  observable,
}

export enum TransitionTypes {
  unknown,
  missing, // empty
  forbidden, // red
  guardedAndNoChange, // orange
  taken, // full color
}

export interface InspectedEventObject {
  name: string // Event type
  data: AnyEventObject // The actual event object
  origin?: string // Session ID
  createdAt: number // Timestamp
  // xstate-ninja custom props
  transitionType: TransitionTypes
}

export interface InspectedActorObject {
  actorRef: AnyActorRef
  sessionId: string
  parent?: string // Session ID
  // snapshot is undefined for invoked/spawned callbacks, promises, observables
  snapshot?: any
  machine?: StateMachineDefinition<any, any, AnyEventObject>
  events: InspectedEventObject[]
  createdAt: number // Timestamp
  updatedAt: number // Timestamp
  status?: 0 | 1 | 2 // 0 = not started, 1 = started, 2 = stopped
  // xstate-ninja custom props
  subscription?: Subscription
  history: XStateInspectUpdateEvent[]
  // dead actor is unsubscribed, done or stopped
  dead: boolean
  type: ActorTypes
}

// used for ActorsEvent.inspectedActors custom prop
// and ActorEvent.inspectedActor
export type SerializedExtendedInspectedActorObject = Omit<
  InspectedActorObject,
  'actorRef' | 'subscription' | 'snapshot' | 'machine'
> & {
  snapshot?: string // JSON-stringified
  actorId: string
  machine?: string // JSON-stringified
}

// The same as SerializedExtendedInspectedActorObject with snapshot and machine deserialized. Importanly,
// compared to InspectedActorObject the "actorRef" and "subscription" props are missing
export type DeserializedExtendedInspectedActorObject = Omit<
  SerializedExtendedInspectedActorObject,
  'snapshot' | 'machine'
> & {
  snapshot?: any
  machine?: any
}

// This is used for ActorsEvent.actors
export interface SerializedInspectedActorObject {
  sessionId: string
  parent?: string
  machine?: string // JSON-stringified
  snapshot?: string // JSON-stringified
  createdAt: number
}

export interface ActorUpdate {
  sessionId: string
  actorRef: AnyActorRef
  snapshot?: any
  event: InspectedEventObject
  status: 0 | 1 | 2 // 0 = not started, 1 = started, 2 = stopped
}

export interface ActorRegistration {
  actorRef: AnyActorRef
  sessionId: string
  machine?: StateMachineDefinition<any, any, AnyEventObject>
  createdAt: number
}

export interface XStateDevInterface {
  register: (actorRef: AnyActorRef) => void
  unregister: (actorRef: AnyActorRef) => void
  onRegister: (
    listener: (actorRegistration: ActorRegistration) => void,
  ) => Subscription | void
  actors: {
    [sessionId: string]: InspectedActorObject
  }
  onUpdate: (listener: (update: ActorUpdate) => void) => Subscription | void
}

export interface WindowWithXStateNinja {
  __xstate_ninja__?: XStateDevInterface
}

export type AnyActorRefWithParent = AnyActorRef & {
  parent?: { id: string | number; sessionId: string }
}

// from xstate
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

export function isTransitionConfig(
  entity: any,
): entity is TransitionConfig<any, EventObject> {
  return (
    (entity as TransitionConfig<any, EventObject>).target != null ||
    (entity as TransitionConfig<any, EventObject>).actions != null
  )
}

export function isTransitionsConfigArray(
  transitionsConfig: TransitionsConfig<any, EventObject>,
): transitionsConfig is TransitionsConfigArray<any, EventObject> {
  return Array.isArray(transitionsConfig)
}
