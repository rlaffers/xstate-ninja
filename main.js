import { createMachine, interpret, actions } from 'xstate'
import { launch } from './lib/index.js'

const { assign } = actions

// api for xstate insights (after it has been opened)
let insights

const machine = createMachine(
  {
    id: 'root',
    preserveActionOrder: true,
    context: {
      speed: 1,
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

let service = interpret(machine)

// display machine state on the page
const stateValue = document.querySelector('#machine-state-value')
let subscription
function subscribe(actor) {
  subscription = service.subscribe((state) => {
    console.groupCollapsed(state.event.type)
    console.log(state.event)
    console.log(`changed: ${state.changed}`, state.context)
    console.groupEnd(state.event.type)
    stateValue.innerHTML = JSON.stringify(state.value)
  })
}

subscribe(service)

// send events
const eventName = document.querySelector('#input-event-name')
function onEventSubmit(event) {
  service.send(eventName.value)
  event.preventDefault()
}
document.querySelector('#event-form').addEventListener('submit', onEventSubmit)

// reset
function restartMachine() {
  service.stop()
  subscription.unsubscribe()
  service = interpret(machine)
  service.start()
  subscribe(service)
  // the launched window needs to resubscribe to this new actor
  if (insights) {
    insights.subscribe(service)
  }
}
document.querySelector('#btn-reset').addEventListener('click', restartMachine)

document
  .querySelector('#btn-speed-inc')
  .addEventListener('click', () => service.send('SPEED_INC'))
document
  .querySelector('#btn-speed-dec')
  .addEventListener('click', () => service.send('SPEED_DEC'))
document
  .querySelector('#btn-reset-speed')
  .addEventListener('click', () =>
    service.send({ type: 'SET_SPEED', value: 1 })
  )

// open the tool
document.querySelector('#btn-open').addEventListener('click', () => {
  insights = launch(service)
})

service.start()
