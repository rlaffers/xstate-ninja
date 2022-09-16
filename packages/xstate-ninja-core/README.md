# xstate-ninja

This is the core library for vanilla JS projects.

## Quick Start

```bash
npm install --save xstate-ninja xstate
```

To track state machines in you project, do this:

```javascript
import { interpret } from 'xstate-ninja'
const service = interpret(machine)
```

Open browser devtools (F12) and select the XState panel.

<div align="center">
  <img src="https://user-images.githubusercontent.com/489018/190674192-d7e84c96-3a55-48e3-be7d-829943de3639.png" alt="screenshot" />
</div>
