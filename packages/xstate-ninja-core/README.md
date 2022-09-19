<div align="center">
  <h1>xstate-ninja</h1>
  <img src="https://user-images.githubusercontent.com/489018/182801436-1a9c7cfd-9c67-4343-a430-17ec63f0ff3b.png" alt="logo" />
  <p>This is the core library for vanilla JS projects.</p>
  <p>
    <a href="https://npmjs.com/package/xstate-ninja"><img src="https://img.shields.io/npm/v/xstate-ninja" alt="npm version" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="code style: prettier" /></a>
    <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  </p>
  <hr/>
</div>

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
