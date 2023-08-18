<div align="center">
  <h1>@xstate-ninja/vue</h1>
  <img src="https://user-images.githubusercontent.com/489018/182801436-1a9c7cfd-9c67-4343-a430-17ec63f0ff3b.png" alt="logo" />
  <p>This package contains XState Ninja integration for Vue.</p>
  <p>
    <a href="https://npmjs.com/package/@xstate-ninja/vue"><img src="https://img.shields.io/npm/v/@xstate-ninja/vue" alt="npm version" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="code style: prettier" /></a>
    <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  </p>
  <hr/>
</div>

## Quick Start

```bash
npm install --save @xstate-ninja/vue xstate-ninja @xstate/vue xstate
```

To track state machines in your project, do this:

```javascript
<script setup lang="ts">
import { useInterpret } from '@xstate-ninja/vue'

const actor = useInterpret(machine, { devTools: true })
</script>
```

The `useMachine` hook is available too:

```javascript
import { useMachine } from '@xstate-ninja/vue'

const [state, send, service] = useMachine(machine, { devTools: true })
```

Install the [browser extension](https://github.com/rlaffers/xstate-ninja/tree/master/extension), open browser devtools (F12) and select the XState panel.

<div align="center">
  <img src="https://user-images.githubusercontent.com/489018/193230455-1499360e-79b4-4e38-903c-befd6d311eb6.png" alt="screenshot" />
</div>
