<script setup lang="ts">

import stateMachine from '../../../example/src/state-machine/state-machine'
import { useInterpret } from '@xstate-ninja/vue'
import { useSelector } from '@xstate/vue'

defineOptions({
  name: 'IndexPage',
})

const service = useInterpret(stateMachine, { devTools: true })

const battery = useSelector(service, (state) => state.context.battery)
const fuel = useSelector(service, (state) => state.context.fuel)
const fuelPercent = computed(() => fuel.value * 100 / 60)

const isRunning = useSelector(service, (state) => state.matches('EngineRunning'))
const isLowFuel = useSelector(service, (state) => state.context.lowFuelWarning)
const isLowBattery = useSelector(service, (state) => state.context.lowBatteryWarning)
const isRunningSlow = useSelector(service, (state) => state.matches('EngineRunning.SlowSpeed'))
const isRunningFast = useSelector(service, (state) => state.matches('EngineRunning.FastSpeed'))
const isRunningInReverse = useSelector(service, (state) => state.matches('EngineRunning.Reverse'))

const canShiftUp = useSelector(service, (state) => state.can('SHIFT_UP'))
const canShiftDown = useSelector(service, (state) => state.can('SHIFT_DOWN'))
const canShiftReverse = useSelector(service, (state) => state.can('SHIFT_REVERSE'))
const canAddFuel = useSelector(service, (state) => state.can('FUEL_ADDED'))
const canChargeBattery = useSelector(service, (state) => state.can('CHARGED_BATTERY'))

const speed = computed(() => {
  if (isRunningSlow.value) return 'slow'
  if (isRunningFast.value) return 'fast'
  if (isRunningInReverse.value) return 'in reverse'
  return 'neutral'
})

</script>

<template>
  <v-card width="100%" class="ma-2">
    <template #text>

      <p>
        Engine is {{ isRunning ? ('running (' + speed + ')') : 'stopped' }}
      </p>

      <v-alert v-if="isLowFuel" type="warning" text="Low fuel"></v-alert>
      <v-alert v-if="isLowBattery" type="warning" text="Low battery"></v-alert>

      <v-sheet :height="40" :width="400" class="ma-2">
        <v-progress-linear :model-value="battery" color="primary" height="20" striped rounded class="ma-2">
          <template v-slot:default="{ value }">
            <strong>Battery {{ Math.ceil(value) }}%</strong>
          </template>
        </v-progress-linear>
        <v-progress-linear :model-value="fuelPercent" color="primary" height="20" striped rounded class="ma-2">
          <strong>Fuel {{ Math.ceil(fuel) }}L</strong>
        </v-progress-linear>
      </v-sheet>


      <v-btn class="ma-2" @mousedown="service.send('START_BUTTON_PRESSED')"
        @mouseup="service.send('START_BUTTON_RELEASED')">{{
          isRunning ? 'stop' : 'start' }}</v-btn>

      <v-btn class="ma-2" :disabled="!canShiftUp" @click="service.send('SHIFT_UP')">⬆</v-btn>
      <v-btn class="ma-2" :disabled="!canShiftDown" @click="service.send('SHIFT_DOWN')">⬇</v-btn>
      <v-btn class="ma-2" :disabled="!canShiftReverse" @click="service.send('SHIFT_REVERSE')">Ⓡ</v-btn>
      <v-btn class="ma-2" :disabled="!canAddFuel" @click="service.send({ type: 'FUEL_ADDED', amount: 15 })">Add
        fuel</v-btn>
      <v-btn class="ma-2" :disabled="!canChargeBattery"
        @click="service.send({ type: 'CHARGED_BATTERY', amount: 15 })">Charge
        battery</v-btn>

    </template>

  </v-card>
</template>
