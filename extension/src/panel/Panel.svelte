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
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'

  function deserializeInspectedActor(
    serializedActor: SerializedExtendedInspectedActorObject,
  ): DeserializedExtendedInspectedActorObject {
    return {
      ...serializedActor,
      snapshot:
        serializedActor.snapshot != null
          ? JSON.parse(serializedActor.snapshot)
          : undefined,
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
    const snapshot =
      event.snapshot != null ? JSON.parse(event.snapshot) : undefined
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
      dead: event.status === InterpreterStatus.Stopped || snapshot?.done,
      actorId: event.actorId,
    }
    return actor
  }

  function updateActorFromUpdateEvent(
    actor: DeserializedExtendedInspectedActorObject,
    event: XStateInspectUpdateEvent,
  ): DeserializedExtendedInspectedActorObject {
    const snapshot =
      event.snapshot != null ? JSON.parse(event.snapshot) : undefined
    actor.history.push(event)
    actor.events.push(event.event)
    const updatedActor = {
      ...actor,
      snapshot,
      status: event.status,
      dead: event.status === InterpreterStatus.Stopped || snapshot?.done,
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
      return false
    }

    if (isXStateNinjaUnregisterEvent(event)) {
      if (!actors) return
      const actor = actors.get(event.sessionId)
      if (!actor) {
        console.error(
          `The stopped actor ${event.sessionId} is not in the list of actors.`,
        )
        return false
      }
      actors.set(actor.sessionId, {
        ...actor,
        dead: true,
      })
      actors = actors
      return false
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
    }
    return false
  }

  // -----------------------------
  let selectedActor: DeserializedExtendedInspectedActorObject
  // if selectedFrame=null, then the latest actor's snapshot is implied
  let selectedFrame: EventFrame | StateNodeFrame = null

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
    <section class="trackers nice-scroll">
      <section class="tracker-container">
        <ActorsDropdown
          class="actors-dropdown"
          {actors}
          bind:selected={selectedActor}
        />
        <ActorDetail actor={selectedActor} />
        <Tracker actor={selectedActor} bind:selectedFrame />
      </section>
    </section>
    <SideBar actor={selectedActor} {selectedFrame} />
  </main>
{/if}

<style>
  main.actors-view {
    --actors-dropdown-height: 1.8rem;
    /* height: calc(100vh - 2em); */
    height: 100%;
    display: grid;
    grid-template-columns: 2fr auto;
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
    max-width: 15rem;
  }
  .trackers {
    grid-area: trackers;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    overflow-y: auto;
    /* height: calc(100% - var(--actors-dropdown-height)); */
  }
  .trackers > .tracker-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
