<script lang="ts">
  let selectedTab = 'actions-tab'
  function selectTab(event) {
    console.log(
      '%cclicked',
      'background: lime; color: black; padding: 1px 5px',
      event.target,
    )
    selectedTab = event.target.id
  }
</script>

<section class="frame-info">
  <div role="tablist" class="tabs">
    <button
      id="actions-tab"
      class="tab"
      role="tab"
      on:click={selectTab}
      aria-selected={selectedTab === 'actions-tab'}
      aria-controls="actions-panel">Actions</button
    >
    <button
      id="invoked-tab"
      class="tab"
      role="tab"
      on:click={selectTab}
      aria-selected={selectedTab === 'invoked-tab'}
      aria-controls="invoked-panel">Invoked actors</button
    >
  </div>
  <section
    role="tabpanel"
    id="actions-panel"
    class="tabpanel"
    aria-hidden={selectedTab !== 'actions-tab'}
    aria-labelledby="actions-tab"
  >
    Actions come here
  </section>
  <section
    role="tabpanel"
    id="invoked-panel"
    class="tabpanel"
    aria-hidden={selectedTab !== 'invoked-tab'}
    aria-labelledby="invoked-tab"
  >
    Invocations come here
  </section>
</section>

<style>
  .tabs {
    background-color: var(--base02);
    display: flex;
    border-bottom: 1px solid var(--base01);
  }
  button.tab {
    background: none;
    color: var(--base03);
    border: 0;
    padding: 4px 8px;
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'PT Sans Narrow', sans-serif;
  }
  button.tab[aria-selected='true'] {
    background-color: var(--base01);
  }
  button.tab:is(:hover, :active, :focus):not([aria-selected='true']) {
    color: var(--base00);
  }
  .tabpanel {
    padding: 8px;
  }
  .tabpanel[aria-hidden='true'] {
    display: none;
  }
</style>
