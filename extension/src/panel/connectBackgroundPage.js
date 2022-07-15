export function connectBackgroundPage() {
  const bkgPort = chrome.runtime.connect({
    name: 'xstate-ninja.panel',
  })

  bkgPort.postMessage({
    type: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId,
  })

  return bkgPort
}
