import { useSelector } from '@xstate/react'
import { LogLevels, configure } from 'xstate-ninja'
import { useInterpret } from '@xstate-ninja/react'
import classNames from 'classnames'
import logo from './assets/logo_512.png'
import reactLogo from './assets/react.svg'
import './App.css'
import Gauge from './Gauge'
import machine from '../../example/src/state-machine/state-machine'

configure({ logLevel: LogLevels.debug, enabled: import.meta.env.DEV })

function App() {
  const service = useInterpret(machine, { devTools: true })

  const battery = useSelector(service, (state) => state.context.battery)
  const fuel = useSelector(service, (state) => state.context.fuel)

  const showStart = useSelector(
    service,
    (state) => state.matches('EngineStopped') || state.matches('Igniting'),
  )
  const isRunning = useSelector(service, (state) => state.matches('EngineRunning'))

  function resetMachine() {
    service.send({ type: 'RESET_CLICKED' })
  }

  return (
    <main>
      <div className="logos">
        <img src={logo} alt="XState Ninja" /> <span style={{ fontSize: '10rem' }}>+</span>{' '}
        <img src={reactLogo} alt="Reactlogo" />
      </div>
      <h1>XState Ninja React Demo</h1>

      <section className="indicators">
        <Gauge state={service.getSnapshot()} />
        <div className="battery-and-fuel">
          <label className="battery-indicator">
            Battery:{' '}
            <meter min="0" max="100" low={10} high={25} optimum={100} value={battery}>
              {battery}
            </meter>
          </label>

          <label className="fuel-indicator">
            Fuel:{' '}
            <meter min="0" max="60" low={10} high={20} optimum={60} value={fuel}>
              {fuel}
            </meter>
          </label>
        </div>
      </section>
      <section className="car-controls">
        <button
          type="button"
          className={classNames('start-stop-btn', {
            start: showStart,
            stop: isRunning,
          })}
          onMouseDown={() => service.send('START_BUTTON_PRESSED')}
          onMouseUp={() => service.send('START_BUTTON_RELEASED')}
        >
          {isRunning ? 'stop' : 'start'}
        </button>

        <div className="shifting-controls">
          <button
            type="button"
            className="speed-shifting-btn"
            onClick={() => service.send('SHIFT_UP')}
          >
            ⬆
          </button>
          <button
            type="button"
            className="speed-shifting-btn"
            onClick={() => service.send('SHIFT_DOWN')}
          >
            ⬇
          </button>
          <button
            type="button"
            className="reverse-shifting-btn"
            onClick={() => service.send('SHIFT_REVERSE')}
          >
            Ⓡ
          </button>
        </div>

        <button
          className="fuel-btn"
          onClick={() => service.send({ type: 'FUEL_ADDED', amount: 15 })}
        >
          Add fuel
        </button>

        <button
          className="battery-btn"
          onClick={() => service.send({ type: 'CHARGED_BATTERY', amount: 15 })}
        >
          Charge battery
        </button>

        <button type="button" onClick={resetMachine} className="reset-btn">
          💀 Reset
        </button>
      </section>
    </main>
  )
}

export default App
