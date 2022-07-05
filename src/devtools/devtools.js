/* global chrome */

// const backgroundPageConnection = chrome.runtime.connect({
//   name: 'devtools',
// })

// function log(text, data) {
//   const message = {
//     type: 'log',
//     text,
//     data,
//   }
//   backgroundPageConnection.postMessage(message)
// }

// backgroundPageConnection.postMessage({
//   type: 'init',
//   tabId: chrome.devtools.inspectedWindow.tabId,
// })

// backgroundPageConnection.onMessage.addListener(
//   (message, sender, sendResponse) => {
//     log('received', { message })
//     return false
//   }
// )

chrome.devtools.panels.create(
  '🤖 XState Insights',
  '../assets/icon_16x16.png',
  '../panel/panel.html'
)
