<script lang="ts">
  import { getType } from './utils'

  export let value: string | number | boolean | symbol | Function | undefined
  export let key: any = null
  export let path: (number | string)[] = []
  export let format: (entry: [any, any], path: any[]) => any = null
</script>

<div class="magic-json-tree-value magic-json-tree-value-{getType(value)}">
  {#if typeof value === 'string'}
    {format ? format([key, value], path) : `"${value}"`}
  {:else if format}
    {String(format([key, value], path))}
  {:else}
    {String(value)}
  {/if}
</div>

<style>
  .magic-json-tree-value {
    margin-left: 0.3rem;
  }
  .magic-json-tree-value-string {
    color: var(--mjt-color-string);
  }
  .magic-json-tree-value-number {
    color: var(--mjt-color-number);
  }
  .magic-json-tree-value-boolean {
    color: var(--mjt-color-boolean);
  }
  .magic-json-tree-value-null {
    color: var(--mjt-color-null);
  }
  .magic-json-tree-value-undefined {
    color: var(--mjt-color-undefined);
  }
  .magic-json-tree-value-symbol {
    color: var(--mjt-color-symbol);
  }
</style>
