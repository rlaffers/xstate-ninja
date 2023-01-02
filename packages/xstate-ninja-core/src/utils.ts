import {
  AnyActorRef,
  AnyInterpreter,
  StateNode,
  ActionObject,
  InvokeDefinition,
  Guard,
  InterpreterStatus,
  type SCXML,
  type AnyEventObject,
} from 'xstate'
import {
  InspectedActorObject,
  InspectedEventObject,
  SerializedExtendedInspectedActorObject,
  AnyActorRefWithParent,
  ActorTypes,
  TransitionTypes,
  isTransitionConfig,
  isTransitionsConfigArray,
  type ParentActor,
} from './types'

export function isInterpreterLike(
  entity: AnyActorRef | AnyInterpreter,
): entity is AnyInterpreter {
  return (entity as AnyInterpreter).machine !== undefined
}

export function isEventLike(entity: any): entity is AnyEventObject {
  return typeof (entity as AnyEventObject)?.type === 'string'
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

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = obj[key]
      if (typeof value === 'function') {
        result[key] = value.toString()
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value)
      } else {
        result[key] = value
      }
    }
  }
  return result as T
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

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm
const ARGUMENT_NAMES = /([^\s,]+)/g

// eslint-disable-next-line @typescript-eslint/ban-types
function getParamNames(func: Function) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '')
  return (
    fnStr
      .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
      .match(ARGUMENT_NAMES) ?? []
  )
}

export function getActorType(actor: AnyActorRefWithParent): ActorTypes {
  // sneakily introspect the subscribe function to distinguish between promises, callbacks and observables
  try {
    const params = getParamNames(actor.subscribe)
    if (params.length === 1 && params[0] === 'next') {
      return ActorTypes.callback
    }
    if (
      params.length === 3 &&
      params[0] === 'next' &&
      params[1] === 'handleError' &&
      params[2] === 'complete'
    ) {
      if (actor.subscribe.toString().length > 150) {
        return ActorTypes.promise
      }
      return ActorTypes.observable
    }
    return ActorTypes.unknown
  } catch (e) {
    console.error(
      'Failed to introspect the subscribe method on an actor',
      actor,
    )
    return ActorTypes.unknown
  }
}

export function createInspectedActorObject(
  actor: AnyActorRefWithParent | AnyInterpreter,
  parent?: ParentActor,
): InspectedActorObject {
  const isInterpreter = isInterpreterLike(actor)

  const inspectedActor: InspectedActorObject = {
    actorRef: actor,
    sessionId: '',
    parent: undefined,
    snapshot:
      (isInterpreter && actor.initialized) || !isInterpreter
        ? actor.getSnapshot()
        : null,
    machine: undefined,
    events: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: undefined,
    history: [],
    type: ActorTypes.unknown,
    dead: isInterpreterLike(actor)
      ? actor.initialized &&
        (actor.getSnapshot?.().done ||
          actor.status === InterpreterStatus.Stopped)
      : false,
  }

  inspectedActor.parent = actor.parent
    ? actor.parent?.sessionId
    : parent?.sessionId
  if (isInterpreterLike(actor)) {
    inspectedActor.sessionId = actor.sessionId
    inspectedActor.status = actor.status
    inspectedActor.machine = actor.machine.definition
    inspectedActor.type = ActorTypes.machine
  } else {
    inspectedActor.sessionId =
      globalThis.crypto?.randomUUID() ?? String(Math.round(Math.random() * 1e6))
    inspectedActor.type = getActorType(actor)
  }
  return inspectedActor
}

export function createInspectedEventObject(
  event: SCXML.Event<AnyEventObject>,
  actor: AnyInterpreter | AnyActorRef,
): InspectedEventObject {
  return {
    name: event.name,
    data: sanitizeObject(event.data),
    origin: event.origin,
    createdAt: Date.now(),
    transitionType: getTransitionInfo(actor),
  }
}

function getTransitionInfo(
  actor: AnyInterpreter | AnyActorRef,
): TransitionTypes {
  if (isInterpreterLike(actor)) {
    // TODO how does configuration look for parallel states?
    const { configuration, event } = actor.state
    const sortedStateNodes = sortStateNodes(configuration)
    switch (true) {
      case actor.state.changed:
        return TransitionTypes.taken
      case isTransitionGuarded(event.type, sortedStateNodes):
        return TransitionTypes.guardedAndNoChange
      case isTransitionForbidden(event.type, sortedStateNodes):
        return TransitionTypes.forbidden
      default:
        return TransitionTypes.missing
    }
  }
  return TransitionTypes.unknown
}

// Sorts state nodes. The lowest one (the highest order) comes first.
function sortStateNodes(stateNodes: StateNode[]): StateNode[] {
  return stateNodes.slice().sort((a, b) => (a.order < b.order ? -1 : 1))
}

function isTransitionGuarded(eventType: string, sortedStateNodes: StateNode[]) {
  for (const stateNode of sortedStateNodes) {
    if (stateNode.config.on === undefined) {
      continue
    }
    const transitionsConfig = stateNode.config.on
    if (isTransitionsConfigArray(transitionsConfig)) {
      const transitions = transitionsConfig.filter((x) => x.event === eventType)
      return (
        transitions.length > 0 && transitions.every((x) => x.cond !== undefined)
      )
    } else if (transitionsConfig[eventType] !== undefined) {
      const transition = transitionsConfig[eventType]
      if (typeof transition === 'string') {
        return false
      } else if (Array.isArray(transition)) {
        return transition.every(
          (x) => isTransitionConfig(x) && x.cond !== undefined,
        )
      } else if (isTransitionConfig(transition)) {
        return transition.cond !== undefined
      }
    } else if (
      transitionsConfig[eventType] === undefined &&
      Object.prototype.hasOwnProperty.call(transitionsConfig, eventType)
    ) {
      // forbidden transition
      return false
    }
  }
  return false
}

function isTransitionForbidden(
  eventType: string,
  sortedStateNodes: StateNode[],
) {
  for (const stateNode of sortedStateNodes) {
    const transitionsConfig = stateNode.config.on
    if (transitionsConfig === undefined) {
      continue
    }
    if (isTransitionsConfigArray(transitionsConfig)) {
      if (transitionsConfig.some((x) => x.event === eventType)) {
        return false
      }
      continue
    }

    if (
      Object.prototype.hasOwnProperty.call(transitionsConfig, eventType) &&
      transitionsConfig[eventType] === undefined
    ) {
      return true
    }
    if (transitionsConfig[eventType] !== undefined) {
      return false
    }
  }
  return false
}
