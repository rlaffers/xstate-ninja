<script lang="ts">
  import Resizer from './Resizer.svelte'
  import Tree from 'magic-json-tree'
  import diff from 'microdiff'
  import assocPath from '@ramda/assocpath'

  export let context: any = null
  export let previousContext: any = null

  let diffMode = false
  function setFullMode() {
    diffMode = false
  }
  function setDiffMode() {
    diffMode = true
  }

  function serializePath(path: any[]): string {
    return path.reduce(
      (result, item) =>
        `${result}${result.length > 0 ? '·' : ''}${String(item)}`,
      '',
    )
  }

  let contextDiff = context
  let formatValue: (entry: [any, any], path: any[]) => any = null
  let formatKey: (entry: [any, any], path: any[]) => any = null
  $: {
    if (diffMode && !previousContext) {
      contextDiff = context
      formatValue = null
      formatKey = null
    } else if (diffMode && previousContext) {
      const changes = diff(previousContext, context)
      console.log(
        '%cchanges',
        'background: red; color: black; padding: 1px 5px',
        changes,
      ) // TODO
      if (changes.length === 0) {
        formatValue = null
        formatKey = null
        contextDiff = null
      } else {
        const deltas = changes.reduce(
          (result, { type, path, oldValue, value }) => {
            result.contextDiff = assocPath(
              path,
              type === 'REMOVE' ? oldValue : value,
              result.contextDiff,
            )
            result.byPath[serializePath(path)] = { type, oldValue }
            return result
          },
          { contextDiff: {}, byPath: {} },
        )

        contextDiff = deltas.contextDiff

        // TODO add formatting to Summary (null -> Array[1] or Array[1] -> Array[2])
        // TODO add styles to changes
        // TODO when array items are deleted, the summary does not make sense (should be Array[3] => Array[2])
        formatValue = ([, value], path: any[]) => {
          const serializedPath = serializePath(path)
          const delta = deltas.byPath[serializedPath]
          if (delta?.type === 'CHANGE') {
            return `${delta.oldValue} ⇨ ${value}`
          }
          return value
        }
        formatKey = ([key], path: any[]) => {
          const serializedPath = serializePath(path)
          const delta = deltas.byPath[serializedPath]
          if (delta?.type === 'CREATE') {
            return `+${key}`
          }
          if (delta?.type === 'REMOVE') {
            return `-${key}`
          }
          return key
        }
      }
    }
  }

  let container: HTMLElement
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
    {#if diffMode && contextDiff === null}
      <p class="no-changes">No changes</p>
    {:else if diffMode}
      <Tree value={contextDiff} expand={1} {formatValue} {formatKey} />
    {:else}
      <Tree value={context} expand={1} />
    {/if}
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
