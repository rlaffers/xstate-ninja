<script lang="ts">
  /* eslint-disable no-use-before-define */
  export let actor = null
</script>

{#if actor != null}
  <p class="actor-detail">
    {#if actor.dead}
      <span title="This actor is dead">💀</span>
    {/if}
    {#if actor.done}
      <span title="The final state has been reached">🏁</span>
    {/if}
  </p>
{/if}

<style>
  .actor-detail {
    margin: 0.5rem 0 0 1rem;
  }

  .actor-detail > span {
    cursor: help;
  }

  .actor-detail:empty {
    margin: 0;
  }
</style>