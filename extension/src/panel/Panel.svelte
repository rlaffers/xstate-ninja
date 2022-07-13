<script>
  import Intro from './Intro.svelte'

  const noMachineDetected = true
</script>

{#if noMachineDetected}
  <Intro />
{:else}
  <p>TODO: display the machine dropdown</p>
{/if}
