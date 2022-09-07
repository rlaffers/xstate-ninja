<script lang="ts">
  import type { ActivityActionObject } from 'xstate'

  export let snapshot: any = null

  function isActivityActionObject(
    activity: any,
  ): activity is ActivityActionObject<any, any> {
    if (!activity || typeof activity !== 'object') {
      return false
    }
    const type = (activity as ActivityActionObject<any, any>).activity?.type
    return typeof type === 'string' && type !== ''
  }

  function getActivitySourceType(
    activity: ActivityActionObject<any, any>,
  ): string {
    const { activity: activityDefinition } = activity
    if (!activityDefinition) {
      return '<unknown>'
    }
    if (activityDefinition.type === 'xstate.invoke') {
      if (
        typeof activityDefinition.src?.type === 'string' &&
        activityDefinition.src.type.match(/:invocation\[\d+\]$/)
      ) {
        return '<inlined>'
      }
      return activityDefinition.src?.type ?? '<unknown>'
    } else {
      return activityDefinition.type ?? '<unknown>'
    }
  }
</script>

<h1>Services</h1>
<p class="services-panel">
  {#key snapshot}
    {#if snapshot?.activities && typeof snapshot.activities === 'object'}
      {#each Object.values(snapshot.activities) as activity (activity)}
        {#if isActivityActionObject(activity)}
          <details class="activity">
            <summary>{getActivitySourceType(activity)}</summary>
            <dl>
              <dt>id:</dt>
              <dd>"{activity.activity?.id}"</dd>

              <dt>type:</dt>
              <dd>
                "{activity.activity?.type === 'xstate.invoke'
                  ? 'invoked'
                  : 'activity'}"
              </dd>
            </dl>
          </details>
        {/if}
      {/each}
    {/if}
  {/key}
</p>

<style>
  h1 {
    font-size: 2rem;
    background-color: var(--base01);
    color: var(--base03);
    margin: 0;
    padding: 0 8px;
  }

  .services-panel {
    padding: 8px;
    margin: 0;
  }

  .services-panel .activity {
    padding-left: 1rem;
  }

  .services-panel .activity > summary {
    display: list-item;
    cursor: pointer;
    margin-left: -1rem;
  }

  .services-panel .activity > dl {
    margin: 0;
  }
  .services-panel .activity > dl {
    display: grid;
    grid-template-columns: 3.5rem 1fr;
    grid-template-rows: repeat(auto-fill, 1.3rem);
  }

  .services-panel .activity > dl > dt {
    color: var(--green);
  }
  .services-panel .activity > dl > dd {
    margin: 0;
    color: var(--orange);
  }
</style>
