<script>
  import { prettyJSON } from '../utils'

  export let data

  // TODO distinguish: a) changed, b) not changed && guarded, c) not changed && forbidden
</script>

<div class="event-frame" title={prettyJSON(data.event)}>
  {data.event.type}
</div>

<style>
  :root {
    --color: #839496;
    --event-unknown-color: #6e757c;
    --event-unknown-bg-color: var(--bg-color);
    --event-changed-state-bg-color: #068b3e;
    --event-skipped-bg-color: #d36b1b;
    --event-forbidden-bg-color: #e5123b;
  }

  .event-frame {
    border: 1px solid var(--event-unknown-color);
    color: var(--event-unknown-color);
    background-color: var(--event-unknown-bg-color);
    border-radius: 10px;
    padding: 0.5em 1em;
    margin-bottom: 0.5em;
    height: 1em;
    line-height: 1em;
  }

  .event-frame.changed-state {
    border-color: var(--color);
    background-color: var(--event-changed-state-bg-color);
    color: var(--color);
  }

  .event-frame.guard-not-passed {
    border-color: var(--color);
    background-color: var(--event-skipped-bg-color);
    color: var(--color);
  }

  .event-frame.forbidden {
    border-color: var(--color);
    background-color: var(--event-forbidden-bg-color);
    color: var(--color);
  }
</style>
