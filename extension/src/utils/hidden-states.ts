import { writable, type Writable } from 'svelte/store'

//
/**
 * Keys are actor session ids.
 */
interface ActorHiddenStates {
  [key: string]: Set<string>
}

const store: Writable<ActorHiddenStates> = writable({})
export { store as hiddenStates }

const emptySet: Set<string> = new Set()

export function hide(sessionId: string, stateName: string): void {
  console.log('hiding', sessionId, stateName) // TODO remove console.log
  store.update((value: ActorHiddenStates) => {
    const set = value[sessionId] ? new Set(value[sessionId]) : emptySet
    set.add(stateName)
    console.log('new set', set) // TODO remove console.log
    return {
      ...value,
      [sessionId]: set,
    }
  })
}

// TODO
// export function unhide() {}
