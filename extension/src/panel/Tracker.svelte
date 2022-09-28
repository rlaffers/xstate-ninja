<script lang="ts">
  import { afterUpdate } from 'svelte'
  import type {
    DeserializedExtendedInspectedActorObject,
    XStateInspectUpdateEvent,
  } from 'xstate-ninja'
  import StateNodeFrameComponent, {
    type StateNodeFrame,
  } from './StateNodeFrame.svelte'
  import EventFrameComponent, { type EventFrame } from './EventFrame.svelte'
  import ArrowDown from './ArrowDown.svelte'
  import { last, debounce } from '../utils'

  export let actor: DeserializedExtendedInspectedActorObject = null
  export let onSelectFrame: (frame: EventFrame | StateNodeFrame) => void

  let activeFrame: EventFrame | StateNodeFrame

  const STATE_NODE = 'stateNode'
  const EVENT = 'event'

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

  function createFrameList(
    actor?: DeserializedExtendedInspectedActorObject,
  ): FrameList {
    const frames = [] as FrameList
    // these props serve for tracking when the reactive statements below need to run
    frames.sessionId = actor?.sessionId
    frames.historySize = actor?.history?.length ?? 0
    frames.createdAt = actor?.createdAt
    // populate frames from the selected actor's history
    if (actor?.history?.length > 0) {
      actor.history.forEach((update) => {
        frames.push(...updateIntoFrames(update))
      })
    }
    return frames
  }

  let frames: FrameList = createFrameList(actor)

  function clearSelectedFrame() {
    activeFrame = null
    onSelectFrame(null)
  }

  $: if (actor) {
    if (
      actor.sessionId !== frames.sessionId ||
      actor.createdAt !== frames.createdAt
    ) {
      const newFrames: FrameList = createFrameList(actor)
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

  let autoscroll = true
  let trackerElement: HTMLElement

  function trackScrolling(node: HTMLElement) {
    const updateAutoscroll = debounce(function updateAutoscroll() {
      autoscroll =
        trackerElement &&
        trackerElement.offsetHeight + trackerElement.scrollTop >
          trackerElement.scrollHeight - 20
    }, 100)
    node.addEventListener('scroll', updateAutoscroll)
    return () => {
      node.removeEventListener('scroll', updateAutoscroll)
    }
  }

  afterUpdate(() => {
    if (autoscroll) {
      trackerElement?.scrollTo(0, trackerElement.scrollHeight)
    }
  })

  function activateFrame(frame: StateNodeFrame | EventFrame) {
    activeFrame = frame
    onSelectFrame(frame)
  }

  let hiddenStates = []
  let selectedActorSessionId: string = actor?.sessionId
  // reset hidden states on actor change
  $: {
    if (actor && actor.sessionId !== selectedActorSessionId) {
      hiddenStates = []
      selectedActorSessionId = actor.sessionId
    }
  }

  function hideStateName(event: MouseEvent) {
    const btn = event.currentTarget
    if (btn instanceof HTMLElement && btn.dataset.stateName !== undefined) {
      hiddenStates = [
        ...hiddenStates,
        btn.dataset.stateName.replace(/\..+/, ''),
      ]
    }
  }
</script>

{#if actor != null}
  <div
    class="tracker nice-scroll"
    bind:this={trackerElement}
    on:click={clearSelectedFrame}
    use:trackScrolling
  >
    {#each frames as frame, index (frame.id)}
      {#if frame.type === STATE_NODE}
        <StateNodeFrameComponent
          data={frame}
          onSelectFrame={activateFrame}
          isSelected={activeFrame === frame}
          {hideStateName}
          {hiddenStates}
        />
      {:else if frame.type === EVENT}
        <EventFrameComponent
          data={frame}
          onSelectFrame={activateFrame}
          isSelected={activeFrame === frame}
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
