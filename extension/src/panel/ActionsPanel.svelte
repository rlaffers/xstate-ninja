<script lang="ts">
  import Tree from 'magic-json-tree'
  import Resizer from './Resizer.svelte'
  import { omit } from '../utils'

  export let snapshot: any = null

  let container: HTMLElement
</script>

<h1>Actions</h1>
<div class="wrapper">
  <p class="actions-panel nice-scroll" bind:this={container}>
    {#if snapshot?.actions}
      {#each snapshot.actions as action (action)}
        <details class="action">
          <summary>{action.type}</summary>
          <Tree value={omit('type', action)} expand={1} />
        </details>
      {/each}
    {/if}
  </p>
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
    position: relative;
  }

  .actions-panel {
    margin: 0;
    padding: 8px;
    overflow: auto;
    min-height: 1rem;
  }

  :global(.sidebar:not(.custom-sized) .actions-panel) {
    max-width: 30rem;
  }

  .actions-panel .action {
    padding-left: 1rem;
  }

  .actions-panel .action > summary {
    display: list-item;
    cursor: pointer;
    margin-left: -1rem;
  }

  .actions-panel
    .action
    > :global(.magic-json-tree-root)
    > :global(.magic-json-tree-summary) {
    display: none;
  }

  .actions-panel
    .action
    > :global(.magic-json-tree-root)
    > :global(.magic-json-tree-object-items)
    > :global(.magic-json-tree-item) {
    margin-left: 0;
  }
</style>
