<script lang="ts">
  import { setContext } from 'svelte'
  import { InterpreterStatus } from 'xstate'
  import {
    isXStateInspectActorsEvent,
    isXStateInspectActorEvent,
    isXStateInspectUpdateEvent,
    isXStateNinjaUnregisterEvent,
    ActorTypes,
    DeadActorsClearedEvent,
  } from 'xstate-ninja'
  import type {
    XStateInspectAnyEvent,
    XStateInspectUpdateEvent,
    SerializedExtendedInspectedActorObject,
    DeserializedExtendedInspectedActorObject,
  } from 'xstate-ninja'
  import SideBar from './SideBar.svelte'
  import { connectBackgroundPage } from './connectBackgroundPage'
  import Intro from './Intro.svelte'
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import MainHeader from './MainHeader.svelte'
  import { MessageTypes } from '../messages'
  import SwimLane from './SwimLane.svelte'

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
      type: ActorTypes.unknown,
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

  function log(text: string, data: any, color = 'cornflowerblue') {
    const msg: any = {
      type: MessageTypes.log,
      text,
      data,
      color,
    }
    bkgPort.postMessage(msg)
  }

  setContext('logger', {
    log,
  })

  let actors: Map<string, DeserializedExtendedInspectedActorObject> = null

  function messageListener(event: XStateInspectAnyEvent) {
    log(event.type, { event, bkgPort }) // TODO remove

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

  function clearDeadActors() {
    if (actors == null) {
      return
    }
    for (const [key, actor] of actors.entries()) {
      if (actor.dead) {
        actors.delete(key)
        actors = actors
      }
    }
    bkgPort.postMessage(new DeadActorsClearedEvent().detail)
  }

  // TODO
  function addSwimLane() {
    return false
  }
</script>

{#if actors == null || actors.size < 1}
  <Intro />
{:else}
  <main class="actors-view">
    <MainHeader {clearDeadActors} {addSwimLane} />

    <section class="swim-lanes">
      <SwimLane {actors} bind:selectedActor bind:selectedFrame />
    </section>

    <SideBar actor={selectedActor} {selectedFrame} />
  </main>
{/if}

<style>
  main.actors-view {
    /* --actors-dropdown-height: 1.8rem; */
    height: 100%;
    display: grid;
    grid-template-columns: 2fr auto;
    grid-template-rows: 2.1rem 3rem 1fr;
    grid-template-areas:
      'main-header main-header'
      'swim-lanes sidebar'
      'swim-lanes sidebar';
  }

  .swim-lanes {
    grid-area: swim-lanes;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }
</style>
