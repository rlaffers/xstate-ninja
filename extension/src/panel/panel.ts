import Panel from './Panel.svelte'

if (chrome.devtools.panels.themeName === 'dark') {
  document.body.setAttribute('data-theme', 'dark')
} else {
  document.body.setAttribute('data-theme', 'light')
}

const mainPanel = new Panel({
  target: document.getElementById('app'),
})

export default mainPanel
