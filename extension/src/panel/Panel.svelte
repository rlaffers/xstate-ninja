<script lang="ts">
  import {
    isXStateInspectActorsEvent,
    isXStateInspectActorEvent,
    isXStateInspectUpdateEvent,
    isXStateNinjaUnregisterEvent,
    DeadActorsClearedEvent,
  } from 'xstate-ninja'
  import type {
    XStateInspectAnyEvent,
    DeserializedExtendedInspectedActorObject,
  } from 'xstate-ninja'
  import SideBar from './SideBar.svelte'
  import { connectBackgroundPage } from './connectBackgroundPage'
  import Intro from './Intro.svelte'
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import MainHeader from './MainHeader.svelte'
  import SwimLane from './SwimLane.svelte'
  import {
    sortByFirstItem,
    deserializeInspectedActor,
    createActorFromUpdateEvent,
    updateActorFromUpdateEvent,
    createLogger,
  } from '../utils'

  // communication with devtools
  const bkgPort: chrome.runtime.Port = connectBackgroundPage()
  bkgPort.onMessage.addListener(messageListener)
  bkgPort.onDisconnect.addListener(() => {
    bkgPort.onMessage.removeListener(messageListener)
  })

  const log = createLogger(bkgPort)

  type ActorList = Map<string, DeserializedExtendedInspectedActorObject>

  let deadHistorySize = 0

  chrome.storage.sync.get('settings', ({ settings }) => {
    deadHistorySize = settings.deadHistorySize
  })
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.settings != null) {
      deadHistorySize = changes.settings.newValue.deadHistorySize
    }
  })

  function purgeSomeDeadActors(actors: ActorList): ActorList {
    const allActors = [...actors.entries()]
    const liveActors = allActors.filter(([, x]) => !x.dead)
    const actorsById = allActors.reduce(
      (
        result: {
          [index: string]: [[number, DeserializedExtendedInspectedActorObject]]
        },
        [, actor],
      ) => {
        if (!actor.dead) {
          return result
        }
        if (!result[actor.actorId]) {
          result[actor.actorId] = [[actor.diedAt ?? Date.now(), actor]]
          return result
        }
        result[actor.actorId].push([actor.diedAt ?? Date.now(), actor])
        return result
      },
      {},
    )

    const deadActors: [string, DeserializedExtendedInspectedActorObject][] = Object.values(actorsById).flatMap((deadActorsWithTimestamp) => {
      const sorted = sortByFirstItem(deadActorsWithTimestamp)
      return sorted
        .slice(deadHistorySize > 0 ? -1 * deadHistorySize : sorted.length)
        .map(([, actor]): [string, DeserializedExtendedInspectedActorObject] => [actor.sessionId, actor])
    })

    return new Map([...liveActors, ...deadActors])
  }

  let actors: ActorList | null = null

  function messageListener(event: XStateInspectAnyEvent) {
    log(event.type, { event })

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
        log(
          `The stopped actor ${event.sessionId} is not in the list of actors.`,
          undefined,
          'red',
        )
        return false
      }
      actors.set(actor.sessionId, {
        ...actor,
        dead: true,
        diedAt: event.diedAt ?? Date.now(),
      })
      // whenever an actor is marked dead, we may now have too many dead actors, so we need
      // to purge some of them based on the time of death
      actors = purgeSomeDeadActors(actors)
      return false
    }

    if (isXStateInspectUpdateEvent(event)) {
      if (!actors) {
        actors = new Map()
      }
      const actor = actors.get(event.sessionId)
      if (!actor) {
        // This is not typically used. An actor is typically created from the ActorEvent or ActorsEvent.
        actors.set(event.sessionId, createActorFromUpdateEvent(event))
      } else {
        actors.set(event.sessionId, updateActorFromUpdateEvent(actor, event))
      }
      actors = actors
    }
    return false
  }

  // -----------------------------
  let activeActor: DeserializedExtendedInspectedActorObject | null

  let swimlanes: DeserializedExtendedInspectedActorObject[] = []
  let activeSwimlane: number | null = null

  // if activeFrame=null, then the latest actor's snapshot is implied
  let activeFrame: EventFrame | StateNodeFrame | null = null

  chrome.devtools.network.onNavigated.addListener(() => {
    actors = new Map()
    swimlanes = []
    activeActor = null
    activeFrame = null
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

  $: {
    if (actors && actors.size > 0 && swimlanes.length === 0) {
      const preselectedActor =
        [...actors.values()].find((x) => x.parent == null) ??
        actors.values().next().value
      swimlanes = [preselectedActor]
      activeSwimlane = 0
      activeActor = swimlanes[0]
      activeFrame = null
    } else if (!actors) {
      swimlanes = []
      activeSwimlane = null
      activeActor = null
      activeFrame = null
    } else if (activeActor && actors.size > 0) {
      const retrievedActor = actors.get(activeActor.sessionId)
      if (retrievedActor == null) {
        // if retrievedActor is null -> this is handled in the Swimlane which will select
        // another available actor and notify us via onActorChange
      } else if (retrievedActor !== activeActor) {
        // the active actor has been updated
        activeActor = retrievedActor
      }
    }
  }

  function activateSwimlane(index: number) {
    if (index === activeSwimlane) {
      return
    }
    if (index > swimlanes.length - 1) {
      log(
        'attemped to change to an invalid swimlane',
        {
          index,
          totalSwimlanes: swimlanes.length,
        },
        'red',
      )
      return
    }
    activeSwimlane = index
    activeActor = swimlanes[index]
    activeFrame = null
  }

  function activateFrame(
    frame: EventFrame | StateNodeFrame | null,
    swimlaneIndex: number,
  ) {
    if (swimlaneIndex !== activeSwimlane) {
      activateSwimlane(swimlaneIndex)
    }
    activeFrame = frame
  }

  function addSwimlane() {
    const preselectedActor: DeserializedExtendedInspectedActorObject | null = actors !== null
      ? [...actors.values()].find((x) => x.parent == null) ??  actors.values().next().value
      : null
    if (preselectedActor) {
      swimlanes = [...swimlanes, preselectedActor]
    }
  }

  function onActorChanged(
    actor: DeserializedExtendedInspectedActorObject,
    index: number,
  ) {
    swimlanes[index] = actor
    swimlanes = swimlanes
    if (index === activeSwimlane) {
      if (activeFrame && activeActor && actor.sessionId !== activeActor.sessionId) {
        activeFrame = null
      }
      activeActor = actor
    }
  }

  // refs to SwimLane elements
  let elements: HTMLElement[] = []

  function closeSwimlane(index: number) {
    swimlanes.splice(index, 1)
    swimlanes = swimlanes
    if (index === activeSwimlane) {
      if (swimlanes.length > 0) {
        activateSwimlane(0)
      } else {
        activeSwimlane = null
        activeActor = null
        activeFrame = null
      }
    }
    // always remove the last element - Svelte will reuse the preceding elements
    elements = elements.slice(0, -1)
  }

  function registerElement(element: HTMLElement) {
    elements.push(element)
  }
</script>

{#if actors == null || actors.size < 1}
  <Intro />
{:else}
  <main class="actors-view">
    <MainHeader {clearDeadActors} {addSwimlane} />

    <section class="swim-lanes nice-scroll" class:multi={swimlanes.length > 1}>
      {#each swimlanes as selectedActor, index}
        <SwimLane
          {actors}
          onActorChanged={(x) => onActorChanged(x, index)}
          {selectedActor}
          active={index === activeSwimlane}
          onSelectSwimlane={() => activateSwimlane(index)}
          onSelectFrame={(frame) => activateFrame(frame, index)}
          closeSwimlane={() => closeSwimlane(index)}
          previousSwimlane={index > 0 ? elements[index - 1] : null}
          onMount={registerElement}
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
