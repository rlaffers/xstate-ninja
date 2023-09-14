<script lang="ts">
  import Key from './Key.svelte'
  import Value from './Value.svelte'
  import Summary from './Summary.svelte'
  import {
    getEntries,
    getSortedEntries,
    getType,
    type Formatter,
  } from './utils'

  export let key: any
  export let value: any
  export let path: (number | string)[] = []
  export let formatKey: Formatter | undefined = undefined
  export let formatValue: Formatter | undefined = undefined
  export let formatSummary: Formatter | undefined = undefined
  export let level: number = 2
  export let expand: number | (string | number)[]
  export let sorted: boolean = false

  let expanded = Array.isArray(expand) ? true : expand >= level ? true : false
  function toggleExpanded(event: Event) {
    expanded = !expanded
    event.preventDefault()
  }

  const [firstExpandItem, ...restExpand] = Array.isArray(expand) ? expand : []
  let entries = sorted ? getSortedEntries : getEntries
  $: entries = sorted ? getSortedEntries : getEntries
</script>

<div
  class="magic-json-tree-item magic-json-tree-item-{getType(value)}"
  class:expanded
>
  {#if typeof value === 'object' && value !== null}
    <div class="key-line">
      <Key {key} {value} {path} format={formatKey} />:<Summary
        {value}
        {key}
        {path}
        format={formatSummary}
        onClick={toggleExpanded}
      />
    </div>
    {#if expanded}
      <div class="magic-json-tree-object-items">
        {#each entries(value) as [k, v]}
          <svelte:self
            key={k}
            value={v}
            level={level + 1}
            path={[...path, k]}
            {formatKey}
            {formatValue}
            {formatSummary}
            expand={!Array.isArray(expand)
              ? expand
              : firstExpandItem === k
              ? restExpand
              : 0}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <div class="key-line">
      <Key {key} {value} {path} format={formatKey} />:<Value
        {key}
        {value}
        {path}
        format={formatValue}
      />
    </div>
  {/if}
</div>

<style>
  .magic-json-tree-item {
    display: flex;
    flex-direction: column;
    margin-left: 1rem;
  }
  .key-line {
    display: flex;
    flex-direction: row;
  }
</style>
