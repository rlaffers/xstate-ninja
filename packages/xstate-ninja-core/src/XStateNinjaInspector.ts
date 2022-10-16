import { toSCXMLEvent } from 'xstate'
import type {
  AnyInterpreter,
  AnyActorRef,
  Subscription,
  AnyEventObject,
  SCXML,
  ActionObject,
} from 'xstate'
import type {
  XStateNinjaInterface,
  ActorRegistration,
  ActorUpdate,
  InspectedActorObject,
  AnyActorRefWithParent,
  WindowWithXStateNinja,
  ParentActor,
} from './types'
import { ActorTypes } from './types'
import {
  isInterpreterLike,
  isEventLike,
  findChildBySessionId,
  createInspectedActorObject,
} from './utils'
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
  InspectorCreatedEvent,
  type SettingsChangedEvent,
} from './events'

export { ActorTypes }

export enum LogLevels {
  error,
  warn,
  info,
  debug,
}

export interface XStateNinjaOptions {
  logLevel?: LogLevels
  enabled?: boolean
}

export class XStateNinjaInspector implements XStateNinjaInterface {
  actors: Record<string, InspectedActorObject>
  logLevel: LogLevels = LogLevels.error
  enabled = true
  trackedActorTypes: ActorTypes[] = [
    ActorTypes.machine,
    ActorTypes.callback,
    ActorTypes.observable,
  ]

  constructor({ logLevel, enabled }: XStateNinjaOptions = {}) {
    this.actors = {}
    this.register = this.register.bind(this)
    this.unregister = this.unregister.bind(this)
    this.onRegister = this.onRegister.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
    this.onConnect = this.onConnect.bind(this)
    this.onRead = this.onRead.bind(this)
    this.onSend = this.onSend.bind(this)
    this.onDeadActorsCleared = this.onDeadActorsCleared.bind(this)
    this.forgetAllChildren = this.forgetAllChildren.bind(this)
    this.isActorTypeTracked = this.isActorTypeTracked.bind(this)
    this.onSettingsChanged = this.onSettingsChanged.bind(this)

    if (logLevel !== undefined) {
      this.setLogLevel(logLevel)
    }

    if (enabled === undefined) {
      this.enabled = !!(globalThis as WindowWithXStateNinja)?.__xstate_ninja__
    }

    globalThis.addEventListener(
      EventTypes.connect,
      this.onConnect as EventListener,
    )
    globalThis.addEventListener(EventTypes.read, this.onRead as EventListener)
    globalThis.addEventListener(EventTypes.send, this.onSend as EventListener)

    globalThis.addEventListener(
      EventTypes.deadActorsCleared,
      this.onDeadActorsCleared as EventListener,
    )

    globalThis.addEventListener(
      EventTypes.settingsChanged,
      this.onSettingsChanged as EventListener,
    )

    globalThis.dispatchEvent(new InspectorCreatedEvent())
  }

  onSettingsChanged(event: SettingsChangedEvent) {
    this.log('received', event)
    const settings = event.detail.settings
    this.trackedActorTypes = settings.trackedActorTypes
  }

  setLogLevel(level: LogLevels) {
    this.logLevel = level
  }

  setEnabled(enabled: boolean) {
    this.enabled =
      !!(globalThis as WindowWithXStateNinja).__xstate_ninja__ && enabled
  }

  isActorTypeTracked(type: ActorTypes): boolean {
    return this.trackedActorTypes.includes(type)
  }

