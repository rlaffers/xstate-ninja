<script lang="ts">
  import { getType, getEntries } from './utils'

  export let value:
    | Record<string, unknown>
    | Array<any>
    | Map<any, any>
    | Set<any>
  export let onClick: (event: MouseEvent) => void
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a class="magic-json-tree-summary" href="#" on:click={onClick}>
  <span class="arrow">‣</span><span class="type-name"
    >{getType(value)}[{getEntries(value).length}]</span
  >
</a>

<style>
  .magic-json-tree-summary {
    text-decoration: none;
    margin-left: 0.2rem;
  }
  .magic-json-tree-summary > .type-name {
    text-transform: capitalize;
  }
  :global(:is(.magic-json-tree-item > .key-line, .magic-json-tree-root)
      > .magic-json-tree-summary
      > .arrow) {
    display: inline-block;
    text-align: center;
    margin-right: 0.2rem;
  }
  :global(:is(.magic-json-tree-item.expanded > .key-line, .magic-json-tree-root)
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
