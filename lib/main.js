/* global CustomEvent */
window.addEventListener('DOMContentLoaded', () => {
  console.log('%c[XState Insights]', 'color: lime; padding: 1px 5px', 'Started')
})

function startReconnecting(api) {
  if (window.opener && !window.opener.closed) {
    const waitingForReload = Symbol('waitingForReload')
    window.opener[waitingForReload] = true
    let count = 0
    const interval = setInterval(() => {
      count += 1
      if (
        window.opener &&
        !window.opener.closed &&
        !window.opener[waitingForReload]
      ) {
        window.opener.__XSTATE_INSIGHTS__ = api
        console.log(
          '%c[XState Insights]',
          'color: lime; padding: 1px 5px',
          'Reconnected'
        )
        window.opener.dispatchEvent(
          new CustomEvent('xstate-insights-reconnected')
        )
        clearInterval(interval)
      }
      if (count >= 10) {
        clearInterval(interval)
      }
    }, 1000)
  }
}

window.startReconnecting = startReconnecting
