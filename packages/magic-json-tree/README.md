<div align="center">
  <h1>magic-json-tree</h1>
  <p>Svelte component to render interactive JSON trees.</p>
  <p>
    <a href="https://npmjs.com/package/magic-json-tree"><img src="https://img.shields.io/npm/v/magic-json-tree" alt="npm version" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="code style: prettier" /></a>
    <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  </p>
  <hr/>
</div>

## Quick Start

```bash
npm install --save magic-json-tree
```

In your Svelte app:

```javascript
<script>
  import Tree from 'magic-json-tree'

  const json = {
    name: 'john',
    age: 123,
    male: true,
    pets: ['rat', 'flees'],
    inventory: {
      belt: ['coins', 'knife', 8, undefined],
      backpack: null,
    },
    skills: new Map([
      ['strength', 123],
      [456, ['one', 'two', 'three']],
      [['favourite', 'inputs'], { taste: 'apple', smell: 'banana' }],
    ]),
  }
</script>

<Tree value={json} />
```

This renders a tree view:

<div align="center">
  <img src="https://user-images.githubusercontent.com/489018/202722774-db620b02-25c0-45eb-a84b-999b63a5c90b.png" alt="screenshot" />
</div>

## Props

| Name     | Type                           | Default | Description                                                                                                   |
| -------- | ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------- |
| `expand` | number \| (string \| number)[] | 0       | Pass a number to expand that many levels deep OR pass an object path like `['item', 'subItem', 'subSubItem']` |

## Example

Execute `npm run dev` and open the given URL in your browser.

## Theming

You can set some of the following CSS variables to overwrite the default colors:

```css
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
```
