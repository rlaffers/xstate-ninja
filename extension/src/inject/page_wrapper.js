const s = document.createElement('script')
s.type = 'text/javascript'
s.src = chrome.runtime.getURL('inject/page.js')
s.onload = function () {
  this.parentNode.removeChild(this)
}
;(document.head || document.documentElement).appendChild(s)
