import { MessageTypes } from '../messages'

let port
function connect() {
  port = chrome.runtime.connect({ name: 'xstate-ninja.page' })
  port.onDisconnect.addListener(connect)
  // port.onMessage.addListener(msg => {
  //   console.log('received', msg, 'from bg');
  // })
}
connect()

function listen(eventName) {
  window.addEventListener(eventName, (event) => {
    if (event.srcElement !== window) {
      return
    }
    port.postMessage({
      type: event.type,
      data: event.detail,
    })
  })
}
listen(MessageTypes.register)
listen(MessageTypes.unregister)
listen(MessageTypes.update)
