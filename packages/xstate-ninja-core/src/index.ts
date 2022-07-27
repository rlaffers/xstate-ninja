// import { interpret as xstateInterpret, spawn as xstateSpawn } from 'xstate'
// import type {
//   InterpreterOptions,
//   ActorRef,
//   Spawnable,
//   AnyStateMachine,
//   AnyInterpreter,
//   AnyActorRef,
// } from 'xstate'
export type { XStateDevInterface, WindowWithXStateNinja } from './types'

// SpawnOptions are not exported from xstate, so here's a copy
// interface SpawnOptions {
//   name?: string
//   autoForward?: boolean
//   sync?: boolean
// }

// const extensionAPI = window.__xstate_ninja__

// export function interpret(
//   machine: AnyStateMachine,
//   options: Partial<InterpreterOptions>,
// ) {
//   const service = xstateInterpret(machine, options)
//   extensionAPI?.register(service)
//   return service
// }

// export function spawn(
//   entity: Spawnable,
//   nameOrOptions?: string | SpawnOptions,
// ): ActorRef<any> {
//   return xstateSpawn(entity, nameOrOptions)
// }

// export function register(actor: AnyInterpreter | AnyActorRef) {
//   return extensionAPI?.register(actor)
// }

// export function unregister(actor: AnyInterpreter | AnyActorRef) {
//   return extensionAPI?.unregister(actor)
// }

export {}
