import type { StateValue } from 'xstate'

export function log(...args) {
  console.log('%c[LOG]', 'color: cyan', ...args)
}

export function error(...args) {
  console.log('%c[ERR]', 'color: red', ...args)
}

export function warn(...args) {
  console.log('%c[WARN]', 'color: orangered', ...args)
}

export function omit(prop: string, obj: Record<string, unknown>) {
  // eslint-disable-next-line
  const { [prop]: _, ...rest } = obj
  return rest
}

export function last(list: any[]) {
  return list[list.length - 1]
}

export function prettyJSON(obj: [] | Record<string, unknown>) {
  const result = JSON.stringify(obj, undefined, 2).replace(/"([^"]+)":/g, '$1:')
  return result
    .slice(2, -2)
    .split('\n')
    .map((l) => l.slice(2))
    .join('\n')
}

export function flattenState(stateValue: StateValue) {
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

export function pick(names: string[], obj: Record<string, any>) {
  const result = {}
  let idx = 0
  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]]
    }
    idx += 1
  }
  return result
}
