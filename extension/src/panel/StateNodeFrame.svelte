<script context="module" lang="ts">
  import type { StateValue } from 'xstate'

  export interface StateNodeFrame {
    type: 'stateNode'
    stateValue: StateValue
    changed?: boolean
    snapshot?: string
    final?: boolean
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
