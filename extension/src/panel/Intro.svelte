<script lang="ts">
  import logo from '../assets/logo_256.png'

  function openHomePage(event) {
    event.preventDefault()
    chrome.tabs.create({
      url: 'https://github.com/rlaffers/xstate-ninja',
    })
  }
</script>

<img src={logo} class="logo" alt="XState Ninja" />
<h1>XState Ninja</h1>
<p>No state machines were found on the current page.</p>
<p>Make sure your state machines are connected to XState Ninja like this:</p>
<h2>Vanilla JS</h2>
<p>
  <!-- prettier-ignore -->
  <code>{`import { interpret } from 'xstate-ninja';
const service = interpret(machine);`}</code>
</p>

<h2>React</h2>
<p>
  <!-- prettier-ignore -->
  <code>{`import { useInterpret } from '@xstate-ninja/react';

// in your React component
const service = useInterpret(machine, { devTools: true });
`}</code>
</p>

<p>
  For more information and code examples visit the <a
    on:click={openHomePage}
    href="https://github.com/rlaffers/xstate-ninja">XState Ninja home page</a
  >.
</p>

<style>
  h1 {
    text-align: center;
    text-transform: uppercase;
    font-size: 2.5rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .logo {
    display: block;
    width: 128px;
    margin: 0 auto;
  }

  code {
    display: block;
    white-space: pre;
    padding: 0.5em 1em;
  }
</style>
