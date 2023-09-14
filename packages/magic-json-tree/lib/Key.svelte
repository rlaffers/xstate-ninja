<script lang="ts">
  import { defaultFormatter, type Formatter } from './utils'

  export let key: any = null
  export let value: string | number | boolean | symbol | Function | undefined
  export let path: (number | string)[] = []
  export let format: Formatter = defaultFormatter
</script>

<div class="magic-json-tree-key">
  {format([key, value], path)}
</div>

<style>
  .magic-json-tree-key {
    color: var(--mjt-color-key);
  }
</style>
