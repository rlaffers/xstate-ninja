import type { AnyEventObject } from 'xstate'
import type { Actor } from './panel/actor'

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
    status: number
    stateValue: string | object
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
    status: number
    stateValue: string | object
    done: boolean
  }
}

export interface UnregisterMessage {
  type: MessageTypes.unregister
  data: {
    id: string
    sessionId: string
    initialized: boolean
    status: number
    stateValue: string | object
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

export type AnyMessage =
  | UpdateMessage
  | InitDoneMessage
  | RegisterMessage
  | UnregisterMessage

export function isUpdateMessage(message: AnyMessage): message is UpdateMessage {
  return message.type === MessageTypes.update
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
