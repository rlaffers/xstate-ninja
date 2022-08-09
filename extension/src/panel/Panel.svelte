<script lang="ts">
  import { setContext } from 'svelte'
  import { InterpreterStatus } from 'xstate'
  import {
    isXStateInspectActorsEvent,
    isXStateInspectActorEvent,
    isXStateInspectUpdateEvent,
    isXStateNinjaUnregisterEvent,
  } from 'xstate-ninja'
  import type {
    XStateInspectAnyEvent,
    XStateInspectUpdateEvent,
    SerializedExtendedInspectedActorObject,
    DeserializedExtendedInspectedActorObject,
  } from 'xstate-ninja'
  import ActorDetail from './ActorDetail.svelte'
  import ActorsDropdown from './ActorsDropdown.svelte'
  import SideBar from './SideBar.svelte'
  import { connectBackgroundPage } from './connectBackgroundPage'
  import Intro from './Intro.svelte'
  import Tracker from './Tracker.svelte'

  function deserializeInspectedActor(
    serializedActor: SerializedExtendedInspectedActorObject,
  ): DeserializedExtendedInspectedActorObject {
    return {
      ...serializedActor,
      snapshot: JSON.parse(serializedActor.snapshot),
      machine:
        serializedActor.machine != null
          ? JSON.parse(serializedActor.machine)
          : undefined,
    } as DeserializedExtendedInspectedActorObject
  }

  // This is not typically used. An actor is typically created from the ActorEvent or ActorsEvent.
  function createActorFromUpdateEvent(
    event: XStateInspectUpdateEvent,
  ): DeserializedExtendedInspectedActorObject {
    const snapshot = JSON.parse(event.snapshot)
    const actor = {
      sessionId: event.sessionId,
      parent: undefined,
      snapshot,
      machine: undefined,
      events: [event.event],
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
      status: event.status,
      // xstate-ninja custom props
      history: [event],
      dead: event.status === InterpreterStatus.Stopped || snapshot.done,
      actorId: event.actorId,
    }
    return actor
  }

  function updateActorFromUpdateEvent(
    actor: DeserializedExtendedInspectedActorObject,
    event: XStateInspectUpdateEvent,
  ): DeserializedExtendedInspectedActorObject {
    const snapshot = JSON.parse(event.snapshot)
    actor.history.push(event)
    actor.events.push(event.event)
    const updatedActor = {
      ...actor,
      snapshot,
      status: event.status,
      dead: event.status === InterpreterStatus.Stopped || snapshot.done,
      updatedAt: event.createdAt,
      history: actor.history,
    }
    return updatedActor
  }

  // communication with devtools
  const bkgPort: chrome.runtime.Port = connectBackgroundPage()
  bkgPort.onMessage.addListener(messageListener)
  bkgPort.onDisconnect.addListener(() => {
    bkgPort.onMessage.removeListener(messageListener)
  })

  function log(text: string, data: any) {
    const msg: any = {
      type: 'log',
      text,
      data,
    }
    bkgPort.postMessage(msg)
  }

  setContext('logger', {
    log,
  })

  let actors: Map<string, DeserializedExtendedInspectedActorObject> = null

  function messageListener(event: XStateInspectAnyEvent) {
    log('received', { event, bkgPort }) // TODO remove

    if (isXStateInspectActorsEvent(event)) {
      actors = new Map(
        Object.entries(event.inspectedActors).map(([k, v]) => [
          k,
          deserializeInspectedActor(v),
        ]),
      )
    }

    if (isXStateInspectActorEvent(event)) {
      if (!actors) {
        actors = new Map()
      }
      actors.set(
        event.sessionId,
        deserializeInspectedActor(event.inspectedActor),
      )
      actors = actors
      return
    }

    if (isXStateNinjaUnregisterEvent(event)) {
      if (!actors) return
      const actor = actors.get(event.sessionId)
      if (!actor) {
        console.error(
          `The stopped actor ${event.sessionId} is not in the list of actors.`,
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

    if (isXStateInspectUpdateEvent(event)) {
      if (!actors) {
        actors = new Map()
      }
      const actor = actors.get(event.sessionId)
      if (!actor) {
        actors.set(event.sessionId, createActorFromUpdateEvent(event))
      } else {
        actors.set(event.sessionId, updateActorFromUpdateEvent(actor, event))
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

  // -----------------------------
  let selectedActor: DeserializedExtendedInspectedActorObject

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
  <main class="actors-view">
    <header>This is the header</header>
    <section class="trackers">
      <section class="tracker-0">
        <ActorsDropdown
          class="actors-dropdown"
          {actors}
          bind:selected={selectedActor}
        />
        <ActorDetail actor={selectedActor} />
        <Tracker actor={selectedActor} />
      </section>
    </section>
    <SideBar actor={selectedActor} />
  </main>
{/if}

<style>
  main.actors-view {
    --actors-dropdown-height: 1.8rem;
    /* height: calc(100vh - 2em); */
    height: 100%;
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 42px 1fr;
    grid-template-areas:
      'header sidebar'
      'trackers sidebar';
  }
  header {
    grid-area: header;
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
    grid-area: trackers;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* height: calc(100% - var(--actors-dropdown-height)); */
  }
</style>
