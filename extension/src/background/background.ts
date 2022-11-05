import { ActorTypes, type ExtensionSettings } from 'xstate-ninja'
import { MessageBroker } from './MessageBroker'

chrome.storage.sync.get('settings', ({ settings }) => {
  if (!settings) {
    const defaultSettings: ExtensionSettings = {
      trackedActorTypes: [
        ActorTypes.machine,
        ActorTypes.callback,
        ActorTypes.observable,
      ],
      deadHistorySize: 1,
    }
    chrome.storage.sync.set({ settings: defaultSettings })
  }
})

const messageBroker = new MessageBroker()
messageBroker.start()
