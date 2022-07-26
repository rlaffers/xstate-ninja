import type { AnyEventObject, StateValue, InterpreterStatus } from 'xstate'
import type { Actor } from './actor'

export enum MessageTypes {
  update = 'xstate-ninja.update',
  register = 'xstate-ninja.register',
  unregister = 'xstate-ninja.unregister',
  init = 'xstate-ninja.init',
  initDone = 'xstate-ninja.initDone',
}

export interface UpdateMessage {
  type: MessageTypes.update
  data: {
    id: string
    sessionId: string
    initialized: boolean
    status: InterpreterStatus
    stateValue: StateValue
    done: boolean
    changed: boolean
    event: AnyEventObject
  }
}

export interface RegisterMessage {
  type: MessageTypes.register
  data: {
    id: string
    sessionId: string
    initialized: boolean
    status: InterpreterStatus
    stateValue: StateValue
    done: boolean
  }
}

export interface UnregisterMessage {
  type: MessageTypes.unregister
  data: {
    id: string
    sessionId: string
    initialized: boolean
    status: InterpreterStatus
    stateValue: StateValue
    changed: boolean
    done: boolean
  }
}

export interface InitMessage {
  type: MessageTypes.init
  tabId: number
}

type ActorTuple = [sessionId: string, actor: Actor]

export interface InitDoneMessage {
  type: MessageTypes.initDone
  data: {
    actors: ActorTuple[]
  }
}

export interface LogMessage {
  type: 'log'
  text: string
  data: any
}

export type AnyMessage =
  | UpdateMessage
  | InitMessage
  | InitDoneMessage
  | RegisterMessage
  | UnregisterMessage
  | LogMessage

export function isUpdateMessage(message: AnyMessage): message is UpdateMessage {
  return message.type === MessageTypes.update
}

export function isInitMessage(message: AnyMessage): message is InitMessage {
  return message.type === MessageTypes.init
}

export function isInitDoneMessage(
  message: AnyMessage,
): message is InitDoneMessage {
  return message.type === MessageTypes.initDone
}

export function isRegisterMessage(
  message: AnyMessage,
): message is RegisterMessage {
  return message.type === MessageTypes.register
}

export function isUnregisterMessage(
  message: AnyMessage,
): message is UnregisterMessage {
  return message.type === MessageTypes.unregister
}

export function isLogMessage(message: AnyMessage): message is LogMessage {
  return message.type === 'log'
}
