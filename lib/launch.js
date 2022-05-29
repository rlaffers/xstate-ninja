class API {
  constructor() {
    this.actor = null
    this.win = null
    this.elements = {}
    this.subscription = null
  }

  connect(win) {
    this.win = win
    this.elements.stateValue = this.win.document.querySelector(
      '#machine-state-value'
    )
  }

  logTransition(state) {
    this.elements.stateValue.innerHTML = JSON.stringify(state.value)
  }

  subscribe(actor) {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.subscription = actor.subscribe((state) => {
      this.logTransition(state)
    })
  }
}

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
