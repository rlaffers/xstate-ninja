<script lang="ts">
  import xstateNinja, { interpret } from 'xstate-ninja'
  import { useSelector } from '@xstate/svelte'
  import { onDestroy } from 'svelte'
  import type { Readable } from 'svelte/store'
  import type { AnyInterpreter, State } from 'xstate'
  import logo from './assets/logo_512.png'
  import machine from './state-machine'

  let service = interpret(machine).start()
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
    xstateNinja.unregister(service)
    service.stop()
    subscription.unsubscribe()
    service = interpret(machine).start()
    subscription = subscribe(service)
  }

  let eventName = ''
</script>

<!-- svelte-ignore a11y-autofocus -->
<main>
  <img src={logo} alt="XState Ninja" />
  <h1>XState Ninja Demo</h1>

  <section class="state-machine">
    <div class="machine-state">
      <p>
        Machine state: <strong>{JSON.stringify($state.value)}</strong>
      </p>
      <p>Context:</p>
      <pre>{JSON.stringify($state.context, undefined, 2)}</pre>
    </div>
    <div class="controls">
      <div class="send-controls">
        <input
          type="text"
          name="eventName"
          bind:value={eventName}
          list="event-names"
          autofocus
          autocomplete="on"
          placeholder="Enter an event"
        />
        <datalist id="event-names">
          <option value="START" />
          <option value="STOP" />
          <option value="PAUSE" />
          <option value="SPEED_INC" />
          <option value="SPEED_DEC" />
          <option value="SPAWN" />
          <option value="FORBIDDEN" />
          <option value="DUMMY" />
        </datalist>
        <button
          type="button"
          on:click={() => service.send(eventName)}
          disabled={String(eventName).length < 1}>Send event</button
        >
      </div>

      <div class="predefined-events">
        <button type="button" on:click={() => service.send('SPEED_INC')}
          >➕</button
        >
        <button type="button" on:click={() => service.send('SPEED_DEC')}
          >➖</button
        >
        <button
          type="button"
          on:click={() => service.send({ type: 'SET_SPEED', value: 0 })}
          >Reset speed</button
        >
      </div>

      <button type="button" on:click={resetMachine} class="reset-btn">
        💀 Reset the machine!
      </button>
    </div>
  </section>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
    color: #2c3e50;
    width: 50vw;
  }

  h1 {
    color: #ff3e00;
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
    background-color: hsl(39, 100%, 50%);
  }
  button.reset-btn:hover {
    background-color: hsl(39, 100%, 60%);
  }

  input {
    padding: 0.3rem 0.6rem;
  }

  img {
    width: 16rem;
    height: 16rem;
  }

  .state-machine {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    text-align: left;
  }

  .machine-state {
    margin-bottom: 1rem;
    font-size: 150%;
  }

  .machine-state > p:first-child {
    margin-top: 0;
  }

  .send-controls {
    margin-bottom: 1rem;
  }

  .predefined-events {
    margin-bottom: 1rem;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }
  }
</style>
