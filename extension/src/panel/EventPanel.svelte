<script lang="ts">
  import Resizer from './Resizer.svelte'
  import JSONFormatter from 'json-formatter-js'

  export let snapshot: any = null
  let container: HTMLElement
  let element: HTMLElement

  let title = 'Event'
  $: {
    if (element) {
      element.innerHTML = ''
      if (snapshot?.event) {
        title = 'Event'
        const formatter = new JSONFormatter(snapshot.event, 2, {
          animateOpen: false,
        })
        element.appendChild(formatter.render())
      } else if (typeof snapshot?.type === 'string') {
        // values from callback actors may be events
        title = 'Event'
        const formatter = new JSONFormatter(snapshot, 2, {
          animateOpen: false,
        })
        element.appendChild(formatter.render())
      } else {
        title = 'Emitted value'
        const formatter = new JSONFormatter(snapshot, 2, {
          animateOpen: false,
        })
        element.appendChild(formatter.render())
      }
    }
  }
</script>

<h1>{title}</h1>
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
