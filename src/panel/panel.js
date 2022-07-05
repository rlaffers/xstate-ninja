// Create a connection to the background page
// TODO reconnect on refresh
const backgroundPageConnection = chrome.runtime.connect({
  name: 'panel',
})

backgroundPageConnection.postMessage({
  type: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
})

function log(text, data) {
  const message = {
    type: 'log',
    text,
    data,
  }
  backgroundPageConnection.postMessage(message)
}

backgroundPageConnection.onMessage.addListener((message) => {
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
})

// TODO try buffering messages in inspected page and polling them from here with inspectedPage.eval
// TODO try executing func with chrome.scripting from content-script, it can pass [args]
// TODO try accessing the background page window from content-script
// TODO try chrome.windows to get access to browser window.__XSTATE_INSIGHTS__.registeredActors
