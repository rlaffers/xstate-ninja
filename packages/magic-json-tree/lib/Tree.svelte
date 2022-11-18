<script lang="ts">
  import ObjectValue from './Object.svelte'
  import { getType } from './utils'

  export let value: any
  export let expand: number | string[] = 0
</script>

<div class="magic-json-tree-root">
  {#if typeof value !== 'object'}
    <div class="magic-json-tree-value magic-json-tree-value-{getType(value)}">
      {String(value)}
    </div>
  {:else}
    <ObjectValue {value} />
  {/if}
</div>

<style>
  :root {
    --base03: #002b36;
    --base02: #073642;
    --base01: #586e75;
    --base00: #657b83;
    --base0: #839496;
    --base1: #93a1a1;
    --base2: #eee8d5;
    --base3: #fdf6e3;
    --yellow: #b58900;
    --orange: #cb4b16;
    --red: #dc322f;
    --magenta: #d33682;
    --violet: #6c71c4;
    --blue: #268bd2;
    --cyan: #2aa198;
    --green: #859900;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--base03);
    color: var(--base1);

    --mjt-color-key: var(--base1);
    --mjt-color-string: var(--orange);
    --mjt-color-number: var(--cyan);
    --mjt-color-null: var(--yellow);
    --mjt-color-undefined: var(--yellow);
    --mjt-color-boolean: var(--blue);
    --mjt-color-object: var(--base1);
    --mjt-color-array: var(--base1);
    --mjt-color-symbol: var(--green);
    --mjt-color-map: var(--green);
    --mjt-color-set: var(--green);
  }
  .magic-json-tree-root {
    text-align: left;
  }
  :global(.magic-json-tree-key) {
    color: var(--mjt-color-key);
  }
  :global(.magic-json-tree-value) {
    margin-left: 0.3rem;
  }
  :global(.magic-json-tree-value-string) {
    color: var(--mjt-color-string);
  }
  :global(.magic-json-tree-value-number) {
    color: var(--mjt-color-number);
  }
  :global(.magic-json-tree-value-boolean) {
    color: var(--mjt-color-boolean);
  }
  :global(.magic-json-tree-value-null) {
    color: var(--mjt-color-null);
  }
  :global(.magic-json-tree-value-undefined) {
    color: var(--mjt-color-undefined);
  }
  :global(.magic-json-tree-value-symbol) {
    color: var(--mjt-color-symbol);
  }
  :global(.magic-json-tree-value-object > .magic-json-tree-summary) {
    color: var(--mjt-color-object);
  }
  :global(.magic-json-tree-value-array > .magic-json-tree-summary) {
    color: var(--mjt-color-array);
  }
  :global(.magic-json-tree-value-map > .magic-json-tree-summary) {
    color: var(--mjt-color-map);
  }
  :global(.magic-json-tree-value-set > .magic-json-tree-summary) {
    color: var(--mjt-color-set);
  }
  :global(.magic-json-tree-item) {
    margin-left: 1rem;
  }
</style>
