<script lang="ts">
  import Tree from '../lib'

  const value = {
    name: 'john',
    age: 123,
    male: true,
    items: [10, 'string', true, {}, [100, null, 200, undefined, 300]],
    symbol: Symbol('☉'),
    inventory: {
      purse: 'coins',
      belt: ['knife', 1, { name: 'bottle' }],
      backpack: null,
      // @ts-ignore
      map: new Map([
        ['foo', 123],
        [[456], ['one', 'two', 'three']],
        ['food', { taste: 'apple', smell: 'banana' }],
      ]),
      set: new Set(['a', 'b', 'c', 'c', 'b', 'b']),
    },
  }
</script>

<main>
  <h1>Magic JSON Tree</h1>
  <p>
    <code>&lt;Tree &lbrace;value&rbrace; /&gt;</code>
    <Tree {value} />
  </p>

  <p>
    <code>&lt;Tree &lbrace;value&rbrace; expand=&lbrace;1&rbrace; /&gt;</code>
    <Tree {value} expand={1} />
  </p>

  <p>
    <code
      >&lt;Tree &lbrace;value&rbrace; expand=&lbrace;['inventory', 'belt',
      2]&rbrace; /&gt;</code
    >
    <Tree {value} expand={['inventory', 'belt', 2]} />
  </p>
</main>

<style>
</style>
