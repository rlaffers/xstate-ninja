import PropTypes from 'prop-types'
import classNames from 'classnames'
import type { State } from 'xstate'
import './Gauge.css'

export default function Gauge({ state }: { state: State<any> }) {
  return (

<div className="container">
  <div className="gauge-outer" />
  <div className={classNames("gauge-inner", { running: state.matches('EngineRunning')})} >
    <div className="on-off-led">on</div>
    <div className="other-leds">
      <div className={classNames("low-fuel-led", { on: state.context.lowFuelWarning})} />
      <div
        className={classNames("low-battery-led", { on: state.context.lowBatteryWarning})}
      />
    </div>
  </div>
  <div
    className={classNames("gauge-indicator", {
      slow: state.matches('EngineRunning.SlowSpeed'),
      fast: state.matches('EngineRunning.FastSpeed'),
      reverse: state.matches('EngineRunning.Reverse'),
    })}
  />
</div>
  )
}

Gauge.propTypes = {
  state: PropTypes.shape({
    matches: PropTypes.func.isRequired,
    context: PropTypes.object,
  })
}
