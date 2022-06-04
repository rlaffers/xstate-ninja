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
