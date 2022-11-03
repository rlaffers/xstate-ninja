<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import ActorsDropdown from './ActorsDropdown.svelte'
  import ActorDetail from './ActorDetail.svelte'
  import Tracker from './Tracker.svelte'
  import Resizer from './Resizer.svelte'

  export let selectedActor: DeserializedExtendedInspectedActorObject
  export let actors: Map<string, DeserializedExtendedInspectedActorObject> =
    null
  export let active = false
  export let onSelectSwimlane: () => void
  export let onActorChanged: (
    actor: DeserializedExtendedInspectedActorObject,
  ) => void
  export let onSelectFrame: (frame: EventFrame | StateNodeFrame) => void
  export let closeSwimlane: () => void
  export let previousSwimlane: HTMLElement
  export let onMount: (node: HTMLElement) => void

  function onActorSelected(actor: DeserializedExtendedInspectedActorObject) {
    selectedActor = actor
    onActorChanged(selectedActor)
  }

  $: {
    if (selectedActor && actors) {
      const retrievedActor = actors.get(selectedActor.sessionId)
      if (retrievedActor == null) {
        // the currently selected actor is no longer available, select something else
        selectedActor = actors.values().next()?.value
        onActorChanged(selectedActor)
      } else if (retrievedActor !== selectedActor) {
        selectedActor = retrievedActor
      }
    }
  }

  let container: HTMLElement
</script>

<section
  class="swim-lane"
  class:active
  on:click={onSelectSwimlane}
  bind:this={container}
  use:onMount
>
  <div class="swim-lane-content">
    <header class="swim-lane-header">
      <ActorsDropdown
        class="actors-dropdown"
        {actors}
        {selectedActor}
        {onActorSelected}
      />
      <ActorDetail actor={selectedActor} />
      <button type="button" class="close-btn" on:click={closeSwimlane}>⨯</button
      >
    </header>
    <Tracker actor={selectedActor} {onSelectFrame} {active} />
  </div>
  <Resizer
    nextTarget={container}
    previousTarget={previousSwimlane}
    direction="horizontal"
  />
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
