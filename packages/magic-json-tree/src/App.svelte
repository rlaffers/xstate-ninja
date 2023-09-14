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
      map: new Map<any, any>([
        ['foo', 123],
        [[456], ['one', 'two', 'three']],
        ['food', { taste: 'apple', smell: 'banana' }],
      ]),
      set: new Set(['a', 'b', 'c', 'c', 'b', 'b']),
    },
  }

  function formatKey([key, val]: [any, any]): any {
    return `${key}(${typeof val})`
  }
  function formatValue([key, val]: [any, any]): any {
    if (key === 'age') {
      return 999
    }
    return val
  }
</script>

<main>
  <h1>Magic JSON Tree</h1>
  <p>
    <code>&lt;Tree &lbrace;value&rbrace; /&gt;</code>
    <Tree {value} />
  </p>

  <p>
    <code>&lt;Tree &lbrace;value&rbrace; sorted /&gt;</code>
    <Tree {value} sorted />
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

  <p>
    <code
      ><pre>&lt;script&gt;
  const formatValue = ([key, value], path) =&gt; key === 'age' ? 999 : value
&lt;/script&gt;

&lt;Tree &lbrace;value&rbrace; &lbrace;formatValue&rbrace; /&gt;</pre></code
    >
    <Tree {value} {formatValue} />
  </p>

  <p>
    <code
      ><pre>&lt;script&gt;
  const formatKey = ([key, value], path) =&gt; `$&lbrace;key&rbrace;(&lbrace;typeof value&rbrace;)`
&lt;/script&gt;

&lt;Tree &lbrace;value&rbrace; &lbrace;formatKey&rbrace; /&gt;</pre></code
    >
    <Tree {value} {formatKey} />
  </p>
</main>

<style>
</style>