  register(actor: AnyInterpreter | AnyActorRef, parent?: ParentActor) {
    if (!this.enabled) {
      return
    }
    this.log('register actor', actor)

    const inspectedActor = createInspectedActorObject(actor, parent)
    if (!this.isActorTypeTracked(inspectedActor.type)) {
      this.log(`Actor type ${inspectedActor.type} is excluded from tracking.`)
      return
    }

    const actorEvent = new ActorEvent(inspectedActor)
    globalThis.dispatchEvent(actorEvent)

    const notSubscribed = (
      childActor: AnyActorRef | AnyInterpreter,
    ): boolean => {
      if (isInterpreterLike(childActor)) {
        return this.actors[childActor.sessionId] === undefined
      }
      // no session id
      return Object.values(this.actors).every(
        (subscribedActor: InspectedActorObject) =>
          subscribedActor.actorRef.id !== childActor.id ||
          subscribedActor.parent !== inspectedActor.sessionId ||
          isInterpreterLike(subscribedActor.actorRef),
      )
    }

    inspectedActor.subscription = actor.subscribe((stateOrValue: any) => {
      // TODO missing assign actions.
      // TODO test how pure/choose/sendParent/raise/log actions are displayed
      this.log(
        `----- actor updated (${inspectedActor.actorRef.id}) -----`,
        stateOrValue,
      )

      inspectedActor.updatedAt = Date.now()
      if (stateOrValue?.done) {
        inspectedActor.dead = true
      }
      inspectedActor.snapshot = inspectedActor.actorRef.getSnapshot()

      let scxmlEvent: SCXML.Event<AnyEventObject>
      if (isInterpreterLike(inspectedActor.actorRef)) {
        scxmlEvent = inspectedActor.actorRef.state._event
        if (scxmlEvent.origin != null && scxmlEvent.origin.match(/^x:\d/)) {
          const originId = findChildBySessionId(
            inspectedActor.actorRef,
            scxmlEvent.origin,
          )?.id
          if (originId != null) {
            scxmlEvent.origin = `${originId} (${scxmlEvent.origin})`
          }
        }

        // register/unregister invoked actors
        if (stateOrValue.actions) {
          // register newly invoked actors
          stateOrValue.actions
            .filter((x: ActionObject<any, any>) => x.type === 'xstate.start')
            .forEach((startAction: ActionObject<any, any>) => {
              const startedChildActor =
                stateOrValue.children[startAction.activity.id]
              if (startedChildActor) {
                // check that we are not listening to it yet
                if (
                  startedChildActor.sessionId != null &&
                  this.actors[startedChildActor.sessionId]?.actorRef?.id ===
                    startedChildActor.id
                ) {
                  return
                }
                const parent: ParentActor = {
                  id: inspectedActor.actorRef.id,
                  sessionId: inspectedActor.sessionId,
                }
                if (
                  startedChildActor.parent === undefined &&
                  Object.isExtensible(startedChildActor)
                ) {
                  startedChildActor.parent = parent
                }
                this.register(startedChildActor, parent)
              }
            })
          // unregister stopped actors
          stateOrValue.actions
            .filter((x: ActionObject<any, any>) => x.type === 'xstate.stop')
            .forEach((stopAction: ActionObject<any, any>) => {
              const stoppedActorId = stopAction.activity.id
              const stoppedChildActor = Object.values(this.actors).find(
                (x) =>
                  x.actorRef.id === stoppedActorId &&
                  x.parent === inspectedActor.sessionId &&
                  !x.dead,
              )
              if (stoppedChildActor) {
                this.unregister(stoppedChildActor.actorRef)
              }
            })
        }

        // register newly spawned actors
        Object.values(stateOrValue.children as (AnyActorRef | AnyInterpreter)[])
          .filter(notSubscribed)
          .forEach((childActor: AnyActorRefWithParent | AnyInterpreter) => {
            const parent: ParentActor = {
              id: inspectedActor.actorRef.id,
              sessionId: inspectedActor.sessionId,
            }
            if (
              childActor.parent === undefined &&
              Object.isExtensible(childActor)
            ) {
              childActor.parent = parent
            }
            this.register(childActor, parent)
          })
      } else if (isEventLike(stateOrValue)) {
        // callback-based actors are capable of emitting an event-like object
        scxmlEvent = toSCXMLEvent(stateOrValue)
      } else {
        // promise-based actors give us the resolved value. Also, we fall into this case when
        // a callback-based actor sent a string value (implied to be a name of event)
        scxmlEvent = toSCXMLEvent({
          type: `xstate-ninja.emitted-value.${inspectedActor.actorRef.id}`,
          data: stateOrValue,
        })
      }
      const event = new UpdateEvent(inspectedActor, scxmlEvent)

      inspectedActor.history.push(event.detail)
      inspectedActor.events.push(event.detail.event)

      globalThis.dispatchEvent(event)

      if (stateOrValue?.done) {
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
        if (actor.children?.size > 0) {
          this.forgetAllChildren(inspectedActor.sessionId)
        }
      })
    }

    // TODO call this.onRegister()
    this.actors[inspectedActor.sessionId] = inspectedActor
  }

  unregister(actor: AnyInterpreter | AnyActorRef) {
    if (!this.enabled) {
      return
    }
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

  /**
   * Marks all child actors of the given actor (session ID) as dead and
   * unsubscribe from their updates.
   */
  forgetAllChildren(sessionId: string) {
    if (!this.enabled) {
      return
    }
    Object.values(this.actors).forEach((x) => {
      if (x.parent === sessionId) {
        x.dead = true
        this.unregister(x.actorRef)
        if (isInterpreterLike(x.actorRef)) {
          if (x.actorRef.children?.size > 0) {
            this.forgetAllChildren(x.sessionId)
          }
        }
      }
    })
  }

  // TODO implement onRegister
  onRegister(
    listener: (actorRegistration: ActorRegistration) => void,
  ): Subscription | void {
    if (!this.enabled) {
      return
    }
    listener({} as ActorRegistration)
    return {} as Subscription
  }

  // TODO implement onUpdate
  onUpdate(listener: (update: ActorUpdate) => void): Subscription | void {
    listener({} as ActorUpdate)
    return {} as Subscription
  }

  onConnect(event: ConnectEvent) {
    if (!this.enabled) {
      return
    }
    this.log('received', event)
    globalThis.dispatchEvent(new ConnectedEvent())
    globalThis.dispatchEvent(new ActorsEvent(Object.values(this.actors)))
  }

  // TODO implement onRead
  onRead(event: ReadEvent) {
    if (!this.enabled) {
      return
    }
    this.log('received', event)
    console.log('onSend not implemented', event)
  }

  // TODO implement onSend
  onSend(event: SendEvent) {
    if (!this.enabled) {
      return
    }
    this.log('received', event)
    console.log('onSend not implemented', event)
  }

  onDeadActorsCleared() {
    Object.entries(this.actors).forEach(([sessionId, inspectedActor]) => {
      if (inspectedActor.dead) {
        delete this.actors[sessionId]
      }
    })
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
