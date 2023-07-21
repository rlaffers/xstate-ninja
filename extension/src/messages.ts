import type {
  XStateInspectReadEvent,
  XStateInspectSendEvent,
  XStateNinjaDeadActorsClearedEvent,
} from 'xstate-ninja'

export enum MessageTypes {
  init = '@xstate-ninja/init',
  log = '@xstate-ninja/log',
  keepAlive = '@xstate-ninja/keepAlive',
}

export interface InitMessage {
  type: MessageTypes.init
  tabId: number
}

export interface LogMessage {
  type: MessageTypes.log
  text: string
  data: any
  color?: string
}

export interface KeepAliveMessage {
  type: MessageTypes.keepAlive
}

export type AnyMessage =
  | InitMessage
  | LogMessage
  | XStateInspectSendEvent
  | XStateInspectReadEvent
  | XStateNinjaDeadActorsClearedEvent
  | KeepAliveMessage

export function isInitMessage(message: AnyMessage): message is InitMessage {
  return message.type === MessageTypes.init
}

export function isLogMessage(message: AnyMessage): message is LogMessage {
  return message.type === MessageTypes.log
}
