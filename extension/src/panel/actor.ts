import type { UpdateMessage } from '../messages'

export interface Actor {
  id: string
  sessionId: string
  initialized: boolean
  status: number
  done: boolean
  stateValue: string | object
  dead: boolean
  history: Array<UpdateMessage['data']>
}
