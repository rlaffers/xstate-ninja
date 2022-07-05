import { log, error } from './utils'

function logDevtoolsMessage({ type, ...msg }, senderName) {
  let bkg = 'gray'
  let args = [msg]
  switch (type) {
    case 'log':
      bkg = 'fuchsia'
      args = [msg.text]
      if (msg.data !== undefined) {
        args.push(msg.data)
      }
      break

    case 'init':
      bkg = 'lime'
      break
  }
  console.log(
    `%c${senderName}:${type}`,
    `background-color: ${bkg}; color: black; padding: 1px 4px;`,
    ...args
  )
}

chrome.runtime.onInstalled.addListener(() => {
  log('XState Insights background script started')
})

const connections = {}

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name !== 'devtools' && port.name !== 'panel') {
    return
  }
  function extensionListener(message, sender) {
    logDevtoolsMessage(message, sender.name)
    if (message.type === 'init') {
      connections[message.tabId] = port
    }
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener)

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener)
    Object.keys(connections).some((tabId) => {
      if (connections[tabId] === port) {
        delete connections[tabId]
        return true
      }
      return false
    })
  })
})

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function (request, sender) {
  // Messages from content scripts should have sender.tab set
  log('→bkg', request) // TODO
  if (sender.tab) {
    const tabId = sender.tab.id
    if (tabId in connections) {
      connections[tabId].postMessage(request)
    } else {
      // TODO remove
      log(`Tab not found in connection list: ${tabId}`)
    }
  } else {
    error('sender.tab not defined.')
  }
  return false
})
