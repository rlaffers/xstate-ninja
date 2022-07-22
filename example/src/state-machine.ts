import type { ActorRefFrom, StateMachine, EventObject } from 'xstate'
import { actions, createMachine, spawn as spawnOriginal } from 'xstate'
import { childMachine } from './child-machine'
import type { WindowWithXStateNinja } from './xstateDevTypes'

const { assign } = actions

interface SpawnOptions {
  name?: string
  autoForward?: boolean
  sync?: boolean
}

declare let window: WindowWithXStateNinja
const xn = window.__xstate_ninja__

// TODO put this overriden spawn into the npm library
function spawn<TC, TE extends EventObject>(
  entity: StateMachine<TC, any, TE>,
  nameOrOptions: string | SpawnOptions,
): ActorRefFrom<StateMachine<TC, any, TE>> {
  const actor = spawnOriginal(entity, nameOrOptions)
  xn?.register(actor)
  // actor.subscribe((state) => {
  //   console.log('child is', state.value)
  // })
  // TODO onStop not on ActorRef
  // actor.onStop.(() => {
  //   console.log('child stopped') // TODO remove console.log
  //   // xn?.unregister(actor)
  // })
  return actor
}

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
