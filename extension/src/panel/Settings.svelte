<script lang="ts">
  /* eslint-disable svelte/no-unused-svelte-ignore */
  import { ActorTypes, isActorType } from 'xstate-ninja'

  export let close: () => void

  interface ExtensionSettings {
    trackedActorTypes: ActorTypes[]
    deadHistorySize: number
    showTimestamps: boolean
  }

  let currentSettings: ExtensionSettings

  chrome.storage.sync.get('settings', ({ settings }) => {
    currentSettings = settings
  })

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.settings != null) {
      currentSettings = changes.settings.newValue
    }
  })

  function saveSettings(event: Event) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const trackedActorTypes: ActorTypes[] = formData
      .getAll('trackedActorTypes')
      .filter((v) => isActorType(v))
      .map((v): ActorTypes => ActorTypes[v as keyof typeof ActorTypes])
    const deadHistorySize = Number(formData.get('deadHistorySize'))
    close()
    chrome.storage.sync.get('settings', ({ settings }) => {
      const nextSettings = {
        ...settings,
        trackedActorTypes,
        deadHistorySize: isNaN(deadHistorySize) ? 0 : deadHistorySize,
        showTimestamps: !!formData.get('showTimestamps'),
      }
      chrome.storage.sync.set({
        settings: nextSettings,
      })
    })
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="modal-background" on:click={close}>
  <dialog open class="settings" on:click={(event) => event.stopPropagation()}>
    <form method="dialog" on:submit={saveSettings}>
      <h1>Settings</h1>
      <fieldset>
        <legend>Tracked actor types</legend>
        <label>
          <input
            type="checkbox"
            name="trackedActorTypes"
            value="machine"
            checked={currentSettings?.trackedActorTypes?.includes?.(ActorTypes.machine)}
          />
          State machines
        </label>
        <label>
          <input
            type="checkbox"
            name="trackedActorTypes"
            value="callback"
            checked={currentSettings?.trackedActorTypes?.includes?.(ActorTypes.callback)}
          />
          Callbacks
        </label>
        <label>
          <input
            type="checkbox"
            name="trackedActorTypes"
            value="observable"
            checked={currentSettings?.trackedActorTypes?.includes?.(ActorTypes.observable)}
          />
          Observables
        </label>
        <label>
          <input
            type="checkbox"
            name="trackedActorTypes"
            value="promise"
            checked={currentSettings?.trackedActorTypes?.includes?.(ActorTypes.promise)}
          />
          Promises
        </label>
      </fieldset>
      <label>
        Keep <input
          type="number"
          name="deadHistorySize"
          id="dead-history"
          value={currentSettings?.deadHistorySize}
          min="0"
          max="10"
        /> dead actors in history (per id)
      </label>
      <label
        >Show timestamps
        <input
          type="checkbox"
          name="showTimestamps"
          value="1"
          checked={currentSettings?.showTimestamps}
        />
      </label>
      <div class="buttons">
        <button on:click={close} type="button">Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>
  </dialog>
</div>

<style>
  .modal-background {
    position: absolute;
    z-index: 100;
    width: 100vw;
    height: 100vh;
    /* var(--background) */
    background-color: #002b3690;
  }

  .modal-background .settings {
    background: var(--background);
    border: 1px solid var(--content-muted);
  }

  .settings h1 {
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
  }
  .settings label {
    display: block;
  }
  .settings .buttons {
    margin-top: 1rem;
  }
  .settings input#dead-history {
    width: 2rem;
  }
</style>
