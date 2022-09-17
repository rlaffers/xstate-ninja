import { interpret as xstateInterpret, spawn as xstateSpawn } from 'xstate'
import type { InterpreterOptions, AnyStateMachine } from 'xstate'
import { XStateNinja, XStateNinjaOptions } from './XStateNinja'

export * from './events'
export * from './types'
export { LogLevels, ActorTypes } from './XStateNinja'

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
  if (options.enabled != null) {
    xstateNinja.setEnabled(options.enabled)
  }
  return xstateNinja
}

export function interpret(
  machine: AnyStateMachine,
  options?: Partial<InterpreterOptions>,
) {
  const service = xstateInterpret(machine, options)
  if (options?.devTools) {
    createXStateNinjaSingleton().register(service)
  }
  return service
}

export { xstateSpawn as spawn }
