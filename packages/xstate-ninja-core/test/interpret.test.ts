import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Interpreter } from 'xstate'
import getInspector, { interpret, configure } from '../src/index'
import {
  machine,
  spyOnDispatchedEvent,
  expectEventToHaveBeenDispatched,
  expectEventNotToHaveBeenDispatched,
} from './utils'

describe('interpret', () => {
  beforeEach(() => {
    globalThis.__xstate_ninja__ = true
  })

  afterEach(() => {
    delete globalThis.__xstate_ninja__
  })

  it('should be a function ', () => {
    expect(typeof interpret).toBe('function')
  })

  it('should interpret passed machine and return an actor', () => {
    const actor = interpret(machine)
    expect(actor).toBeInstanceOf(Interpreter)
    expect(actor.id).toBe('mockMachine')
  })

  it('should inspect passed machine when options.devTools is true', () => {
    const inspector = getInspector()
    const spy = vi.spyOn(inspector, 'register')
    const eventSpy = spyOnDispatchedEvent('@xstate/inspect.actor')

    interpret(machine, { devTools: true })
    expect(spy).toHaveBeenCalledTimes(1)
    expectEventToHaveBeenDispatched(eventSpy)
  })

  it('should not inspect passed machine when options.devTools is not true', () => {
    const inspector = getInspector()
    const spy = vi.spyOn(inspector, 'register')
    const eventSpy = spyOnDispatchedEvent('@xstate/inspect.actor')

    interpret(machine)
    expect(spy).not.toHaveBeenCalled()
    expectEventNotToHaveBeenDispatched(eventSpy)
  })

  it('should not inspect passed machine when inspector is disabled', () => {
    const eventSpy = spyOnDispatchedEvent('@xstate/inspect.actor')
    configure({ enabled: false })
    interpret(machine, { devTools: true })
    expectEventNotToHaveBeenDispatched(eventSpy)
  })
})
