<script lang="ts">
  import CogwheelIcon from './icons/CogwheelIcon.svelte'
  import TrashBinIcon from './icons/TrashBinIcon.svelte'
  import ukraineHeart from '../assets/ukraine_heart_64.png'

  export let clearDeadActors: () => void
  export let addSwimLane: () => void

  function openHelpUkraine(event) {
    event.preventDefault()
    chrome.tabs.create({
      url: 'https://www.defendukraine.org/donate',
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
  <button title="Settings" class="config-btn" disabled><CogwheelIcon /></button>

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

<style>
  .main-header {
    grid-area: main-header;
    display: flex;
    flex-direction: row;
    background-color: var(--background-highlight);
    border-bottom: 1px solid var(--content-muted);
    padding: 0.2rem;
  }

  .main-header button {
    background: transparent;
    border: 0;
    color: var(--content);
  }

  .main-header button:hover {
    color: var(--blue) !important;
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
    border-right: 1px solid var(--content-muted);
    margin: 0.2rem 0.5rem;
  }
</style>
