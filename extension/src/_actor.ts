import type { InspectedActorObject } from 'xstate-ninja'

// export interface Actor {
//   id: string
//   sessionId: string
//   initialized: boolean // not needed
//   status: number
//   done: boolean // part of snapshot
//   stateValue: string | object // part of snapshot
//   dead: boolean // status=2 || done
//   history: Array<UpdateMessage['data']>
// }

export type Actor = Omit<InspectedActorObject, 'actorRef' | 'subscription'> & {
  dead: boolean // status=2 || done
  // history: Array<XStateInspectUpdateEvent>
}
