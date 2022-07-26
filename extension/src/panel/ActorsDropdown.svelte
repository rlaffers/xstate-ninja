<script lang="ts">
  import type { Actor } from '../actor'

  export let actors: Map<string, Actor>

  let className = ''
  export { className as class }
  let selectedSessionId: string = actors.values().next().value.sessionId
  export let selected: Actor
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
      {actor.id} ({actor.sessionId})
    </option>
  {/each}
</select>
