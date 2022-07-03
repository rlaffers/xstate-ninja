/* global chrome */
function log(...args) {
  console.log('[xstate-insights]', ...args)
}

chrome.devtools.panels.create(
  'XState Insights',
  '../assets/icon_16x16.png',
  '../panel/panel.html',
  () => {
    log('Panel created')
  }
)
