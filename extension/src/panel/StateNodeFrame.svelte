<script context="module" lang="ts">
  import type { StateValue } from 'xstate'
  import type { EventFrame } from './EventFrame.svelte'

  export interface StateNodeFrame {
    id: string
    type: 'stateNode'
    stateValue: StateValue
    changed?: boolean
    snapshot?: string
    final?: boolean
    startedInvocation: boolean
    stoppedInvocation: boolean
  }

  export function isStateNodeFrame(
    frame: StateNodeFrame | EventFrame,
  ): frame is StateNodeFrame {
    return frame == null ? false : frame.type === 'stateNode'
  }
</script>

<script lang="ts">
  import { fade } from 'svelte/transition'
  import { flattenState } from '../utils'

  export let data: StateNodeFrame
  export let onSelectFrame: (frame: StateNodeFrame) => void
  export let isSelected = false

  function selectFrame(event: MouseEvent) {
    onSelectFrame(data)
    event.stopPropagation()
  }
</script>

<article
  class:selected={isSelected}
  class:final={data?.final}
  class="state-node-frame"
  in:fade
  on:click={selectFrame}
>
  {flattenState(data.stateValue)}
  <div class="info-icons">
    {#if data.startedInvocation}
      <div class="icon-started-invocation">⊕</div>
    {/if}
    {#if data.stoppedInvocation}
      <div class="icon-stopped-invocation">⊖</div>
    {/if}
  </div>
</article>

<style>
  .state-node-frame {
    border: 1px solid var(--magenta);
    padding: 0.5em 1em;
    background-color: var(--base03);
    color: var(--magenta);
    min-width: 10em;
    height: 2em;
    line-height: 2em;
    text-align: center;
    cursor: pointer;
    z-index: 3;
    position: relative;
  }

  .info-icons {
    position: absolute;
    top: 0;
    right: 0;
    line-height: 1rem;
    height: 1rem;
    padding-top: 1px;
    padding-right: 4px;
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
