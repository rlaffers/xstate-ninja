import type { AnyInterpreter, AnyActorRef, Subscription } from 'xstate'
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
  createInspectedActorObject,
  createInspectedEventObject,
} from './events'

export enum LogLevels {
  error,
  warn,
  info,
  debug,
}

export interface XStateNinjaOptions {
  logLevel?: LogLevels
}

// TODO make option `enabled` and disable everything in the production mode by default
// TODO bypass everything if the web extension is not installed (check globalThis.__xstate_ninja__)
export class XStateNinja implements XStateDevInterface {
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

    globalThis.addEventListener(
      EventTypes.connect,
      this.onConnect as EventListener,
    )
    globalThis.addEventListener(EventTypes.read, this.onRead as EventListener)
    globalThis.addEventListener(EventTypes.send, this.onSend as EventListener)
  }

  register(actor: AnyInterpreter | AnyActorRef) {
    this.log('register actor', actor)
    const inspectedActor = createInspectedActorObject(actor)

    const actorEvent = new ActorEvent(inspectedActor)
    this.log('actor event', actorEvent)
    globalThis.dispatchEvent(actorEvent)

    inspectedActor.subscription = actor.subscribe((state) => {
      inspectedActor.updatedAt = Date.now()
      if (state.done) {
        inspectedActor.dead = true
      }
      const event = new UpdateEvent(inspectedActor)
      this.log('update event', event)

      inspectedActor.history.push(event.detail)
      inspectedActor.events.push(
        createInspectedEventObject(
          state?.event ?? { type: '' },
          inspectedActor.sessionId,
        ),
      )

      globalThis.dispatchEvent(event)

      if (state.done) {
        this.unregister(actor)
      }

      // TODO call this.onUpdate()
    })

    // Actor is stopped when the containing component is unmounted
    if (isInterpreterLike(actor)) {
      actor.onStop(() => {
        inspectedActor.status = actor.status
        inspectedActor.dead = true
        this.unregister(actor)
      })
    }

    // TODO call this.onRegister()
    this.actors[inspectedActor.sessionId] = inspectedActor
  }

  unregister(actor: AnyInterpreter | AnyActorRef) {
    this.log('unregister actor', actor)
    const [sessionId, inspectedActor] =
      Object.entries(this.actors).find(
        ([, { actorRef }]) => actorRef === actor,
      ) ?? []
    if (sessionId === undefined || inspectedActor === undefined) {
      return
    }
    inspectedActor.subscription?.unsubscribe()
    inspectedActor.dead = true
    inspectedActor.updatedAt = Date.now()

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
    globalThis.dispatchEvent(new ConnectedEvent())
    globalThis.dispatchEvent(new ActorsEvent(Object.values(this.actors)))
  }

  // TODO implement onRead
  onRead(event: ReadEvent) {
    this.log('received', event)
    console.log('onSend not implemented', event)
  }

  // TODO implement onSend
  onSend(event: SendEvent) {
    this.log('received', event)
    console.log('onSend not implemented', event)
  }

  log(...args: any[]) {
    if (this.logLevel >= LogLevels.debug) {
      console.log(
        '%c[xstate-ninja]',
        'background-color: lightgray; color: black; padding: 1px 2px;',
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
