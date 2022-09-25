<script lang="ts">
  import { beforeUpdate, afterUpdate, getContext } from 'svelte'
  import type {
    DeserializedExtendedInspectedActorObject,
    XStateInspectUpdateEvent,
  } from 'xstate-ninja'
  import StateNodeFrameComponent, {
    type StateNodeFrame,
  } from './StateNodeFrame.svelte'
  import EventFrameComponent, { type EventFrame } from './EventFrame.svelte'
  import ArrowDown from './ArrowDown.svelte'
  import { last } from '../utils'

  export let actor: DeserializedExtendedInspectedActorObject = null
  export let selectedFrame: EventFrame | StateNodeFrame

  const STATE_NODE = 'stateNode'
  const EVENT = 'event'

  // TODO remove
  const { log } = getContext('logger')

  function createEventFrame(
    update: XStateInspectUpdateEvent,
    snapshot?: any,
  ): EventFrame {
    return {
      id: `${EVENT}·${update.event.name}·${update.event.createdAt}·${update.sessionId}`,
      type: EVENT,
      event: update.event,
      changed: snapshot?.changed,
      snapshot: update.snapshot,
    }
  }

  function createStateNodeFrame(
    update: XStateInspectUpdateEvent,
    snapshot?: any,
  ): StateNodeFrame {
    return {
      id: `${STATE_NODE}·${update.event.name}·${update.event.createdAt}·${update.sessionId}`,
      type: STATE_NODE,
      stateValue: snapshot?.value,
      changed: snapshot?.changed,
      snapshot: update.snapshot,
      final: snapshot?.done,
      startedInvocation: didStartInvocation(snapshot),
      stoppedInvocation: didStopInvocation(snapshot),
    }
  }

  function didStartInvocation(snapshot: any): boolean {
    if (!snapshot || !snapshot.actions || !Array.isArray(snapshot.actions)) {
      return false
    }
    return snapshot.actions.some((x) => x.type === 'xstate.start')
  }

  function didStopInvocation(snapshot: any): boolean {
    if (!snapshot || !snapshot.actions || !Array.isArray(snapshot.actions)) {
      return false
    }
    return snapshot.actions.some((x) => x.type === 'xstate.stop')
  }

  function updateIntoFrames(
    update: XStateInspectUpdateEvent,
  ): Array<EventFrame> {
    const frames = []
    const snapshot =
      update.snapshot != null ? JSON.parse(update.snapshot) : undefined
    frames.push(createEventFrame(update, snapshot))
    if (snapshot?.changed) {
      frames.push(createStateNodeFrame(update, snapshot))
    }
    return frames
  }

  // Array of EventFrame or StateFrame
  interface FrameList extends Array<EventFrame | StateNodeFrame> {
    sessionId?: string
    historySize: number
    createdAt?: number
  }

  function createFrameList(): FrameList {
    const frames = [] as FrameList
    // these props serve for tracking when the reactive statements below need to run
    frames.sessionId = actor?.sessionId
    frames.historySize = actor?.history?.length ?? 0
    frames.createdAt = actor?.createdAt
    return frames
  }

  let frames: FrameList = createFrameList()

  function clearSelectedFrame() {
    selectedFrame = null
  }

  $: if (actor) {
    log('actor changed', actor, 'goldenrod') // TODO remove
    if (
      actor.sessionId !== frames.sessionId ||
      actor.createdAt !== frames.createdAt
    ) {
      const newFrames: FrameList = createFrameList()
      newFrames.sessionId = actor?.sessionId
      newFrames.historySize = actor.history.length
      // populate frames from the selected actor's history
      if (actor?.history?.length > 0) {
        actor.history.forEach((update) => {
          newFrames.push(...updateIntoFrames(update))
        })
      }
      frames = newFrames
      clearSelectedFrame()
    } else if (actor.history.length !== frames.historySize) {
      frames.historySize = actor.history.length
      const update = last(actor.history)
      if (update != null) {
        frames.push(...updateIntoFrames(update))
      }
      frames = frames
    }
  }

  let autoscroll: boolean
  let trackerElement: HTMLElement
  beforeUpdate(() => {
    autoscroll =
      trackerElement &&
      trackerElement.offsetHeight + trackerElement.scrollTop >
        trackerElement.scrollHeight - 20
  })

  afterUpdate(() => {
    if (autoscroll) {
      trackerElement?.scrollTo(0, trackerElement.scrollHeight)
    }
  })

  function onSelectFrame(frame: StateNodeFrame | EventFrame) {
    selectedFrame = frame
  }
</script>

{#if actor != null}
  <div
    class="tracker nice-scroll"
    bind:this={trackerElement}
    on:click={clearSelectedFrame}
  >
    {#each frames as frame, index (frame.id)}
      {#if frame.type === STATE_NODE}
        <StateNodeFrameComponent
          data={frame}
          {onSelectFrame}
          isSelected={selectedFrame === frame}
        />
      {:else if frame.type === EVENT}
        <EventFrameComponent
          data={frame}
          {onSelectFrame}
          isSelected={selectedFrame === frame}
        />
        {#if frames[index + 1]?.type === STATE_NODE}
          <ArrowDown />
        {/if}
      {/if}
    {/each}
  </div>
{/if}

<style>
  .tracker {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    overflow-y: auto;
    padding-bottom: 5px;
  }
</style>
