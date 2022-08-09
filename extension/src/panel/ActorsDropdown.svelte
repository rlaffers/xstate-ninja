<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import { last } from '../utils'

  export let actors: Map<string, DeserializedExtendedInspectedActorObject>

  let className = ''
  export { className as class }
  const latestActor: DeserializedExtendedInspectedActorObject =
    actors != null
      ? last(
          Array.from(actors.values()).sort((a, b) => a.createdAt - b.createdAt),
        )
      : null

  // let selectedSessionId: string = actors.values().next().value.sessionId
  let selectedSessionId: string = latestActor ? latestActor.sessionId : null
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
