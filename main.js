import { createMachine, interpret } from 'xstate'
import { launch } from './lib/index.js'

// api for xstate insights (after it has been opened)
let insights

const machine = createMachine({
  id: 'root',
  preserveActionOrder: true,
  context: {},
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
        Cold: {},
        Hot: {},
      },
      on: {
        PAUSE: 'Paused',
        STOP: 'Stopped',
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
})

let service = interpret(machine)

// display machine state on the page
const stateValue = document.querySelector('#machine-state-value')
let subscription
function subscribe(actor) {
  subscription = service.subscribe((state) => {
    console.groupCollapsed(state.event.type)
    console.log(state.event)
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

// open the tool
document.querySelector('#btn-open').addEventListener('click', () => {
  insights = launch(service)
})

service.start()
