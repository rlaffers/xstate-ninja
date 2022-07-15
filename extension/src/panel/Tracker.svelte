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

  // TODO dead actors keep getting updated with every update on other actors
  let frames = []
  $: if (actor) {
    if (actor.sessionId !== frames.sessionId) {
      frames = []
      frames.sessionId = actor.sessionId
    } else {
      const update = last(actor.history)
      frames.push(createEventFrame(update))
      if (update.changed) {
        frames.push(createStateNodeFrame(update))
      }
    }
    frames = frames
  }
</script>

{#if actor != null}
  Actor selected: {actor.id} ({JSON.stringify(actor.stateValue)}){actor.done
    ? ' 🏁'
    : ''}

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
  :root {
    --bg-color: #121212;
    --color: #839496;
  }
  .frames {
    height: 100%;
    overflow-y: auto;
    width: 15rem;
  }
  .frames {
    scrollbar-width: 5px;
    scrollbar-color: var(--color) var(--bg-color);
  }
  .frames::-webkit-scrollbar {
    width: 6px;
  }

  .frames::-webkit-scrollbar-track {
    background: var(--bg-color);
    border: 1px solid var(--color);
  }

  .frames::-webkit-scrollbar-thumb {
    background-color: var(--color);
    border-radius: 20px;
    border: 1px solid var(--color);
  }

  .frames > div {
    cursor: pointer;
    text-align: center;
  }
</style>
