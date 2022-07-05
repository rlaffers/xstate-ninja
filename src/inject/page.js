/* global CustomEvent */
;(function () {
  const namespace = '__XSTATE_INSIGHTS__'

  class XStateInsights {
    constructor(...args) {
      // this.actors = new WeakMap()
      this.actors = {}
    }

    subscribe(actor) {
      // TODO create new port for each actor to ensure integrity/prevent actor id collisions
      // TODO Cleanup: subscribing to everything immediately → memory leak? Can we subscribe only after the
      // devtools panel is open? If the machine is no longer used by the page, the devtools should
      // unsubscribe.

      window.dispatchEvent(
        new CustomEvent('xstate-insights.subscribe', {
          detail: {
            id: actor.id,
            initialized: actor.initialized,
            status: actor.status,
            sessionId: actor.sessionId,
          },
        })
      )

      // TODO other ways to end subscriptions (on unmount?)
      const subscription = actor.subscribe((state) => {
        window.dispatchEvent(
          new CustomEvent('xstate-insights.update', {
            detail: {
              id: actor.id,
              sessionId: actor.sessionId,
              status: actor.status,
              // context: state.context,
              stateValue: state.value,
              // TODO try event with non-serializable data
              event: state.event,
            },
          })
        )

        if (state.done) {
          this.unsubscribe(actor)
        }
      })

      // this.actors.set(actor, subscription)
      this.actors[actor.sessionId] = { subscription, actor }
    }

    unsubscribe(actor) {
      // const subscription = this.actors.get(actor)
      const { subscription } = this.actors[actor.sessionId] ?? {}
      if (!subscription) {
        return
      }
      subscription.unsubscribe()
      window.dispatchEvent(
        new CustomEvent('xstate-insights.unsubscribe', {
          detail: {
            id: actor.id,
            sessionId: actor.sessionId,
            status: actor.status,
          },
        })
      )
      // this.actors.delete(actor)
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
        // configuration: actor.state.configuration,
      }
      return state
    }
  }

  window[namespace] = new XStateInsights()
})()
