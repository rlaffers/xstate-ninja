let port
function connect() {
  port = chrome.runtime.connect({ name: 'xstate-insights.page' })
  port.onDisconnect.addListener(connect)
  // port.onMessage.addListener(msg => {
  //   console.log('received', msg, 'from bg');
  // })
}
connect()

function listen(eventName) {
  window.addEventListener(`xstate-insights.${eventName}`, (event) => {
    if (event.srcElement !== window) {
      return
    }
    port.postMessage({
      type: event.type,
      data: event.detail,
    })
  })
}
listen('register')
listen('unregister')
listen('update')
