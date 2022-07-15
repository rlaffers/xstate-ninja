<script>
  import { flattenState } from '../utils'

  export let data
</script>

<div class="state-node-frame">
  {flattenState(data.stateValue)}
</div>

<style>
  :root {
    --bg-color: #121212;
    --state-border-color: #839496;
    --state-color: #ededed;
  }

  .state-node-frame {
    border: 1px solid var(--state-border-color);
    padding: 0.5em 1em;
    margin-bottom: 0.5em;
    background-color: var(--bg-color);
    color: var(--state-color);
    min-width: 10em;
    height: 2em;
    line-height: 2em;
  }

  .state-node-frame.latest {
    position: sticky;
    top: 0px;
  }
</style>
