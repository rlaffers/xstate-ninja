<script lang="ts">
  import Tree from 'magic-json-tree'
  import Resizer from './Resizer.svelte'

  export let snapshot: any = null
  let container: HTMLElement

  let title = 'Event'
  $: {
    // values from callback actors may be events
    if (snapshot?.event || typeof snapshot?.type === 'string') {
      title = 'Event'
    } else {
      title = 'Emitted value'
    }
  }
</script>

<h1>{title}</h1>
<div class="wrapper">
  <div class="event-panel nice-scroll" bind:this={container}>
    {#if snapshot?.event}
      <Tree value={snapshot.event} expand={1} />
    {:else}
      <Tree value={snapshot} expand={1} />
    {/if}
  </div>
  <Resizer previousTarget={container} direction="vertical" />
</div>

<style>
  h1 {
    font-size: 2rem;
    background-color: var(--content);
    color: var(--background);
    margin: 0;
    padding: 0 8px;
  }

  .wrapper {
    /* to prevent overflow when the context is too long */
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .event-panel {
    margin: 0;
    padding: 8px;
    overflow: auto;
    max-height: calc(100% - 5px);
    min-height: 1rem;
  }
  :global(.sidebar:not(.custom-sized) .event-panel) {
    max-width: 30rem;
  }
</style>
