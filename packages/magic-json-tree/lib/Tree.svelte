<script lang="ts">
  import Item from './Item.svelte'
  import Value from './Value.svelte'
  import Summary from './Summary.svelte'
  import { getEntries, getSortedEntries, type Formatter } from './utils'

  export let value: any
  export let expand: number | (string | number)[] = 0
  export let formatKey: Formatter | undefined = undefined
  export let formatValue: Formatter | undefined = undefined
  export let formatSummary: Formatter | undefined = undefined
  export let sorted: boolean = false

  let safeFormatKey: Formatter | undefined
  $: {
    if (typeof formatKey === 'function') {
      safeFormatKey = (entry: [any, any], p: any[]) => {
        try {
          return formatKey!(entry, p)
        } catch (e) {
          console.error(
            'The passed `formatKey` function threw an error. An unformatted key will be rendered.\n',
            e,
          )
          const head = entry[0]
          return head
        }
      }
    }
  }

  let safeFormatValue: Formatter | undefined
  $: {
    if (typeof formatValue === 'function') {
      safeFormatValue = (entry: [any, any], p: any[]) => {
        try {
          return formatValue!(entry, p)
        } catch (e) {
          console.error(
            'The passed `formatValue` function threw an error. An unformatted value will be rendered.\n',
            e,
          )
          return entry[1]
        }
      }
    }
  }

  let safeFormatSummary: Formatter | undefined
  $: {
    if (typeof formatSummary === 'function') {
      safeFormatSummary = (entry: [any, any], p: any[]) => {
        try {
          return formatSummary!(entry, p)
        } catch (e) {
          console.error(
            'The passed `formatSummary` function threw an error. A default summary will be rendered.\n',
            e,
          )
          return entry[1]
        }
      }
    }
  }

  let expanded = Array.isArray(expand) ? true : expand >= 1
  function toggleExpanded(event: Event) {
    expanded = !expanded
    event.preventDefault()
  }

  const [firstExpandItem, ...restExpand] = Array.isArray(expand) ? expand : []

  let entries = sorted ? getSortedEntries : getEntries
  $: entries = sorted ? getSortedEntries : getEntries
</script>

<div class="magic-json-tree-root" class:expanded>
  {#if typeof value === 'object' && value !== null}
    <Summary {value} onClick={toggleExpanded} format={safeFormatSummary} />
    {#if expanded}
      <div class="magic-json-tree-object-items">
        {#each entries(value) as [key, val]}
          <Item
            {key}
            value={val}
            path={[key]}
            formatKey={safeFormatKey}
            formatValue={safeFormatValue}
            formatSummary={safeFormatSummary}
            level={2}
            {sorted}
            expand={!Array.isArray(expand) ? expand : firstExpandItem === key ? restExpand : 0}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <Value {value} format={safeFormatValue} />
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

    --mjt-color-key: var(--base1);
    --mjt-color-string: var(--orange);
    --mjt-color-number: var(--cyan);
    --mjt-color-null: var(--red);
    --mjt-color-undefined: var(--red);
    --mjt-color-boolean: var(--blue);
    --mjt-color-object: var(--base00);
    --mjt-color-array: var(--base00);
    --mjt-color-symbol: var(--green);
    --mjt-color-map: var(--green);
    --mjt-color-set: var(--green);
  }
  .magic-json-tree-root {
    text-align: left;
  }
</style>
