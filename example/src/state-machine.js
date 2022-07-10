import { createMachine, actions, spawn as spawnOriginal } from 'xstate'

const { assign, send } = actions

// TODO put this overriden spawn into the npm library
const spawn = (x, name) => {
  const actor = spawnOriginal(x, name)
  // window.__XSTATE_EXPLORER__?.register(actor)
  // actor.subscribe((state) => {
  //   console.log('child is', state.value)
  // })
  actor.onStop(() => {
    console.log('child stopped') // TODO remove console.log
    // window.__XSTATE_EXPLORER__?.unregister(actor)
  })
  return actor
}

const childMachine = createMachine({
  id: 'the_child',
  initial: 'Born',
  states: {
    Born: {
      entry: send('BIRTH'), // TODO will this event be caught on a spawned child?
      after: {
        3000: 'Adult',
      },
    },
    Adult: {
      after: {
        3000: 'Old',
      },
    },
    Old: {
      type: 'final',
    },
  },
})

export default createMachine(
  {
    id: 'root',
    preserveActionOrder: true,
    context: {
      speed: 1,
      info: "Don't panic",
      results: [9, 8, 7],
      // non-serializable
      customEvent: (function () {
        /* global CustomEvent */
        const event = new CustomEvent('dummy-event', { detail: { foo: 42 } })
        event.myFunc = function () {}
        event.myFunc.funcname = 'myFunc'
        return event
      })(),
      spawnedRef: null,
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
      SPAWN: {
        actions: assign({
          spawnedRef: () => spawn(childMachine, 'baby'),
        }),
      },
    },
  },
  {
    guards: {
      isSpeedBelowMax: ({ speed }) => speed < 5,
    },
  },
)
