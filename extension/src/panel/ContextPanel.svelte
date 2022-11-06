<script lang="ts">
  import Resizer from './Resizer.svelte'
  import JSONFormatter from 'json-formatter-js'

  export let context: any = null

  let container: HTMLElement
  let element: HTMLElement
  $: {
    if (element) {
      element.innerHTML = ''
      if (context) {
        const formatter = new JSONFormatter(context, 1, {
          animateOpen: false,
        })
        element.appendChild(formatter.render())
      }
    }
  }
</script>

<h1>Context</h1>
<div class="wrapper nice-scroll" bind:this={container}>
  <div class="context-container">
    <div bind:this={element} />
  </div>
  <Resizer previousTarget={container} direction="vertical" />
</div>

<style>
  h1 {
    font-size: 2rem;
    background-color: var(--content);
    color: var(--background);
    margin: 0;
    padding: 0 8px;
  }
  .wrapper {
    overflow: auto;
  }
  .context-container {
    margin: 0;
    padding: 8px;
    min-height: 1rem;
  }
  :global(.sidebar:not(.custom-sized) .context-container) {
    max-width: 30rem;
  }
</style>
