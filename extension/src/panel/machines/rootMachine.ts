import { createMachine, actions } from 'xstate'
import { map, fromPairs, isEmpty } from 'rambda'
import type { AnyInterpreter, AnyEventObject } from 'xstate'
import type { XStateInspectAnyEvent, DeserializedExtendedInspectedActorObject } from 'xstate-ninja'
import {
  isXStateInspectActorsEvent,
  isXStateInspectActorEvent,
  isXStateInspectUpdateEvent,
  isXStateNinjaUnregisterEvent,
  isXStateInspectConnectedEvent,
  DeadActorsClearedEvent,
} from 'xstate-ninja'
import {
  deserializeInspectedActor,
  sortByFirstItem,
  createActorFromUpdateEvent,
  updateActorFromUpdateEvent,
} from '../../utils'
import type { EventFrame } from '../EventFrame.svelte'
import type { StateNodeFrame } from '../StateNodeFrame.svelte'

const { assign, choose } = actions

export type ActorList = {
  [sessionId: string]: DeserializedExtendedInspectedActorObject
}

type TContext = {
  activeSwimlane: number | null
  activeActor: DeserializedExtendedInspectedActorObject | null
  actors: ActorList
  swimlanes: DeserializedExtendedInspectedActorObject[]
  trackerMachineRefs: AnyInterpreter[]
  inspectorVersion: string | null
  deadHistorySize: number
  activeFrame: EventFrame | StateNodeFrame | null
  bkgPort: chrome.runtime.Port | null
}

type TEvent =
  | {
      type: 'INSPECTOR_EVENT'
      event: XStateInspectAnyEvent
    }
  | {
      type: 'DEAD_HISTORY_SIZE_CHANGED'
      deadHistorySize: number
    }
  | {
      type: 'PAGE_NAVIGATION_EVENT'
    }
  | {
      type: 'CLEAR_DEAD_ACTORS_CLICKED'
    }
  | {
      type: 'SWIMLANE_SELECTED'
      swimlaneIndex: number
    }
  | {
      type: 'FRAME_SELECTED'
      swimlaneIndex: number
      frame: EventFrame | StateNodeFrame
    }
  | {
      type: 'FRAME_DESELECTED'
      swimlaneIndex: number
    }
  | {
      type: 'ADD_SWIMLANE_CLICKED'
    }
  | {
      type: 'ACTOR_SELECTED'
      swimlaneIndex: number
      actor: DeserializedExtendedInspectedActorObject
    }
  | {
      type: 'CLOSE_SWIMLANE_CLICKED'
      swimlaneIndex: number
    }

