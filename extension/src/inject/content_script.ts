import { MessageTypes, type AnyMessage } from '../messages'

let port: chrome.runtime.Port
function connect() {
  port = chrome.runtime.connect({ name: 'xstate-ninja.page' })
  port.onDisconnect.addListener(connect)
  // port.onMessage.addListener(msg => {
  //   console.log('received', msg, 'from bg');
  // })
}
connect()

function listen(eventName: string) {
  window.addEventListener(eventName, (event: CustomEvent) => {
    if (event.target !== window) {
      return
    }
    const msg: AnyMessage = {
      type: event.type as
        | MessageTypes.update
        | MessageTypes.register
        | MessageTypes.unregister,
      data: event.detail,
    }
    port.postMessage(msg)
  })
}
listen(MessageTypes.register)
listen(MessageTypes.unregister)
listen(MessageTypes.update)
