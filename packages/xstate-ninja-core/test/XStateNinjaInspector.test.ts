import { describe, it, expect, afterEach } from 'vitest'
import getInspector from '../src/index'

describe('XStateNinjaInspector', () => {
  afterEach(() => {
    delete globalThis.__xstate_ninja__
  })

  it('should be the default export', () => {
    expect(getInspector).toBeDefined()
    expect(typeof getInspector).toBe('function')
  })

  it('should return a singleton', () => {
    expect(getInspector()).toBe(getInspector())
  })

  it('should return an instance with register,unregister,onRegister,onUpdate methods', () => {
    const inspector = getInspector()
    expect(typeof inspector.register).toBe('function')
    expect(typeof inspector.unregister).toBe('function')
    expect(typeof inspector.onUpdate).toBe('function')
    expect(typeof inspector.onRegister).toBe('function')
  })

  it('should be disabled when xstate-ninja browser extension is not installed', () => {
    expect(getInspector().enabled).toBe(false)
  })

  it('should be enabled if xstate-ninja browser extension is installed', () => {
    globalThis.__xstate_ninja__ = true
    expect(getInspector().enabled).toBe(true)
  })

  it('should be enabled/disabled with setEnabled method', () => {
    globalThis.__xstate_ninja__ = true
    const inspector = getInspector()
    inspector.setEnabled(true)
    expect(inspector.enabled).toBe(true)
    inspector.setEnabled(false)
    expect(inspector.enabled).toBe(false)
  })
})
