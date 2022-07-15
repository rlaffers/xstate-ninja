<script>
  import Intro from './Intro.svelte'
  import { EventTypes } from '../EventTypes'
  import { connectBackgroundPage } from './connectBackgroundPage'

  // chrome.devtools.network.onNavigated.addListener((request) => {
  //   // TODO clear the panel on refresh
  // })

  const bkgPort = connectBackgroundPage()

  function log(text, data) {
    bkgPort.postMessage({
      type: 'log',
      text,
      data,
    })
  }
  // TODO temporary. Instead, make an interface for applying updates to HTML
  // renderer.updateMachine
  // renderer.addMachine
  // renderer.removeMachine
  // renderer.selectMachine
  function print(state) {
    const el = document.createElement('div')
    el.innerText = state.event.type
    document.body.appendChild(el)
  }

  // TODO we should determine this from the bkgPort messages. If not actors becomes detected
  // upon init message, show this. Until then, show a loader
  // TODO control this by a state machine
  let actors = new Map()

  function messageListener(message) {
    // TODO handle the register event, render machine dropdown
    // TODO renderer.addMachine(message)
    log('received', { message, bkgPort })
    if (message.type === EventTypes.actorsRegisteredPreviously) {
      actors = message.data
    }

    if (message.type === EventTypes.update) {
      // sanitize
      const sessionId = String(message.data.sessionId).replaceAll(
        /[^a-z0-9:]/gi,
        '',
      )
      // Read extended actor state info from the page window. The serialization mechanism for inspectedWindow.eval() is
      // more robust than the mechanism for serializing CustomEvent.detail which is therefore kept purposefully bare and simple.
      // With eval() we are able to get state.context reasonably safely (serializing functions and object instances will
      // not throw exceptions).
      // At worst (with circular dependencies within serialized objects) we will get an exception here, but since we have already
      // received the update message, we can at least render some minimal information.
      chrome.devtools.inspectedWindow.eval(
        `console.log('♥ devtools requests actor state', '${sessionId}') || window.__XSTATE_NINJA__?.getSerializableActorState('${sessionId}')`,
        (result, error) => {
          if (error) {
            // TODO on failure we can still use the limited info from the message
            log('💀 Eval error:', { error })
          } else {
            log('✅ Eval result:', { result })
            // TODO temporary
            print(result)
            // renderer.updateMachine(result)
          }
        },
      )
    }
    return false
  }
  bkgPort.onMessage.addListener(messageListener)
  bkgPort.onDisconnect.addListener(() => {
    bkgPort.onMessage.removeListener(messageListener)
  })
</script>

{#if actors.size < 1}
  <Intro />
{:else}
  <p>TODO: display the machine dropdown</p>
{/if}
