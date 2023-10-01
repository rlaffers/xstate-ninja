<script context="module" lang="ts">
  /* eslint-disable svelte/no-unused-svelte-ignore */
  import type { StateValue } from 'xstate'
  import type { EventFrame } from './EventFrame.svelte'
  import HideIcon from './icons/HideIcon.svelte'

  export interface StateNodeFrame {
    id: string
    type: 'stateNode'
    stateValue: StateValue
    changed?: boolean
    snapshot?: string
    final?: boolean
    startedInvocation: boolean
    stoppedInvocation: boolean
    historyIndex: number
  }

  export function isStateNodeFrame(frame: StateNodeFrame | EventFrame): frame is StateNodeFrame {
    return frame == null ? false : frame.type === 'stateNode'
  }
</script>

<script lang="ts">
  import { fade } from 'svelte/transition'
  import { flattenState, isCompoundState } from '../utils'
  import { hiddenStates, hide } from '../utils/hidden-states'

  export let data: StateNodeFrame
  export let onSelectFrame: (frame: StateNodeFrame) => void
  export let isSelected = false
  export let actorSessionId: string

  function hideStateName(event: MouseEvent) {
    const btn = event.currentTarget
    if (btn instanceof HTMLElement && btn.dataset.stateName !== undefined) {
      hide(actorSessionId, btn.dataset.stateName.replace(/\..+/, ''))
    }
  }

  function selectFrame(event: MouseEvent) {
    onSelectFrame(data)
    event.stopPropagation()
  }

  let hiddenParallelActorStates = $hiddenStates[actorSessionId] ?? new Set()
  $: {
    hiddenParallelActorStates = $hiddenStates[actorSessionId] ?? new Set()
  }

  function isHidden(stateName: string): boolean {
    const root = stateName.replace(/\..+/, '')
    return hiddenParallelActorStates.has(root)
  }

  const flatStateNames = flattenState(data.stateValue)
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<article
  class:selected={isSelected}
  class:final={data?.final}
  class="state-node-frame"
  in:fade
  on:click={selectFrame}
>
  {#key hiddenParallelActorStates}
    <div class="parallel-state-names">
      {#each flatStateNames as stateName}
        {#if flatStateNames.length === 1}
          <div>{stateName}</div>
        {:else if flatStateNames.length > 1 && isCompoundState(stateName) && !isHidden(stateName)}
          <div class="state-name-wrapper">
            <button
              class="hide-btn"
              type="button"
              on:click={hideStateName}
              data-state-name={stateName}
              title="Hide this parallel state"
            >
              <HideIcon class="hide-icon" />
            </button>
            <div>{stateName}</div>
          </div>
        {/if}
      {/each}
    </div>
  {/key}
  <div class="info-icons">
    {#if data.startedInvocation}
      <div class="icon-started-invocation" title="A service was invoked here">⊕</div>
    {/if}
    {#if data.stoppedInvocation}
      <div class="icon-stopped-invocation" title="An invoked service was stopped here">⊖</div>
    {/if}
  </div>
</article>

<style>
  .state-node-frame {
    grid-column: 2 / 3;
    border: 1px solid var(--magenta);
    padding: 0.5em 1em;
    background-color: var(--background);
    color: var(--magenta);
    min-width: 10em;
    /* height: 2em; */
    line-height: 2em;
    text-align: center;
    cursor: pointer;
    z-index: 3;
    position: relative;
  }

  .parallel-state-names {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .info-icons {
    position: absolute;
    top: 0;
    right: 0;
    line-height: 1rem;
    height: 1rem;
    padding-top: 1px;
    padding-right: 4px;
    display: flex;
    gap: 2px;
  }

  .state-name-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .hide-btn {
    width: 1.8rem;
    height: 1rem;
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    display: none;
  }

  .state-name-wrapper:hover > .hide-btn {
    display: block;
  }

  :global(.hide-icon) {
    width: 100%;
    height: 100%;
  }

  :global(.hide-icon > g > path) {
    fill: var(--content-muted) !important;
  }
  :global(.hide-icon:hover > g > path) {
    fill: var(--blue) !important;
  }

  .state-node-frame.final .info-icons {
    top: 3px;
    right: 3px;
  }

  .selected {
    box-shadow: inset 0 0 10px;
  }

  .final {
    position: relative;
  }
  .final::after {
    content: ' ';
    position: absolute;
    z-index: -1;
    inset: 4px;
    border: 1px solid var(--magenta);
  }

  article:last-of-type {
    position: sticky;
    top: 0px;
  }
</style>
