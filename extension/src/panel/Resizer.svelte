<script lang="ts">
  export let direction: 'horizontal' | 'vertical' = 'horizontal'
  export let target: HTMLElement = null

  // TODO prevent vertical resizer from growing horizontally and vice versa

  // The current position of mouse
  let x = 0
  let y = 0

  // The dimension of the element
  let w = 0
  let h = 0

  // Handle the mousedown event
  // that's triggered when user drags the resizer
  function mouseDownHandler(e: MouseEvent) {
    // Get the current mouse position
    x = e.clientX
    y = e.clientY

    // Calculate the dimension of element
    const styles = window.getComputedStyle(target)
    w = parseInt(styles.width, 10)
    h = parseInt(styles.height, 10)

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
    // this removes the max-height
    target.classList.add('custom-sized')
    target.style.width = `${w}px`
    target.style.height = `${h}px`
    e.preventDefault()
  }

  function mouseMoveHandler(e: MouseEvent) {
    // How far the mouse has been moved
    const dx = x - e.clientX
    const dy = e.clientY - y

    // Adjust the dimension of element
    if (direction === 'horizontal') {
      target.style.width = `${w + dx}px`
    } else {
      target.style.height = `${h + dy}px`
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
  }

  .resizer-vertical {
    cursor: row-resize;
    height: 5px;
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
  }
</style>
