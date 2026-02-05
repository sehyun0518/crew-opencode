import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getProviderFromModel, validateAPIKeys } from '../../src/core/llm-clients'

describe('LLM Clients', () => {
  describe('getProviderFromModel', () => {
    it('should identify Anthropic models', () => {
      expect(getProviderFromModel('claude-opus-4.5')).toBe('anthropic')
      expect(getProviderFromModel('claude-sonnet-4.5')).toBe('anthropic')
      expect(getProviderFromModel('claude-haiku-4.5')).toBe('anthropic')
    })

    it('should identify OpenAI models', () => {
      expect(getProviderFromModel('gpt-5.2-medium')).toBe('openai')
      expect(getProviderFromModel('gpt-5.2-mini')).toBe('openai')
    })

    it('should identify Google models', () => {
      expect(getProviderFromModel('gemini-3-pro')).toBe('google')
      expect(getProviderFromModel('gemini-3-flash')).toBe('google')
    })

    it('should throw error for unknown model', () => {
      expect(() => getProviderFromModel('unknown-model')).toThrow('Unknown model provider')
    })
  })

  describe('validateAPIKeys', () => {
    const originalEnv = { ...process.env }

    beforeEach(() => {
      // Clear API keys from environment
      delete process.env.ANTHROPIC_API_KEY
      delete process.env.OPENAI_API_KEY
      delete process.env.GOOGLE_API_KEY
    })

    afterEach(() => {
      // Restore original environment
      process.env.ANTHROPIC_API_KEY = originalEnv.ANTHROPIC_API_KEY
      process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY
      process.env.GOOGLE_API_KEY = originalEnv.GOOGLE_API_KEY
    })

    it('should report all missing keys when none are set', () => {
      const result = validateAPIKeys()

      expect(result.anthropic).toBe(false)
      expect(result.openai).toBe(false)
      expect(result.google).toBe(false)
      expect(result.missing).toHaveLength(3)
      expect(result.missing).toContain('ANTHROPIC_API_KEY')
      expect(result.missing).toContain('OPENAI_API_KEY')
      expect(result.missing).toContain('GOOGLE_API_KEY')
    })

    it('should report only missing keys when some are set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'

      const result = validateAPIKeys()

      expect(result.anthropic).toBe(true)
      expect(result.openai).toBe(false)
      expect(result.google).toBe(false)
      expect(result.missing).toHaveLength(2)
      expect(result.missing).toContain('OPENAI_API_KEY')
      expect(result.missing).toContain('GOOGLE_API_KEY')
    })

    it('should report all keys present when all are set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key-1'
      process.env.OPENAI_API_KEY = 'test-key-2'
      process.env.GOOGLE_API_KEY = 'test-key-3'

      const result = validateAPIKeys()

      expect(result.anthropic).toBe(true)
      expect(result.openai).toBe(true)
      expect(result.google).toBe(true)
      expect(result.missing).toHaveLength(0)
    })
  })
})
