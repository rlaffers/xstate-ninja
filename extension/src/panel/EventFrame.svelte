<script>
  export let data

  // Sorts state nodes. The lowest one (the highest order) comes first.
  function sortStateNodes(stateNodes) {
    return stateNodes.slice().sort((a, b) => a.order < b.order)
  }

  // TODO how does configuration look for parallel states?
  function isTransitionGuarded(eventType, configuration) {
    for (const stateNode of sortStateNodes(configuration)) {
      if (stateNode.config.on === undefined) {
        continue
      }
      if (stateNode.config.on[eventType] !== undefined) {
        const transition = stateNode.config.on[eventType]
        if (typeof transition === 'string') {
          return false
        } else if (Array.isArray(transition)) {
          return transition.every((x) => x.cond !== undefined)
        } else {
          return transition.cond !== undefined
        }
      }
      // forbidden transition
      if (
        Object.prototype.hasOwnProperty.call(stateNode.config.on, eventType) &&
        stateNode.config.on[eventType] === undefined
      ) {
        return false
      }
    }
    return false
  }

  function isTransitionForbidden(eventType, configuration) {
    for (const stateNode of sortStateNodes(configuration)) {
      if (
        stateNode.config.on !== undefined &&
        Object.prototype.hasOwnProperty.call(stateNode.config.on, eventType) &&
        stateNode.config.on[eventType] === undefined
      ) {
        return true
      }
      if (stateNode.config.on?.[eventType] !== undefined) {
        return false
      }
    }
    return false
  }

  // TODO get configuration from the actor
  const configuration = []

  let className
  let description
  if (data.changed) {
    className = 'changed-state'
    description = 'This event triggered a state transition'
  } else if (isTransitionGuarded(data.event.type, configuration)) {
    className = 'guard-not-passed'
    description =
      'A guard prevented this event from triggering a state transition'
  } else if (isTransitionForbidden(data.event.type, configuration)) {
    className = 'forbidden'
    description = 'Transition for this event is forbidden explicitly'
  } else {
    description = 'No transition exists for this event'
  }
</script>

<div class="event-frame {className}" title={description}>
  {data.event.type}
</div>

<style>
  .event-frame {
    display: inline-block;
    border: 1px solid var(--base01);
    color: var(--base01);
    border-radius: 1rem;
    padding: 0.5em 1em;
    margin-bottom: 0.5em;
    height: 1em;
    line-height: 1em;
    text-align: center;
    cursor: pointer;
  }

  .event-frame.changed-state {
    border-color: var(--base1);
    color: var(--base1);
  }

  .event-frame.guard-not-passed {
    border-color: var(--orange);
    color: var(--orange);
  }

  .event-frame.forbidden {
    border-color: var(--red);
    background-color: var(--base03);
    color: var(--red);
  }
</style>
