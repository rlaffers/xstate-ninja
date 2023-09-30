<script lang="ts">
  import { getTypeSummary, type Formatter } from './utils'

  type ValueType =
    | Record<string, unknown>
    | Array<any>
    | Map<any, any>
    | Set<any>

  export let value: ValueType

  export let onClick: (event: MouseEvent) => void
  export let format: Formatter | undefined
  export let key: any = null
  export let path: (number | string)[] = []
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a class="magic-json-tree-summary" href="#" on:click={onClick}>
  <span class="arrow">‣</span><span class="summary-content">
    {#if format}
      {format([key, value], path) ?? getTypeSummary(value)}
    {:else}
      {getTypeSummary(value)}
    {/if}
  </span>
</a>

<style>
  .magic-json-tree-summary {
    text-decoration: none;
    margin-left: 0.2rem;
    white-space: nowrap;
  }
  .magic-json-tree-summary > .summary-content {
    text-transform: capitalize;
  }
  :global(:is(.magic-json-tree-item > .key-line, .magic-json-tree-root)
      > .magic-json-tree-summary
      > .arrow) {
    display: inline-block;
    text-align: center;
    margin-right: 0.2rem;
  }
  :global(:is(.magic-json-tree-item.expanded
        > .key-line, .magic-json-tree-root.expanded)
      > .magic-json-tree-summary
      > .arrow) {
    transform: rotate(90deg);
    transform-origin: center;
  }
  :global(:is(.magic-json-tree-item-object > .key-line, .magic-json-tree-root)
      > .magic-json-tree-summary) {
    color: var(--mjt-color-object);
  }
  :global(.magic-json-tree-item-array > .key-line > .magic-json-tree-summary) {
    color: var(--mjt-color-array);
  }
  :global(.magic-json-tree-item-map > .key-line > .magic-json-tree-summary) {
    color: var(--mjt-color-map);
  }
  :global(.magic-json-tree-item-set > .key-line > .magic-json-tree-summary) {
    color: var(--mjt-color-set);
  }
</style>
