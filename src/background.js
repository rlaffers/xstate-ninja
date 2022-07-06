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

const connections = {}

function messageListener(message, port) {
  if (port.name === 'xstate-insights.panel') {
    logDevtoolsMessage(message, port.name)
    if (message.type === 'init') {
      connections[message.tabId] = port
    }
    return
  }
  if (port.name === 'xstate-insights.page') {
    log('→bkg', message)
    if (port.sender?.tab) {
      const tabId = port.sender.tab.id
      if (tabId in connections) {
        connections[tabId].postMessage(message)
      } else {
        log(`Tab not found in connection list: ${tabId}. Devtools not open?`)
      }
    } else {
      error('sender.tab not defined.')
    }
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (
    port.name !== 'xstate-insights.devtools' &&
    port.name !== 'xstate-insights.panel' &&
    port.name !== 'xstate-insights.page'
  ) {
    return
  }
  log('connecting port:', port.name)
  port.onMessage.addListener(messageListener)

  port.onDisconnect.addListener(function (port) {
    log('disconnecting port:', port.name)
    port.onMessage.removeListener(messageListener)
    Object.keys(connections).some((tabId) => {
      if (connections[tabId] === port) {
        delete connections[tabId]
        return true
      }
      return false
    })
  })

  // TODO only do this where needed, i.e. for pages with devtools open
  if (port.name === 'xstate-insights.page') {
    keepAlive(port)
  }
})

// periodically reconnect the page port to keep the background service worker alive
function keepAlive(port) {
  port._timer = setTimeout(forceReconnect, 250e3, port)
  port.onDisconnect.addListener(deleteTimer)
}

function forceReconnect(port) {
  log('reconnecting the page to keep service worker alive')
  deleteTimer(port)
  port.disconnect()
}
function deleteTimer(port) {
  if (port._timer) {
    clearTimeout(port._timer)
    delete port._timer
  }
}
