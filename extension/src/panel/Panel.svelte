<script>
  import Intro from './Intro.svelte'
  import { EventTypes } from '../EventTypes'
  import { connectBackgroundPage } from './connectBackgroundPage'
  import ActorsDropdown from './ActorsDropdown.svelte'
  import Tracker from './Tracker.svelte'

  function createActorFromMessageData(data) {
    return {
      ...data,
      dead: data.status === 2 || data.done,
      history: [],
    }
  }

  // TODO control this panel by a state machine

  // chrome.devtools.network.onNavigated.addListener((request) => {
  //   // TODO clear the panel on refresh
  // })

  const bkgPort = connectBackgroundPage()

  function log(text, data) {
    bkgPort.postMessage({
      type: 'log',
      text,
      data,
    })
  }
  // TODO temporary. Instead, make an interface for applying updates to HTML
  /* function print(state) { */
  /*   const el = document.createElement('div') */
  /*   el.innerText = state.event.type */
  /*   document.body.appendChild(el) */
  /* } */

  let actors = null
  function handleInitDoneOnce(message) {
    if (message.type === EventTypes.initDone) {
      actors = new Map(message.data.actors)
      bkgPort.onMessage.removeListener(handleInitDoneOnce)
    }
  }
  bkgPort.onMessage.addListener(handleInitDoneOnce)

  function messageListener(message) {
    log('received', { message, bkgPort }) // TODO remove

    if (message.type === EventTypes.register) {
      if (!actors) {
        actors = new Map()
      }
      actors.set(
        message.data.sessionId,
        createActorFromMessageData(message.data),
      )
      actors = actors
      return
    }

    if (message.type === EventTypes.unregister) {
      if (!actors) return
      const actor = actors.get(message.data.sessionId)
      if (!actor) {
        console.error(
          `The stopped actor ${message.data.sessionId} is not in the list of actors.`,
        )
        return
      }
      actor.dead = true
      actors.set(actor.sessionId, actor)
      actors = actors
      return
    }

    if (message.type === EventTypes.update) {
      if (!actors) {
        actors = new Map()
      }
      const actor = actors.get(message.data.sessionId)
      if (!actor) {
        actors.set(
          message.data.sessionId,
          createActorFromMessageData(message.data),
        )
      } else {
        actors.set(message.data.sessionId, {
          ...createActorFromMessageData(message.data),
          history: [...actor.history, message.data],
        })
      }
      actors = actors

      // ========================
      // Read extended actor state info from the page window. The serialization mechanism for inspectedWindow.eval() is
      // more robust than the mechanism for serializing CustomEvent.detail which is therefore kept purposefully bare and simple.
      // With eval() we are able to get state.context reasonably safely (serializing functions and object instances will
      // not throw exceptions).
      // At worst (with circular dependencies within serialized objects) we will get an exception here, but since we have already
      // received the update message, we can at least render some minimal information.
      // sanitize

      // const sessionId = String(message.data.sessionId).replaceAll(
      //   /[^a-z0-9:]/gi,
      //   '',
      // )
      // chrome.devtools.inspectedWindow.eval(
      //   `console.log('♥ devtools requests actor state', '${sessionId}') || window.__XSTATE_NINJA__?.getSerializableActorState('${sessionId}')`,
      //   (result, error) => {
      //     if (error) {
      //       log('💀 Eval error:', { error })
      //     } else {
      //       log('✅ Eval result:', { result })
      //       print(result)
      //     }
      //   },
      // )
    }
    return false
  }
  bkgPort.onMessage.addListener(messageListener)
  bkgPort.onDisconnect.addListener(() => {
    bkgPort.onMessage.removeListener(messageListener)
  })

  // -----------------------------
  let selectedActor
</script>

{#if actors == null}
  Loading...
{:else if actors.size < 1}
  <Intro />
{:else}
  <div class="actors-view">
    <ActorsDropdown {actors} bind:selected={selectedActor} />
    <section class="trackers">
      <Tracker actor={selectedActor} />
    </section>
  </div>
{/if}
