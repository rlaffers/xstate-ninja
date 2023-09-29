import {
  ActorEvent,
  ActorsEvent,
  ConnectedEvent,
  EventTypes,
  UnregisterEvent,
  UpdateEvent,
  type XStateInspectAnyEvent,
} from 'xstate-ninja'

// let the host window know that the extension is installed
const s = document.createElement('script')
s.type = 'text/javascript'
s.src = chrome.runtime.getURL('inject/xstate_ninja.js')
s.onload = function () {
  if (s.parentNode) {
    s.parentNode.removeChild(s)
  }
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
    eventName as keyof WindowEventMap,
    ((
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
    }) as EventListener,
  )
}
forwardEvent(EventTypes.actor)
forwardEvent(EventTypes.actors)
forwardEvent(EventTypes.unregister)
forwardEvent(EventTypes.update)
forwardEvent(EventTypes.connected)
forwardEvent(EventTypes.inspectorCreated)
