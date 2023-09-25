import {
  ActionObject,
  AnyActorRef,
  type AnyEventObject,
  AnyInterpreter,
  Guard,
  Interpreter,
  InterpreterStatus,
  InvokeDefinition,
  type SCXML,
  StateNode,
} from 'xstate'
import {
  ActorTypes,
  AnyActorRefWithParent,
  InspectedActorObject,
  InspectedEventObject,
  isTransitionConfig,
  isTransitionsConfigArray,
  type ParentActor,
  SerializedExtendedInspectedActorObject,
  TransitionTypes,
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
    initial: stateNode.initial === undefined
      ? undefined
      : String(stateNode.initial),
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

export function serializeInspectedActor(
  actor: InspectedActorObject,
): SerializedExtendedInspectedActorObject {
  const serialized = omit(['actorRef', 'subscription'], actor)
  serialized.snapshot = serializeSnapshot(serialized.snapshot)
  serialized.actorId = actor.actorRef.id
  if (serialized.machine !== undefined) {
    if (
      typeof serialized.machine === 'object' &&
      isContextObject(serialized.machine.context)
    ) {
      serialized.machine.context = sanitizeObject(serialized.machine.context)
    }

    serialized.machine = stringifySafely(serialized.machine)
  }
  return serialized as SerializedExtendedInspectedActorObject
}

function mutateObject<T extends Record<string | symbol, unknown>>(
  path: (string | number)[],
  value: unknown,
  obj: T,
): Record<keyof T, unknown> {
  const lastIndex = path.length - 1
  let ref: any = obj
  for (let i = 0; i <= lastIndex; i++) {
    const key = path[i]
    if (i === lastIndex) {
      ref[key] = value
    } else {
      if (typeof ref[key] !== 'object' || ref[key] === null) {
        ref[key] = {}
      }
      ref = ref[key]
    }
  }
  return obj
}

function truncate(str: string, num = 10) {
  if (str.length <= num) {
    return str
  } else {
    return str.slice(0, num) + '…'
  }
}

const safeBuiltins = [Promise, Date, RegExp]

function isJSONSafe(
  value: unknown,
): value is
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint
  | Date
  | Promise<any>
  | RegExp {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'undefined' ||
    value === null ||
    (typeof value === 'object' && safeBuiltins.some((c) => value instanceof c))
  )
}

/**
 * A tuple where first item is a path to a value in the object, and the second item is a object (or array).
 */
type IterationQueueItem = [
  (string | number)[],
  Record<string, unknown> | unknown[],
]

function isActorRef(x: unknown): x is Interpreter<any> {
  return x instanceof Interpreter
}

/**
 * Returns an iterator for [key, value] pairs from object, array, map, or set.
 */
// function getIterator<T>(x: Record<string, T> | T[] | Set<T> | Map<string, T>) {
function getIterator<T>(x: Record<string, T> | T[] | Map<string, T>) {
  if (Array.isArray(x)) {
    return x.entries()
  }
  // if (x instanceof Set) {
  //   return x.entries()
  // }
  if (x instanceof Map) {
    return x.entries()
  }
  return Object.entries(x).values()
}

