import {
  AnyActorRef,
  AnyInterpreter,
  StateNode,
  ActionObject,
  InvokeDefinition,
  Guard,
  type AnyEventObject,
} from 'xstate'
import {
  InspectedActorObject,
  SerializedExtendedInspectedActorObject,
} from './types'

export function isInterpreterLike(
  entity: AnyActorRef | AnyInterpreter,
): entity is AnyInterpreter {
  return (entity as AnyInterpreter).machine !== undefined
}

export function isEventLike(entity: any): entity is AnyEventObject {
  return typeof (entity as AnyEventObject).type === 'string'
}

// TODO import this from xstate when it becomes available
interface TransitionConfig {
  target: string[]
  source: string
  actions: Array<ActionObject<any, any>>
  cond: Guard<any, any> | undefined
  eventType: string
}
interface StateNodeConfig {
  type: StateNode['type']
  id: string
  key: string
  initial?: string
  entry: Array<ActionObject<any, any>>
  exit: Array<ActionObject<any, any>>
  on: {
    [key: string]: TransitionConfig[]
  }
  invoke: Array<InvokeDefinition<any, any>>
  states: Record<string, StateNodeConfig>
}
export function machineToJSON(stateNode: StateNode): StateNodeConfig {
  const config = {
    type: stateNode.type,
    initial:
      stateNode.initial === undefined ? undefined : String(stateNode.initial),
    id: stateNode.id,
    key: stateNode.key,
    entry: stateNode.onEntry,
    exit: stateNode.onExit,
    on: mapValues(stateNode.on, (transition) => {
      return transition.map((t) => {
        return {
          target: t.target ? t.target.map(getStateNodeId) : [],
          source: getStateNodeId(t.source),
          actions: t.actions,
          cond: t.cond,
          eventType: t.eventType,
        }
      })
    }),
    invoke: stateNode.invoke,
    states: {} as { [index: string]: StateNodeConfig },
  }

  Object.values(stateNode.states).forEach((sn) => {
    config.states[sn.key] = machineToJSON(sn)
  })

  return config
}

// from xstate
function mapValues<T, P, O extends { [key: string]: T }>(
  collection: O,
  iteratee: (item: O[keyof O], key: keyof O, collection: O, i: number) => P,
): { [key in keyof O]: P } {
  const result: Partial<{ [key in keyof O]: P }> = {}

  const collectionKeys = keys(collection)
  for (let i = 0; i < collectionKeys.length; i++) {
    const key = collectionKeys[i]
    result[key] = iteratee(collection[key], key, collection, i)
  }

  return result as { [key in keyof O]: P }
}

function keys<T extends object>(value: T): Array<keyof T & string> {
  return Object.keys(value) as Array<keyof T & string>
}

// from xstate
function getStateNodeId(stateNode: StateNode): string {
  return `#${stateNode.id}`
}

export function omit(
  names: (string | number)[],
  obj: { [k: string]: any },
): { [k: string]: any } {
  const result: { [k: string]: any } = {}
  const index: Record<string, 1> = {}
  let idx = 0
  const len = names.length

  while (idx < len) {
    index[names[idx]] = 1
    idx += 1
  }

  for (const prop in obj) {
    if (!Object.prototype.hasOwnProperty.call(index, prop)) {
      result[prop] = obj[prop]
    }
  }
  return result
}

export function serializeActor(
  actor: InspectedActorObject,
): SerializedExtendedInspectedActorObject {
  const serialized = omit(['actorRef', 'subscription'], actor)
  serialized.snapshot = JSON.stringify(serialized.snapshot)
  serialized.actorId = actor.actorRef.id
  if (serialized.machine !== undefined) {
    serialized.machine = JSON.stringify(serialized.machine)
  }
  return serialized as SerializedExtendedInspectedActorObject
}

export function sanitizeEvent(event: AnyEventObject): AnyEventObject {
  // some events from xstate may contain functions, which break their serialization
  // for transport over window.dispatchEvent()
  return Object.entries(event).reduce(
    (result: { [key: string]: any }, [key, value]) => {
      if (typeof value === 'function') {
        result[key] = value.toString()
      } else {
        result[key] = value
      }
      return result
    },
    {},
  ) as AnyEventObject
}

export function findChildBySessionId(
  actor: AnyInterpreter,
  sessionId: string,
): AnyActorRef | undefined {
  for (const child of actor.children.values()) {
    if ((child as AnyInterpreter).sessionId === sessionId) {
      return child
    }
  }
  return undefined
}
