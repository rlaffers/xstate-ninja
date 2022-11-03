<script lang="ts">
  export let direction: 'horizontal' | 'vertical' = 'horizontal'
  export let previousTarget: HTMLElement = null
  export let nextTarget: HTMLElement = null

  // The current position of mouse
  let x = 0
  let y = 0

  // The dimension of the previous element
  let w1 = 0
  let h1 = 0
  let scrollbarWidth1 = 0
  // The dimension of the next element
  let w2 = 0
  let h2 = 0
  let scrollbarWidth2 = 0

  function getScrollbarWidth(element: HTMLElement): number {
    const width =
      direction === 'vertical'
        ? element.getBoundingClientRect().height - element.clientHeight
        : element.getBoundingClientRect().width - element.clientWidth
    return Math.abs(Math.round(width))
  }

  // Handle the mousedown event
  // that's triggered when user drags the resizer
  function mouseDownHandler(e: MouseEvent) {
    // Get the current mouse position
    x = e.clientX
    y = e.clientY

    // Calculate the dimension of element
    if (previousTarget) {
      const computedStyle = window.getComputedStyle(previousTarget)
      w1 = parseInt(computedStyle.width, 10)
      h1 = parseInt(computedStyle.height, 10)
      scrollbarWidth1 = getScrollbarWidth(previousTarget)
      // this allows overriding the default width/height
      previousTarget.classList.add('custom-sized')
    }
    if (nextTarget) {
      const computedStyle = window.getComputedStyle(nextTarget)
      w2 = parseInt(computedStyle.width, 10)
      h2 = parseInt(computedStyle.height, 10)
      scrollbarWidth2 = getScrollbarWidth(nextTarget)
      nextTarget.classList.add('custom-sized')
    }

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
    e.preventDefault()
  }

  function mouseMoveHandler(e: MouseEvent) {
    // How far the mouse has been moved
    const dx = e.clientX - x
    const dy = e.clientY - y

    // Adjust the dimension of element
    // horizontal: ← prev smaller, next larger
    // vertical: ^ prev smaller, next larger
    if (direction === 'horizontal') {
      if (previousTarget) {
        previousTarget.style.width = `${w1 + dx + scrollbarWidth1}px`
      }
      if (nextTarget) {
        nextTarget.style.width = `${w2 - dx + scrollbarWidth2}px`
      }
    } else {
      if (previousTarget) {
        previousTarget.style.height = `${h1 + dy + scrollbarWidth1}px`
      }
      if (nextTarget) {
        nextTarget.style.height = `${h1 - dy + scrollbarWidth2}px`
      }
    }
    e.preventDefault()
  }

  function mouseUpHandler() {
    document.removeEventListener('mousemove', mouseMoveHandler)
    document.removeEventListener('mouseup', mouseUpHandler)
  }
</script>

<div
  class={direction === 'horizontal' ? 'resizer-horizontal' : 'resizer-vertical'}
  on:mousedown={mouseDownHandler}
/>

<style>
  .resizer-horizontal {
    cursor: col-resize;
    width: 5px;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
    opacity: 0;
    transition: opacity 1s;
    background: repeating-linear-gradient(
      135deg,
      var(--content-muted),
      var(--content-muted) 1px,
      transparent 1px,
      transparent 4px
    );
    border-left: 1px solid var(--content-muted);
    border-right: 1px solid var(--content-muted);
  }

  .resizer-horizontal:hover {
    transition: none;
    opacity: 1;
  }

  .resizer-vertical {
    cursor: row-resize;
    height: 5px;
    width: 100%;
    position: sticky;
    left: 0;
    bottom: 0;
    z-index: 11;
    opacity: 0;
    transition: opacity 1s;
    background: repeating-linear-gradient(
      135deg,
      var(--content-muted),
      var(--content-muted) 1px,
      transparent 1px,
      transparent 4px
    );
    border-top: 1px solid var(--content-muted);
    border-bottom: 1px solid var(--content-muted);
  }

  .resizer-vertical:hover {
    transition: none;
    opacity: 1;
  }
</style>
