<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import ContextPanel from './ContextPanel.svelte'
  import ActionsPanel from './ActionsPanel.svelte'
  import ServicesPanel from './ServicesPanel.svelte'

  /* eslint-disable no-use-before-define */
  export let actor: DeserializedExtendedInspectedActorObject = null
  export let selectedSnapshot: any = null
</script>

<aside class="sidebar">
  {#if actor?.machine !== undefined}
    <ContextPanel
      context={selectedSnapshot?.context ?? actor?.snapshot?.context}
    />
    <ActionsPanel snapshot={selectedSnapshot ?? actor?.snapshot} />
    <ServicesPanel snapshot={selectedSnapshot ?? actor?.snapshot} />
  {:else}
    <p>This actor is not a state machine.</p>
  {/if}
</aside>

<style>
  .sidebar {
    grid-area: sidebar;
    border-left: 1px solid var(--base01);
  }
  .sidebar > p {
    margin: 1rem;
  }
</style>
