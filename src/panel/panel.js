// Create a connection to the background page
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
  return false
})

// TODO try buffering messages in inspected page and polling them from here with inspectedPage.eval
// TODO try executing func with chrome.scripting from content-script, it can pass [args]
// TODO try accessing the background page window from content-script
// TODO try chrome.windows to get access to browser window.__XSTATE_INSIGHTS__.registeredActors
