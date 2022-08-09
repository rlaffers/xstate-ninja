import { actions, createMachine } from 'xstate'
import { spawn } from 'xstate-ninja'
import { childMachine } from './child-machine'

const { assign } = actions

interface CustomEventWithMyFunc extends CustomEvent {
  myFunc: () => void
}

function createCustomEvent(): CustomEventWithMyFunc {
  const event: any = new CustomEvent('dummy-event', {
    detail: { foo: 42 },
  })
  event.myFunc = () => true
  return event
}

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
        const event = createCustomEvent()
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
      myFunc: function () {
        // empty fu
      },
      myMap: new Map([
        ['foo', { enabled: true }],
        ['bar', { enabled: false }],
      ]),
      thisIsUndefined: undefined,
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
