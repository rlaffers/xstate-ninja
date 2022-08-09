import { createMachine, actions } from 'xstate'

const { choose, assign, sendParent } = actions

export const batteryMachine = createMachine(
  {
    id: 'battery',
    preserveActionOrder: true,
    context: {
      battery: 0,
    },
    initial: 'Operating',
    states: {
      Operating: {
        entry: choose([
          {
            cond: 'isBatteryLow',
            actions: 'sendLowBatteryWarning',
          },
        ]),
        on: {
          DISCHARGED_BATTERY: [
            {
              cond: 'willBeLow',
              actions: ['decreaseBattery', 'sendLowBatteryWarning'],
            },
            {
              actions: 'decreaseBattery',
            },
          ],
          CHARGED_BATTERY: {
            actions: choose([
              {
                cond: 'isBatteryOK',
                actions: 'increaseBattery',
              },
              {
                cond: 'willBeOk',
                actions: ['increaseBattery', 'sendBatteryOK'],
              },
              {
                actions: ['increaseBattery', 'sendLowBatteryWarning'],
              },
            ]),
          },
        },
      },
    },
  },
  {
    guards: {
      isBatteryLow: ({ battery }) => battery < 10,
      isBatteryOK: ({ battery }) => battery >= 10,
      willBeLow: ({ battery }, { amount }) => battery - amount < 10,
      willBeOK: ({ battery }, { amount }) => battery + amount >= 10,
    },
    actions: {
      decreaseBattery: assign({
        battery: ({ battery }, { amount }) =>
          battery - amount < 0 ? 0 : battery - amount,
      }),
      increaseBattery: assign({
        battery: ({ battery }, { amount }) =>
          battery + amount > 100 ? 100 : battery + amount,
      }),
      sendLowBatteryWarning: sendParent('LOW_BATTERY_WARNING'),
      sendBatteryOK: sendParent('BATTERY_OK'),
    },
  },
)
