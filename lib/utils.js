export function flattenState(stateValue) {
  if (typeof stateValue === 'string') {
    return stateValue
  }
  let result = ''
  Object.entries(stateValue).forEach(([key, value]) => {
    // TODO add support for parallel states
    result = `${key}.${flattenState(value)}`
  })
  return result
}

// Sorts state nodes. The lowest one (the highest order) comes first.
function sortStateNodes(stateNodes) {
  return stateNodes.slice().sort((a, b) => a.order < b.order)
}

// TODO how does configuration look for parallel states?
export function isTransitionGuarded(eventType, configuration) {
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

export function isTransitionForbidden(eventType, configuration) {
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

export function prettyJSON(obj) {
  const result = JSON.stringify(obj, undefined, 2).replace(/"([^"]+)":/g, '$1:')
  return result
    .slice(2, -2)
    .split('\n')
    .map((l) => l.slice(2))
    .join('\n')
}
