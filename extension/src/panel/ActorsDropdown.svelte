<script>
  // Map
  export let actors
  export let selected = actors.values().next().value.sessionId
</script>

<select name="activeActor" bind:value={selected}>
  {#each [...actors.values()] as actor}
    <option value={actor.sessionId}>{actor.id} ({actor.sessionId}) </option>
  {/each}
</select>
