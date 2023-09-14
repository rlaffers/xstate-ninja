import './app.css'
import App from './App.svelte'

const targetElement = document.getElementById('app')

let app: App | undefined

if (targetElement) {
  app = new App({
    target: targetElement,
  })
} else {
  console.error('Element with id "app" not found')
}

export default app
