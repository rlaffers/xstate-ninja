import { Controller } from './controller'

window.__XSTATE_INSIGHTS__ = null

let insightsWindow
let promiseAPI

export function launch() {
  if (insightsWindow == null || insightsWindow.closed) {
    const width = Math.floor(window.screen.width / 2)
    const height = window.innerHeight

    insightsWindow = window.open(
      '/lib/main.html',
      'xstateInsights',
      `popup,width=${width},height=${height},left=${width}`
    )
    const controller = new Controller()

    let activateAPI
    promiseAPI = new Promise((resolve) => {
      activateAPI = () => {
        window.__XSTATE_INSIGHTS__ = {
          subscribe: controller.subscribe.bind(controller),
        }
        resolve(window.__XSTATE_INSIGHTS__)
      }
    })

    insightsWindow.addEventListener('DOMContentLoaded', () => {
      controller.connect(insightsWindow)
      activateAPI()
    })

    function initiateReconnecting() {
      if (window.__XSTATE_INSIGHTS__) {
        console.log(
          'XState Insights will reconnect after the main window is reloaded.'
        )
        insightsWindow.startReconnecting(window.__XSTATE_INSIGHTS__)
      }
    }
    window.addEventListener('beforeunload', initiateReconnecting)
  } else {
    insightsWindow.focus()
  }
  return promiseAPI
}
