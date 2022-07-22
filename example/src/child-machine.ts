import { createMachine, actions } from 'xstate'

const { send } = actions
export const childMachine = createMachine({
  id: 'the_child',
  initial: 'Born',
  states: {
    Born: {
      entry: send('BIRTH'), // TODO will this event be caught on a spawned child?
      after: {
        3000: 'Adult',
      },
    },
    Adult: {
      after: {
        3000: 'Old',
      },
    },
    Old: {
      type: 'final',
    },
  },
})
