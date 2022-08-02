import { interpret as xstateInterpret, spawn as xstateSpawn } from 'xstate'
import type {
  InterpreterOptions,
  ActorRef,
  Spawnable,
  AnyStateMachine,
} from 'xstate'
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

// SpawnOptions are not exported from xstate, so here's a copy
interface SpawnOptions {
  name?: string
  autoForward?: boolean
  sync?: boolean
}

export function spawn(
  entity: Spawnable,
  nameOrOptions?: string | SpawnOptions,
): ActorRef<any> {
  const service = xstateSpawn(entity, nameOrOptions)
  createXStateNinjaSingleton().register(service)
  return service
}
