window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return
  }
  const message = event.data
  if (typeof message !== 'object' || message?.source !== 'xstate-insights') {
    return
  }
  chrome.runtime.sendMessage(message)
})

// TODO experimental
window.addEventListener('xstate-insights.subscribe', (event) => {
  console.log('%ccontent-script', 'color: crimson', event)
})
