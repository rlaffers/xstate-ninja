# @xstate-ninja/react

This is XState Ninja for React.

## Quick Start

```bash
npm install --save xstate-ninja @xstate-ninja/react
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
