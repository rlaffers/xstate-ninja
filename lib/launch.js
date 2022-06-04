import { API } from './api'

let win
export function launch(actor) {
  let api
  if (win == null || win.closed) {
    const width = Math.floor(window.screen.width / 2)
    const height = window.innerHeight

    win = window.open(
      '/lib/main.html',
      'xstateInsights',
      `popup,width=${width},height=${height},left=${width}`
    )
    api = new API()

    win.addEventListener('DOMContentLoaded', () => {
      api.connect(win)
      api.subscribe(actor)
    })
  } else {
    win.focus()
  }

  return {
    subscribe: api.subscribe.bind(api),
  }
}
