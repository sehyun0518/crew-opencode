import { describe, it, expect } from 'vitest'
import { validateConfig, safeValidateConfig, DEFAULT_CONFIG } from '../../src/config'

describe('Configuration Schema', () => {
  describe('validateConfig', () => {
    it('should validate default config', () => {
      expect(() => validateConfig(DEFAULT_CONFIG)).not.toThrow()
    })

    it('should accept valid config', () => {
      const validConfig = {
        version: '1.0',
        crew: {
          pm: { enabled: true, model: 'claude-opus-4.5' as const, maxTurns: 10, temperature: 0.7 },
          ta: { enabled: true, model: 'claude-sonnet-4.5' as const, maxTurns: 15, temperature: 0.5 },
          fe: { enabled: true, model: 'gemini-3-pro' as const, maxTurns: 20, temperature: 0.7 },
          design: { enabled: true, model: 'gpt-5.2-medium' as const, maxTurns: 10, temperature: 0.8 },
          qa: { enabled: true, model: 'claude-haiku-4.5' as const, maxTurns: 15, temperature: 0.3 },
        },
        sop: { default: 'feature' as const },
        incidentReport: { enabled: true, outputDir: 'reports', format: 'json' as const, includeContext: true },
        hooks: { preToolUse: [], postToolUse: [], stop: [] },
      }

      expect(() => validateConfig(validConfig)).not.toThrow()
    })

    it('should accept partial config with defaults', () => {
      const partialConfig = {
        version: '1.0',
      }

      const validated = validateConfig(partialConfig)

      expect(validated.crew).toBeDefined()
      expect(validated.sop).toBeDefined()
    })
  })

  describe('safeValidateConfig', () => {
    it('should return success for valid config', () => {
      const result = safeValidateConfig(DEFAULT_CONFIG)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid config', () => {
      const invalidConfig = {
        version: 123, // Should be string
      }

      const result = safeValidateConfig(invalidConfig)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
    })
  })
})
