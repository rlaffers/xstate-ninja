import { createMachine, actions, spawn } from 'xstate'
import { ignitionMachine } from './ignition-machine'
import { batteryMachine } from './battery-machine'
import { fuelMachine } from './fuel-machine'

const { assign, forwardTo, stop } = actions

export default createMachine(
  {
    id: 'vehicle',
    preserveActionOrder: true,
    initial: 'EngineStopped',
    entry: [
      'spawnFuelWatcher',
      'spawnBatteryWatcher',
      // TODO remove
      // 'spawnCallback',
      // 'spawnPromise',
    ],
    context: {
      fuel: 60,
      battery: 100,
      refs: {},
      lowFuelWarning: false,
      lowBatteryWarning: false,
      shutdownInitiated: false,
    },
    states: {
      EngineStopped: {
        on: {
          START_BUTTON_PRESSED: {
            cond: 'isBatteryAboveMinimum',
            target: 'Igniting',
          },
          FUEL_ADDED: {
            actions: ['addFuel', 'sendToFuelWatcher'],
          },
          CHARGED_BATTERY: {
            actions: ['increaseBattery', 'sendToBatteryWatcher'],
          },
        },
      },
      Igniting: {
        invoke: {
          src: 'ignition',
          id: 'car-ignition',
          data: ({ battery }) => ({
            battery,
          }),
          onDone: [
            {
              actions: ['setBatteryEmpty', 'sendToBatteryWatcher'],
              target: 'EngineStopped',
            },
          ],
        },
        after: {
          '3000': {
            cond: 'hasFuel',
            target: 'EngineRunning',
          },
        },
        on: {
          START_BUTTON_RELEASED: {
            target: 'EngineStopped',
          },
          DISCHARGED_BATTERY: {
            actions: ['decreaseBattery', 'sendToBatteryWatcher'],
          },
        },
      },
      EngineRunning: {
        entry: 'startChargingBattery',
        exit: 'stopChargingBattery',
        initial: 'Idle',
        states: {
          SlowSpeed: {
            invoke: {
              src: 'consumeFuelSlowly',
            },
            on: {
              SHIFT_DOWN: {
                target: 'Idle',
              },
              SHIFT_UP: {
                target: 'FastSpeed',
              },
            },
          },
          FastSpeed: {
            invoke: {
              src: 'consumeFuelQuickly',
            },
            on: {
              SHIFT_DOWN: {
                target: 'SlowSpeed',
              },
            },
          },
          Reverse: {
            invoke: {
              src: 'consumeFuelIdly',
            },
            on: {
              SHIFT_DOWN: {
                target: 'Idle',
              },
            },
          },
          Idle: {
            invoke: {
              src: 'consumeFuelIdly',
              id: 'consumeFuelIdly',
            },
            on: {
              SHIFT_UP: {
                target: 'SlowSpeed',
              },
              SHIFT_REVERSE: {
                target: 'Reverse',
              },
            },
          },
        },
        on: {
          START_BUTTON_PRESSED: {
            actions: 'initiateShutdown',
          },
          START_BUTTON_RELEASED: {
            cond: 'isShutdownInitiated',
            target: 'EngineStopped',
            actions: 'resetShutdown',
          },
          FUEL_CONSUMED: {
            actions: ['removeFuel', 'sendToFuelWatcher'],
          },
          FUEL_TANK_EMPTY: {
            actions: 'setFuelEmpty',
            target: 'EngineStopped',
          },
          CHARGED_BATTERY: {
            actions: ['increaseBattery', 'sendToBatteryWatcher'],
          },
        },
      },
    },
    on: {
      LOW_FUEL_WARNING: {
        actions: 'showLowFuelWarning',
      },
      FUEL_OK: {
        actions: 'hideLowFuelWarning',
      },
      LOW_BATTERY_WARNING: {
        actions: 'showLowBatteryWarning',
      },
      BATTERY_OK: {
        actions: 'hideLowBatteryWarning',
      },
    },
  },
  {
    guards: {
      isBatteryAboveMinimum: ({ battery }) => battery >= 10,
      hasFuel: ({ fuel }) => fuel > 0,
      isShutdownInitiated: ({ shutdownInitiated }) => shutdownInitiated,
    },
    actions: {
      initiateShutdown: assign({
        shutdownInitiated: true,
      }),
      resetShutdown: assign({
        shutdownInitiated: false,
      }),
      spawnBatteryWatcher: assign({
        refs: ({ refs, battery }) => ({
          ...refs,
          batteryWatcher: spawn(
            batteryMachine.withContext({ battery }),
            'batteryWatcher',
          ),
        }),
      }),

      spawnCallback: assign({
        cbRef: () =>
          spawn((sendBack) => {
            console.log(
              '%cspawned cb executed',
              'background: deeppink; color: white; padding: 1px 5px',
            )
            sendBack({ type: 'SPAWNED_CB_STARTED' })
            const t1 = setTimeout(() => {
              console.log(
                '%cfirst event',
                'background: deeppink; color: white; padding: 1px 5px',
              )
              sendBack('PLAIN_STRING_FROM_SPAWNED_CB')
            }, 100)
            const t2 = setTimeout(() => {
              console.log(
                '%csecond event',
                'background: deeppink; color: white; padding: 1px 5px',
              )
              sendBack({ type: 'EVENT_OBJ_FROM_SPAWNED_CB 2' })
            }, 1000)
            return () => {
              clearTimeout(t1)
              clearTimeout(t2)
            }
          }, 'spawnedCallback'),
      }),

      spawnPromise: assign({
        promiseRef: () =>
          spawn(
            () =>
              new Promise((resolve) => setTimeout(() => resolve(1980), 1000)),
            'spawnedPromise',
          ),
      }),

      spawnFuelWatcher: assign({
        refs: ({ refs, fuel }) => ({
          ...refs,
          fuelWatcher: spawn(fuelMachine.withContext({ fuel }), 'fuelWatcher'),
        }),
      }),

      addFuel: assign({
        fuel: ({ fuel }, { amount }) =>
          fuel + amount > 60 ? 60 : fuel + amount,
      }),

      removeFuel: assign({
        fuel: ({ fuel }, { amount }) => (fuel - amount < 0 ? 0 : fuel - amount),
      }),

      setFuelEmpty: assign({
        fuel: 0,
      }),

      sendToFuelWatcher: forwardTo('fuelWatcher'),

      sendToBatteryWatcher: forwardTo('batteryWatcher'),

      increaseBattery: assign({
        battery: ({ battery }, { amount }) =>
          battery + amount > 100 ? 100 : battery + amount,
      }),

      decreaseBattery: assign({
        battery: ({ battery }, { amount }) =>
          battery - amount < 0 ? 0 : battery - amount,
      }),

      setBatteryEmpty: assign({
        battery: 0,
      }),

      startChargingBattery: assign({
        refs: ({ refs }) => ({
          ...refs,
          batteryCharger: spawn((sendBack) => {
            const interval = setInterval(
              () => sendBack({ type: 'CHARGED_BATTERY', amount: 2 }),
              1000,
            )
            return () => clearInterval(interval)
          }, 'batteryCharger'),
        }),
      }),

      stopChargingBattery: stop('batteryCharger'),

      showLowFuelWarning: assign({
        lowFuelWarning: true,
      }),

      hideLowFuelWarning: assign({
        lowFuelWarning: false,
      }),

      showLowBatteryWarning: assign({
        lowBatteryWarning: true,
      }),

      hideLowBatteryWarning: assign({
        lowBatteryWarning: false,
      }),
    },
    services: {
      ignition: ignitionMachine,
      consumeFuelIdly: () => (sendBack) => {
        const interval = setInterval(() => {
          sendBack({ type: 'FUEL_CONSUMED', amount: 0.5 })
        }, 1000)
        return () => clearInterval(interval)
      },

      consumeFuelSlowly: () => (sendBack) => {
        const interval = setInterval(() => {
          sendBack({ type: 'FUEL_CONSUMED', amount: 2 })
        }, 1000)
        return () => clearInterval(interval)
      },

      consumeFuelQuickly: () => (sendBack) => {
        const interval = setInterval(() => {
          sendBack({ type: 'FUEL_CONSUMED', amount: 5 })
        }, 1000)
        return () => clearInterval(interval)
      },
    },
  },
)
