import { useEffect } from 'react'
import { useInterpret as useInterpretXState } from '@xstate/react'
import type { InterpreterOptions, AnyStateMachine } from 'xstate'
import createXStateNinjaSingleton from 'xstate-ninja'

const ninja = createXStateNinjaSingleton()

export function useInterpret(
  machine: AnyStateMachine,
  options?: Partial<InterpreterOptions>,
) {
  const service = useInterpretXState(machine, options)
  useEffect(() => {
    ninja.register(service)
    return () => ninja.unregister(service)
  }, [])
  return service
}
