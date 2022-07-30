// TODO eliminate this script. This stuff is provided by the npm package
import type { AnyEventObject, AnyInterpreter, Subscription } from 'xstate'
import {
  MessageTypes,
  type RegisterMessage,
  type UnregisterMessage,
  type UpdateMessage,
} from '../messages'
;(function () {
  const namespace = '__xstate_ninja__'

  function sanitizeEventForSerialization(event: AnyEventObject) {
    if (event == null) {
      return event
    }
    let safeEvent: AnyEventObject
    try {
      safeEvent = structuredClone(event)
    } catch (e) {
      Object.keys(event).forEach((key) => {
        if (typeof event[key] === 'function') {
          event[key] = null
        }
      })
      try {
        safeEvent = structuredClone(event)
      } catch (e) {
        safeEvent = {
          type: event.type,
        }
      }
    }
    return safeEvent
  }

  class XStateNinja {
    actors: Record<
      string,
      { actor: AnyInterpreter; subscription: Subscription }
    >

    constructor() {
      this.actors = {}
    }

    register(actor: AnyInterpreter) {
      const detailRegister: RegisterMessage['data'] = {
        id: actor.id,
        sessionId: actor.sessionId,
        initialized: actor.initialized,
        status: actor.status,
        done: actor.state.done,
        stateValue: null,
      }
      window.dispatchEvent(
        new CustomEvent(MessageTypes.register, {
          detail: detailRegister,
        }),
      )

      const subscription = actor.subscribe((state) => {
        const detail: UpdateMessage['data'] = {
          id: actor.id,
          sessionId: actor.sessionId,
          initialized: actor.initialized,
          status: actor.status,
          // context: state.context,
          stateValue: state.value,
          changed: state.changed,
          done: state.done,
          event: sanitizeEventForSerialization(state.event),
        }
        window.dispatchEvent(
          new CustomEvent(MessageTypes.update, {
            detail,
          }),
        )

        if (state.done) {
          this.unregister(actor)
        }
      })

      // Actor is stopped when the surrounding component is unmounted
      actor.onStop(() => {
        this.unregister(actor)
      })

      this.actors[actor.sessionId] = { subscription, actor }
    }

    /**
     * @param {Interpreter} actor
     */
    unregister(actor: AnyInterpreter) {
      const { subscription } = this.actors[actor.sessionId] ?? {}
      if (!subscription) {
        return
      }
      subscription.unsubscribe()
      const detail: UnregisterMessage['data'] = {
        id: actor.id,
        sessionId: actor.sessionId,
        status: actor.status,
        initialized: actor.initialized,
        stateValue: actor.state.value,
        changed: actor.state.changed,
        done: actor.state.done,
      }
      window.dispatchEvent(
        new CustomEvent(MessageTypes.unregister, {
          detail,
        }),
      )
      delete this.actors[actor.sessionId]
    }

    /**
     * This method is called over chrome.devtools.inspectedWindow.eval(). Therefore it must
     * return serializable data. Chrome will structurely clone these data with these caveats:
     * 1. Objects may contain functions but they will be converted into objects. Function props, if any will be cloned.
     * 2. Objects will be cloned with own props only (no props inherited from object's prototype)
     * 3. Circular dependencies will cause a failure. The eval callback will receive E_PROTOCOLERROR and no result.
     */
    getSerializableActorState(sessionId: string) {
      const { actor } = this.actors[sessionId] ?? {}
      if (!actor) {
        throw new Error(`Requested sessionId (${sessionId}) is invalid`)
      }
      const state = {
        // actor props
        id: actor.id,
        sessionId: actor.sessionId,
        status: actor.status,
        initialized: actor.initialized,
        // end of actor props
        value: actor.state.value,
        event: actor.state.event,
        context: actor.state.context,
        changed: actor.state.changed,
        done: actor.state.done,
        // configuration: actor.state.configuration,
      }
      return state
    }
  }

  window[namespace] = new XStateNinja()
})()
