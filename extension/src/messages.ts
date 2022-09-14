import type {
  XStateInspectReadEvent,
  XStateInspectSendEvent,
} from 'xstate-ninja'
export enum MessageTypes {
  init = '@xstate-ninja/init',
}

export interface InitMessage {
  type: MessageTypes.init
  tabId: number
}

export interface LogMessage {
  type: 'log'
  text: string
  data: any
  color?: string
}

export type AnyMessage =
  | InitMessage
  | LogMessage
  | XStateInspectSendEvent
  | XStateInspectReadEvent

export function isInitMessage(message: AnyMessage): message is InitMessage {
  return message.type === MessageTypes.init
}

export function isLogMessage(message: AnyMessage): message is LogMessage {
  return message.type === 'log'
}
