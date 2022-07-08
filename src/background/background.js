import { log, error } from '../utils'
import { Tab } from './Tab'

// TODO rebrand to XState Explorer
// or XState Ninja
// or XState Monkey

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

const devPorts = new Map()
const tabs = new Map()

function handleMessageFromDevtoolPanel(message, port) {
  if (port.name === 'xstate-insights.panel') {
    logDevtoolsMessage(message, port.name)
    if (message.type === 'init') {
      devPorts.set(message.tabId, port)
      const tab = tabs.get(message.tabId)
      if (tab) {
        tab.devPort = port
      } else {
        error(
          `No tab ${message.tabId} exists! The devtools panel will receive no messages.`
        )
      }
    }
  } else {
    error(`Invalid port.name: ${port.name}`)
  }
}

let isKeptAlive = false

const removeDevPort = (ports) => (port) => {
  log('disconnecting port:', port.name)
  for (const [tabId, value] of ports.entries()) {
    if (value === port) {
      ports.delete(tabId)
      if (tabs.has(tabId)) {
        tabs.get(tabId).devPort = null
      }
      break
    }
  }
}

const removeTab = (tabs) => (port) => {
  log('disconnecting tab port', port.name)
  for (const [id, tab] of tabs.entries()) {
    if (tab.port === port) {
      tabs.delete(id)
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
    port.onDisconnect.addListener(removeDevPort(devPorts))
    port.onDisconnect.removeListener(handleMessageFromDevtoolPanel)
  }

  if (port.name === 'xstate-insights.page') {
    const tab = new Tab(
      port.sender.tab.id,
      port,
      devPorts.get(port.sender.tab.id)
    )
    // TODO put tabs and devPanels into a Controller instance
    tabs.set(tab.id, tab)
    port.onDisconnect.addListener(removeTab(tabs))
  }

  if (!isKeptAlive && port.name === 'xstate-insights.page') {
    keepAlive(port)
  }
  log(`Connected tabs: ${tabs.size}\nDev panels: ${devPorts.size}`)
})

// periodically reconnect the page port to keep the background service worker alive
function keepAlive(port) {
  port._timer = setTimeout(forceReconnect, 250e3, port)
  // triggered when the tab is closed
  port.onDisconnect.addListener((disconnectedPort) => {
    deleteTimer(disconnectedPort)
    if (tabs.size > 0) {
      keepAlive(tabs.values().next().value.port)
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
