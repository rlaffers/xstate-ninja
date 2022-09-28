<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import ActorsDropdown from './ActorsDropdown.svelte'
  import ActorDetail from './ActorDetail.svelte'
  import Tracker from './Tracker.svelte'

  export let selectedActor: DeserializedExtendedInspectedActorObject
  export let actors: Map<string, DeserializedExtendedInspectedActorObject> =
    null
  export let active = false
  export let onSelectSwimLane: () => void
  export let onActorChanged: (
    actor: DeserializedExtendedInspectedActorObject,
  ) => void
  export let onSelectFrame: (frame: EventFrame | StateNodeFrame) => void
  export let closeSwimLane: () => void

  let selectedActorSessionId: string = null

  $: {
    if (selectedActorSessionId != null && actors) {
      const retrievedActor = actors.get(selectedActorSessionId)
      if (retrievedActor == null) {
        // the currently selected actor is no longer available, select something else
        selectedActor = actors.values().next()?.value
        selectedActorSessionId = selectedActor.sessionId
        onActorChanged(selectedActor)
      } else if (retrievedActor !== selectedActor) {
        selectedActor = retrievedActor
        onActorChanged(selectedActor)
      }
    }
  }
</script>

<section class="swim-lane" class:active on:click={onSelectSwimLane}>
  <header class="swim-lane-header">
    <ActorsDropdown
      class="actors-dropdown"
      {actors}
      bind:selectedActorSessionId
    />
    <ActorDetail actor={selectedActor} />
    <button type="button" class="close-btn" on:click={closeSwimLane}>⨯</button>
  </header>
  <Tracker actor={selectedActor} {onSelectFrame} {active} />
</section>

<style>
  .swim-lane {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    border-left: 1px solid var(--base01);
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: none;
    box-shadow: none;
    color: var(--base1);
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
    background: var(--base02);
  }

  .swim-lane-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.2rem 0 0.2rem 0;
    width: 100%;
    border-bottom: 1px solid var(--base01);
  }

  :global(.actors-dropdown) {
    height: 1.8rem;
    max-width: 15rem;
    align-self: center;
    margin: 0.5rem 0;
  }
</style>
