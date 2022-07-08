import { log } from '../utils'

export class Tab {
  constructor(id, port, devPort = null) {
    if (port.name !== 'xstate-insights.page') {
      throw new Error(`Invalid port.name: ${port.name}`)
    }
    this.id = id
    this.port = port
    this.devPort = devPort
    this.actors = {}
    this.sendUpdatesToDevPanel = this.sendUpdatesToDevPanel.bind(this)
    port.onMessage.addListener(this.sendUpdatesToDevPanel)
    port.onDisconnect.removeListener(this.sendUpdatesToDevPanel)
  }

  sendUpdatesToDevPanel(message) {
    log(`→ message from tab ${this.id}:`, message)
    if (this.devPort != null) {
      this.devPort.postMessage(message)
    } else {
      log(`No dev port for tab ${this.id}. Devtools not open?`)
    }
  }
}
