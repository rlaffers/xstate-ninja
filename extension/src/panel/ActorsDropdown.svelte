<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
  import { isEmpty } from 'rambda'
  import type { ActorList } from './machines/rootMachine'

  export let actors: ActorList
  let className = ''
  export { className as class }
  export let selectedActor: DeserializedExtendedInspectedActorObject
  export let onActorSelected: (actor: DeserializedExtendedInspectedActorObject) => void

  let selectedActorSessionId: string = selectedActor?.sessionId

  $: {
    // selectedActor can be later changed due to swimlane re-ordering
    // we need to update the session id
    if (selectedActor && selectedActor.sessionId !== selectedActorSessionId) {
      selectedActorSessionId = selectedActor.sessionId
    }
  }

  const root = Symbol('root')
  const levelKey = Symbol('level')

  function sortByParent(list: DeserializedExtendedInspectedActorObject[]) {
    const result: Record<string | symbol, DeserializedExtendedInspectedActorObject[]> = {}
    for (const item of list) {
      if (item.parent == null) {
        if (!result[root]) {
          result[root] = []
        }
        result[root].push(item)
      } else {
        if (!result[item.parent]) {
          result[item.parent] = []
        }
        result[item.parent].push(item)
      }
    }
    return result
  }
  type DeserializedExtendedInspectedActorObjectWithLevel =
    DeserializedExtendedInspectedActorObject & { [levelKey]: number }

  function getOrderedChildren(
    list: Record<string | symbol, DeserializedExtendedInspectedActorObject[]>,
    parentId: symbol | string,
    level: number = 0,
  ) {
    const children: DeserializedExtendedInspectedActorObjectWithLevel[] = []
    if (!list[parentId]) {
      return children
    }
    for (const child of list[parentId]) {
      const childWithLevel: DeserializedExtendedInspectedActorObjectWithLevel = {
        ...child,
        [levelKey]: level,
      }
      children.push(childWithLevel)
      children.push(...getOrderedChildren(list, child.sessionId, level + 1))
    }
    return children
  }

  function sortActors(list: ActorList): DeserializedExtendedInspectedActorObjectWithLevel[] {
    if (isEmpty(list)) {
      return []
    }
    const sortedByParent = sortByParent(Object.values(list))
    return getOrderedChildren(sortedByParent, root)
  }

  let sortedActors: DeserializedExtendedInspectedActorObjectWithLevel[] = []
  $: sortedActors = sortActors(actors)

  function onChange(event: Event) {
    if (isEmpty(actors)) {
      return
    }
    const sessionId = (event.currentTarget as HTMLSelectElement).value
    const nextSelectedActor = actors[sessionId]
    if (nextSelectedActor && nextSelectedActor.sessionId !== selectedActorSessionId) {
      selectedActorSessionId = nextSelectedActor.sessionId
      selectedActor = nextSelectedActor
      onActorSelected(selectedActor)
    }
  }

  /* eslint-disable svelte/no-at-html-tags */
  function padding(level: number) {
    if (level === 0) {
      return ''
    }
    const padding = Array(level).fill('&nbsp;').join('')
    return `${padding}⤷`
  }
</script>

<select
  name="activeActor"
  on:change={onChange}
  value={selectedActorSessionId}
  class={`actor-dropdown ${className}`}
>
  {#each sortedActors as actor}
    <option value={actor.sessionId}
      >{@html padding(actor[levelKey])}{actor.actorId} ({actor.sessionId})
      {actor.dead ? '💀' : ''}
    </option>
  {/each}
</select>
