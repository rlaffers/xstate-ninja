<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import ContextPanel from './ContextPanel.svelte'
  import ActionsPanel from './ActionsPanel.svelte'
  import ServicesPanel from './ServicesPanel.svelte'
  import EventPanel from './EventPanel.svelte'
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import { isEventFrame } from './EventFrame.svelte'
  import Resizer from './Resizer.svelte'

  /* eslint-disable no-use-before-define */
  export let actor: DeserializedExtendedInspectedActorObject = null
  export let activeFrame: EventFrame | StateNodeFrame = null

  let selectedSnapshot: any = null
  let previousSnapshot: any = null
  $: {
    if (activeFrame?.snapshot != null) {
      selectedSnapshot = JSON.parse(activeFrame.snapshot)
      previousSnapshot = JSON.parse(
        actor?.history?.[activeFrame.historyIndex - 1]?.snapshot ?? null,
      )
    } else {
      selectedSnapshot = actor?.snapshot
      const historySize = actor?.history?.length ?? 0
      previousSnapshot = JSON.parse(
        actor?.history?.[historySize - 2]?.snapshot ?? null,
      )
    }
  }

  let node: HTMLElement
</script>

<aside class="sidebar" bind:this={node}>
  <Resizer direction="horizontal" nextTarget={node} />
  {#if actor?.machine !== undefined}
    <ContextPanel
      context={selectedSnapshot?.context}
      previousContext={previousSnapshot?.context}
    />
    {#if isEventFrame(activeFrame)}
      <EventPanel snapshot={selectedSnapshot} />
    {/if}
    <ActionsPanel snapshot={selectedSnapshot} />
    <ServicesPanel snapshot={selectedSnapshot} />
  {:else}
    <p>This actor is not a state machine.</p>
    {#if isEventFrame(activeFrame)}
      <EventPanel snapshot={selectedSnapshot} />
    {/if}
  {/if}
</aside>

<style>
  .sidebar {
    grid-area: sidebar;
    border-left: 1px solid var(--content-muted);
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .sidebar > p {
    margin: 1rem;
  }
</style>
