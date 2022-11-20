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
  if (Array.isArray(obj)) {
    return Object.keys(obj).map((k) => [k, obj[k]])
  }
  if ('entries' in obj && typeof obj.entries === 'function') {
    return [...obj.entries()]
  }
  return Object.entries(obj)
}
