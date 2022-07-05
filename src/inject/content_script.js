function listen(eventName) {
  window.addEventListener(`xstate-insights.${eventName}`, (event) => {
    if (event.srcElement !== window) {
      return
    }
    // TODO remove
    console.log('%ccontent-script', 'color: lime', event)
    chrome.runtime.sendMessage({
      type: event.type,
      data: event.detail,
    })
  })
}
listen('subscribe')
listen('unsubscribe')
listen('update')
