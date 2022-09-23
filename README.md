<div align="center">
  <h1>XState Ninja</h1>
  <img src="https://user-images.githubusercontent.com/489018/182801436-1a9c7cfd-9c67-4343-a430-17ec63f0ff3b.png" alt="logo" />
  <p>A dedicated devtool for XState state machines.</p>
  <p>
    <a href="https://npmjs.com/package/xstate-ninja"><img src="https://img.shields.io/npm/v/xstate-ninja" alt="npm version" /></a>
    <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="code style: prettier" /></a>
    <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  </p>
  <hr/>
</div>

## Screenshots

<div align="center">
  <img src="https://user-images.githubusercontent.com/489018/190877530-9ab334bf-a220-4ad6-9977-3f5000f01c66.png" alt="screenshot" />
</div>

## Quick Start

1. Install the browser extension from the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/).
2. Install the xstate-ninja package in your project:

```bash
npm install --save xstate-ninja xstate
```

3. Interpret your state machine with the provided **interpret** function:

```javascript
import { interpret } from 'xstate-ninja'
const service = interpret(machine)
```

## How it works

The **interpret** function is just a thin wrapper around the [core interpreter](https://xstate.js.org/docs/guides/interpretation.html#interpreter) provided by the XState library. It accepts the same argument as the XState's `interpret` function. It observes your state machines and sends updates to the XState Ninja browser extension.

## Configuration

To change default settings, import the XState Ninja instance in your project's index file:

```javascript
// in your index.ts
import xstateNinja, { LogLevels } from 'xstate-ninja'

xstateNinja({
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

## TODO

- ~~typescript~~
- ~~create the xstate integration~~
- ~~display parent-children hierarchy in the dropdown~~
- ~~track invoked actors~~
- ~~add event panel for event frames with event info~~
- ~~inspect the `devTools` option in useInterpret and useMachine hooks to include/exclude machine from tracking~~
- BUG: initial status in actor detail is Stopped
- add options to hide promise or callback actors from the extension
- optimize memory usage by dead actors (config option to limit how many dead actors are retained: N of each kind; max N total; none)
- ~~add button to clear all dead actors~~
- display assign actions (they are not reported by the xstate interpreter)
- ~~add more info on the ActorDetail bar: time started, time finished, time unsubscribed, children~~
- ~~add React integration~~
- add Svelte integration
- ~~add parent onto spawned actors (better hierarchy in the dropdown)~~
- ~~add option to disable logging (in the production mode)~~
- mark state nodes with invoked services with icons in the tracker
- add icons to frames for marking spawned children
- add Vue integration
- ~~track invoked actors~~
- ~~stopped spawned actor is not marked as dead~~
- ~~mark the final state with double border~~
- ~~mark events guarded, forbidden~~
- ~~display context~~
- ~~display actions for event frames~~
- ~~display invocations for state node frames~~
- ~~display entry/exit actions for state node frames~~
- add second tracker lane
- hide transition actions from state node frames; Hide entry/exit actions from event frames. Mark them as such.
- ~~make context sidebar width adjustable~~
- ~~make context, actions, services panels resizable and collapsible~~
- highlight changes in the context (diff mode)
- support parallel states
- highlight transitions guarded by "in" state guards
- add a light theme
- add button to emit an event
- user annotations tool

## Attribution

[Ninja icons created by Good Ware - Flaticon](https://www.flaticon.com/free-icons/ninja)
