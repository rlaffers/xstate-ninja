<script>
  import { fade } from 'svelte/transition'
</script>

<span class="arrow-down" transition:fade />

<style>
  .arrow-down {
    width: 80px;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: -1;
    /* 2rem+2px is the height+border of event frame */
    transform: translateY(calc(-2rem - 2px));
    margin-bottom: -45px;
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
    height: 70px;
    border-width: 0 2px 0 0;
    border-style: solid;
    border-color: var(--base01);
    transform-origin: 50% 50%;
  }
</style>
