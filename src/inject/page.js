/* global CustomEvent */
;(function () {
  const namespace = '__XSTATE_INSIGHTS__'
  function createEvent(type, actor, state) {
    return {
      type,
      source: 'xstate-insights',
      id: actor.id,
      // TODO post as much as possible/serializable
      stateValue: state?.value,
      event: state?.event,
      // machine: actor.machine.toJSON(),
    }
  }
  function subscribe(actor) {
    // TODO maybe use ports to ensure integrity/prevent machine IDs collisions
    window.postMessage(createEvent('subscribe', actor))

    // TODO experimental
    window.dispatchEvent(
      new CustomEvent('xstate-insights.subscribe', {
        // TODO the detail will be null in content script 😢
        detail: {
          actor,
          risi: 42,
        },
      })
    )
    const subscription = actor.subscribe((state) => {
      window.postMessage(createEvent('update', actor, state))
      if (state.done) {
        subscription.unsubscribe()
        window.postMessage(createEvent('unsubscribe', actor, state))
      }
    })
  }

  window[namespace] = {
    subscribe,
  }
})()
