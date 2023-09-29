import Panel from './Panel.svelte'

if (chrome.devtools.panels.themeName === 'dark') {
  document.querySelector(':root')!.setAttribute('data-theme', 'dark')
} else {
  document.querySelector(':root')!.setAttribute('data-theme', 'light')
}

const targetElement = document.getElementById('app')
let mainPanel: Panel | undefined

if (targetElement) {
  mainPanel = new Panel({
    target: targetElement,
  })
}

export default mainPanel
