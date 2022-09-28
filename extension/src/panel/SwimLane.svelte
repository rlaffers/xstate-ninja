<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import type { EventFrame } from './EventFrame.svelte'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import ActorsDropdown from './ActorsDropdown.svelte'
  import ActorDetail from './ActorDetail.svelte'
  import Tracker from './Tracker.svelte'

  export let selectedActor: DeserializedExtendedInspectedActorObject
  // if selectedFrame=null, then the latest actor's snapshot is implied
  export let selectedFrame: EventFrame | StateNodeFrame = null
  export let actors: Map<string, DeserializedExtendedInspectedActorObject> =
    null

  let selectedActorSessionId: string = null

  $: {
    if (selectedActorSessionId != null && actors) {
      const retrievedActor = actors.get(selectedActorSessionId)
      if (retrievedActor == null) {
        // the currently selected actor is no longer available, select something else
        selectedActor = actors.values().next()?.value
        selectedActorSessionId = selectedActor.sessionId
      } else if (retrievedActor !== selectedActor) {
        selectedActor = retrievedActor
      }
    }
  }
</script>

<section class="swim-lane">
  <header class="swim-lane-header">
    <ActorsDropdown
      class="actors-dropdown"
      {actors}
      bind:selectedActorSessionId
    />
    <ActorDetail actor={selectedActor} />
  </header>
  <Tracker actor={selectedActor} bind:selectedFrame />
</section>

<style>
  .swim-lane {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
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
