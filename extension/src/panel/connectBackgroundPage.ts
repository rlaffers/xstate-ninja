import { MessageTypes, type InitMessage } from '../messages'

export function connectBackgroundPage(): chrome.runtime.Port {
  const bkgPort = chrome.runtime.connect({
    name: 'xstate-ninja.panel',
  })

  const msg: InitMessage = {
    type: MessageTypes.init,
    tabId: chrome.devtools.inspectedWindow.tabId,
  }

  bkgPort.postMessage(msg)
  return bkgPort
}
