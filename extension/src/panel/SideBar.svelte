<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import JSONFormatter from 'json-formatter-js'

  /* eslint-disable no-use-before-define */
  export let actor: DeserializedExtendedInspectedActorObject = null

  let contextContainer: HTMLElement
  $: {
    if (actor?.snapshot?.context) {
      const formatter = new JSONFormatter(actor.snapshot.context)
      contextContainer.innerHTML = ''
      contextContainer.appendChild(formatter.render())
      formatter.openAtDepth(2)
    }
  }
</script>

<aside class="sidebar">
  <h1>Context</h1>
  <p class="context-container" bind:this={contextContainer} />
</aside>

<style>
  .sidebar {
    grid-area: sidebar;
    border-left: 1px solid var(--base01);
  }
  .sidebar h1 {
    font-size: 2rem;
    background-color: var(--base01);
    color: var(--base03);
    margin: 0;
    padding: 0 0.5rem;
  }
  .sidebar p {
    margin: 0.5rem;
  }
</style>
