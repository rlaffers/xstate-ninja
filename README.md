<div align="center">
  <h1>XState Ninja</h1>
  <img src="https://user-images.githubusercontent.com/489018/182801436-1a9c7cfd-9c67-4343-a430-17ec63f0ff3b.png" alt="logo" />
  <p>A dedicated devtool for XState state machines.</p>
  <p>    
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
const service = interpret(machine)
```

For React integration, check the [@xstate-ninja/react](https://github.com/rlaffers/xstate-ninja/tree/master/packages/xstate-ninja-react) library.

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
- ~~support parallel states~~
- ~~add second tracker lane~~
- ~~mark state nodes with invoked services with icons in the tracker~~
- ~~add button to close a swimlane~~
- ~~prevent autoscroll if any frame is selected~~
- ~~add a light theme~~
- ~~display EventFrame for non-machine actors~~
- ~~add extra links: github, xstate docs~~
- ~~limit height and width of side panels~~
- ~~style scrollbars in side panels~~
- optimize memory usage by dead actors (config option to limit how many dead actors are retained: N of each kind; max N total; none)
- permament hiding of parallel state nodes
- redesign the hide parallel state button
- add Node integration
- ~~add options to hide promise or callback actors from the extension~~
- ~~build for Firefox~~
- link identical events sent between actors
- add icons to frames for marking spawned children
- display guards on guarded events
- link to implementations for actions and services
- ~~add button for hiding some parallel states~~
- hide transition actions from state node frames; Hide entry/exit actions from event frames. Mark them as such.
- ~~add button to clear all dead actors~~
- display assign actions (they are not reported by the xstate interpreter)
- ~~add more info on the ActorDetail bar: time started, time finished, time unsubscribed, children~~
- ~~add React integration~~
- add Svelte integration
- ~~add parent onto spawned actors (better hierarchy in the dropdown)~~
- ~~add option to disable logging (in the production mode)~~
- add Vue integration
- ~~track invoked actors~~
- ~~stopped spawned actor is not marked as dead~~
- ~~mark the final state with double border~~
- ~~mark events guarded, forbidden~~
- ~~display context~~
- ~~display actions for event frames~~
- ~~display invocations for state node frames~~
- ~~display entry/exit actions for state node frames~~
- ~~make context sidebar width adjustable~~
- ~~make context, actions, services panels resizable and collapsible~~
- highlight changes in the context (diff mode)
- highlight transitions guarded by "in" state guards
- add button for emitting events
- user annotations tool

## Attribution

[Ninja icons created by Good Ware - Flaticon](https://www.flaticon.com/free-icons/ninja)
