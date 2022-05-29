import { createMachine, interpret } from 'xstate'

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

// display machine state
const stateValue = document.querySelector('#machine-state-value')
let subscription
function subscribe(actor) {
  subscription = service.subscribe((state) => {
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
}
document.querySelector('#btn-reset').addEventListener('click', restartMachine)

service.start()
