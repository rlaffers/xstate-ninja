import { createMachine, actions, EventObject } from 'xstate'

const { choose, sendParent, respond, send, raise, assign } = actions

interface ContextType {
  latestEvent: EventObject | null
  tickCount: number
}

export default createMachine(
  {
    id: 'play',
    predictableActionArguments: true,
    schema: {
      context: {} as ContextType,
    },
    context: { latestEvent: null, tickCount: 0 },
    type: 'parallel',
    states: {
      Operation: {
        initial: 'Slow',
        states: {
          Slow: {
            entry: sendParent('STARTED_SLOW'),
            invoke: {
              src: 'slowPlay',
              id: 'slowPlay',
            },
            on: {
              FASTER: 'Medium',
            },
          },
          Medium: {
            entry: send('STARTED_MEDIUM'),
            invoke: {
              src: 'mediumPlay',
              id: 'mediumPlay',
            },
            on: {
              SLOWER: 'Slow',
              FASTER: 'Fast',
            },
          },
          Fast: {
            entry: raise('STARTED_FAST'),
            invoke: {
              src: 'fastPlay',
              id: 'fastPlay',
            },
            on: {
              SLOWER: 'Medium',
            },
          },
          Paused: {},
        },
        on: {
          PAUSE: '.Paused',
          PLAY: '.Slow',
          TICK: {
            actions: [
              'increaseCount',
              choose([
                {
                  cond: ({ tickCount }) => tickCount % 5 === 0,
                  actions: sendParent(({ tickCount }) => ({
                    type: 'PROGRESS',
                    value: tickCount,
                  })),
                },
              ]),
            ],
          },
        },
      },
      Roger: {
        initial: 'Active',
        states: {
          Active: {
            on: {
              '*': {
                actions: choose([
                  {
                    cond: (c, e) => e.type !== 'ROGER_THAT',
                    actions: ['setLatestEvent', 'rogerThat'],
                  },
                ]),
              },
            },
          },
          Inactive: {},
        },
      },
    },
  },
  {
    services: {
      slowPlay: () => (sendBack) => {
        const id = setInterval(() => sendBack({ type: 'TICK' }), 3000)
        return () => clearInterval(id)
      },
      mediumPlay: () => (sendBack) => {
        const id = setInterval(() => sendBack({ type: 'TICK' }), 2500)
        return () => clearInterval(id)
      },
      fastPlay: () => (sendBack) => {
        const id = setInterval(() => sendBack({ type: 'TICK' }), 2000)
        return () => clearInterval(id)
      },
    },
    actions: {
      setLatestEvent: assign({
        latestEvent: (c, e) => e,
      }),
      rogerThat: respond((c, e) => ({ type: 'ROGER_THAT', subject: e.type })),
      increaseCount: assign({
        tickCount: ({ tickCount }) => tickCount + 1,
      }),
    },
  },
)
