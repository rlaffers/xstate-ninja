<script lang="ts">
  /* eslint-disable svelte/no-unused-svelte-ignore */
  import { isEmpty } from 'rambda'
  import { useSelector } from '@xstate/svelte'
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import ActorsDropdown from './ActorsDropdown.svelte'
  import ActorDetail from './ActorDetail.svelte'
  import Tracker from './Tracker.svelte'
  import Resizer from './Resizer.svelte'
  import { hiddenStates, unhide } from '../utils/hidden-states'
  import UnhideIcon from './icons/UnhideIcon.svelte'
  import { rootActorContext } from './Panel.svelte'

  export let index: number
  export let selectedActor: DeserializedExtendedInspectedActorObject
  export let closeSwimlane: () => void
  export let previousSwimlane: HTMLElement | null
  export let onMount: (node: HTMLElement) => void

  const rootActor = rootActorContext.get()
  const actors = useSelector(rootActor, (state) => state.context.actors)
  const activeSwimlane = useSelector(rootActor, (state) => state.context.activeSwimlane)

  let active = index === $activeSwimlane
  $: active = index === $activeSwimlane

  function onActorChanged(actor: DeserializedExtendedInspectedActorObject, swimlaneIndex: number) {
    rootActor.send({
      type: 'ACTOR_SELECTED',
      swimlaneIndex,
      actor,
    })
  }

  function onActorSelected(actor: DeserializedExtendedInspectedActorObject) {
    selectedActor = actor
    onActorChanged(actor, index)
  }

  function onSelectSwimlane() {
    rootActor.send({
      type: 'SWIMLANE_SELECTED',
      swimlaneIndex: index,
    })
  }

  function onSelectFrame(frame: EventFrame | StateNodeFrame) {
    rootActor.send({
      type: 'FRAME_SELECTED',
      frame,
      swimlaneIndex: index,
    })
  }

  function onDeselectFrame() {
    rootActor.send({
      type: 'FRAME_DESELECTED',
      swimlaneIndex: index,
    })
  }

  // make sure the selected actor exists in $actors (which are occasionally purged)
  $: {
    if (selectedActor && !isEmpty($actors)) {
      const retrievedActor = $actors[selectedActor.sessionId]
      if (retrievedActor == null) {
        // the currently selected actor is no longer available, select something else
        selectedActor = Object.values($actors)[0]
        onActorChanged(selectedActor, index)
      } else if (retrievedActor !== selectedActor) {
        selectedActor = retrievedActor
      }
    }
  }

  let container: HTMLElement

  let hiddenParallelActorStates = selectedActor
    ? $hiddenStates[selectedActor.sessionId]
    : new Set<string>()
  $: {
    if (selectedActor) {
      hiddenParallelActorStates = $hiddenStates[selectedActor.sessionId] ?? new Set<string>()
    } else {
      hiddenParallelActorStates = new Set<string>()
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<section
  class="swim-lane"
  class:active
  on:click={onSelectSwimlane}
  bind:this={container}
  use:onMount
>
  <div class="swim-lane-content">
    <header class="swim-lane-header">
      <div class="first-row">
        <ActorsDropdown
          class="actors-dropdown"
          actors={$actors}
          {selectedActor}
          {onActorSelected}
        />
        {#if hiddenParallelActorStates.size > 0}
          <button
            type="button"
            class="unhide-btn"
            title="Show hidden parallel states"
            on:click={() => unhide(selectedActor.sessionId)}
          >
            <UnhideIcon class="unhide-icon" />
          </button>
        {/if}
      </div>
      <ActorDetail actor={selectedActor} />
      <button type="button" class="close-btn" on:click={closeSwimlane}>⨯</button>
    </header>
    <Tracker actor={selectedActor} {onSelectFrame} {onDeselectFrame} {active} />
  </div>
  <Resizer nextTarget={container} previousTarget={previousSwimlane} direction="horizontal" />
</section>

<style>
  .swim-lane {
    display: flex;
    flex-direction: row;
    position: relative;
    flex: 1;
  }

  :global(.swim-lane.custom-sized) {
    flex: none !important;
  }

  :global(.swim-lane:first-child > .resizer-horizontal) {
    display: none;
  }

  .swim-lane-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    border-left: 1px solid var(--content-muted);
    position: relative;
  }

  .first-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .close-btn {
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: none;
    box-shadow: none;
    color: var(--content-accent);
    font-size: 1.2rem;
    display: none;
  }

  .close-btn:hover {
    color: var(--blue);
  }

  .swim-lane:hover .close-btn {
    display: block;
  }

  .swim-lane:only-child .close-btn {
    display: none !important;
  }

  .unhide-btn {
    background: none;
    border: none;
    box-shadow: none;
    color: var(--content-accent);
    font-size: 1.2rem;
    width: 2rem;
    margin: 0.5rem 0.25px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.unhide-btn .unhide-icon) {
    width: 100%;
  }

  :global(.unhide-btn > svg > g path) {
    fill: var(--content);
  }

  :global(.unhide-btn:hover > svg > g path) {
    fill: var(--blue) !important;
  }

  .swim-lane:first-child {
    border-left: none;
  }

  :global(.swim-lanes.multi) .swim-lane.active {
    background: var(--background-highlight);
  }

  .swim-lane-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.2rem 0 0.2rem 0;
    width: 100%;
    border-bottom: 1px solid var(--content-muted);
  }

  :global(.actors-dropdown) {
    height: 1.8rem;
    max-width: 15rem;
    align-self: center;
    margin: 0.5rem 0;
  }
</style>
