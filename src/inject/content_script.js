import { EventTypes } from '../EventTypes'

let port
function connect() {
  port = chrome.runtime.connect({ name: 'xstate-explorer.page' })
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
listen(EventTypes.register)
listen(EventTypes.unregister)
listen(EventTypes.update)
