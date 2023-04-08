<script context="module" lang="ts">
  import { TransitionTypes } from 'xstate-ninja'
  import type { InspectedEventObject } from 'xstate-ninja'
  import type { StateNodeFrame } from './StateNodeFrame.svelte'
  import { formatTime } from '../utils'

  export interface EventFrame {
    id: string
    type: 'event'
    event: InspectedEventObject
    changed?: boolean
    snapshot?: string
    historyIndex: number
  }

  export function isEventFrame(
    frame: StateNodeFrame | EventFrame,
  ): frame is EventFrame {
    return frame == null ? false : frame.type === 'event'
  }
</script>

<script lang="ts">
  import { fade } from 'svelte/transition'

  export let data: EventFrame
  export let onSelectFrame: (frame: EventFrame) => void
  export let isSelected = false

  function selectFrame(event: MouseEvent) {
    onSelectFrame(data)
    event.stopPropagation()
  }

  let className = ''
  let description = ''
  switch (data.event.transitionType) {
    case TransitionTypes.taken:
      className = 'changed-state'
      description = 'This event triggered a state transition'
      break

    case TransitionTypes.guardedAndNoChange:
      className = 'guard-not-passed'
      description =
        'A guard prevented this event from triggering a state transition'
      break

    case TransitionTypes.forbidden:
      className = 'forbidden'
      description = 'Transition for this event is forbidden explicitly'
      break

    case TransitionTypes.missing:
      description = 'No transition exists for this event'
      break
  }
</script>

<div class="timestamp">{formatTime(data.event.createdAt)}</div>
<div
  class:selected={isSelected}
  class="event-frame {className}"
  title={description}
  in:fade
  on:click={selectFrame}
>
  {data.event.data.type}
  {#if data.event.origin}
    <div class="origin">from:&nbsp;{data.event.origin}</div>
  {/if}
</div>

<style>
  .timestamp {
    color: var(--content-muted);
    margin-top: 0.5rem;
    padding: 0 5px;
  }
  :global(.hidden-timestamps .timestamp) {
    width: 0px;
    padding: 0;
    margin: 0;
    visibility: hidden;
  }
  .event-frame {
    display: block;
    border: 1px solid var(--content-muted);
    color: var(--content-muted);
    background-color: var(--background);
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
    line-height: 1rem;
    text-align: center;
    cursor: pointer;
    z-index: 2;
  }

  .selected {
    box-shadow: inset 0 0 7px;
  }

  .event-frame.changed-state {
    border-color: var(--content-accent);
    color: var(--background);
    background-color: var(--content-accent);
  }

  .event-frame.guard-not-passed {
    border-color: var(--yellow);
    color: var(--yellow);
  }

  .event-frame.forbidden {
    border-color: var(--red);
    background-color: var(--background);
    color: var(--red);
  }
  .origin {
    font-size: 80%;
  }
</style>
