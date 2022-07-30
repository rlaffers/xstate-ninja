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
  ActorRegistration,
  ActorUpdate,
  InspectedActorObject,
} from './types'
import { isInterpreterLike } from './utils'
import {
  ActorEvent,
  ActorsEvent,
  UpdateEvent,
  UnregisterEvent,
  ConnectEvent,
  ConnectedEvent,
  ReadEvent,
  SendEvent,
  EventTypes,
} from './events'
// export { EventTypes } from './events'
// export { ActorEvent, UpdateEvent, UnregisterEvent }
export * from './events'
export * from './types'
// export type { XStateDevInterface, WindowWithXStateNinja }

// SpawnOptions are not exported from xstate, so here's a copy
interface SpawnOptions {
  name?: string
  autoForward?: boolean
  sync?: boolean
}

enum LogLevels {
  error,
  warn,
  info,
  debug,
}

interface XStateNinjaOptions {
  logLevel?: LogLevels
}

class XStateNinja implements XStateDevInterface {
  actors: Record<string, InspectedActorObject>
  logLevel: LogLevels = LogLevels.error

  constructor({ logLevel }: XStateNinjaOptions = {}) {
    this.actors = {}
    this.register = this.register.bind(this)
    this.unregister = this.unregister.bind(this)
    this.onRegister = this.onRegister.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
    this.onConnect = this.onConnect.bind(this)
    this.onRead = this.onRead.bind(this)
    this.onSend = this.onSend.bind(this)

    if (logLevel !== undefined) {
      this.logLevel = logLevel
    }

    window.addEventListener(EventTypes.connect, this.onConnect as EventListener)
    window.addEventListener(EventTypes.read, this.onRead as EventListener)
    window.addEventListener(EventTypes.send, this.onSend as EventListener)
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
      const event = new UpdateEvent(inspectedActor)
      globalThis.dispatchEvent(event)

      inspectedActor.history.push(event)
      // TODO push InspectedEventObject into inspectedActor.events

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

    // TODO call this.onUpdate()

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

  onConnect(event: ConnectEvent) {
    this.log('received', event)
    window.dispatchEvent(new ConnectedEvent())
    window.dispatchEvent(new ActorsEvent(Object.values(this.actors)))
  }

  // TODO implement onRead
  onRead(event: ReadEvent) {
    console.log('onSend not implemented', event)
  }

  // TODO implement onSend
  onSend(event: SendEvent) {
    console.log('onSend not implemented', event)
  }

  log(...args: any[]) {
    if (this.logLevel >= LogLevels.debug) {
      console.log(
        '%c[xstate-ninja]',
        'background-color: gray; color: black; padding: 1px 2px;',
        ...args,
      )
    }
  }

  error(...args: any[]) {
    if (this.logLevel >= LogLevels.error) {
      console.log(
        '%c[xstate-ninja]',
        'background-color: red; color: black; padding: 1px 2px;',
        ...args,
      )
    }
  }

  warn(...args: any[]) {
    if (this.logLevel >= LogLevels.warn) {
      console.log(
        '%c[xstate-ninja]',
        'background-color: orange; color: black; padding: 1px 2px;',
        ...args,
      )
    }
  }

  info(...args: any[]) {
    if (this.logLevel >= LogLevels.info) {
      console.log(
        '%c[xstate-ninja]',
        'background-color: teal; color: black; padding: 1px 2px;',
        ...args,
      )
    }
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
  options?: Partial<InterpreterOptions>,
) {
  const service = xstateInterpret(machine, options)
  xstateNinja.register(service)
  return service
}

export function spawn(
  entity: Spawnable,
  nameOrOptions?: string | SpawnOptions,
): ActorRef<any> {
  const service = xstateSpawn(entity, nameOrOptions)
  xstateNinja.register(service)
  return service
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
    history: [],
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
