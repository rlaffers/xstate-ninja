<script lang="ts">
  import type { AnyActorRef } from 'xstate'
  import Tree from 'magic-json-tree'
  import Resizer from './Resizer.svelte'
  import { omit } from '../utils'
  import './ActionsPanel.css'

  export let snapshot: any = null

  let container: HTMLElement

  function getSendTargetName(to: string | AnyActorRef): string {
    return typeof to === 'string' ? to : to.id ?? 'N/A'
  }
</script>

<h1>Actions</h1>
<div class="wrapper">
  <p class="actions-panel nice-scroll" bind:this={container}>
    {#if snapshot?.actions}
      {#each snapshot.actions as action (action)}
        <details class="action">
          <summary>
            <span class="action-type">{action.type}</span>
            {#if action.type === 'xstate.send'}
              <span class="send-action-event">{action.event?.type}</span>
              {#if action.to != null}
                <span class="send-action-target"
                  >{getSendTargetName(action.to)}</span
                >
              {/if}
            {/if}
          </summary>
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
    /* to prevent overflow when the context is too long */
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
    container: action-summary / inline-size;
    white-space: nowrap;
    overflow: hidden;
  }

  .actions-panel .action > summary .send-action-event {
    color: var(--orange);
    display: none;
  }

  .actions-panel .action > summary .send-action-target {
    color: var(--violet);
    display: none;
  }

  .actions-panel .action > summary .send-action-target::before {
    content: '➔';
    margin-right: 5px;
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
