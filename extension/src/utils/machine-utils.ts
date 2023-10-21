import type { AnyEventObject, ConditionPredicate, GuardMeta } from 'xstate'

export const and =
  <TContext, TEvent extends AnyEventObject>(
    guardConfigs: (string | ConditionPredicate<TContext, TEvent>)[],
  ) =>
  (context: TContext, event: TEvent, meta: GuardMeta<TContext, TEvent>) => {
    const configuredGuards = meta.state.configuration.find((x) => x.order === 0)?.options.guards
    return guardConfigs.every((guard) => {
      if (typeof guard === 'function') {
        return guard(context, event, meta)
      }
      const guardFunction = configuredGuards?.[guard]
      if (guardFunction == null) {
        throw new Error(`Guard "${guard}" is not provided in the machine options.`)
      }
      return guardFunction(context, event as any, meta as any)
    })
  }
