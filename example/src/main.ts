import xstateNinja, { interpret, LogLevels } from 'xstate-ninja'
import type { AnyInterpreter } from 'xstate'
import logo from './assets/logo_512.png'
import './style.css'
import machine from './state-machine/state-machine'

xstateNinja({ logLevel: LogLevels.debug })

const service = interpret(machine, { devTools: true })

function subscribe(actor: AnyInterpreter) {
  const sub = actor.subscribe((s) => {
    console.groupCollapsed(s.event.type)
    console.log(s.event)
    if (s.changed) {
      console.log(`»`, s.value)
    }
    console.log(`changed: ${s.changed}`, s.context)
    /* console.groupEnd(st.event.type) */
    console.groupEnd()
  })

  return sub
}

subscribe(service)
service.start()

const rootElement = document.querySelector<HTMLDivElement>('#app')
if (rootElement) {
  rootElement.innerHTML = `
    <main>
      <div className="logos">
        <img src="${logo}" alt="XState Ninja Logo" />
      </div>
      <h1>XState Ninja Demo</h1>
    <div>
      <p>
        Press F12 and check the XState devtools.
      </p>
      <button id="start-btn">Start</button>
    </div>
  `
}

document.querySelector('#start-btn')?.addEventListener('mousedown', () => {
  console.log(
    '%cclick',
    'background: orangered; color: black; padding: 1px 5px',
  )
  service.send('START_BUTTON_PRESSED')
})
document.querySelector('#start-btn')?.addEventListener('mouseup', () => {
  console.log(
    '%cclick',
    'background: orangered; color: black; padding: 1px 5px',
  )
  service.send('START_BUTTON_RELEASED')
})
