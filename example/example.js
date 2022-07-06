/* global __XSTATE_INSIGHTS__, CustomEvent */
import { createMachine, interpret, actions } from 'xstate'
// TODO create an npm library xstate-insights, @xstate-insights/react
// import { register } from 'xstate-insights'

const { assign } = actions

const machine = createMachine(
  {
    id: 'root',
    preserveActionOrder: true,
    context: {
      speed: 1,
      info: "Don't panic",
      results: [9, 8, 7],
      // non-serializable
      customEvent: (function () {
        const event = new CustomEvent('dummy-event', { detail: { foo: 42 } })
        event.myFunc = function () {}
        event.myFunc.funcname = 'myFunc'
        return event
      })(),
      // deep serializable object
      deepObject: {
        quick: {
          brown: {
            fox: 42,
          },
        },
      },
    },
    initial: 'Ready',
    states: {
      Ready: {
        on: {
          START: 'Playing',
          STOP: 'Stopped',
        },
      },
      Playing: {
        initial: 'Cold',
        states: {
          Cold: {
            on: {
              FORBIDDEN: undefined,
            },
          },
          Hot: {},
        },
        on: {
          PAUSE: 'Paused',
          STOP: 'Stopped',
          SPEED_INC: {
            cond: 'isSpeedBelowMax',
            actions: assign({
              speed: ({ speed }) => speed + 1,
            }),
          },
          SPEED_DEC: {
            actions: assign({
              speed: ({ speed }) => speed - 1,
            }),
          },
        },
      },
      Paused: {
        on: {
          START: 'Playing',
          STOP: 'Stopped',
        },
      },
      Stopped: {
        type: 'final',
      },
    },
    on: {
      SET_SPEED: {
        actions: assign({ speed: (_, { value }) => value }),
      },
    },
  },
  {
    guards: {
      isSpeedBelowMax: ({ speed }) => speed < 5,
    },
  }
)

let actor = interpret(machine)

// TODO crucial step! We could hide this into an exported "interpret", "useMachine", "useInterpret" function
window.__XSTATE_INSIGHTS__?.register(actor)

// display machine state on the page
const stateValue = document.querySelector('#machine-state-value')
let subscription
function subscribe(actor) {
  subscription = actor.subscribe((state) => {
    console.groupCollapsed(state.event.type)
    console.log(state.event)
    console.log(`changed: ${state.changed}`, state.context)
    console.groupEnd(state.event.type)
    stateValue.innerHTML = JSON.stringify(state.value)
  })
}

subscribe(actor)

// send events
const eventName = document.querySelector('#input-event-name')
function onEventSubmit(event) {
  actor.send(eventName.value)
  event.preventDefault()
}
document.querySelector('#event-form').addEventListener('submit', onEventSubmit)

// reset
function restartMachine() {
  __XSTATE_INSIGHTS__?.unregister(actor)
  actor.stop()
  subscription.unsubscribe()
  actor = interpret(machine)
  actor.start()
  subscribe(actor)
  __XSTATE_INSIGHTS__?.register(actor)
}
document.querySelector('#btn-reset').addEventListener('click', restartMachine)

document
  .querySelector('#btn-speed-inc')
  .addEventListener('click', () => actor.send('SPEED_INC'))
document
  .querySelector('#btn-speed-dec')
  .addEventListener('click', () => actor.send('SPEED_DEC'))
document
  .querySelector('#btn-reset-speed')
  .addEventListener('click', () => actor.send({ type: 'SET_SPEED', value: 1 }))

actor.start()
