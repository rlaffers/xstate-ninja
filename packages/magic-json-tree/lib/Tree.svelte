<script lang="ts">
  import Item from './Item.svelte'
  import Value from './Value.svelte'
  import Summary from './Summary.svelte'
  import { getEntries } from './utils'

  export let value: any
  export let expand: number | (string | number)[] = 0
  export let formatKey: (entry: [any, any], path: any[]) => any = null
  export let formatValue: (entry: [any, any], path: any[]) => any = null
  export let formatSummary: (entry: [any, any], path: any[]) => any = null

  let safeFormatKey = null
  $: safeFormatKey = formatKey
    ? (entry: [any, any], p: any[]) => {
        try {
          return formatKey(entry, p)
        } catch (e) {
          console.error(
            'The passed `formatKey` function threw an error. An unformatted key will be rendered.\n',
            e,
          )
          return entry[0]
        }
      }
    : null

  let safeFormatValue = null
  $: safeFormatValue = formatValue
    ? (entry: [any, any], p: any[]) => {
        try {
          return formatValue(entry, p)
        } catch (e) {
          console.error(
            'The passed `formatValue` function threw an error. An unformatted value will be rendered.\n',
            e,
          )
          return entry[1]
        }
      }
    : null

  let safeFormatSummary = null
  $: safeFormatSummary = formatSummary
    ? (entry: [any, any], p: any[]) => {
        try {
          return formatSummary(entry, p)
        } catch (e) {
          console.error(
            'The passed `formatSummary` function threw an error. A default summary will be rendered.\n',
            e,
          )
          return entry[1]
        }
      }
    : null

  let expanded = Array.isArray(expand) ? true : expand >= 1 ? true : false
  function toggleExpanded(event: Event) {
    expanded = !expanded
    event.preventDefault()
  }

  const [firstExpandItem, ...restExpand] = Array.isArray(expand) ? expand : []
</script>

<div class="magic-json-tree-root" class:expanded>
  {#if typeof value === 'object' && value !== null}
    <Summary {value} onClick={toggleExpanded} format={safeFormatSummary} />
    {#if expanded}
      <div class="magic-json-tree-object-items">
        {#each getEntries(value) as [key, val]}
          <Item
            {key}
            value={val}
            path={[key]}
            formatKey={safeFormatKey}
            formatValue={safeFormatValue}
            formatSummary={safeFormatSummary}
            level={2}
            expand={!Array.isArray(expand)
              ? expand
              : firstExpandItem === key
              ? restExpand
              : 0}
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
</style>
