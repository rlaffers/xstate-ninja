<script>
  export let actors
  let className = ''
  export { className as class }
  let selectedSessionId = actors.values().next().value.sessionId
  export let selected
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
