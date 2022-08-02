<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'

  export let actors: Map<string, DeserializedExtendedInspectedActorObject>

  let className = ''
  export { className as class }
  let selectedSessionId: string = actors.values().next().value.sessionId
  export let selected: DeserializedExtendedInspectedActorObject
  $: {
    const selectedActor = actors.get(selectedSessionId)
    if (selectedActor !== selected) {
      selected = selectedActor
    }
  }
</script>

<select name="activeActor" bind:value={selectedSessionId} class={className}>
  {#each [...actors.values()] as actor}
    <option value={actor.sessionId}
      >{actor.dead ? '💀' : ''}
      {actor.actorId} ({actor.sessionId})
    </option>
  {/each}
</select>
