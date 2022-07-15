<script>
  export let actor = null
</script>

{#if actor != null}
  Actor selected: {actor.id} ({JSON.stringify(actor.stateValue)}){actor.done
    ? ' 🏁'
    : ''}
{/if}
