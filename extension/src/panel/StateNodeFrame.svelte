<script context="module" lang="ts">
  import type { StateValue } from 'xstate'

  export interface StateNodeFrame {
    type: 'stateNode'
    stateValue: StateValue
    changed: boolean
  }
</script>

<script lang="ts">
  import { fade } from 'svelte/transition'
  import { flattenState } from '../utils'

  export let data: StateNodeFrame
</script>

<article class="state-node-frame" in:fade>
  {flattenState(data.stateValue)}
</article>

<style>
  .state-node-frame {
    border: 1px solid var(--magenta);
    padding: 0.5em 1em;
    /* margin-bottom: 0.5em; */
    background-color: var(--base03);
    color: var(--magenta);
    min-width: 10em;
    height: 2em;
    line-height: 2em;
    text-align: center;
    cursor: pointer;
    z-index: 3;
  }

  article:last-of-type {
    position: sticky;
    top: 0px;
  }
</style>
