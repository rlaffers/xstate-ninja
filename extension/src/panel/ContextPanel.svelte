<script lang="ts">
  import JSONFormatter from 'json-formatter-js'

  export let context: any = null

  let contextContainer: HTMLElement
  $: {
    if (contextContainer) {
      contextContainer.innerHTML = ''
      if (context) {
        const formatter = new JSONFormatter(context, 2, {
          animateOpen: false,
        })
        contextContainer.appendChild(formatter.render())
      }
    }
  }
</script>

<h1>Context</h1>
<p class="context-container" bind:this={contextContainer} />

<style>
  h1 {
    font-size: 2rem;
    background-color: var(--base01);
    color: var(--base03);
    margin: 0;
    padding: 0 8px;
  }
  .context-container {
    margin: 8px;
  }
</style>
