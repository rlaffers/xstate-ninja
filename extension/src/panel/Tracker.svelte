<script>
  import StateNodeFrame from './StateNodeFrame.svelte'
  import EventFrame from './EventFrame.svelte'
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

  // Array of EventFrame or StateFrame
  let frames = []
  // these props serve for tracking when the reactive statements below need to run
  frames.sessionId = actor?.sessionId
  frames.history = actor?.history

  // reset frames if actor has been switched
  // TODO populate frames from the new actor's history
  $: if (actor?.sessionId !== frames.sessionId) {
    frames = []
    frames.sessionId = actor?.sessionId
    // copy the history so the next reactive statement is executed
    frames.history = [...actor.history]
  }
  $: if (actor && actor?.history !== frames.history) {
    frames.history = actor.history
    const update = last(actor.history)
    frames.push(createEventFrame(update))
    if (update.changed) {
      frames.push(createStateNodeFrame(update))
    }
    frames = frames
  }
</script>

{#if actor != null}
  <div class="actor-detail">
    {#if actor.dead}
      <span title="This actor is dead">💀</span>
    {/if}
    {#if actor.done}
      <span title="The final state has been reached">🏁</span>
    {/if}
  </div>

  <div class="frames">
    {#each frames as frame}
      {#if frame.type === STATE_NODE}
        <StateNodeFrame data={frame} />
      {:else if frame.type === EVENT}
        <EventFrame data={frame} />
      {/if}
    {/each}
  </div>
{/if}

<style>
  .frames {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    overflow-y: auto;
  }
  .frames {
    scrollbar-width: 5px;
    scrollbar-color: var(--base01) var(--base03);
  }
  .frames::-webkit-scrollbar {
    width: 6px;
  }

  .frames::-webkit-scrollbar-track {
    background: var(--base03);
    border: 1px solid var(--base01);
  }

  .frames::-webkit-scrollbar-thumb {
    background-color: var(--base01);
    border-radius: 20px;
    border: 1px solid var(--base01);
  }

  .frames > div {
    cursor: pointer;
    text-align: center;
  }

  .actor-detail {
    margin: 0.5rem 0;
  }

  .actor-detail > span {
    cursor: help;
  }

  .actor-detail:empty {
    margin: 0;
  }
</style>
