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
        const formatter = new JSONFormatter(context, 2, {
          animateOpen: false,
        })
        element.appendChild(formatter.render())
      }
    }
  }
</script>

<h1>Context</h1>
<div class="context-container" bind:this={container}>
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
  .context-container {
    position: relative;
    margin: 8px 8px 0 8px;
    padding-bottom: 8px;
    overflow: auto;
  }
</style>