export const rootMachine = createMachine(
  {
    id: 'root',
    predictableActionArguments: true,
    schema: {
      context: {} as TContext,
      events: {} as TEvent,
    },
    context: {
      activeSwimlane: null,
      activeActor: null,
      actors: {},
      swimlanes: [],
      trackerMachineRefs: [],
      inspectorVersion: null,
      deadHistorySize: 0,
      // TODO this should live within each trackerMachine. If there is at least one swimlanes, there is always one
      // tracker active
      activeFrame: null,
      bkgPort: null, // must be provided when the machine is created
    },
    initial: 'Initializing',
    states: {
      Initializing: {
        invoke: {
          src: 'readDeadHistorySizeFromStorage',
          id: 'readDeadHistorySizeFromStorage',
          onDone: {
            target: 'Idle',
            actions: ['setDeadHistorySize'],
          },
          onError: {
            target: 'Idle',
            actions: ['logError'],
          },
        },
      },
      Idle: {},
    },
    on: {
      INSPECTOR_EVENT: [
        {
          cond: 'isConnectedEvent',
          actions: 'setInspectorVersion',
        },
        {
          cond: 'isActorsEvent',
          // TODO if going from 0 actors to 1 actor => generate swimlanes, set active swimlane, active actor, active frame
          // TODO if going to 0 actors => reset swimlanes, active swimlane, active actor, active frame
          actions: 'setActors',
        },
        {
          cond: 'isActorEvent',
          actions: [
            'addActor',
            choose([
              {
                cond: 'hasOneActor',
                actions: [
                  'addSwimlane',
                  'setFirstActiveSwimlane',
                  'setFirstActiveActor',
                  'resetActiveFrame',
                ],
              },
            ]),
          ],
        },
        {
          cond: 'isUnregisterEvent',
          actions: [
            'markActorDead',
            'purgeSomeDeadActors',
            // TODO within each swimlane we may need to select a different actor
            choose([
              {
                cond: 'hasNoActors',
                actions: [
                  'resetSwimlanes',
                  'resetActiveSwimlane',
                  'resetActiveActor',
                  'resetActiveFrame',
                ],
              },
            ]),
          ],
        },
        {
          cond: 'isUpdateEvent',
          // TODO if going from 0 actors to 1 actor => generate swimlanes, set active swimlane, active actor, active frame
          actions: 'updateOrCreateActor',
        },
      ],
      DEAD_HISTORY_SIZE_CHANGED: {
        actions: 'setDeadHistorySize',
      },
      PAGE_NAVIGATION_EVENT: {
        actions: [
          'resetActors',
          'resetSwimlanes',
          'resetActiveSwimlane',
          'resetActiveActor',
          'resetActiveFrame',
        ],
      },
      CLEAR_DEAD_ACTORS_CLICKED: {
        actions: [
          'clearAllDeadActors',
          'sendDeadActorsClearedEvent',
          choose([
            {
              cond: 'hasNoActors',
              actions: [
                'resetSwimlanes',
                'resetActiveSwimlane',
                'resetActiveActor',
                'resetActiveFrame',
              ],
            },
          ]),
        ],
      },
      SWIMLANE_SELECTED: {
        cond: 'isDifferentSwimlane',
        actions: ['setActiveSwimlane', 'setActiveActor', 'resetActiveFrame'],
      },
      FRAME_SELECTED: [
        {
          cond: 'isDifferentSwimlane',
          actions: ['setActiveSwimlane', 'setActiveActor', 'setActiveFrame'],
        },
        {
          // the same swimlane
          actions: ['setActiveFrame'],
        },
      ],
      FRAME_DESELECTED: {
        actions: 'resetActiveFrame',
      },
      ADD_SWIMLANE_CLICKED: {
        actions: ['addSwimlane'],
      },
      CLOSE_SWIMLANE_CLICKED: {
        actions: [
          'removeSwimlane',
          'setFirstActiveSwimlane',
          'setFirstActiveActor',
          'resetActiveFrame',
        ],
      },
      ACTOR_SELECTED: [
        {
          cond: 'isDifferentSwimlane',
          actions: ['updateActorInSwimlane'],
        },
        {
          cond: 'isDifferentActiveActor',
          actions: ['updateActorInSwimlane', 'setActiveActorFromEvent', 'resetActiveFrame'],
        },
        {
          actions: ['updateActorInSwimlane', 'setActiveActorFromEvent'],
        },
      ],
    },
  },
  // --------------- IMPLEMENTATIONS ----------------
  {
    actions: {
      updateOrCreateActor: assign({
        actors: (context, event: TEvent) => {
          if (event.type !== 'INSPECTOR_EVENT' || !isXStateInspectUpdateEvent(event.event)) {
            return context.actors
          }
          const inspectEvent = event.event
          const actor = context.actors[inspectEvent.sessionId]
          if (actor) {
            return {
              ...context.actors,
              [inspectEvent.sessionId]: updateActorFromUpdateEvent(actor, inspectEvent),
            }
          }
          // This is not typically executed. An actor is typically created from the ActorEvent or ActorsEvent.
          return {
            ...context.actors,
            [inspectEvent.sessionId]: createActorFromUpdateEvent(inspectEvent),
          }
        },
      }),

      setInspectorVersion: assign({
        inspectorVersion: (context, event: TEvent) => {
          if (event.type !== 'INSPECTOR_EVENT' || !isXStateInspectConnectedEvent(event.event)) {
            return null
          }
          return event.event.version
        },
      }),

      setActors: assign({
        actors: (context, event: TEvent) => {
          if (event.type !== 'INSPECTOR_EVENT' || !isXStateInspectActorsEvent(event.event)) {
            return context.actors
          }
          return map(deserializeInspectedActor, event.event.inspectedActors)
        },
      }),

      resetActors: assign({
        actors: {},
      }),

      resetActiveSwimlane: assign({
        activeSwimlane: null,
      }),

      setActiveSwimlane: assign({
        activeSwimlane: (context, event: AnyEventObject) => {
          if (event.swimlaneIndex != null) {
            if (event.swimlaneIndex < context.swimlanes.length) {
              return event.swimlaneIndex
            }
            console.error('Attempted to set an invalid swimlane', {
              swimlaneIndex: event.swimlaneIndex,
              totalSwimlanes: context.swimlanes.length,
            })
          }
          return context.activeSwimlane
        },
      }),

      setFirstActiveSwimlane: assign({
        activeSwimlane: (context) => {
          if (context.swimlanes.length > 0) {
            return 0
          }
          return null
        },
      }),

      addSwimlane: assign({
        swimlanes: (context) => {
          const preselectedActor = !isEmpty(context.actors)
            ? Object.values(context.actors).find((x) => x.parent == null) ??
              Object.values(context.actors)[0]
            : null
          if (preselectedActor) {
            return [...context.swimlanes, preselectedActor]
          }
          return context.swimlanes
        },
      }),

      removeSwimlane: assign({
        swimlanes: (context, event: TEvent) => {
          if (event.type !== 'CLOSE_SWIMLANE_CLICKED') {
            return context.swimlanes
          }
          if (event.swimlaneIndex >= context.swimlanes.length) {
            console.error('Attempted to remove an invalid swimlane', {
              swimlaneIndex: event.swimlaneIndex,
              totalSwimlanes: context.swimlanes.length,
            })
            return context.swimlanes
          }
          const next = [...context.swimlanes]
          next.splice(event.swimlaneIndex, 1)
          return next
        },
      }),

      resetSwimlanes: assign({
        swimlanes: [],
      }),

      updateActorInSwimlane: assign({
        swimlanes: (context, event: TEvent) => {
          if (event.type === 'ACTOR_SELECTED') {
            if (event.swimlaneIndex >= context.swimlanes.length) {
              console.error('Attempted to update actor from an invalid swimlane', {
                swimlaneIndex: event.swimlaneIndex,
                totalSwimlanes: context.swimlanes.length,
              })
              return context.swimlanes
            }
            const next = [...context.swimlanes]
            next[event.swimlaneIndex] = event.actor
            return next
          }
          return context.swimlanes
        },
      }),

      setActiveActor: assign({
        activeActor: (context, event: AnyEventObject) => {
          if (event.swimlaneIndex != null) {
            if (event.swimlaneIndex < context.swimlanes.length) {
              return context.swimlanes[event.swimlaneIndex]
            }
            console.error('Attempted to set an invalid swimlane', {
              swimlaneIndex: event.swimlaneIndex,
              totalSwimlanes: context.swimlanes.length,
            })
          }
          return context.activeActor
        },
      }),

      setFirstActiveActor: assign({
        activeActor: (context) => {
          if (context.swimlanes.length > 0) {
            return context.swimlanes[0]
          }
          return null
        },
      }),

      setActiveActorFromEvent: assign({
        activeActor: (context, event: TEvent) => {
          if (event.type === 'ACTOR_SELECTED') {
            return event.actor
          }
          return context.activeActor
        },
      }),

      resetActiveActor: assign({
        activeActor: null,
      }),

      setActiveFrame: assign({
        activeFrame: (context, event: TEvent) => {
          if (event.type !== 'FRAME_SELECTED' || event.frame == null) {
            return context.activeFrame
          }
          return event.frame
        },
      }),

      resetActiveFrame: assign({
        activeFrame: null,
      }),

      addActor: assign({
        actors: (context, event: TEvent) => {
          if (event.type !== 'INSPECTOR_EVENT' || !isXStateInspectActorEvent(event.event)) {
            return context.actors
          }

          const inspectEvent = event.event
          return {
            ...context.actors,
            [inspectEvent.sessionId]: deserializeInspectedActor(inspectEvent.inspectedActor),
          }
        },
      }),

      markActorDead: assign({
        actors: (context, event: TEvent) => {
          if (event.type !== 'INSPECTOR_EVENT' || !isXStateNinjaUnregisterEvent(event.event)) {
            return context.actors
          }

          const inspectEvent = event.event
          if (!isEmpty(context.actors)) {
            const actor = context.actors[inspectEvent.sessionId]
            if (!actor) {
              console.error(
                `The stopped actor ${inspectEvent.sessionId} is not in the list of actors.`,
              )
              return context.actors
            }
            return {
              ...context.actors,
              [inspectEvent.sessionId]: {
                ...actor,
                dead: true,
                diedAt: inspectEvent.diedAt ?? Date.now(),
              },
            }
          }
          return context.actors
        },
      }),

      purgeSomeDeadActors: assign({
        actors: (context, event: TEvent) => {
          if (event.type !== 'INSPECTOR_EVENT' || !isXStateNinjaUnregisterEvent(event.event)) {
            return context.actors
          }
          const allActors = Object.entries(context.actors)
          const liveActors = allActors.filter(([, x]) => !x.dead)
          const actorsById = allActors.reduce(
            (
              result: {
                [index: string]: [[number, DeserializedExtendedInspectedActorObject]]
              },
              [, actor],
            ) => {
              if (!actor.dead) {
                return result
              }
              if (!result[actor.actorId]) {
                result[actor.actorId] = [[actor.diedAt ?? Date.now(), actor]]
                return result
              }
              result[actor.actorId].push([actor.diedAt ?? Date.now(), actor])
              return result
            },
            {},
          )

          const deadActors: [string, DeserializedExtendedInspectedActorObject][] = Object.values(
            actorsById,
          ).flatMap((deadActorsWithTimestamp) => {
            const sorted = sortByFirstItem(deadActorsWithTimestamp)
            return sorted
              .slice(context.deadHistorySize > 0 ? -1 * context.deadHistorySize : sorted.length)
              .map(([, actor]): [string, DeserializedExtendedInspectedActorObject] => [
                actor.sessionId,
                actor,
              ])
          })

          return fromPairs([...liveActors, ...deadActors])
        },
      }),

      clearAllDeadActors: assign({
        actors: (context) => {
          if (isEmpty(context.actors)) {
            return context.actors
          }
          return fromPairs(Object.entries(context.actors).filter(([, actor]) => !actor.dead))
        },
      }),

      sendDeadActorsClearedEvent: (context) => {
        context.bkgPort?.postMessage(new DeadActorsClearedEvent().detail)
      },

      setDeadHistorySize: assign({
        deadHistorySize: (context, event: any) => {
          if (event.deadHistorySize != null) {
            return event.deadHistorySize
          }
          if (event.data != null) {
            return event.data.deadHistorySize ?? context.deadHistorySize
          }
          return context.deadHistorySize
        },
      }),

      logError(context, event) {
        console.error('Error in rootMachine:', (event as any).data)
      },
    },

    services: {
      readDeadHistorySizeFromStorage() {
        return new Promise((resolve) => {
          chrome.storage.sync.get('settings', ({ settings }) => {
            resolve({ deadHistorySize: settings.deadHistorySize })
          })
        })
      },
    },

    guards: {
      hasNoActors: (context) => {
        return isEmpty(context.actors)
      },
      hasOneActor: (context) => {
        return Object.keys(context.actors).length === 1
      },
      isConnectedEvent: (context, event: AnyEventObject) => {
        return isXStateInspectConnectedEvent(event.event)
      },
      isActorsEvent: (context, event: AnyEventObject) => {
        return isXStateInspectActorsEvent(event.event)
      },
      isActorEvent: (context, event: AnyEventObject) => {
        return isXStateInspectActorEvent(event.event)
      },
      isUnregisterEvent: (context, event: AnyEventObject) => {
        return isXStateNinjaUnregisterEvent(event.event)
      },
      isUpdateEvent: (context, event: AnyEventObject) => {
        return isXStateInspectUpdateEvent(event.event)
      },
      isDifferentSwimlane: (context, event: TEvent) => {
        if (event.type === 'SWIMLANE_SELECTED' || event.type === 'FRAME_SELECTED') {
          return context.activeSwimlane !== event.swimlaneIndex
        }
        return true
      },
      isDifferentActiveActor: (context, event: TEvent) =>
        event.type === 'ACTOR_SELECTED' &&
        context.activeActor != null &&
        context.activeActor.sessionId !== event.actor.sessionId,
    },
  },
)
