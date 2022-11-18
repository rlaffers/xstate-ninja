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
