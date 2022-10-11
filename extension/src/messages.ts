import type {
  XStateInspectReadEvent,
  XStateInspectSendEvent,
  XStateNinjaDeadActorsClearedEvent,
} from 'xstate-ninja'

export enum MessageTypes {
  init = '@xstate-ninja/init',
  log = '@xstate-ninja/log',
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

export type AnyMessage =
  | InitMessage
  | LogMessage
  | XStateInspectSendEvent
  | XStateInspectReadEvent
  | XStateNinjaDeadActorsClearedEvent

export function isInitMessage(message: AnyMessage): message is InitMessage {
  return message.type === MessageTypes.init
}

export function isLogMessage(message: AnyMessage): message is LogMessage {
  return message.type === MessageTypes.log
}
