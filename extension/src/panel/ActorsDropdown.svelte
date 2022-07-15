<script>
  export let actors
  let selectedSessionId = actors.values().next().value.sessionId
  export let selected
  $: selected = actors.get(selectedSessionId)
</script>

<select name="activeActor" bind:value={selectedSessionId}>
  {#each [...actors.values()] as actor}
    <option value={actor.sessionId}
      >{actor.dead ? '💀' : ''}
      {actor.id} ({actor.sessionId})
    </option>
  {/each}
</select>
