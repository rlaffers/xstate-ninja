<script context="module" lang="ts">
  import type { Interpreter, StateMachine } from 'xstate'
  import { rootMachine as machine } from './machines/rootMachine'
  import { createContext } from '../utils/createContext'

  type InterpreterOf<M> = M extends StateMachine<
    infer TContext,
    infer TStateSchema,
    infer TEvent,
    infer TTypestate,
    any,
    any,
    infer TResolvedTypesMeta
  >
    ? Interpreter<TContext, TStateSchema, TEvent, TTypestate, TResolvedTypesMeta>
    : never

  // create properly type context for the root machine actor
  export const rootActorContext = createContext<InterpreterOf<typeof machine>>()
</script>

<script lang="ts">
  import { isEmpty } from 'rambda'
  import type { XStateInspectAnyEvent } from 'xstate-ninja'
  import { useMachine, useSelector } from '@xstate/svelte'
  import SideBar from './SideBar.svelte'
  import { connectBackgroundPage } from './connectBackgroundPage'
  import Intro from './Intro.svelte'
  import MainHeader from './MainHeader.svelte'
  import SwimLane from './SwimLane.svelte'
  import { rootMachine } from './machines/rootMachine'

  // communication with devtools
  const bkgPort: chrome.runtime.Port = connectBackgroundPage()

  const { service: rootActor } = useMachine(
    rootMachine.withContext({
      ...rootMachine.initialState.context,
      bkgPort,
    }),
  )

  rootActorContext.set(rootActor)

  function messageListener(event: XStateInspectAnyEvent) {
    rootActor.send({
      type: 'INSPECTOR_EVENT',
      event,
    })
  }

  bkgPort.onMessage.addListener(messageListener)
  bkgPort.onDisconnect.addListener(() => {
    bkgPort.onMessage.removeListener(messageListener)
  })

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.settings != null) {
      rootActor.send({
        type: 'DEAD_HISTORY_SIZE_CHANGED',
        deadHistorySize: changes.settings.newValue.deadHistorySize,
      })
    }
  })

  const actors = useSelector(rootActor, (state) => state.context.actors)

  // -----------------------------
  const swimlanes = useSelector(rootActor, (state) => state.context.swimlanes)

  chrome.devtools.network.onNavigated.addListener(() => {
    rootActor.send({
      type: 'PAGE_NAVIGATION_EVENT',
    })
  })

  // refs to SwimLane elements
  let elements: HTMLElement[] = []

  function closeSwimlane(index: number) {
    rootActor.send({
      type: 'CLOSE_SWIMLANE_CLICKED',
      swimlaneIndex: index,
    })
    // always remove the last element - Svelte will reuse the preceding elements
    elements = elements.slice(0, -1)
  }

  function registerElement(element: HTMLElement) {
    elements.push(element)
  }
</script>

{#if $actors == null || isEmpty($actors)}
  <Intro />
{:else}
  <main class="actors-view">
    <MainHeader />

    <section class="swim-lanes nice-scroll" class:multi={$swimlanes.length > 1}>
      {#each $swimlanes as actor, index}
        <SwimLane
          {index}
          selectedActor={actor}
          closeSwimlane={() => closeSwimlane(index)}
          previousSwimlane={index > 0 ? elements[index - 1] : null}
          onMount={registerElement}
        />
      {/each}
    </section>

    <SideBar />
  </main>
{/if}

<style>
  main.actors-view {
    height: 100%;
    display: grid;
    grid-template-columns: 2fr fit-content(10%);
    grid-template-rows: 2.1rem 3rem 1fr;
    grid-template-areas:
      'main-header main-header'
      'swim-lanes sidebar'
      'swim-lanes sidebar';
  }

  .swim-lanes {
    grid-area: swim-lanes;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    overflow-x: auto;
  }
</style>
