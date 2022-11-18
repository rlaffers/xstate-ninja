<script lang="ts">
  import { getType } from './utils'
  export let value: any[]
  export let expanded = false

  function toggleExpanded(event: Event) {
    expanded = !expanded
    event.preventDefault()
  }

  let entries =
    typeof value.entries === 'function'
      ? [...value.entries()]
      : Object.entries(value)
  $: entries =
    typeof value.entries === 'function'
      ? [...value.entries()]
      : Object.entries(value)
</script>

<div
  class="magic-json-tree-value magic-json-tree-value-{getType(value)}"
  class:expanded
>
  <a class="magic-json-tree-summary" href="#" on:click={toggleExpanded}>
    <span class="arrow">‣</span><span class="type-name"
      >{getType(value)}[{entries.length}]</span
    >
  </a>
  {#if expanded}
    {#each entries as [key, val]}
      <div class="magic-json-tree-item">
        <div class="magic-json-tree-key">{key}</div>
        :
        <div class="magic-json-tree-value magic-json-tree-value-{getType(val)}">
          {#if typeof val === 'string'}
            "{val}"
          {:else if val == null}
            {String(val)}
          {:else if typeof val === 'object'}
            <svelte:self value={val} />
          {:else}
            {String(val)}
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .magic-json-tree-item {
    display: flex;
  }
  .magic-json-tree-summary {
    text-decoration: none;
  }
  .magic-json-tree-summary > .type-name {
    text-transform: capitalize;
  }
  .magic-json-tree-value-object > .magic-json-tree-summary > .arrow {
    display: inline-block;
    text-align: center;
    margin-right: 0.2rem;
  }
  .magic-json-tree-value-object.expanded > .magic-json-tree-summary > .arrow {
    transform: rotate(90deg);
    transform-origin: center;
  }
</style>
