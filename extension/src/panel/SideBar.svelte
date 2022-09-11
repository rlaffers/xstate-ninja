<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import ContextPanel from './ContextPanel.svelte'
  import ActionsPanel from './ActionsPanel.svelte'
  import ServicesPanel from './ServicesPanel.svelte'
  import EventPanel from './EventPanel.svelte'
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import { isEventFrame } from './EventFrame.svelte'

  /* eslint-disable no-use-before-define */
  export let actor: DeserializedExtendedInspectedActorObject = null
  export let selectedFrame: EventFrame | StateNodeFrame = null

  let selectedSnapshot: any = null
  $: selectedSnapshot =
    selectedFrame?.snapshot != null ? JSON.parse(selectedFrame.snapshot) : null
</script>

<aside class="sidebar">
  {#if actor?.machine !== undefined}
    <ContextPanel
      context={selectedSnapshot?.context ?? actor?.snapshot?.context}
    />
    {#if isEventFrame(selectedFrame)}
      <EventPanel snapshot={selectedSnapshot ?? actor?.snapshot} />
    {/if}
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
