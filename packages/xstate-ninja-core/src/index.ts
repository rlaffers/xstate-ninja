import { interpret as xstateInterpret } from 'xstate'
import type { AnyStateMachine, InterpreterOptions } from 'xstate'
import {
  XStateNinjaInspector,
  XStateNinjaOptions,
} from './XStateNinjaInspector'

export * from './events'
export * from './types'
export { isActorType, LogLevels } from './XStateNinjaInspector'

let inspector: XStateNinjaInspector
/**
 * Creates a singleton XStateNinjaInspector which can be used to register
 * for updates from actors (e.g. state machines).
 */
export default function createXStateNinjaInspector(
  options: XStateNinjaOptions = {},
): XStateNinjaInspector {
  if (inspector === undefined) {
    inspector = new XStateNinjaInspector(options)
  }
  if (options.logLevel != null) {
    inspector.setLogLevel(options.logLevel)
  }
  if (options.enabled != null) {
    inspector.setEnabled(options.enabled)
  }
  return inspector
}

export function interpret(
  machine: AnyStateMachine,
  options?: Partial<InterpreterOptions>,
) {
  const service = xstateInterpret(machine, options)
  if (options?.devTools) {
    createXStateNinjaInspector().register(service)
  }
  return service
}
