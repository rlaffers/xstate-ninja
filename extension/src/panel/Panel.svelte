<script>
  import { setContext } from 'svelte'
  import { EventTypes } from '../EventTypes'
  import ActorDetail from './ActorDetail.svelte'
  import ActorsDropdown from './ActorsDropdown.svelte'
  import { connectBackgroundPage } from './connectBackgroundPage'
  import Intro from './Intro.svelte'
  import Tracker from './Tracker.svelte'

  function createActorFromMessageData(data) {
    return {
      ...data,
      dead: data.status === 2 || data.done,
      history: [],
    }
  }

  const bkgPort = connectBackgroundPage()

  function log(text, data) {
    bkgPort.postMessage({
      type: 'log',
      text,
      data,
    })
  }

  setContext('logger', {
    log,
  })

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
      actors.set(actor.sessionId, {
        ...actor,
        dead: true,
      })
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

  chrome.devtools.network.onNavigated.addListener(() => {
    actors = new Map()
    selectedActor = null
  })
</script>

{#if actors == null}
  Loading...
{:else if actors.size < 1}
  <Intro />
{:else}
  <div class="actors-view">
    <header>
      <ActorsDropdown
        class="actors-dropdown"
        {actors}
        bind:selected={selectedActor}
      />
      <ActorDetail actor={selectedActor} />
    </header>
    <main class="trackers">
      <Tracker actor={selectedActor} />
    </main>
  </div>
{/if}

<style>
  .actors-view {
    --actors-dropdown-height: 1.8rem;
    height: calc(100vh - 2em);
  }
  header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    background-color: var(--base02);
    padding: 0.5rem;
  }
  :global(.actors-dropdown) {
    height: var(--actors-dropdown-height);
  }
  .trackers {
    height: calc(100% - var(--actors-dropdown-height));
  }
</style>
