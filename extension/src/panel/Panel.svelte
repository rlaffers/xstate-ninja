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

  // We use this function because logging with console.log directly here does not work
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
    log(event.type, { event }) // TODO remove

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
  let activeActor: DeserializedExtendedInspectedActorObject

  // if activeFrame=null, then the latest actor's snapshot is implied
  let activeFrame: EventFrame | StateNodeFrame = null

  chrome.devtools.network.onNavigated.addListener(() => {
    actors = new Map()
    activeActor = null
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

  let swimLanes: DeserializedExtendedInspectedActorObject[] = []
  let activeSwimLane: number | null = null
  $: {
    if (actors && swimLanes.length === 0) {
      swimLanes = [actors.values().next().value]
      activeSwimLane = 0
      activeActor = swimLanes[0]
      activeFrame = null
    } else if (!actors) {
      swimLanes = []
      activeSwimLane = null
      activeActor = null
      activeFrame = null
    }
  }

  function activateSwimLane(index: number) {
    if (index === activeSwimLane) {
      return
    }
    if (index > swimLanes.length - 1) {
      log(
        'attemped to change to an invalid swimlane',
        { index, totalSwimLanes: swimLanes.length },
        'red',
      )
      return
    }
    activeSwimLane = index
    activeActor = swimLanes[index]
    activeFrame = null
  }

  function activateFrame(
    frame: EventFrame | StateNodeFrame,
    swimLaneIndex: number,
  ) {
    if (swimLaneIndex !== activeSwimLane) {
      activateSwimLane(swimLaneIndex)
    }
    activeFrame = frame
  }

  function addSwimLane() {
    const firstActor = actors?.values()?.next()?.value
    if (firstActor) {
      swimLanes = [...swimLanes, firstActor]
    }
  }

  function onActorChanged(
    actor: DeserializedExtendedInspectedActorObject,
    index: number,
  ) {
    swimLanes[index] = actor
    swimLanes = swimLanes
    if (index === activeSwimLane) {
      if (activeFrame && actor.sessionId !== activeActor.sessionId) {
        activeFrame = null
      }
      activeActor = actor
    }
  }

  function closeSwimLane(index: number) {
    swimLanes.splice(index, 1)
    swimLanes = swimLanes
    if (index === activeSwimLane) {
      if (swimLanes.length > 0) {
        activateSwimLane(0)
      } else {
        activeSwimLane = null
        activeActor = null
        activeFrame = null
      }
    }
  }
</script>

{#if actors == null || actors.size < 1}
  <Intro />
{:else}
  <main class="actors-view">
    <MainHeader {clearDeadActors} {addSwimLane} />

    <section class="swim-lanes nice-scroll" class:multi={swimLanes.length > 1}>
      {#each swimLanes as selectedActor, index}
        <SwimLane
          {actors}
          onActorChanged={(x) => onActorChanged(x, index)}
          {selectedActor}
          active={index === activeSwimLane}
          onSelectSwimLane={() => activateSwimLane(index)}
          onSelectFrame={(frame) => activateFrame(frame, index)}
          closeSwimLane={() => closeSwimLane(index)}
        />
      {/each}
    </section>

    <SideBar actor={activeActor} {activeFrame} />
  </main>
{/if}

<style>
  main.actors-view {
    height: 100%;
    display: grid;
    grid-template-columns: 2fr fit-content(10%);
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
    overflow-x: auto;
  }
</style>
