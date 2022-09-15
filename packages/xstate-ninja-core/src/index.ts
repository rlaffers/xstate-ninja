import { interpret as xstateInterpret, spawn as xstateSpawn } from 'xstate'
import type { InterpreterOptions, AnyStateMachine } from 'xstate'
import { XStateNinja, XStateNinjaOptions } from './XStateNinja'

export * from './events'
export * from './types'
export { LogLevels } from './XStateNinja'

// Usage:
// import { interpret } from 'xstate-ninja'
// const service = interpret(machine)
//
// OR
// import { interpret } from 'xstate'
// import createXStateNinja, { LogLevels } from 'xstate-ninja'
// const xstateNinja = createXStateNinja({ logLevel: LogLevels.debug })
// const service = interpret(machine)
// xstateNinja.register(service)
//
// xstateNinja.onUpdate(() => {}) // subscribe to updates
//
//
let xstateNinja: XStateNinja
export default function createXStateNinjaSingleton(
  options: XStateNinjaOptions = {},
): XStateNinja {
  if (xstateNinja === undefined) {
    xstateNinja = new XStateNinja(options)
  }
  if (options.logLevel != null) {
    xstateNinja.setLogLevel(options.logLevel)
  }
  return xstateNinja
}

export function interpret(
  machine: AnyStateMachine,
  options?: Partial<InterpreterOptions>,
) {
  const service = xstateInterpret(machine, options)
  createXStateNinjaSingleton().register(service)
  return service
}

export { xstateSpawn as spawn }
