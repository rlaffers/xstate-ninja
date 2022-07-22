export function log(...args) {
  console.log('%c[LOG]', 'color: cyan', ...args)
}

export function error(...args) {
  console.log('%c[ERR]', 'color: red', ...args)
}

export function warn(...args) {
  console.log('%c[WARN]', 'color: orangered', ...args)
}

export function omit(prop, obj) {
  // eslint-disable-next-line
  const { [prop]: _, ...rest } = obj
  return rest
}

export function last(list) {
  return list[list.length - 1]
}

export function prettyJSON(obj) {
  const result = JSON.stringify(obj, undefined, 2).replace(/"([^"]+)":/g, '$1:')
  return result
    .slice(2, -2)
    .split('\n')
    .map((l) => l.slice(2))
    .join('\n')
}

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
