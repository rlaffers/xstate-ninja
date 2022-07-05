// Create a connection to the background page

let bkgPort

// TODO tidy up, this is a mess, make functions clean, encapsulate reconnection
function log(text, data) {
  const message = {
    type: 'log',
    text,
    data,
  }
  bkgPort.postMessage(message)
}

function messageListener(message) {
  log('received', { message })
  // TODO experimental: we are going to request extended actor state from the page. This is a safer
  // way to read context. If it fails, we can always revert back to what we got in the message.data
  if (message.type === 'xstate-insights.update') {
    const sessionId = String(message.data.sessionId).replaceAll(
      /[^a-z0-9:]/gi,
      ''
    )
    chrome.devtools.inspectedWindow.eval(
      `console.log('♥ devtools requests actor state', '${sessionId}') || window.__XSTATE_INSIGHTS__?.getSerializableActorState('${sessionId}')`,
      (result, error) => {
        if (error) {
          log('💀 Eval error:', { error })
        } else {
          log('✅ Eval result:', { result })
        }
      }
    )
  }
  return false
}

function connectBackgroundPage() {
  bkgPort = chrome.runtime.connect({
    name: 'panel',
  })

  bkgPort.postMessage({
    type: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId,
  })

  bkgPort.onMessage.addListener(messageListener)

  bkgPort.onDisconnect.addListener((port) => {
    bkgPort.onMessage.removeListener(messageListener)
    bkgPort = null
  })
  return bkgPort
}

connectBackgroundPage()

// reconnect on page refresh
chrome.devtools.network.onNavigated.addListener((request) => {
  bkgPort?.disconnect()
  connectBackgroundPage()
})
