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

const panelConnections = new Map()
const tabConnections = new Map()

function handleMessageFromDevtoolPanel(message, port) {
  if (port.name === 'xstate-insights.panel') {
    logDevtoolsMessage(message, port.name)
    if (message.type === 'init') {
      panelConnections.set(message.tabId, port)
    }
  } else {
    error(`Invalid port.name: ${port.name}`)
  }
}

function relayPageMessageToDevtoolPanel(message, port) {
  if (port.name === 'xstate-insights.page') {
    log('→ bkg', message)
    if (port.sender?.tab) {
      const tabId = port.sender.tab.id
      if (panelConnections.has(tabId)) {
        panelConnections.get(tabId).postMessage(message)
      } else {
        log(`Tab not found in connection list: ${tabId}. Devtools not open?`)
      }
    } else {
      error('sender.tab not defined.')
    }
  } else {
    error(`Invalid port.name: ${port.name}`)
  }
}

let isKeptAlive = false

const removeConnection = (connections) => (port) => {
  log('disconnecting port:', port.name)
  for (const [key, value] of connections.entries()) {
    if (value === port) {
      connections.delete(key)
      break
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

  if (port.name === 'xstate-insights.panel') {
    port.onMessage.addListener(handleMessageFromDevtoolPanel)
    port.onDisconnect.addListener(removeConnection(panelConnections))
    port.onDisconnect.removeListener(handleMessageFromDevtoolPanel)
  }

  if (port.name === 'xstate-insights.page') {
    tabConnections.set(port.sender.tab.id, port)
    port.onDisconnect.addListener(removeConnection(tabConnections))
    port.onMessage.addListener(relayPageMessageToDevtoolPanel)
    port.onDisconnect.removeListener(relayPageMessageToDevtoolPanel)
  }

  if (!isKeptAlive && port.name === 'xstate-insights.page') {
    keepAlive(port)
  }
})

// periodically reconnect the page port to keep the background service worker alive
function keepAlive(port) {
  port._timer = setTimeout(forceReconnect, 250e3, port)
  // triggered when the tab is closed
  port.onDisconnect.addListener((disconnectedPort) => {
    deleteTimer(disconnectedPort)
    if (tabConnections.size > 0) {
      keepAlive(tabConnections.values().next().value)
    }
  })
  isKeptAlive = true
}

function forceReconnect(port) {
  log('reconnecting the page to keep service worker alive')
  deleteTimer(port)
  isKeptAlive = false
  port.disconnect()
}

function deleteTimer(port) {
  if (port._timer) {
    clearTimeout(port._timer)
    delete port._timer
  }
}
