import { actions, createMachine, type EventObject } from 'xstate'

const { choose, sendParent, respond, send, raise, assign } = actions

interface ContextType {
  latestEvent: EventObject | null
  tickCount: number
}

type EventType =
  | { type: 'PLAY' }
  | { type: 'TICK' }
  | { type: 'ROGER_THAT'; subject: string }
  | { type: 'FASTER' }
  | { type: 'SLOWER' }
  | { type: 'PAUSE' }
  | { type: 'STARTED_FAST' }

export default createMachine(
  {
    id: 'play',
    predictableActionArguments: true,
    schema: {
      context: {} as ContextType,
      events: {} as EventType,
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
            entry: raise({ type: 'STARTED_FAST' }),
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
                  cond: 'isDivisibleByFive',
                  actions: [
                    sendParent((context: ContextType) => ({
                      type: 'PROGRESS',
                      value: context.tickCount,
                    })),
                  ],
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
                actions: [
                  choose([
                    {
                      cond: (_, e) => e.type !== 'ROGER_THAT',
                      actions: ['setLatestEvent', 'rogerThat'],
                    },
                  ]),
                ],
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
        latestEvent: (_, e) => e,
      }),
      rogerThat: respond((_, e) => {
        return { type: 'ROGER_THAT', subject: e.type }
      }) as any,
      increaseCount: assign({
        tickCount: ({ tickCount }) => tickCount + 1,
      }),
    },
    guards: {
      isDivisibleByFive: ({ tickCount }) => tickCount % 5 === 0,
    },
  },
)
