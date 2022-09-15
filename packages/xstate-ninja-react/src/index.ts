import { useInterpret as useInterpretXState } from '@xstate/react'
import type { InterpreterOptions, AnyStateMachine } from 'xstate'
import createXStateNinjaSingleton from 'xstate-ninja'

export function useInterpret(
  machine: AnyStateMachine,
  options?: Partial<InterpreterOptions>,
) {
  const service = useInterpretXState(machine, options)
  createXStateNinjaSingleton().register(service)
  return service
}