/**
 * Sanitizes an object by removing circular references and pre-formatting unserializable properties.
 * If the passed object is AnyEventObject, this function will return a sanitized object. Returns a new object,
 * does not mutate the passed object.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  unsafeObject: T,
): T extends AnyEventObject ? Record<keyof T, unknown> & AnyEventObject
  : Record<keyof T, unknown> {
  const queue: IterationQueueItem[] = [[[], unsafeObject]]
  const seen = new WeakSet()

  const sanitized: Record<string, unknown> = {}

  while (queue.length > 0) {
    const [path, obj] = queue.shift() as IterationQueueItem

    for (const [key, val] of getIterator(obj)) {
      if (isJSONSafe(val)) {
        mutateObject([...path, key], val, sanitized)
      } else if (typeof val === 'function') {
        mutateObject(
          [...path, key],
          '<function>: ' + truncate(val.toString(), 20),
          sanitized,
        )
      } else if (typeof val === 'symbol') {
        mutateObject(
          [...path, key],
          '<symbol>: ' + truncate(val.toString(), 20),
          sanitized,
        )
      } else if (isActorRef(val)) {
        // actor refs need to be simplified, otherwise they are not going to be passed through window.dispatchEvent
        const simplifiedActor = {
          id: val.id,
          sessionId: val.sessionId,
          status: val.status,
        }
        mutateObject([...path, key], simplifiedActor, sanitized)
      } else if (val instanceof Map || val instanceof Set) {
        // TODO sanitize maps and sets properly
        // Sets should be converted to arrays
        // Maps should be converted to plain objects but only if they use string keys
        mutateObject([...path, key], {}, sanitized)
      } else if (Array.isArray(val)) {
        if (seen.has(val)) {
          mutateObject([...path, key], '<circular>', sanitized)
        } else {
          seen.add(val)
          queue.push([[...path, key], val])
          mutateObject([...path, key], [], sanitized)
        }
      } else if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          mutateObject([...path, key], '<circular>', sanitized)
        } else {
          const sanitizedVal = isEventObject(val)
            ? sanitizeBrowserEvent(val)
            : val
          seen.add(sanitizedVal)
          queue.push([[...path, key], sanitizedVal as Record<string, unknown>])
          mutateObject([...path, key], {}, sanitized)
        }
      } else {
        console.error(`Unexpected value type: [${typeof val}]`, val)
        mutateObject([...path, key], '<sanitized unexpected value>', sanitized)
      }
    }
  }
  return sanitized as T extends AnyEventObject
    ? Record<keyof T, unknown> & AnyEventObject
    : Record<keyof T, unknown>
}

export function serializeSnapshot(snapshot?: unknown): string | undefined {
  if (snapshot == null) {
    return undefined
  }
  // synthetic react events and events with circular refs must be sanitized because they are not serializable
  if (typeof snapshot === 'object' && snapshot !== null) {
    const sanitized = {
      ...snapshot,
    }
    if ('event' in sanitized && isEventObject(sanitized.event)) {
      sanitized.event = sanitizeObject(sanitized.event)
    }
    if ('_event' in sanitized && isEventObject(sanitized._event)) {
      sanitized._event = sanitizeObject(sanitized._event)
    }
    if ('context' in sanitized && isContextObject(sanitized.context)) {
      sanitized.context = sanitizeObject(sanitized.context)
    }
    return stringifySafely(sanitized)
  }
  return stringifySafely(snapshot)
}

/**
 * Strips unserializable props from native events and React events wrapping native events
 */
function sanitizeBrowserEvent(event: AnyEventObject): AnyEventObject {
  if (event instanceof Event) {
    const cloned: AnyEventObject = {
      type: event.type,
    }
    const skippedKeys = [
      'view',
      'target',
      'currentTarget',
      'relatedTarget',
      'srcElement',
    ]
    for (const key in event) {
      if (
        !skippedKeys.includes(key) &&
        !(event[key as keyof typeof event] instanceof Element)
      ) {
        cloned[key] = event[key as keyof typeof event]
      }
    }
    return cloned
  }
  for (const k in event) {
    const v = event[k]
    if (v instanceof Event || v?.nativeEvent instanceof Event) {
      v.view = undefined
      v.target = undefined
      v.currentTarget = undefined
      v.relatedTarget = undefined
    }
  }
  return event
}

export function isEventObject(x: any): x is AnyEventObject {
  return x && typeof x === 'object' && typeof x.type === 'string'
}

export function isContextObject(x: any): x is Record<string, unknown> {
  return (
    typeof x === 'object' &&
    x != null &&
    Object.keys(x).every((k) => typeof k === 'string')
  )
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
    snapshot: (isInterpreter && actor.initialized) || !isInterpreter
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
    inspectedActor.sessionId = globalThis.crypto?.randomUUID() ??
      String(Math.round(Math.random() * 1e6))
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

export function stringifySafely(value: any): string | undefined {
  try {
    return JSON.stringify(value)
  } catch (error) {
    console.error('Failed to stringify:', { value, error })
    return undefined
  }
}

export function isActorType(x: any): x is ActorTypes {
  return x in ActorTypes
}
