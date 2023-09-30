import { useEffect } from 'react'
import { useInterpret as useInterpretXState, useMachine as useMachineXState } from '@xstate/react'
import type {
  InterpreterOptions,
  AnyStateMachine,
  InternalMachineOptions,
  Observer,
  StateFrom,
} from 'xstate'
import { MaybeLazy, UseMachineOptions } from './types'
import createXStateNinjaSingleton from 'xstate-ninja'

const ninja = createXStateNinjaSingleton()

export function useInterpret<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  options?: InterpreterOptions &
    UseMachineOptions<TMachine['__TContext'], TMachine['__TEvent']> &
    InternalMachineOptions<
      TMachine['__TContext'],
      TMachine['__TEvent'],
      TMachine['__TResolvedTypesMeta']
    >,
  observerOrListener?: Observer<StateFrom<TMachine>> | ((value: StateFrom<TMachine>) => void),
) {
  const service = useInterpretXState(getMachine, options, observerOrListener)
  useEffect(() => {
    if (options?.devTools) {
      ninja.register(service)
      return () => ninja.unregister(service)
    }
    return undefined
  }, [options?.devTools])
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
  useEffect(() => {
    if (options?.devTools) {
      const [, , service] = result
      ninja.register(service)
      return () => ninja.unregister(service)
    }
    return undefined
  }, [options?.devTools])
  return result
}
