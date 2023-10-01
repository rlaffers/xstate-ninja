import { createMachine, actions } from 'xstate'

const { choose, assign, sendParent } = actions

export const fuelMachine = createMachine(
  {
    id: 'fuel',
    predictableActionArguments: true,
    context: {
      fuel: 0,
    },
    type: 'parallel',
    states: {
      First: {
        initial: 'Operating',
        states: {
          Operating: {
            entry: choose([
              {
                cond: 'isFuelEmpty',
                actions: 'sendFuelTankEmpty',
              },
              {
                cond: 'isFuelLow',
                actions: 'sendLowFuelWarning',
              },
            ]),
            on: {
              FUEL_CONSUMED: [
                {
                  cond: 'willBeEmpty',
                  actions: ['removeFuel', 'sendFuelTankEmpty'],
                },
                {
                  cond: 'willBeLow',
                  actions: ['removeFuel', 'sendLowFuelWarning'],
                },
                {
                  actions: 'removeFuel',
                },
              ],
              FUEL_ADDED: {
                actions: choose([
                  {
                    cond: 'isFuelOK',
                    actions: 'addFuel',
                  },
                  {
                    cond: 'willBeOK',
                    actions: ['addFuel', 'sendFuelOK'],
                  },
                  {
                    cond: 'willBeLow',
                    actions: ['addFuel', 'sendLowFuelWarning'],
                  },
                  {
                    actions: ['addFuel', 'sendFuelTankEmpty'],
                  },
                ]),
              },
            },
          },
        },
      },
      Second: {
        initial: 'Hot',
        states: {
          Hot: {},
        },
      },
    },
  },
  {
    guards: {
      isFuelEmpty: ({ fuel }) => fuel <= 0,
      isFuelLow: ({ fuel }) => fuel < 10,
      isFuelOK: ({ fuel }) => fuel >= 10,
      willBeEmpty: ({ fuel }, { amount }) => fuel - amount <= 0,
      willBeLow: ({ fuel }, { amount }) => fuel - amount < 10,
      willBeOK: ({ fuel }, { amount }) => fuel + amount >= 10,
    },
    actions: {
      removeFuel: assign({
        fuel: ({ fuel }, { amount }) => (fuel - amount < 0 ? 0 : fuel - amount),
      }),
      addFuel: assign({
        fuel: ({ fuel }, { amount }) => (fuel + amount > 60 ? 60 : fuel + amount),
      }),
      sendFuelTankEmpty: sendParent('FUEL_TANK_EMPTY'),
      sendLowFuelWarning: sendParent('LOW_FUEL_WARNING'),
      sendFuelOK: sendParent('FUEL_OK'),
    },
  },
)
