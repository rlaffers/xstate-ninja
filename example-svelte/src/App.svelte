<script lang="ts">
  import getXStateNinja, { interpret, LogLevels, configure } from 'xstate-ninja'
  import { useSelector } from '@xstate/svelte'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import { onDestroy } from 'svelte'
  import type { Readable } from 'svelte/store'
  import type { AnyInterpreter, State } from 'xstate'
  import logo from './assets/logo_512.png'
  import machine from '../../example/src/state-machine/state-machine'
  import Gauge from './Gauge.svelte'

  configure({ logLevel: LogLevels.debug })
  const ninja = getXStateNinja()

  let service = interpret(machine, { devTools: true }).start()
  let state: Readable<State<any>>

  function subscribe(actor: AnyInterpreter) {
    const sub = actor.subscribe((s) => {
      console.groupCollapsed(s.event.type)
      console.log(s.event)
      if (s.changed) {
        console.log(`»`, s.value)
      }
      console.log(`changed: ${s.changed}`, s.context)
      /* console.groupEnd(st.event.type) */
      console.groupEnd()
    })

    state = useSelector(actor, (s) => s)
    return sub
  }

  let subscription = subscribe(service)

  onDestroy(() => subscription.unsubscribe())

  function resetMachine() {
    ninja.unregister(service)
    service.stop()
    subscription.unsubscribe()
    service = interpret(machine).start()
    subscription = subscribe(service)
  }

  const animatedFuelProgress = tweened(0, {
    duration: 400,
    easing: cubicOut,
  })

  const animatedBatteryProgress = tweened(0, {
    duration: 400,
    easing: cubicOut,
  })

  $: animatedFuelProgress.set($state.context.fuel)
  $: animatedBatteryProgress.set($state.context.battery)
</script>

<main>
  <img src={logo} alt="XState Ninja" />
  <h1>XState Ninja Demo</h1>

  <section class="indicators">
    <Gauge {state} />
    <div class="battery-and-fuel">
      <label class="battery-indicator"
        >Battery: <meter
          min="0"
          max="100"
          low="10"
          high="25"
          optimum="100"
          value={$animatedBatteryProgress}>{$state.context.battery}</meter
        ></label
      >

      <label class="fuel-indicator"
        >Fuel: <meter min="0" max="60" low="10" high="20" optimum="60" value={$animatedFuelProgress}
          >{$state.context.fuel}</meter
        >
      </label>
    </div>
  </section>
  <section class="car-controls">
    <button
      type="button"
      class="start-stop-btn"
      class:start={$service.matches('EngineStopped') || $service.matches('Igniting')}
      class:stop={$service.matches('EngineRunning')}
      on:mousedown={() => service.send('START_BUTTON_PRESSED')}
      on:mouseup={() => service.send('START_BUTTON_RELEASED')}
      >{$service.matches('EngineRunning') ? 'stop' : 'start'}</button
    >

    <div class="shifting-controls">
      <button type="button" class="speed-shifting-btn" on:click={() => service.send('SHIFT_UP')}
        >⬆</button
      >
      <button type="button" class="speed-shifting-btn" on:click={() => service.send('SHIFT_DOWN')}
        >⬇</button
      >
      <button
        type="button"
        class="reverse-shifting-btn"
        on:click={() => service.send('SHIFT_REVERSE')}>Ⓡ</button
      >
    </div>

    <button class="fuel-btn" on:click={() => service.send({ type: 'FUEL_ADDED', amount: 15 })}
      >Add fuel</button
    >

    <button
      class="battery-btn"
      on:click={() => service.send({ type: 'CHARGED_BATTERY', amount: 15 })}>Charge battery</button
    >

    <button type="button" on:click={resetMachine} class="reset-btn"> 💀 Reset </button>
  </section>
</main>

<style>
  :root {
    --base03: #002b36;
    --base02: #073642;
    --base01: #586e75;
    --base00: #657b83;
    --base0: #839496;
    --base1: #93a1a1;
    --base2: #eee8d5;
    --base3: #fdf6e3;
    --yellow: #b58900;
    --orange: #cb4b16;
    --red: #dc322f;
    --magenta: #d33682;
    --violet: #6c71c4;
    --blue: #268bd2;
    --cyan: #2aa198;
    --green: #859900;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
      'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--base03);
    color: var(--base1);
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
    color: var(--base1);
    width: 50vw;
  }

  h1 {
    color: var(--red);
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  button {
    padding: 0.3rem 0.6rem;
    cursor: pointer;
  }

  button.reset-btn {
    margin-left: 50px;
  }

  img {
    width: 16rem;
    height: 16rem;
  }

  .indicators {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 250px;
  }

  .indicators .battery-and-fuel {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .car-controls {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    text-align: left;
  }

  .shifting-controls {
    display: flex;
    flex-direction: column;
    margin-left: 50px;
  }

  .shifting-controls button {
    margin-bottom: 10px;
    font-size: 3rem;
  }

  button.start-stop-btn {
    text-transform: uppercase;
    color: var(--base3);
    border: 5px solid var(--base2);
    padding: 5px;
    font-size: 28px;
    height: 120px;
    width: 120px;
    border-radius: 60px;
    box-shadow: 0 2px 4px darkslategray;
  }

  button.start-stop-btn.start {
    background-color: var(--green);
  }

  button.start-stop-btn.start:active {
    background: radial-gradient(var(--base3), var(--green));
  }

  button.start-stop-btn.stop {
    background-color: var(--red);
  }

  button.start-stop-btn.stop:active {
    background: radial-gradient(var(--base3), var(--red));
  }

  button.fuel-btn,
  button.battery-btn {
    margin-left: 50px;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }
  }
</style>
