<script lang="ts">
  import { beforeUpdate, afterUpdate } from 'svelte'
  import type {
    DeserializedExtendedInspectedActorObject,
    XStateInspectUpdateEvent,
  } from 'xstate-ninja'
  import StateNodeFrameComponent, {
    type StateNodeFrame,
  } from './StateNodeFrame.svelte'
  import EventFrameComponent, { type EventFrame } from './EventFrame.svelte'
  import ArrowDown from './ArrowDown.svelte'
  import { last } from '../utils'

  export let actor: DeserializedExtendedInspectedActorObject = null

  const STATE_NODE = 'stateNode'
  const EVENT = 'event'

  function createEventFrame(
    update: XStateInspectUpdateEvent,
    snapshot: any,
  ): EventFrame {
    return {
      type: EVENT,
      event: update.event,
      changed: snapshot.changed,
    }
  }

  function createStateNodeFrame(snapshot: any): StateNodeFrame {
    return {
      type: STATE_NODE,
      stateValue: snapshot.value,
      changed: snapshot.changed,
    }
  }

  function updateIntoFrames(
    update: XStateInspectUpdateEvent,
  ): Array<EventFrame> {
    const frames = []
    const snapshot = JSON.parse(update.snapshot)
    frames.push(createEventFrame(update, snapshot))
    if (snapshot.changed) {
      frames.push(createStateNodeFrame(snapshot))
    }
    return frames
  }

  // Array of EventFrame or StateFrame
  interface FrameList extends Array<EventFrame | StateNodeFrame> {
    sessionId?: string
    history?: XStateInspectUpdateEvent[]
  }

  let frames: FrameList = []
  // these props serve for tracking when the reactive statements below need to run
  frames.sessionId = actor?.sessionId
  frames.history = actor?.history

  $: if (actor) {
    if (actor.sessionId !== frames.sessionId) {
      const newFrames: FrameList = []
      newFrames.sessionId = actor?.sessionId
      newFrames.history = actor.history
      // populate frames from the selected actor's history
      if (actor?.history?.length > 0) {
        actor.history.forEach((update) => {
          newFrames.push(...updateIntoFrames(update))
        })
      }
      frames = newFrames
    } else if (actor.history !== frames.history) {
      frames.history = actor.history
      const update = last(actor.history)
      frames.push(...updateIntoFrames(update))
      frames = frames
    }
  }

  let autoscroll: boolean
  let trackerElement: HTMLElement
  beforeUpdate(() => {
    autoscroll =
      trackerElement &&
      trackerElement.offsetHeight + trackerElement.scrollTop >
        trackerElement.scrollHeight - 20
  })

  afterUpdate(() => {
    if (autoscroll) {
      trackerElement.scrollTo(0, trackerElement.scrollHeight)
    }
  })
</script>

{#if actor != null}
  <div class="tracker" bind:this={trackerElement}>
    {#each frames as frame, index}
      {#if frame.type === STATE_NODE}
        <StateNodeFrameComponent data={frame} />
      {:else if frame.type === EVENT}
        <EventFrameComponent data={frame} />
        {#if frames[index + 1]?.type === STATE_NODE}
          <ArrowDown />
        {/if}
      {/if}
    {/each}
  </div>
{/if}

<style>
  .tracker {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: 5px;
    scrollbar-color: var(--base01) var(--base03);
  }
  .tracker::-webkit-scrollbar {
    width: 6px;
  }

  .tracker::-webkit-scrollbar-track {
    background: var(--base03);
    border: 1px solid var(--base01);
  }

  .tracker::-webkit-scrollbar-thumb {
    background-color: var(--base01);
    border-radius: 20px;
    border: 1px solid var(--base01);
  }
</style>
