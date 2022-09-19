# @xstate-ninja/react

This is XState Ninja for React.

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
  <img src="https://user-images.githubusercontent.com/489018/190674192-d7e84c96-3a55-48e3-be7d-829943de3639.png" alt="screenshot" />
</div>
