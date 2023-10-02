import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Interpreter } from 'xstate'
import { InterpreterStatus } from 'xstate'
import getInspector, { interpret, configure, TransitionTypes } from '../src/index'
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
    const registerEventSpy = spyOnDispatchedEvent('@xstate/inspect.actor')

    interpret(machine, { devTools: true })
    expect(spy).toHaveBeenCalledTimes(1)
    expectEventToHaveBeenDispatched(registerEventSpy)

    const event = registerEventSpy[1].mock.calls[0][0] as CustomEvent
    expect(event.detail, 'event.detail').toMatchObject({
      type: '@xstate/inspect.actor',
      sessionId: 'x:1',
      inspectedActor: expect.objectContaining({
        actorId: 'mockMachine',
        // sessionId: 'x:1',
        status: InterpreterStatus.NotStarted,
        type: 1,
        dead: false,
        events: [],
        history: [],
      }),
    })
    expect(typeof event.detail.createdAt).toBe('number')
    expect(typeof event.detail.machine).toBe('string')
    expect(typeof event.detail.sessionId).toBe('string')
  })

  it('should send update events to devtools', () => {
    const actor = interpret(machine, { devTools: true })

    // xstate.init should be sent to devtools
    const updateEventSpy = spyOnDispatchedEvent('@xstate/inspect.update')
    actor.start()
    expectEventToHaveBeenDispatched(updateEventSpy)
    const updateEvent1 = updateEventSpy[1].mock.calls[0][0].detail
    expect(updateEvent1).toMatchObject({
      type: '@xstate/inspect.update',
      // sessionId: 'x:1',
      actorId: 'mockMachine',
      status: InterpreterStatus.Running,
      event: {
        name: 'xstate.init',
        transitionType: TransitionTypes.missing,
      },
    })
    expect(typeof updateEvent1.sessionId).toBe('string')

    // START event should be sent to devtools
    actor.send({ type: 'START', value: 42 })
    expect(updateEventSpy[1]).toHaveBeenCalledTimes(2)
    const updateEvent2 = updateEventSpy[1].mock.calls[1][0].detail
    expect(updateEvent2).toMatchObject({
      type: '@xstate/inspect.update',
      // sessionId: 'x:1',
      actorId: 'mockMachine',
      status: InterpreterStatus.Running,
      event: {
        name: 'START',
        data: { type: 'START', value: 42 },
        transitionType: TransitionTypes.taken,
      },
    })
    expect(typeof updateEvent1.sessionId).toBe('string')
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
