<script lang="ts">
  import CogwheelIcon from './icons/CogwheelIcon.svelte'
  import TrashBinIcon from './icons/TrashBinIcon.svelte'

  export let clearDeadActors: () => void
  export let addSwimLane: () => void
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
  <button title="Settings" class="config-btn"><CogwheelIcon /></button>
</header>

<style>
  .main-header {
    grid-area: main-header;
    display: flex;
    flex-direction: row;
    background-color: var(--base02);
    border-bottom: 1px solid var(--base01);
    padding: 0.2rem;
  }

  .main-header button {
    background: transparent;
    border: 0;
    color: var(--base0);
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
    border-right: 1px solid var(--base01);
    margin: 0.2rem 0.5rem;
  }
</style>
