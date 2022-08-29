<script lang="ts">
  import type { ActivityActionObject } from 'xstate'
  import JSONFormatter from 'json-formatter-js'
  import { omit } from '../utils'

  export let snapshot: any = null

  let selectedTab = 'actions-tab'
  function selectTab(
    event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) {
    selectedTab = event.currentTarget.id
  }

  function insertActionDetail(node: HTMLElement, action: any) {
    const formatter = new JSONFormatter(omit('type', action))
    node.appendChild(formatter.render())
  }
  interface ActivityActionObjectMap {
    [activityKey: string]: ActivityActionObject<any, any> | false
  }

  function isActivityActionObjectMap(
    activities: any,
  ): activities is ActivityActionObjectMap {
    if (activities != null && typeof activities === 'object') {
      const activity = Object.values(activities)[0]
      if (!activity || typeof activity !== 'object') {
        return false
      }
      const type = (activity as ActivityActionObject<any, any>).activity?.type
      return typeof type === 'string' && type !== ''
    }
    return false
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

<section class="frame-info">
  <div role="tablist" class="tabs">
    <button
      id="actions-tab"
      class="tab"
      role="tab"
      on:click={selectTab}
      aria-selected={selectedTab === 'actions-tab'}
      aria-controls="actions-panel">Actions</button
    >
    <button
      id="invoked-tab"
      class="tab"
      role="tab"
      on:click={selectTab}
      aria-selected={selectedTab === 'invoked-tab'}
      aria-controls="invoked-panel">Services</button
    >
  </div>
  <section
    role="tabpanel"
    id="actions-panel"
    class="tabpanel"
    aria-hidden={selectedTab !== 'actions-tab'}
    aria-labelledby="actions-tab"
  >
    {#if snapshot?.actions}
      {#each snapshot.actions as action (action)}
        <details class="action" use:insertActionDetail={action}>
          <summary>{action.type}</summary>
        </details>
      {/each}
    {/if}
  </section>

  <section
    role="tabpanel"
    id="invoked-panel"
    class="tabpanel"
    aria-hidden={selectedTab !== 'invoked-tab'}
    aria-labelledby="invoked-tab"
  >
    {#if snapshot?.activities && isActivityActionObjectMap(snapshot.activities)}
      {#each Object.values(snapshot.activities) as activity (activity)}
        {#if activity}
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
  </section>
</section>

<style>
  .tabs {
    background-color: var(--base02);
    display: flex;
    border-bottom: 1px solid var(--base01);
  }
  button.tab {
    background: none;
    color: var(--base03);
    border: 0;
    padding: 4px 8px;
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'PT Sans Narrow', sans-serif;
  }
  button.tab[aria-selected='true'] {
    background-color: var(--base01);
  }
  button.tab:is(:hover, :active, :focus):not([aria-selected='true']) {
    color: var(--base00);
  }
  .tabpanel {
    padding: 8px;
  }
  .tabpanel[aria-hidden='true'] {
    display: none;
  }

  .tabpanel .action,
  .tabpanel .activity {
    padding-left: 1rem;
  }

  .tabpanel .action > summary,
  .tabpanel .activity > summary {
    display: list-item;
    cursor: pointer;
    margin-left: -1rem;
  }

  .tabpanel
    .action
    > :global(.json-formatter-row)
    > :global(.json-formatter-toggler-link) {
    display: none;
  }

  .tabpanel
    .action
    > :global(.json-formatter-row)
    > :global(.json-formatter-children)
    > :global(.json-formatter-row) {
    margin-left: 0;
  }

  .tabpanel .activity > dl {
    margin: 0;
  }
  .tabpanel .activity > dl {
    display: grid;
    grid-template-columns: 3.5rem 1fr;
    grid-template-rows: repeat(auto-fill, 1.3rem);
  }

  .tabpanel .activity > dl > dt {
    color: var(--green);
  }
  .tabpanel .activity > dl > dd {
    margin: 0;
    color: var(--orange);
  }
</style>
