<div align="center">
  <h1>@xstate-ninja/react</h1>
  <img src="https://user-images.githubusercontent.com/489018/182801436-1a9c7cfd-9c67-4343-a430-17ec63f0ff3b.png" alt="logo" />
  <p>This package contains XState Ninja integration for React.</p>
  <p>
    <a href="https://npmjs.com/package/@xstate-ninja/react"><img src="https://img.shields.io/npm/v/@xstate-ninja/react" alt="npm version" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="code style: prettier" /></a>
    <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  </p>
  <hr/>
</div>

## Quick Start

```bash
npm install --save @xstate-ninja/react xstate-ninja @xstate/react xstate
```

To track state machines in your project, do this:

```javascript
import { useInterpret } from '@xstate-ninja/react'

function App() {
  const service = useInterpret(machine, { devTools: true })
}
```

The `useMachine` hook is available too:

```javascript
import { useMachine } from '@xstate-ninja/react'

function App() {
  const [state, send, service] = useMachine(machine, { devTools: true })
}
```

Open browser devtools (F12) and select the XState panel.

<div align="center">
  <img src="https://user-images.githubusercontent.com/489018/190877530-9ab334bf-a220-4ad6-9977-3f5000f01c66.png" alt="screenshot" />
</div>
