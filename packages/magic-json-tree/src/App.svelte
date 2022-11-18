<script lang="ts">
  import Tree from '../lib'

  const value1 = {
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
        [[456], 'bar'],
      ]),
    },
  }
</script>

<main>
  <h1>Magic JSON Tree</h1>
  <Tree value={value1} />
</main>

<style>
</style>
