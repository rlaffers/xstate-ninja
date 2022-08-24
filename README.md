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

## Installation

1. Install the browser extension from the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/).
2. Install the npm package in your project:

```bash
npm install --save xstate-ninja xstate
```

3. Interpret your state machine with the provided **interpret** function:

```javascript
import { interpret } from 'xstate-ninja'
const service = interpret(machine)
```

## How it works

The **interpret** function is just a thin wrapper around the [core interpreter](https://xstate.js.org/docs/guides/interpretation.html#interpreter) provided by the XState library. It observes your state machines and sends updates to the XState Ninja browser extension.

## TODO

- ~~typescript~~
- ~~create the xstate integration~~
- add React integration
- add Svelte integration
- add Vue integration
- track invoked actors
- stopped spawned actor is not marked as dead
- ~~mark the final state with double border~~
- ~~mark events guarded, forbidden~~
- ~~display context~~
- highlight changes in the context (diff mode)
- make context sidebar size adjustable
- display actions for event frames
- display invocations for state node frames
- display entry/exit actions for state node frames
- add more info on the ActorDetail bar: time started, time finished, time unsubscribed
- add second tracker lane
- add button for linking events in two trackers
- add button to emit an event
- user annotations tool
- optimize memory usage by dead actors
- add option to disable logging (in the production mode)
- display the initial state right before xstate.init
- support parallel states
- highlight transitions guarded by "in" state guards
- add a light theme

## Attribution

[Ninja icons created by Good Ware - Flaticon](https://www.flaticon.com/free-icons/ninja)
