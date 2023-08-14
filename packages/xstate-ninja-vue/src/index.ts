import { watchEffect } from 'vue'
import {
  useInterpret as useInterpretXState,
  useMachine as useMachineXState,
} from '@xstate/vue'
import type {
  InterpreterOptions,
  AnyStateMachine,
  InternalMachineOptions,
  Observer,
  StateFrom,
} from 'xstate'
import { MaybeLazy, UseMachineOptions } from './types'
import createXStateNinjaInspector from 'xstate-ninja'

const ninja = createXStateNinjaInspector()

export function useInterpret<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  options?: InterpreterOptions &
    UseMachineOptions<TMachine['__TContext'], TMachine['__TEvent']> &
    InternalMachineOptions<
      TMachine['__TContext'],
      TMachine['__TEvent'],
      TMachine['__TResolvedTypesMeta']
    >,
  observerOrListener?:
    | Observer<StateFrom<TMachine>>
    | ((value: StateFrom<TMachine>) => void),
) {
  const service = useInterpretXState(getMachine, options, observerOrListener)
  watchEffect((onCleanup) => {
    if (options?.devTools) {
      ninja.register(service)
      onCleanup(() => ninja.unregister(service))
    }
    return undefined
  })
  return service
}

export function useMachine<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  options?: InterpreterOptions &
    UseMachineOptions<TMachine['__TContext'], TMachine['__TEvent']> &
    InternalMachineOptions<
      TMachine['__TContext'],
      TMachine['__TEvent'],
      TMachine['__TResolvedTypesMeta']
    >,
) {
  const result = useMachineXState(getMachine, options)
  watchEffect((onCleanup) => {
    if (options?.devTools) {
      ninja.register(result.service)
      onCleanup(() => ninja.unregister(result.service))
    }
    return undefined
  })
  return result
}
