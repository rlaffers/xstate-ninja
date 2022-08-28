<script lang="ts">
  import JSONFormatter from 'json-formatter-js'
  import { omit } from '../utils'

  // TODO for non-machine actors snapshot can be whatever
  export let snapshot: any = null

  let selectedTab = 'actions-tab'
  function selectTab(
    event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) {
    selectedTab = event.currentTarget.id
  }

  function insertActionDetail(node: HTMLElement, action: any) {
    const formatter = new JSONFormatter(omit('type', action))
    node.appendChild(formatter.render())
  }
  // TODO missing assign actions
  // TODO display invocations in a separate section
</script>

<section class="frame-info">
  <div role="tablist" class="tabs">
    <button
      id="actions-tab"
      class="tab"
      role="tab"
      on:click={selectTab}
      aria-selected={selectedTab === 'actions-tab'}
      aria-controls="actions-panel">Actions</button
    >
    <button
      id="invoked-tab"
      class="tab"
      role="tab"
      on:click={selectTab}
      aria-selected={selectedTab === 'invoked-tab'}
      aria-controls="invoked-panel">Invoked services</button
    >
  </div>
  <section
    role="tabpanel"
    id="actions-panel"
    class="tabpanel"
    aria-hidden={selectedTab !== 'actions-tab'}
    aria-labelledby="actions-tab"
  >
    {#if snapshot?.actions}
      {#each snapshot.actions as action (action)}
        <details class="action" use:insertActionDetail={action}>
          <summary>{action.type}</summary>
        </details>
      {/each}
    {/if}
  </section>

  <section
    role="tabpanel"
    id="invoked-panel"
    class="tabpanel"
    aria-hidden={selectedTab !== 'invoked-tab'}
    aria-labelledby="invoked-tab"
  >
    Invocations come here
  </section>
</section>

<style>
  .tabs {
    background-color: var(--base02);
    display: flex;
    border-bottom: 1px solid var(--base01);
  }
  button.tab {
    background: none;
    color: var(--base03);
    border: 0;
    padding: 4px 8px;
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'PT Sans Narrow', sans-serif;
  }
  button.tab[aria-selected='true'] {
    background-color: var(--base01);
  }
  button.tab:is(:hover, :active, :focus):not([aria-selected='true']) {
    color: var(--base00);
  }
  .tabpanel {
    padding: 8px;
  }
  .tabpanel[aria-hidden='true'] {
    display: none;
  }

  .tabpanel .action {
    padding-left: 1rem;
  }

  .tabpanel .action > summary {
    display: list-item;
    cursor: pointer;
    margin-left: -1rem;
  }

  .tabpanel
    .action
    > :global(.json-formatter-row)
    > :global(.json-formatter-toggler-link) {
    display: none;
  }

  .tabpanel
    .action
    > :global(.json-formatter-row)
    > :global(.json-formatter-children)
    > :global(.json-formatter-row) {
    margin-left: 0;
  }
</style>
