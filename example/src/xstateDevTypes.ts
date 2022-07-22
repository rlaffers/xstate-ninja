import type {
  AnyActorRef,
  StateNodeDefinition as StateMachineDefinition,
  AnyEventObject,
  Subscription,
} from 'xstate'

// TODO move these types to the extension
export interface InspectedEventObject {
  name: string // Event type
  data: AnyEventObject // The actual event object
  origin?: string // Session ID
  createdAt: number // Timestamp
}

export interface InspectedActorObject {
  actorRef: AnyActorRef
  sessionId: string
  parent?: string // Session ID
  snapshot: any
  machine?: StateMachineDefinition<any, any, AnyEventObject> // This is originally StateNodeDefinition (renaming)
  events: InspectedEventObject[]
  createdAt: number // Timestamp
  updatedAt: number // Timestamp
  status: 0 | 1 | 2 // 0 = not started, 1 = started, 2 = stopped
}

export interface ActorUpdate {
  sessionId: string
  actorRef: AnyActorRef
  snapshot: any
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
  ) => Subscription
  actors: {
    [sessionId: string]: InspectedActorObject
  }
  onUpdate: (listener: (update: ActorUpdate) => void) => Subscription
}

export interface WindowWithXStateNinja extends Window {
  __xstate_ninja__: XStateDevInterface
}
