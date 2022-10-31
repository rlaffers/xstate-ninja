<script lang="ts">
  export let direction: 'horizontal' | 'vertical' = 'horizontal'
  export let target: HTMLElement = null

  // The current position of mouse
  let x = 0
  let y = 0

  // The dimension of the element
  let w = 0
  let h = 0
  let scrollbarWidth = 0

  function getScrollbarWidth(element: HTMLElement): number {
    const width = (scrollbarWidth =
      direction === 'vertical'
        ? element.getBoundingClientRect().height - element.clientHeight
        : element.getBoundingClientRect().width - element.clientWidth)
    return Math.abs(Math.round(width))
  }

  // Handle the mousedown event
  // that's triggered when user drags the resizer
  function mouseDownHandler(e: MouseEvent) {
    // Get the current mouse position
    x = e.clientX
    y = e.clientY

    // Calculate the dimension of element
    const computedStyle = window.getComputedStyle(target)
    w = parseInt(computedStyle.width, 10)
    h = parseInt(computedStyle.height, 10)
    scrollbarWidth = getScrollbarWidth(target)

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
    // this removes the max-height
    target.classList.add('custom-sized')
    e.preventDefault()
  }

  function mouseMoveHandler(e: MouseEvent) {
    // How far the mouse has been moved
    const dx = x - e.clientX
    const dy = e.clientY - y

    // Adjust the dimension of element
    if (direction === 'horizontal') {
      target.style.width = `${w + dx + scrollbarWidth}px`
    } else {
      target.style.height = `${h + dy + scrollbarWidth}px`
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
  }

  .resizer-vertical {
    cursor: row-resize;
    height: 5px;
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 11;
  }
</style>
