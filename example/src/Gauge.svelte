<script lang="ts">
  import type { Readable } from 'svelte/store'
  import type { State } from 'xstate'

  export let state: Readable<State<any>>
</script>

<div class="container">
  <div class="gauge-outer" />
  <div class="gauge-inner" class:running={$state.matches('EngineRunning')}>
    <div class="on-off-led">on</div>
    <div class="other-leds">
      <div class="low-fuel-led" class:on={$state.context.lowFuelWarning} />
      <div
        class="low-battery-led"
        class:on={$state.context.lowBatteryWarning}
      />
    </div>
  </div>
  <div
    class="gauge-indicator"
    class:slow={$state.matches('EngineRunning.SlowSpeed')}
    class:fast={$state.matches('EngineRunning.FastSpeed')}
    class:reverse={$state.matches('EngineRunning.Reverse')}
  />
</div>

<style>
  .container {
    position: relative;
    width: 400px;
    height: 200px;
    overflow: hidden;
    text-align: center;
  }
  .gauge-outer {
    z-index: 1;
    position: absolute;
    background-color: var(--base02);
    width: 400px;
    height: 200px;
    top: 0%;
    border-radius: 250px 250px 0px 0px;
  }
  .gauge-inner {
    z-index: 3;
    position: absolute;
    background-color: var(--base03);
    width: 250px;
    height: 125px;
    top: 75px;
    margin-left: 75px;
    margin-right: auto;
    border-radius: 250px 250px 0px 0px;
  }
  .gauge-inner .on-off-led {
    position: relative;
    top: 20px;
    font-size: 20px;
    font-weight: bold;
    color: transparent;
    text-transform: uppercase;
  }
  .gauge-inner.running .on-off-led {
    color: var(--green);
  }
  .gauge-inner .other-leds {
    position: relative;
    top: 50px;
    left: 50px;
    display: flex;
    flex-direction: row;
    height: 40px;
  }
  .gauge-inner .low-fuel-led {
    display: none;
    width: 30px;
    height: 30px;
    color: transparent;
    background: url('assets/fuel_low.png') no-repeat;
    background-size: 30px 32px;
    background-position: 1px 3px;
  }
  .gauge-inner .low-fuel-led.on {
    display: block;
  }
  .gauge-inner .low-battery-led {
    display: none;
    width: 30px;
    height: 30px;
    color: transparent;
    background: url('assets/battery_low.png') no-repeat;
    background-size: 30px 30px;
    background-position: 0 3px;
  }
  .gauge-inner .low-battery-led.on {
    display: block;
  }
  .gauge-indicator {
    z-index: 2;
    position: absolute;
    background-color: var(--green);
    width: 400px;
    height: 200px;
    top: 200px;
    margin-left: auto;
    margin-right: auto;
    border-radius: 0px 0px 200px 200px;
    transform-origin: center top;
    transition: all 1.3s ease-in-out;
  }
  .gauge-indicator.slow {
    transform: rotate(60deg);
  }
  .gauge-indicator.fast {
    transform: rotate(150deg);
    background-color: var(--red);
  }
  .gauge-indicator.reverse {
    transform: rotate(20deg);
    background-color: var(--yellow);
  }
  /* .container:hover .gauge-indicator { */
  /*   transform: rotate(0.5turn); */
  /* } */
</style>
