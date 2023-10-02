import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import getInspector, { configure, LogLevels } from '../src/index'

describe('configure', () => {
  beforeEach(() => {
    globalThis.__xstate_ninja__ = true
  })

  afterEach(() => {
    delete globalThis.__xstate_ninja__
  })

  it('should be a function ', () => {
    expect(typeof configure).toBe('function')
  })

  it('should enable/disable the inspector', () => {
    const inspector = getInspector()
    configure({ enabled: true })
    expect(inspector.enabled).toBe(true)
    configure({ enabled: false })
    expect(inspector.enabled).toBe(false)
  })

  it('should set log level', () => {
    const inspector = getInspector()
    configure({ logLevel: LogLevels.error })
    expect(inspector.logLevel).toBe(LogLevels.error)
    configure({ logLevel: LogLevels.warn })
    expect(inspector.logLevel).toBe(LogLevels.warn)
    configure({ logLevel: LogLevels.info })
    expect(inspector.logLevel).toBe(LogLevels.info)
    configure({ logLevel: LogLevels.debug })
    expect(inspector.logLevel).toBe(LogLevels.debug)
  })
})
