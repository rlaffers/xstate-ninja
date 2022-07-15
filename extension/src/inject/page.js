/* global CustomEvent */
;(function () {
  const namespace = '__XSTATE_NINJA__'

  class XStateNinja {
    constructor(...args) {
      this.actors = {}
    }

    /**
     * @param {Interpreter} actor
     */
    register(actor) {
      window.dispatchEvent(
        // TODO use the EventTypes enum
        new CustomEvent('xstate-ninja.register', {
          detail: {
            id: actor.id,
            sessionId: actor.sessionId,
            initialized: actor.initialized,
            status: actor.status,
            done: actor.state.done,
            stateValue: null,
          },
        }),
      )

      const subscription = actor.subscribe((state) => {
        window.dispatchEvent(
          new CustomEvent('xstate-ninja.update', {
            detail: {
              id: actor.id,
              sessionId: actor.sessionId,
              initialized: actor.initialized,
              status: actor.status,
              // context: state.context,
              stateValue: state.value,
              done: state.done,
              // TODO try event with non-serializable data. If it breaks, serialize it here in a try-catch block
              event: state.event,
            },
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
    unregister(actor) {
      const { subscription } = this.actors[actor.sessionId] ?? {}
      if (!subscription) {
        return
      }
      subscription.unsubscribe()
      window.dispatchEvent(
        new CustomEvent('xstate-ninja.unregister', {
          detail: {
            id: actor.id,
            sessionId: actor.sessionId,
            status: actor.status,
            initialized: actor.initialized,
            stateValue: actor.state.value,
            done: actor.state.done,
          },
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
     *
     * @param {string} sessionId
     * @return {Object}
     */
    getSerializableActorState(sessionId) {
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
