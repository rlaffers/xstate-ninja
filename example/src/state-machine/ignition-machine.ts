import { actions, createMachine } from 'xstate'

const { sendParent, assign } = actions

export const ignitionMachine = createMachine(
  {
    id: 'ignition',
    preserveActionOrder: true,
    context: {
      battery: 0,
    },
    initial: 'Initializing',
    states: {
      Initializing: {
        always: [
          {
            cond: 'isBatteryEmpty',
            target: 'Discharged',
          },
          {
            target: 'Discharging',
          },
        ],
      },
      Discharging: {
        invoke: {
          src: 'keepDischarging',
          id: 'keepDischarging',
        },
        on: {
          DISCHARGED_BATTERY: [
            {
              cond: 'willBeEmpty',
              target: 'Discharged',
              actions: ['decreaseBattery', sendParent((_, e) => e)],
            },
            {
              actions: ['decreaseBattery', sendParent((_, e) => e)],
            },
          ],
        },
      },
      Discharged: {
        type: 'final',
      },
    },
  },
  {
    guards: {
      isBatteryEmpty: ({ battery }) => battery <= 0,
      willBeEmpty: ({ battery }, { amount }) => battery - amount <= 0,
    },
    services: {
      keepDischarging: () => (sendBack) => {
        const interval = setInterval(
          () => sendBack({ type: 'DISCHARGED_BATTERY', amount: 8 }),
          1000,
        )
        return () => clearInterval(interval)
      },
    },
    actions: {
      decreaseBattery: assign({
        battery: ({ battery }, { amount }) => battery - amount <= 0 ? 0 : battery - amount,
      }),
    },
  },
)
