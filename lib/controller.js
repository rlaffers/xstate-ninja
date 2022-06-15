import {
  flattenState,
  isTransitionGuarded,
  isTransitionForbidden,
  prettyJSON,
} from './utils'

export class Controller {
  constructor() {
    this.actor = null
    this.win = null
    this.elements = {}
    this.subscription = null
  }

  connect(win) {
    this.win = win
    this.elements.frames = this.win.document.querySelector('.frames')
    this.elements.details = this.win.document.querySelector('.details')
    this.elements.contextContent = this.win.document.querySelector(
      '.details > .context > .content'
    )
  }

  isScrolledToBottom(element) {
    return element.offsetHeight + element.scrollTop >= element.scrollHeight
  }

  // TODO make a webcomponent
  createEventFrame({ event, changed, configuration }) {
    const element = document.createElement('div')
    element.className = 'frame-event'
    element.innerText = event.type
    element.title = prettyJSON(event)
    if (changed) {
      element.classList.add('changed-state')
    } else if (isTransitionGuarded(event.type, configuration)) {
      element.classList.add('guard-not-passed')
    } else if (isTransitionForbidden(event.type, configuration)) {
      element.classList.add('forbidden')
    }
    return element
  }

  createStateNodeFrame(state) {
    const element = document.createElement('div')
    element.classList.add('frame-state-node', 'latest')
    element.innerHTML = flattenState(state.value)
    return element
  }

  addEventFrame(state) {
    const stickyScroll = this.isScrolledToBottom(this.elements.frames)
    const eventFrame = this.createEventFrame(state)
    this.elements.frames.append(eventFrame)
    if (stickyScroll) {
      this.scrollToFrame(eventFrame)
    }
  }

  addStateNodeFrame(state) {
    const stateNodes =
      this.elements.frames.querySelectorAll('.frame-state-node')
    if (stateNodes.length > 0) {
      stateNodes.item(stateNodes.length - 1).classList.remove('latest')
    }
    const stateNodeFrame = this.createStateNodeFrame(state)
    this.elements.frames.append(stateNodeFrame)
    this.scrollToFrame(stateNodeFrame)
  }

  updateContext(context) {
    this.elements.contextContent.innerHTML = prettyJSON(context)
  }

  scrollToFrame(element) {
    this.elements.frames.scrollTo(0, element.offsetTop)
  }

  reset() {
    this.elements.frames.innerHTML = ''
    this.elements.contextContent.innerHTML = ''
  }

  subscribe(actor) {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.reset()
    this.subscription = actor.subscribe((state) => {
      this.addEventFrame(state)
      this.updateContext(state.context)
      if (state.changed) {
        // this.addTransitionFrame(state)
        this.addStateNodeFrame(state)
      }
    })
  }
}
