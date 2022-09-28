<script lang="ts">
  import Resizer from './Resizer.svelte'
  import JSONFormatter from 'json-formatter-js'

  export let snapshot: any = null
  let container: HTMLElement
  let element: HTMLElement

  $: {
    if (element) {
      element.innerHTML = ''
      if (snapshot?.event) {
        const formatter = new JSONFormatter(snapshot.event, 2, {
          animateOpen: false,
        })
        element.appendChild(formatter.render())
      }
    }
  }
</script>

<h1>Event</h1>
<div class="event-panel" bind:this={container}>
  <Resizer target={container} direction="vertical" />
  <div bind:this={element} />
</div>

<style>
  h1 {
    font-size: 2rem;
    background-color: var(--content);
    color: var(--background);
    margin: 0;
    padding: 0 8px;
  }

  .event-panel {
    position: relative;
    margin: 8px 8px 0 8px;
    padding-bottom: 8px;
    overflow: auto;
  }
</style>
