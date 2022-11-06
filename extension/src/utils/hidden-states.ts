import { writable, type Writable } from 'svelte/store'

/**
 * Keys are actor session ids.
 */
interface ActorHiddenStates {
  [key: string]: Set<string>
}

const store: Writable<ActorHiddenStates> = writable({})
export { store as hiddenStates }

function createEmptySet(): Set<string> {
  return new Set()
}

export function hide(sessionId: string, stateName: string): void {
  store.update((value: ActorHiddenStates) => {
    const set = value[sessionId] ? new Set(value[sessionId]) : createEmptySet()
    set.add(stateName)
    return {
      ...value,
      [sessionId]: set,
    }
  })
}

export function unhide(sessionId: string) {
  store.update((value: ActorHiddenStates) => {
    return {
      ...value,
      [sessionId]: createEmptySet(),
    }
  })
}
