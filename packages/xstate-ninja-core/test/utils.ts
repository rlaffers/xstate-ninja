import { expect, vi, type Mock } from 'vitest'
import { createMachine } from 'xstate'

export const machine = createMachine({
  id: 'mockMachine',
  initial: 'Idle',
  states: {
    Idle: {},
    Busy: {},
  },
})

export function spyOnDispatchedEvent<TEventName extends string>(
  eventType: TEventName,
): [TEventName, Mock<any[], void>] {
  const spy = vi.fn(() => {})
  globalThis.addEventListener(eventType, spy)
  return [eventType, spy]
}

export function expectEventToHaveBeenDispatched([eventType, eventListener]: [
  string,
  Mock<any[], void>,
]) {
  expect(eventListener).toHaveBeenCalledTimes(1)
  const arg = eventListener.mock.calls[0][0]
  expect(arg).toBeInstanceOf(CustomEvent)
  expect((arg as any)?.type).toBe(eventType)
}

export function expectEventNotToHaveBeenDispatched([, eventListener]: [string, Mock<any[], void>]) {
  expect(eventListener).not.toHaveBeenCalled()
}
