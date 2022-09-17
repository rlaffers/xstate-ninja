<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'

  /* eslint-disable no-use-before-define */
  export let actor: DeserializedExtendedInspectedActorObject = null

  let created: Date = null
  $: created = actor ? new Date(actor.createdAt) : null

  let updated: Date = null
  $: updated = actor ? new Date(actor.updatedAt) : null

  function formatTime(date?: Date): string {
    if (!date) return 'N/A'

    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes(),
    ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
  }
  function getStatus(actor?: DeserializedExtendedInspectedActorObject): string {
    if (actor == null) return 'N/A'
    switch (actor.status) {
      case 0:
        return 'Not started'
      case 1:
        return actor.dead ? 'Unsubscribed' : 'Running'
      case 2:
        return 'Stopped'
      default:
        return 'N/A'
    }
  }
  function getActorType(
    actor?: DeserializedExtendedInspectedActorObject,
  ): string {
    if (actor?.machine != null) return 'machine'
    // TODO
    return 'p/c/o'
  }
</script>

{#if actor != null}
  <div class="actor-detail">
    {#if actor?.dead}
      <div class="icon" title="This actor is dead">💀</div>
    {/if}
    {#if actor?.snapshot?.done}
      <div class="icon" title="The final state has been reached">🏁</div>
    {/if}
    <dl title="Type" class="type">
      <dt>Type:</dt>
      <dd>{getActorType(actor)}</dd>
    </dl>
    <dl title="Status" class="status">
      <dt>Status:</dt>
      <dd>{getStatus(actor)}</dd>
    </dl>
    <dl title="Started" class="started">
      <dt>✸</dt>
      <dd>{formatTime(created)}</dd>
    </dl>
    <dl title="Last update" class="updated">
      <dt>Δ</dt>
      <dd>{formatTime(updated)}</dd>
    </dl>

    {#if actor?.parent != null}
      <dl title="Parent actor" class="parent">
        <dt>⌂</dt>
        <dd>{actor?.parent}</dd>
      </dl>
    {/if}
  </div>
{/if}

<style>
  .actor-detail {
    display: flex;
    height: 30px;
    width: calc(100% - 0.8rem);
    margin: 0;
    padding: 0.4rem;
    border-bottom: 1px solid var(--base01);
    background-color: var(--base02);
  }

  .actor-detail dl {
    display: flex;
    align-items: center;
    margin-right: 0.8rem;
    margin-block-start: 0;
    margin-block-end: 0;
    cursor: help;
  }
  .actor-detail dt {
    color: var(--base01);
  }
  .actor-detail dt:after {
    content: '';
  }
  .parent dt {
    font-size: 130%;
  }
  .actor-detail dd {
    margin-inline-start: 0.2rem;
  }

  .actor-detail > .icon {
    cursor: help;
    display: flex;
    align-items: center;
    margin-right: 0.8rem;
  }
</style>
