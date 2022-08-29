<script lang="ts">
  import JSONFormatter from 'json-formatter-js'
  import { omit } from '../utils'

  export let snapshot: any = null

  function insertActionDetail(node: HTMLElement, action: any) {
    const formatter = new JSONFormatter(omit('type', action))
    node.appendChild(formatter.render())
  }
</script>

<h1>Actions</h1>
<p class="actions-panel">
  {#if snapshot?.actions}
    {#each snapshot.actions as action (action)}
      <details class="action" use:insertActionDetail={action}>
        <summary>{action.type}</summary>
      </details>
    {/each}
  {/if}
</p>

<style>
  h1 {
    font-size: 2rem;
    background-color: var(--base01);
    color: var(--base03);
    margin: 0;
    padding: 0 8px;
  }

  .actions-panel {
    padding: 8px;
    margin: 0;
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
    > :global(.json-formatter-row)
    > :global(.json-formatter-toggler-link) {
    display: none;
  }

  .actions-panel
    .action
    > :global(.json-formatter-row)
    > :global(.json-formatter-children)
    > :global(.json-formatter-row) {
    margin-left: 0;
  }
</style>
