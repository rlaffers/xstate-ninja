<script lang="ts">
  import { getType, type Formatter } from './utils'

  // eslint-disable-next-line @typescript-eslint/ban-types
  export let value: string | number | boolean | symbol | Function | undefined
  export let key: any = null
  export let path: (number | string)[] = []
  export let format: Formatter = ([, value]) =>
    typeof value === 'string' ? `"${String(value)}"` : value
</script>

<div class="magic-json-tree-value magic-json-tree-value-{getType(value)}">
  {format([key, value], path)}
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
