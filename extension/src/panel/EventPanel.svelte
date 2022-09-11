<script lang="ts">
  import JSONFormatter from 'json-formatter-js'

  export let snapshot: any = null
  let node: HTMLElement

  $: {
    if (node) {
      node.innerHTML = ''
      if (snapshot?.event) {
        const formatter = new JSONFormatter(snapshot.event, 2, {
          animateOpen: false,
        })
        node.appendChild(formatter.render())
      }
    }
  }
</script>

<h1>Event</h1>
<p class="event-panel" bind:this={node} />

<style>
  h1 {
    font-size: 2rem;
    background-color: var(--base01);
    color: var(--base03);
    margin: 0;
    padding: 0 8px;
  }

  .event-panel {
    padding: 8px;
    margin: 0;
  }
</style>
