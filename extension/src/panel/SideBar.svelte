<script lang="ts">
  import { useSelector } from '@xstate/svelte'
  import ContextPanel from './ContextPanel.svelte'
  import ActionsPanel from './ActionsPanel.svelte'
  import ServicesPanel from './ServicesPanel.svelte'
  import EventPanel from './EventPanel.svelte'
  import { isEventFrame } from './EventFrame.svelte'
  import Resizer from './Resizer.svelte'
  import { rootActorContext } from './Panel.svelte'

  const rootActor = rootActorContext.get()
  const actor = useSelector(rootActor, (state) => state.context.activeActor)
  const activeFrame = useSelector(rootActor, (state) => state.context.activeFrame)

  let selectedSnapshot: any = null
  let previousSnapshot: any = null
  $: {
    if ($activeFrame?.snapshot != null) {
      selectedSnapshot = JSON.parse($activeFrame.snapshot)
      const previousSerialized: string | null =
        $actor?.history?.[$activeFrame.historyIndex - 1]?.snapshot ?? null
      previousSnapshot = previousSerialized != null ? JSON.parse(previousSerialized) : null
    } else {
      selectedSnapshot = $actor?.snapshot
      const historySize = $actor?.history?.length ?? 0
      const previousSerialized: string | null = $actor?.history?.[historySize - 2]?.snapshot ?? null
      previousSnapshot = previousSerialized != null ? JSON.parse(previousSerialized) : null
    }
  }

  let node: HTMLElement
</script>

<aside class="sidebar" bind:this={node}>
  <Resizer direction="horizontal" nextTarget={node} />
  {#if $actor?.machine !== undefined}
    <ContextPanel context={selectedSnapshot?.context} previousContext={previousSnapshot?.context} />
    {#if isEventFrame($activeFrame)}
      <EventPanel snapshot={selectedSnapshot} />
    {/if}
    <ActionsPanel snapshot={selectedSnapshot} />
    <ServicesPanel snapshot={selectedSnapshot} />
  {:else}
    <p>This actor is not a state machine.</p>
    {#if isEventFrame($activeFrame)}
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
