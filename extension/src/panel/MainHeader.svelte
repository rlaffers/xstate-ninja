<script lang="ts">
  import { ActorTypes, type ExtensionSettings } from 'xstate-ninja'
  import CogwheelIcon from './icons/CogwheelIcon.svelte'
  import TrashBinIcon from './icons/TrashBinIcon.svelte'
  import ukraineHeart from '../assets/ukraine_heart_64.png'

  export let clearDeadActors: () => void
  export let addSwimLane: () => void

  function openHelpUkraine(event: MouseEvent) {
    event.preventDefault()
    chrome.tabs.create({
      url: 'https://www.defendukraine.org/donate',
    })
  }

  let settingsShown = false
  function openSettings() {
    settingsShown = true
  }
  function closeSettings() {
    settingsShown = false
  }

  let currentSettings: ExtensionSettings = {
    trackedActorTypes: [
      ActorTypes.machine,
      ActorTypes.callback,
      ActorTypes.observable,
    ],
  }
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
    const trackedActorTypes = Array.from(
      new FormData(event.target as HTMLFormElement).keys(),
    ).map((name) => ActorTypes[name])
    closeSettings()
    chrome.storage.sync.get('settings', ({ settings }) => {
      const nextSettings = {
        ...settings,
        trackedActorTypes,
      }
      chrome.storage.sync.set({
        settings: nextSettings,
      })
    })
  }
</script>

<header class="main-header">
  <button
    title="Add another swim lane"
    class="add-swim-lane-btn"
    on:click={addSwimLane}>+</button
  >
  <button
    on:click={clearDeadActors}
    title="Clear dead actors"
    class="clear-dead-btn"><TrashBinIcon /></button
  >
  <div class="separator" />
  <div class="middle-bar">
    <button title="Settings" class="config-btn" on:click={openSettings}
      ><CogwheelIcon /></button
    >
  </div>

  <div class="separator" />
  <a
    href="https://www.defendukraine.org/donate"
    on:click={openHelpUkraine}
    title="Please support Ukraine"
    class="help-ukraine"
    ><img
      src={ukraineHeart}
      alt="Please help Ukraine"
      width="20"
      height="20"
    /></a
  >
</header>
{#if settingsShown}
  <div class="modal-background" on:click={closeSettings}>
    <dialog open class="settings" on:click={(event) => event.stopPropagation()}>
      <form method="dialog" on:submit={saveSettings}>
        <h1>Settings</h1>
        <fieldset>
          <legend>Tracked actor types</legend>
          <label>
            <input
              type="checkbox"
              name="machine"
              checked={currentSettings.trackedActorTypes?.includes?.(
                ActorTypes.machine,
              )}
            />
            State machines
          </label>
          <label>
            <input
              type="checkbox"
              name="callback"
              checked={currentSettings.trackedActorTypes?.includes?.(
                ActorTypes.callback,
              )}
            />
            Callbacks
          </label>
          <label>
            <input
              type="checkbox"
              name="observable"
              checked={currentSettings.trackedActorTypes?.includes?.(
                ActorTypes.observable,
              )}
            />
            Observables
          </label>
          <label>
            <input
              type="checkbox"
              name="promise"
              checked={currentSettings.trackedActorTypes?.includes?.(
                ActorTypes.promise,
              )}
            />
            Promises
          </label>
        </fieldset>
        <button on:click={closeSettings} type="button">Cancel</button>
        <button type="submit">Save</button>
      </form>
    </dialog>
  </div>
{/if}

<style>
  .main-header {
    grid-area: main-header;
    display: flex;
    flex-direction: row;
    background-color: var(--background-highlight);
    border-bottom: 1px solid var(--content-muted);
    padding: 0.2rem;
    align-items: center;
  }

  .main-header button {
    background: transparent;
    border: 0;
    color: var(--content);
    padding: 1px 6px;
  }

  .main-header button:hover {
    color: var(--blue) !important;
  }

  .main-header a {
    padding: 1px 6px 1px 0;
  }

  .middle-bar {
    flex: 1;
  }

  :global(.clear-dead-btn > svg),
  :global(.config-btn > svg) {
    height: 100%;
  }

  :global(.clear-dead-btn:hover > svg > g > path),
  :global(.config-btn:hover > svg > g > path) {
    fill: var(--blue) !important;
  }

  .help-ukraine {
    display: flex;
    align-items: center;
  }

  .help-ukraine:hover {
    transform: scale(1.1);
  }

  .add-swim-lane-btn {
    font-size: 1.4rem;
    font-weight: bold;
  }

  .config-btn {
    display: flex;
    align-items: center;
  }

  .separator {
    width: 0;
    height: calc(100% - 0.4rem);
    border-right: 1px solid var(--content-muted);
    margin: 0.2rem 0.5rem;
  }

  .modal-background {
    position: absolute;
    z-index: 10;
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
</style>
