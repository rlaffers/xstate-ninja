import { createMachine, actions } from 'xstate'
import playMachine from './play-machine'

const { assign, forwardTo, send, pure, log } = actions

// TODO cb, promise services
// TODO in guards

export default createMachine(
  {
    id: 'root',
    predictableActionArguments: true,
    context: {
      progress: 0,
    },
    initial: 'Off',
    states: {
      Off: {
        on: {
          POWER: 'Standby',
        },
      },
      Standby: {
        entry: send({ type: 'ENTERED_STANDBY', timestamp: Date.now() }),
        on: {
          PLAY: 'Playing',
          POWER: 'Off',
        },
      },
      Playing: {
        invoke: {
          src: 'playMachine',
          id: 'play',
        },
        initial: 'Playing',
        states: {
          Playing: {
            on: {
              PAUSE: {
                target: 'Paused',
                actions: forwardTo('play'),
              },
            },
          },
          Paused: {
            on: {
              PLAY: {
                target: 'Playing',
                actions: forwardTo('play'),
              },
              STOP: {
                target: '#root.Standby',
                actions: 'resetProgress',
              },
              POWER: {
                actions: send('POWER_DOWN_ATTEMPTED', { delay: 1000 }),
              },
            },
          },
        },
        on: {
          STOP: {
            target: 'Standby',
            actions: 'resetProgress',
          },
          PROGRESS: {
            actions: 'updateProgress',
          },
          FASTER: {
            actions: forwardTo('play'),
          },
          SLOWER: {
            actions: send((c, e) => e, { to: 'play' }),
          },
        },
      },
      Deciding: {
        always: [
          {
            cond: () => false,
            target: 'Standby',
          },
          {
            cond: () => true,
            target: 'Off',
          },
        ],
      },
    },
    on: {
      GUARDED_EVENT: [
        {
          cond: (c, e) => e.randomValue % 3 === 0,
          actions: send('MULTIPLE_OF_THREE_RECEIVED'),
        },
      ],
      PURE_ACTION: {
        actions: pure(() => [
          log('pure action triggered'),
          send('PURE_ACTION_TRIGGERED'),
        ]),
      },
      ALWAYS: '.Deciding',
    },
  },
  {
    services: {
      playMachine,
    },
    actions: {
      resetProgress: assign({
        progress: 0,
      }),
      updateProgress: assign({
        progress: (c, { value }) => value,
      }),
    },
  },
)
