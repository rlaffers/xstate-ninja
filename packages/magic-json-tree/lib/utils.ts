export function getType(value: any): string {
  if (value === null) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return 'array'
  }
  if (value instanceof Map) {
    return 'map'
  }
  if (value instanceof Set) {
    return 'set'
  }
  return typeof value
}

// this function will make sure that entries from sparse arrays will not include empty slots.
export function getEntries(
  obj: Record<string, unknown> | any[] | Map<any, any> | Set<any>,
): [any, any][] {
  if (Array.isArray(obj) || obj instanceof Map || obj instanceof Set) {
    return [...obj.entries()]
  }
  return Object.entries(obj)
}

export function getTypeSummary(v: any): string {
  const type = getType(v)
  if (type === 'string') {
    return `${type}[v.length]`
  }
  if (type === 'array' || type === 'map' || type === 'set' || type === 'object') {
    return `${type}[${getEntries(v).length}]`
  }
  return type
}

export function getSortedEntries(obj: Record<string, unknown> | any[] | Map<any, any> | Set<any>) {
  return getEntries(obj).sort(([k1], [k2]) => ('' + k1).localeCompare(k2))
}

export type Formatter = (entry: [any, any], path: any[]) => string

export const defaultFormatter: Formatter = ([k]) => {
  return String(k)
}
