import {
  EventTypes,
  ActorEvent,
  ActorsEvent,
  UpdateEvent,
  ConnectedEvent,
  UnregisterEvent,
  type XStateInspectAnyEvent,
} from 'xstate-ninja'

// let the host window know that the extension is installed
const s = document.createElement('script')
s.type = 'text/javascript'
s.src = chrome.runtime.getURL('inject/xstate_ninja.js')
s.onload = function () {
  this.parentNode.removeChild(this)
}
;(document.head || document.documentElement).appendChild(s)

let port: chrome.runtime.Port
function connect() {
  port = chrome.runtime.connect({ name: 'xstate-ninja.page' })
  port.onDisconnect.addListener(connect)
  port.onMessage.addListener((msg: XStateInspectAnyEvent) => {
    // console.log(
    //   '%c[content-script]',
    //   'color: fuchsia',
    //   '← received from bg',
    //   msg,
    // )
    window.dispatchEvent(new CustomEvent(msg.type, { detail: msg }))
  })
}
connect()

function forwardEvent(eventName: string) {
  window.addEventListener(
    eventName,
    (
      event: CustomEvent<
        | ActorEvent
        | ActorsEvent
        | UpdateEvent
        | ConnectedEvent
        | UnregisterEvent
      >,
    ) => {
      if (event.target !== window) {
        return
      }
      // console.log(
      //   '%c[content-script]',
      //   'color: fuchsia',
      //   '» fwd event to background.js',
      //   event.type,
      //   event,
      // )
      port.postMessage(event.detail)
    },
  )
}
forwardEvent(EventTypes.actor)
forwardEvent(EventTypes.actors)
forwardEvent(EventTypes.unregister)
forwardEvent(EventTypes.update)
forwardEvent(EventTypes.connected)
