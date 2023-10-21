<script lang="ts">
  import { satisfies } from 'semver'
  import { useSelector } from '@xstate/svelte'
  import CogwheelIcon from './icons/CogwheelIcon.svelte'
  import TrashBinIcon from './icons/TrashBinIcon.svelte'
  import ukraineHeart from '../assets/ukraine_heart_64.png'
  import githubLogo from '../assets/github_light_32px.png'
  import XStateLogo from './icons/XStateLogo.svelte'
  import Settings from './Settings.svelte'
  import xstateNinjaLogo from '../assets/icon_32x32.png'
  import config from '../config.json'
  import { rootActorContext } from './Panel.svelte'

  const rootActor = rootActorContext.get()

  const inspectorVersion = useSelector(rootActor, (state) => state.context.inspectorVersion)

  function clearDeadActors() {
    rootActor.send({
      type: 'CLEAR_DEAD_ACTORS_CLICKED',
    })
  }

  function addSwimlane() {
    rootActor.send({
      type: 'ADD_SWIMLANE_CLICKED',
    })
  }

  let inspectorVersionSatisfied = true
  $: inspectorVersionSatisfied =
    $inspectorVersion == null ? true : satisfies($inspectorVersion, config.inspector)

  function openHelpUkraine(event: MouseEvent) {
    event.preventDefault()
    chrome.tabs.create({
      url: 'https://www.defendukraine.org/donate',
    })
  }

  function openGithub(event: MouseEvent) {
    event.preventDefault()
    chrome.tabs.create({
      url: 'https://github.com/rlaffers/xstate-ninja#xstate-ninja',
    })
  }

  function openXStateDocs(event: MouseEvent) {
    event.preventDefault()
    chrome.tabs.create({
      url: 'https://xstate.js.org/docs/',
    })
  }

  let settingsShown = false
  function openSettings() {
    settingsShown = true
  }
  function closeSettings() {
    settingsShown = false
  }
</script>

<header class="main-header">
  <button title="Add another swim lane" class="add-swim-lane-btn" on:click={addSwimlane}>+</button>
  <button on:click={clearDeadActors} title="Clear dead actors" class="clear-dead-btn"
    ><TrashBinIcon /></button
  >
  <div class="separator" />
  <div class="middle-bar">
    <button title="Settings" class="config-btn" on:click={openSettings}><CogwheelIcon /></button>
  </div>

  {#if $inspectorVersion != null}
    <div class="inspector-version" class:invalid-version={!inspectorVersionSatisfied}>
      <span
        title={inspectorVersionSatisfied
          ? 'xstate-ninja detected on the page is compatible with this extension'
          : `xstate-ninja detected on the page is not supported by this extension. Upgrade xstate-ninja to ${config.inspector}`}
        ><img src={xstateNinjaLogo} alt="xstate-ninja" /> <strong>{$inspectorVersion}</strong></span
      >
    </div>
  {/if}

  <div class="separator" />
  <a
    href="https://github.com/rlaffers/xstate-ninja"
    on:click={openGithub}
    title="Open the home page"
    class="github-link"><img src={githubLogo} alt="Github" /></a
  >

  <a
    href="https://xstate.js.org/docs/"
    on:click={openXStateDocs}
    title="XState docs"
    class="xstate-link"
  >
    <XStateLogo />
  </a>

  <a
    href="https://www.defendukraine.org/donate"
    on:click={openHelpUkraine}
    title="Please support Ukraine"
    class="help-ukraine"
    ><img src={ukraineHeart} alt="Please help Ukraine" width="20" height="20" /></a
  >
</header>
{#if settingsShown}
  <Settings close={closeSettings} />
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

  .inspector-version {
    cursor: default;
  }

  .inspector-version img {
    height: 18px;
    vertical-align: bottom;
  }

  .inspector-version > span > strong {
    vertical-align: bottom;
  }

  .inspector-version.invalid-version span {
    color: var(--red);
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

  :global(.xstate-link > svg) {
    width: 4rem;
    height: 2rem;
  }

  :global(.clear-dead-btn:hover > svg > g > path),
  :global(.config-btn:hover > svg > g > path) {
    fill: var(--blue) !important;
  }

  .help-ukraine,
  .xstate-link,
  .github-link {
    display: flex;
    align-items: center;
  }

  .help-ukraine:hover,
  .github-link:hover {
    transform: scale(1.1);
  }

  .github-link > img {
    width: 1rem;
    height: 1rem;
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
</style>
