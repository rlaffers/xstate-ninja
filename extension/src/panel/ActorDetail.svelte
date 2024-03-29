<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import { ActorTypes } from 'xstate-ninja'

  /* eslint-disable no-use-before-define */
  export let actor: DeserializedExtendedInspectedActorObject

  let created: Date | null = null
  $: created = actor ? new Date(actor.createdAt) : null

  let updated: Date | null = null
  $: updated = actor ? new Date(actor.updatedAt) : null

  function formatTime(date: Date | null): string {
    if (!date) return 'N/A'

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
      2,
      '0',
    )}:${String(date.getSeconds()).padStart(2, '0')}`
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
        return actor.dead ? 'Unsubscribed' : 'N/A'
    }
  }
  function getActorType(actr: DeserializedExtendedInspectedActorObject): string {
    switch (actr.type) {
      case ActorTypes.machine:
        return 'machine'
      case ActorTypes.callback:
        return 'callback'
      case ActorTypes.promise:
        return 'promise'
      case ActorTypes.observable:
        return 'observable'
      default:
        return 'unknown'
    }
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
    <dl class="type">
      <dt>Type:</dt>
      <dd>{getActorType(actor)}</dd>
    </dl>
    <dl class="status">
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
    width: calc(100% - 0.8rem);
    margin: 0;
    padding: 0.4rem;
    flex-wrap: wrap;
  }

  .actor-detail dl {
    display: flex;
    align-items: center;
    margin-right: 0.8rem;
    margin-block-start: 0;
    margin-block-end: 0;
  }
  .actor-detail dl:not(.type, .status) {
    cursor: help;
  }
  .actor-detail dt {
    color: var(--content-muted);
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
