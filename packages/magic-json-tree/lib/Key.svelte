<script lang="ts">
  export let key: any = null
  export let value: string | number | boolean | symbol | Function | undefined
  export let path: (number | string)[] = []
  export let format: (entry: [any, any], path: any[]) => any = null
</script>

<div class="magic-json-tree-key">
  {format ? format([key, value], [...path, key]) : String(key)}
</div>

<style>
  .magic-json-tree-key {
    color: var(--mjt-color-key);
  }
</style>
