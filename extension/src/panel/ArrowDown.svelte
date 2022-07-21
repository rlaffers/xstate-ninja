<script>
  import { fade } from 'svelte/transition'
</script>

<span class="arrow-down" transition:fade />

<style>
  .arrow-down {
    width: 50px;
    height: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    margin-bottom: -16px;
  }

  .arrow-down::after {
    content: '';
    display: block;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    border-width: 2px 2px 0 0;
    border-style: solid;
    border-color: var(--base01);
    transform-origin: 50% 50%;
    transform: translate(0.5px, -16px) rotate(135deg);
  }

  .arrow-down::before {
    content: '';
    display: block;
    width: 0;
    height: 30px;
    border-width: 0 2px 0 0;
    border-style: solid;
    border-color: var(--base01);
    transform-origin: 50% 50%;
  }
</style>
