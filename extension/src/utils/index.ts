import { InterpreterStatus, type State } from 'xstate'
import type { StateValue } from 'xstate'
import { ActorTypes } from 'xstate-ninja'
import type {
  DeserializedExtendedInspectedActorObject,
  SerializedExtendedInspectedActorObject,
  XStateInspectUpdateEvent,
} from 'xstate-ninja'
import { MessageTypes } from '../messages'

export function log(...args: any[]) {
  console.log('%c[LOG]', 'color: cyan', ...args)
}

export function error(...args: any[]) {
  console.log('%c[ERR]', 'color: red', ...args)
}

export function warn(...args: any[]) {
  console.log('%c[WARN]', 'color: orangered', ...args)
}

export function omit(prop: string, obj: Record<string, unknown>) {
  // eslint-disable-next-line
  const { [prop]: _, ...rest } = obj
  return rest
}

export function last(list: any[]) {
  return list[list.length - 1]
}

export function prettyJSON(obj: [] | Record<string, unknown> = {}): string {
  const result = JSON.stringify(obj, undefined, 2).replace(/"([^"]+)":/g, '$1:')
  return result
    .slice(2, -2)
    .split('\n')
    .map((l) => l.slice(2))
    .join('\n')
}

export function flattenState(stateValue: StateValue): string[] {
  if (typeof stateValue === 'string') {
    return [stateValue]
  }

  const result = []
  for (const [key, value] of Object.entries(stateValue)) {
    result.push(`${key}.${flattenState(value)}`.replace(/\.$/, ''))
  }
  return result
}

export function isCompoundState(stateName: string): boolean {
  return /\./.test(stateName)
}

export function pick(names: string[], obj: Record<string, any>) {
  const result: Record<string, any> = {}
  let idx = 0
  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]]
    }
    idx += 1
  }
  return result
}

export function debounce(f: (...args: any[]) => any, timeout: number) {
  let id: number
  return (...args: any[]) => {
    clearTimeout(id)
    id = setTimeout(() => {
      f(...args)
    }, timeout)
    return id
  }
}

export function sortByFirstItem<B>(arr: [number, B][]): [number, B][] {
  return arr.sort((a, b) => {
    if (a[0] === b[0]) return 0
    if (a[0] < b[0]) return -1
    return 1
  })
}

export function deserializeInspectedActor(
  serializedActor: SerializedExtendedInspectedActorObject,
): DeserializedExtendedInspectedActorObject {
  return {
    ...serializedActor,
    snapshot: serializedActor.snapshot != null
      ? JSON.parse(serializedActor.snapshot)
      : undefined,
    machine: serializedActor.machine != null
      ? JSON.parse(serializedActor.machine)
      : undefined,
  } as DeserializedExtendedInspectedActorObject
}

export function createActorFromUpdateEvent(
  event: XStateInspectUpdateEvent,
): DeserializedExtendedInspectedActorObject {
  const snapshot = event.snapshot != null
    ? JSON.parse(event.snapshot)
    : undefined
  const actor = {
    sessionId: event.sessionId,
    parent: undefined,
    snapshot,
    machine: undefined,
    events: [event.event],
    createdAt: event.createdAt,
    updatedAt: event.createdAt,
    status: event.status,
    // xstate-ninja custom props
    history: [event],
    dead: event.status === InterpreterStatus.Stopped || snapshot?.done,
    actorId: event.actorId,
    type: ActorTypes.unknown,
  }
  return actor
}

export function updateActorFromUpdateEvent(
  actor: DeserializedExtendedInspectedActorObject,
  event: XStateInspectUpdateEvent,
): DeserializedExtendedInspectedActorObject {
  const snapshot = event.snapshot != null
    ? JSON.parse(event.snapshot)
    : undefined
  actor.history.push(event)
  actor.events.push(event.event)
  const updatedActor = {
    ...actor,
    snapshot,
    status: event.status,
    dead: event.status === InterpreterStatus.Stopped || snapshot?.done,
    updatedAt: event.createdAt,
    history: actor.history,
  }
  return updatedActor
}

export const createLogger =
  (port: chrome.runtime.Port) =>
  (text: string, data: any, color = 'cornflowerblue') => {
    const msg: any = {
      type: MessageTypes.log,
      text,
      data,
      color,
    }
    port.postMessage(msg)
  }

export function formatTime(timestamp: number): string {
  const dt = new Date(timestamp)
  const hours = `${dt.getHours()}`.padStart(2, '0')
  const minutes = `${dt.getMinutes()}`.padStart(2, '0')
  const seconds = `${dt.getSeconds()}`.padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export function isMachineSnapshot(snapshot: any): snapshot is State<any> {
  return snapshot != null && typeof snapshot === 'object' &&
    snapshot.machine != null && typeof snapshot.machine === 'object' &&
    snapshot.configuration != null && typeof snapshot.configuration === 'object'
}
