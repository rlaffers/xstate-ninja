import type { XStateDevInterface } from './types'

declare global {
  interface Window {
    __xstate_ninja__?: XStateDevInterface
  }
}
