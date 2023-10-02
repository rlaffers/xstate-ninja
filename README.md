<div align="center">
  <h1>XState Ninja</h1>
  <img src="https://user-images.githubusercontent.com/489018/182801436-1a9c7cfd-9c67-4343-a430-17ec63f0ff3b.png" alt="logo" />
  <p>A dedicated devtool for XState state machines.</p>
  <p>    
    <a href="https://github.com/rlaffers/xstate-ninja/actions/workflows/main.yml">
      <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/rlaffers/xstate-ninja/main.yml">
    </a>
 <a href="https://github.com/support-ukraine/support-ukraine"><img src="https://bit.ly/support-ukraine-now" alt="Support Ukraine" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="code style: prettier" /></a>
    <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  </p>
  <hr/>
</div>

## Screenshots

<div align="center">
  <img src="https://user-images.githubusercontent.com/489018/193230455-1499360e-79b4-4e38-903c-befd6d311eb6.png" alt="screenshot" />
</div>

## Quick Start

1. Install the browser extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/xstate-ninja/cogeldipmkjdfjgjkghlmhehejpmcfif) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/xstate-ninja/).
2. Install the xstate-ninja package in your project:

```bash
npm install --save xstate-ninja xstate
```

3. Interpret your state machine with the provided **interpret** function:

```javascript
import { interpret } from 'xstate-ninja'
const actor = interpret(machine, { devTools: true })
```

For React integration, check the [@xstate-ninja/react](https://github.com/rlaffers/xstate-ninja/tree/master/packages/xstate-ninja-react) library.
For Vue integration, check the [@xstate-ninja/vue](https://github.com/rlaffers/xstate-ninja/tree/master/packages/xstate-ninja-vue) library.

## How it works

The **interpret** function is just a thin wrapper around the [core interpreter](https://xstate.js.org/docs/guides/interpretation.html#interpreter) provided by the XState library. It accepts the same argument as the XState's `interpret` function. It observes your state machines and sends updates to the XState Ninja browser extension.

## Configuration

To change default settings, import the XState Ninja instance in your project's index file:

```javascript
// in your index.ts
import { configure, LogLevels } from 'xstate-ninja'

configure({
  enabled: process.env.NODE_ENV !== 'production',
  logLevel: LogLevels.debug,
})
```

XState Ninja is a singleton, so wherever you change these settings, they will be applied throughout your application.

### `enabled`

**Type: boolean**

**Default: `true`**

Turns XState Ninja on or off. By default, tracking is always on. You may want to disable tracking in the production mode to improve performance.

### `logLevel`

**Type: LogLevels enum**

**Default: `LogLevels.error`**

Controls how much stuff is logged into console by XState Ninja.

## Upgrading from v1 → v2

If you were using the default export to configure XState Ninja, replace it with the `configure` function:

```javascript
// ❌ DEPRECATED xstate-ninja v1
import XStateNinja from 'xstate-ninja'
XStateNinja({ enabled: false })

// ✅ xstate-ninja v2
import { configure } from 'xstate-ninja'
configure({ enabled: false })
```

## Attribution

[Ninja icons created by Good Ware - Flaticon](https://www.flaticon.com/free-icons/ninja)
