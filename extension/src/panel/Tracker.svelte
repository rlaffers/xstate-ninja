<script lang="ts">
  import { type State } from 'xstate'
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
  import { last, debounce, isMachineSnapshot } from '../utils'

  export let actor: DeserializedExtendedInspectedActorObject
  export let onSelectFrame: (frame: EventFrame | StateNodeFrame | null) => void
  export let active = false

  let activeFrame: EventFrame | StateNodeFrame | null

  // clear activeFrame if parent swimlane stopped being active
  $: {
    if (!active) {
      activeFrame = null
    }
  }

  const STATE_NODE = 'stateNode'
  const EVENT = 'event'

  function createEventFrame(
    update: XStateInspectUpdateEvent,
    historyIndex: number,
    snapshot?: any,
  ): EventFrame {
    return {
      id: `${EVENT}·${update.event.name}·${update.event.createdAt}·${update.sessionId}`,
      type: EVENT,
      event: update.event,
      changed: snapshot?.changed,
      snapshot: update.snapshot,
      historyIndex,
    }
  }

  function createStateNodeFrame(
    update: XStateInspectUpdateEvent,
    historyIndex: number,
    snapshot?: any,
  ): StateNodeFrame {
    return {
      id: `${STATE_NODE}·${update.event.name}·${update.event.createdAt}·${update.sessionId}`,
      type: STATE_NODE,
      stateValue: snapshot?.value,
      changed: snapshot?.changed,
      snapshot: update.snapshot,
      final: snapshot?.done,
      startedInvocation: isMachineSnapshot(snapshot)
        ? didStartInvocation(snapshot)
        : false,
      stoppedInvocation: isMachineSnapshot(snapshot)
        ? didStopInvocation(snapshot)
        : false,
      historyIndex,
    }
  }

  function didStartInvocation(snapshot: State<any>): boolean {
    const actions = snapshot.actions
    if (!Array.isArray(actions)) {
      return false
    }
    return actions.some((x) => x.type === 'xstate.start')
  }

  function didStopInvocation(snapshot: State<any>): boolean {
    const actions = snapshot.actions
    if (!Array.isArray(actions)) {
      return false
    }
    return actions.some((x) => x.type === 'xstate.stop')
  }

  function updateIntoFrames(
    update: XStateInspectUpdateEvent,
    historyIndex: number,
  ): (EventFrame | StateNodeFrame)[] {
    const frames: (EventFrame | StateNodeFrame)[] = []
    const snapshot: unknown =
      update.snapshot != null ? JSON.parse(update.snapshot) : undefined
    frames.push(createEventFrame(update, historyIndex, snapshot))
    if (isMachineSnapshot(snapshot) && snapshot?.changed) {
      frames.push(createStateNodeFrame(update, historyIndex, snapshot))
    }
    return frames
  }

  // Array of EventFrame or StateFrame
  interface FrameList extends Array<EventFrame | StateNodeFrame> {
    historySize: number
    sessionId?: string
    createdAt?: number
  }

  function createFrameList(
    actr: DeserializedExtendedInspectedActorObject,
  ): FrameList {
    const frames: FrameList = [] as unknown as FrameList
    // these props serve for tracking when the reactive statements below need to run
    frames.sessionId = actr?.sessionId
    frames.historySize = actr?.history?.length ?? 0
    frames.createdAt = actr?.createdAt
    // populate frames from the selected actor's history
    if (actr && actr.history?.length > 0) {
      actr.history.forEach((update, index) => {
        frames.push(...updateIntoFrames(update, index))
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
        frames.push(...updateIntoFrames(update, actor.history.length - 1))
      }
      frames = frames
    }
  }

  let autoscroll = true
  let trackerElement: HTMLElement

  $: {
    if (activeFrame) {
      autoscroll = false
    }
  }

  function trackScrolling(node: HTMLElement) {
    const updateAutoscroll = debounce(function updateAutoscroll() {
      autoscroll =
        trackerElement &&
        trackerElement.offsetHeight + trackerElement.scrollTop >
          trackerElement.scrollHeight - 20
    }, 100)
    node.addEventListener('scroll', updateAutoscroll)
    // return () => {
    //   node.removeEventListener('scroll', updateAutoscroll)
    // }
    return {
      destroy: () => {
        node.removeEventListener('scroll', updateAutoscroll)
      },
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

  let selectedActorSessionId: string = actor?.sessionId
  $: {
    if (actor && actor.sessionId !== selectedActorSessionId) {
      selectedActorSessionId = actor.sessionId
    }
  }

  let showTimestamps = true

  chrome.storage.sync.get('settings', ({ settings }) => {
    showTimestamps = settings.showTimestamps
  })
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.settings != null) {
      showTimestamps = changes.settings.newValue.showTimestamps
    }
  })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if actor != null}
  <div
    class="tracker nice-scroll"
    class:hidden-timestamps={!showTimestamps}
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
          actorSessionId={selectedActorSessionId}
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
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    justify-items: center;
    width: 100%;
    overflow-y: auto;
    padding-bottom: 5px;
  }
</style>
