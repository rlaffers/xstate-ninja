import {
  EventTypes,
  ActorEvent,
  UpdateEvent,
  UnregisterEvent,
} from 'xstate-ninja'

let port: chrome.runtime.Port
function connect() {
  port = chrome.runtime.connect({ name: 'xstate-ninja.page' })
  port.onDisconnect.addListener(connect)
  port.onMessage.addListener((msg) => {
    console.log('[content-script] received from bg', msg) // TODO remove
    window.dispatchEvent(msg)
  })
}
connect()

function forwardEvent(eventName: string) {
  window.addEventListener(
    eventName,
    (event: ActorEvent | UpdateEvent | UnregisterEvent) => {
      if (event.target !== window) {
        return
      }
      port.postMessage(event)
    },
  )
}
forwardEvent(EventTypes.actor)
forwardEvent(EventTypes.actors)
forwardEvent(EventTypes.unregister)
forwardEvent(EventTypes.update)
