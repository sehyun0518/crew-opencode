import { describe, it, expect } from 'vitest'
import * as configModule from '../../src/config'

describe('Config Module Exports', () => {
  describe('Schema exports', () => {
    it('should export schema types', () => {
      expect(configModule.CrewConfigSchema).toBeDefined()
      expect(configModule.AgentConfigSchema).toBeDefined()
      expect(configModule.SOPDefinitionSchema).toBeDefined()
      expect(configModule.SOPStepSchema).toBeDefined()
      expect(configModule.IncidentReportConfigSchema).toBeDefined()
      expect(configModule.HooksConfigSchema).toBeDefined()
      expect(configModule.ModelIdSchema).toBeDefined()
      expect(configModule.ModelProviderSchema).toBeDefined()
    })

    it('should export validation functions', () => {
      expect(typeof configModule.validateConfig).toBe('function')
      expect(typeof configModule.safeValidateConfig).toBe('function')
    })
  })

  describe('Defaults exports', () => {
    it('should export default config', () => {
      expect(configModule.DEFAULT_CONFIG).toBeDefined()
      expect(configModule.DEFAULT_CONFIG.version).toBe('1.0')
    })

    it('should export default SOPs', () => {
      expect(configModule.DEFAULT_SOP_FEATURE).toBeDefined()
      expect(configModule.DEFAULT_SOP_BUGFIX).toBeDefined()
      expect(configModule.DEFAULT_SOP_REFACTOR).toBeDefined()
    })
  })

  describe('Loader exports', () => {
    it('should export config functions', () => {
      expect(typeof configModule.loadConfig).toBe('function')
      expect(typeof configModule.saveConfig).toBe('function')
      expect(typeof configModule.resetConfig).toBe('function')
      expect(typeof configModule.getConfigValue).toBe('function')
      expect(typeof configModule.setConfigValue).toBe('function')
      expect(typeof configModule.configExists).toBe('function')
      expect(typeof configModule.getConfigSource).toBe('function')
    })

    it('should export path functions', () => {
      expect(typeof configModule.getGlobalConfigDir).toBe('function')
      expect(typeof configModule.getLocalConfigDir).toBe('function')
      expect(typeof configModule.getGlobalConfigPath).toBe('function')
      expect(typeof configModule.getLocalConfigPath).toBe('function')
    })

    it('should export constants', () => {
      expect(configModule.CONFIG_FILE_NAME).toBe('crew-opencode.json')
    })
  })

  describe('Module integration', () => {
    it('should allow using exported defaults with validation', () => {
      const result = configModule.safeValidateConfig(configModule.DEFAULT_CONFIG)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should allow creating valid config from defaults', () => {
      const config = configModule.DEFAULT_CONFIG

      expect(() => configModule.validateConfig(config)).not.toThrow()
    })
  })
})
