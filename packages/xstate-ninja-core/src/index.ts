import { interpret as xstateInterpret, spawn as xstateSpawn } from 'xstate'
import type {
  InterpreterOptions,
  ActorRef,
  Spawnable,
  AnyStateMachine,
  AnyInterpreter,
  AnyActorRef,
  Subscription,
} from 'xstate'
import type {
  XStateDevInterface,
  WindowWithXStateNinja,
  ActorRegistration,
  ActorUpdate,
  InspectedActorObject,
} from './types'
import { ActorEvent, UpdateEvent, UnregisterEvent } from './events'
import { isInterpreterLike } from './utils'
export type { XStateDevInterface, WindowWithXStateNinja }

// SpawnOptions are not exported from xstate, so here's a copy
interface SpawnOptions {
  name?: string
  autoForward?: boolean
  sync?: boolean
}

// TODO import this into the example instead of the window type
// TODO does this interface need to be injected by the chrome extension?
class XStateNinja implements XStateDevInterface {
  actors: Record<string, InspectedActorObject>
  // TODO changed from
  // actors: Record<
  //   string,
  //   { actor: AnyInterpreter; subscription: Subscription }
  // >

  constructor() {
    this.actors = {}
    this.register = this.register.bind(this)
    this.unregister = this.unregister.bind(this)
    this.onRegister = this.onRegister.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
  }

  register(actor: AnyInterpreter | AnyActorRef) {
    // const detailRegister: RegisterMessage['data'] = {
    //   id: actor.id,
    //   sessionId: actor.sessionId,
    //   initialized: actor.initialized,
    //   status: actor.status,
    //   done: actor.state.done,
    //   stateValue: null,
    // }
    // globalThis.dispatchEvent(
    //   new CustomEvent(MessageTypes.register, {
    //     detail: detailRegister,
    //   }),
    // )
    const inspectedActor = createInspectedActorObject(actor)

    // TODO handle this new register message in the ext
    globalThis.dispatchEvent(new ActorEvent(inspectedActor))

    // TODO we need to keep track of this sub to be able to unsub
    // TODO keep even unsubbed actors around?
    inspectedActor.subscription = actor.subscribe((state) => {
      // const detail: UpdateMessage['data'] = {
      //   id: actor.id,
      //   sessionId: actor.sessionId,
      //   initialized: actor.initialized,
      //   status: actor.status,
      //   // context: state.context,
      //   stateValue: state.value,
      //   changed: state.changed,
      //   done: state.done,
      //   event: sanitizeEventForSerialization(state.event),
      // }
      // TODO handle this new update message in the ext
      globalThis.dispatchEvent(new UpdateEvent(inspectedActor))

      if (state.done) {
        this.unregister(actor)
      }
    })

    // Actor is stopped when the containing component is unmounted
    if (isInterpreterLike(actor)) {
      actor.onStop(() => {
        this.unregister(actor)
      })
    }

    // TODO call this.onUpdate
    this.actors[inspectedActor.sessionId] = inspectedActor
  }

  unregister(actor: AnyInterpreter | AnyActorRef) {
    const [sessionId, inspectedActor] =
      Object.entries(this.actors).find(
        ([, { actorRef }]) => actorRef === actor,
      ) ?? []
    if (sessionId === undefined || inspectedActor === undefined) {
      return
    }
    inspectedActor.subscription?.unsubscribe()

    // TODO handle this new unregister event
    globalThis.dispatchEvent(new UnregisterEvent(inspectedActor))
    delete this.actors[sessionId]
  }

  // TODO implement onRegister
  onRegister(
    listener: (actorRegistration: ActorRegistration) => void,
  ): Subscription {
    listener({} as ActorRegistration)
    return {} as Subscription
  }

  // TODO implement onUpdate
  onUpdate(listener: (update: ActorUpdate) => void): Subscription {
    listener({} as ActorUpdate)
    return {} as Subscription
  }
}

// Usage:
// import { register } from 'xstate-ninja'
//
// const service = interpret(machine)
// register(service)
const xstateNinja = new XStateNinja()
export default xstateNinja

export function interpret(
  machine: AnyStateMachine,
  options: Partial<InterpreterOptions>,
) {
  const service = xstateInterpret(machine, options)
  xstateNinja.register(service)
  return service
}

export function spawn(
  entity: Spawnable,
  nameOrOptions?: string | SpawnOptions,
): ActorRef<any> {
  return xstateSpawn(entity, nameOrOptions)
}

function createInspectedActorObject(
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
  }

  if (isInterpreterLike(actor)) {
    inspectedActor.sessionId = actor.sessionId
    inspectedActor.parent = actor.parent?.sessionId
    inspectedActor.status = actor.status
  } else {
    inspectedActor.sessionId =
      globalThis.crypto?.randomUUID() ?? String(Math.round(Math.random() * 1e6))
  }
  return inspectedActor
}
