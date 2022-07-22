<script>
  import { fade } from 'svelte/transition'
  import { flattenState } from '../utils'

  export let data
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
  }

  article:last-of-type {
    position: sticky;
    top: 0px;
  }
</style>
