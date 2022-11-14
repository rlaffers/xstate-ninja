<script lang="ts">
  import Resizer from './Resizer.svelte'
  import JSONFormatter from 'json-formatter-js'
  import diff from 'microdiff'
  import assocPath from '@ramda/assocpath'

  // from microdiff
  interface DifferenceChange {
    type: 'CHANGE'
    path: (string | number)[]
    value: any
    oldValue: any
  }

  export let context: any = null
  export let previousContext: any = null

  let diffMode = false
  function setFullMode() {
    diffMode = false
  }
  function setDiffMode() {
    diffMode = true
  }

  const noChangesElement = document.createElement('p')
  noChangesElement.classList.add('no-changes')
  noChangesElement.innerText = 'No changes'

  function renderDiff(current: any, previous: any): HTMLElement {
    if (!previous) {
      const formatter = new JSONFormatter(current, 1, {
        animateOpen: false,
      })
      return formatter.render()
    }
    const changes = diff(previous, current)
    if (changes.length < 1) {
      return noChangesElement
    }
    // TODO display additions
    // TODO display removals
    const structuredChanges = changes.reduce((result, change) => {
      if (change.type === 'CHANGE') {
        return assocPath(change.path, change.value, result)
      }
      return result
    }, {})

    const formatter = new JSONFormatter(structuredChanges, 1, {
      animateOpen: false,
    })
    return formatter.render()
  }

  function renderFull(ctx: any): HTMLElement {
    const formatter = new JSONFormatter(ctx, 1, {
      animateOpen: false,
    })
    return formatter.render()
  }

  let container: HTMLElement
  let element: HTMLElement
  $: {
    if (element) {
      element.innerHTML = ''
      if (context && diffMode) {
        element.appendChild(renderDiff(context, previousContext))
      } else if (context && !diffMode) {
        element.appendChild(renderFull(context))
      }
    }
  }
</script>

<h1>Context</h1>
<div class="wrapper nice-scroll" bind:this={container}>
  <div class="context-container">
    <div class="buttons">
      <button type="button" disabled={!diffMode} on:click={setFullMode}
        >Full</button
      >
      <button type="button" disabled={diffMode} on:click={setDiffMode}
        >Diff</button
      >
    </div>
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
  :global(.no-changes) {
    font-style: italic;
    color: var(--content-muted);
    margin: 1rem 0.1rem 0.5rem;
  }
  .buttons button {
    background: none;
    border: none;
    color: var(--content-accent);
  }
  .buttons button:disabled {
    color: var(--orange);
  }
  .buttons button:enabled:hover {
    color: var(--blue);
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
