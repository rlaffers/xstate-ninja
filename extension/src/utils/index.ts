import type { StateValue } from 'xstate'

export function log(...args: any[]) {
  console.log('%c[LOG]', 'color: cyan', ...args)
}

export function error(...args: any[]) {
  console.log('%c[ERR]', 'color: red', ...args)
}

export function warn(...args: any[]) {
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

export function prettyJSON(obj: [] | Record<string, unknown> = {}): string {
  const result = JSON.stringify(obj, undefined, 2).replace(/"([^"]+)":/g, '$1:')
  return result
    .slice(2, -2)
    .split('\n')
    .map((l) => l.slice(2))
    .join('\n')
}

export function flattenState(stateValue: StateValue): string[] {
  if (typeof stateValue === 'string') {
    return [stateValue]
  }

  const result = []
  for (const [key, value] of Object.entries(stateValue)) {
    result.push(`${key}.${flattenState(value)}`.replace(/\.$/, ''))
  }
  return result
}

export function isCompoundState(stateName: string): boolean {
  return /\./.test(stateName)
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
