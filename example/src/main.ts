import xstateNinja, { interpret, LogLevels } from 'xstate-ninja'
import type { AnyInterpreter } from 'xstate'
import logo from './assets/logo_512.png'
import './style.css'
import machine from './state-machine2/state-machine'

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

const complexObject: Record<string, unknown> = {}
const hasCircularRef = {
  dummy: true,
  complexObject,
}
complexObject.ref = hasCircularRef

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
      <div class="buttons">
        <button id="power-btn">Power</button>
        <button id="play-btn">Play</button>
        <button id="stop-btn">Stop</button>
        <button id="pause-btn">Pause</button>
        <button id="faster-btn">»</button>
        <button id="slower-btn">«</button>
        <button id="guarded-event-btn">Send event for guarded transition</button>
        <button id="trigger-pure-btn">Trigger pure action</button>
        <button id="always-transition-btn">Trigger always transition</button>
        <button id="send-circular-object-btn">Send complex data</button>
      </div>
    </div>
  `
}

document.querySelector('#power-btn')?.addEventListener('mousedown', () => {
  service.send('POWER')
})
document.querySelector('#play-btn')?.addEventListener('mousedown', () => {
  service.send({ type: 'PLAY', speed: 1 })
})
document.querySelector('#stop-btn')?.addEventListener('mousedown', () => {
  service.send('STOP')
})
document.querySelector('#pause-btn')?.addEventListener('mousedown', () => {
  service.send('PAUSE')
})
document.querySelector('#faster-btn')?.addEventListener('mousedown', () => {
  service.send('FASTER')
})
document.querySelector('#slower-btn')?.addEventListener('mousedown', () => {
  service.send('SLOWER')
})
const emptyArray: unknown[] = []
document.querySelector('#send-circular-object-btn')?.addEventListener('mousedown', (event) => {
  service.send({
    type: 'DISPATCHED_CIRCULAR_DATA',
    data: {
      description: 'this object contains circular data',
      complexObject,
      browserEvent: event,
      emptyArray,
      shouldNotBeSanitized: emptyArray,
      actorRef: service,
      someMap: new Map([['foo', 'one']]),
      someSet: new Set([1, 1, 2, 3]),
    },
  })
})
document.querySelector('#guarded-event-btn')?.addEventListener('mousedown', () => {
  service.send({
    type: 'GUARDED_EVENT',
    randomValue: Math.floor(Math.random() * 100),
  })
})
document.querySelector('#trigger-pure-btn')?.addEventListener('mousedown', () => {
  service.send('PURE_ACTION')
})
document.querySelector('#always-transition-btn')?.addEventListener('mousedown', () => {
  service.send('ALWAYS')
})
