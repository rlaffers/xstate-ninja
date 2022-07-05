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
  const { [prop]: x, ...rest } = obj
  return rest
}
