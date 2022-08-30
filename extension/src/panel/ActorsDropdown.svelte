<script lang="ts">
  import type { DeserializedExtendedInspectedActorObject } from 'xstate-ninja'

  export let actors: Map<string, DeserializedExtendedInspectedActorObject>

  const root = Symbol('root')
  const levelKey = Symbol('level')

  function sortByParent(list) {
    const result = {}
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

  function getOrderedChildren(list, parentId, level = 0) {
    const children = []
    if (!list[parentId]) {
      return children
    }
    for (const child of list[parentId]) {
      child[levelKey] = level
      children.push(child)
      children.push(...getOrderedChildren(list, child.sessionId, level + 1))
    }
    return children
  }

  function sortActors(actors) {
    if (!actors) {
      return actors
    }
    const sortedByParent = sortByParent(Array.from(actors.values()))
    return getOrderedChildren(sortedByParent, root)
  }

  let sortedActors = []
  $: sortedActors = sortActors(actors)

  let className = ''
  export { className as class }

  let selectedSessionId: string = null
  $: {
    if (selectedSessionId == null) {
      selectedSessionId = sortedActors[0]?.sessionId
    }
  }

  export let selected: DeserializedExtendedInspectedActorObject
  $: {
    const selectedActor = actors.get(selectedSessionId)
    if (selectedActor !== selected) {
      selected = selectedActor
    }
  }

  function padding(level) {
    if (level === 0) {
      return ''
    }
    const padding = Array(level).fill('&nbsp;').join('')
    return `${padding}⤷`
  }
</script>

<select
  name="activeActor"
  bind:value={selectedSessionId}
  class={`actor-dropdown ${className}`}
>
  {#each sortedActors as actor}
    <option value={actor.sessionId}
      >{@html padding(actor[levelKey])}{actor.actorId} ({actor.sessionId})
      {actor.dead ? '💀' : ''}
    </option>
  {/each}
</select>
