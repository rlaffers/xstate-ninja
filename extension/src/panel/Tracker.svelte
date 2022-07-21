<script>
  import { beforeUpdate, afterUpdate } from 'svelte'
  import StateNodeFrame from './StateNodeFrame.svelte'
  import EventFrame from './EventFrame.svelte'
  import ArrowDown from './ArrowDown.svelte'
  import { last } from '../utils'

  export let actor = null

  const STATE_NODE = 'stateNode'
  const EVENT = 'event'

  function createEventFrame(update) {
    return {
      type: EVENT,
      event: update.event,
      changed: update.changed,
    }
  }

  function createStateNodeFrame(update) {
    return {
      type: STATE_NODE,
      stateValue: update.stateValue,
      changed: update.changed,
    }
  }

  function updateIntoFrames(update) {
    const frames = []
    frames.push(createEventFrame(update))
    if (update.changed) {
      frames.push(createStateNodeFrame(update))
    }
    return frames
  }

  // Array of EventFrame or StateFrame
  let frames = []
  // these props serve for tracking when the reactive statements below need to run
  frames.sessionId = actor?.sessionId
  frames.history = actor?.history

  $: if (actor) {
    if (actor.sessionId !== frames.sessionId) {
      const newFrames = []
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

  let autoscroll
  let trackerElement
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
        <StateNodeFrame data={frame} />
      {:else if frame.type === EVENT}
        <EventFrame data={frame} />
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

  .tracker > div {
    cursor: pointer;
    text-align: center;
  }
</style>
