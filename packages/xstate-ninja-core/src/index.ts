import { interpret as xstateInterpret } from 'xstate'
import type { AnyStateMachine, InterpreterOptions } from 'xstate'
import { XStateNinjaInspector, XStateNinjaOptions } from './XStateNinjaInspector'

export * from './events'
export * from './types'
export { isActorType, LogLevels } from './XStateNinjaInspector'

let inspector: XStateNinjaInspector
/**
 * Creates a singleton XStateNinjaInspector which can be used to register
 * for updates from actors (e.g. state machines).
 */
export default function getXStateNinjaInspector(): XStateNinjaInspector {
  if (inspector === undefined) {
    inspector = new XStateNinjaInspector()
  }
  return inspector
}

export function interpret(machine: AnyStateMachine, options?: Partial<InterpreterOptions>) {
  const actor = xstateInterpret(machine, options)
  if (options?.devTools) {
    getXStateNinjaInspector().register(actor)
  }
  return actor
}

export function configure(options: XStateNinjaOptions = {}) {
  const ninja = getXStateNinjaInspector()
  if (options.logLevel != null) {
    ninja.setLogLevel(options.logLevel)
  }
  if (options.enabled != null) {
    ninja.setEnabled(options.enabled)
  }
}
