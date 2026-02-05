import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { vol } from 'memfs'
import { join } from 'node:path'
import {
  loadConfig,
  saveConfig,
  resetConfig,
  getConfigValue,
  setConfigValue,
  configExists,
  getConfigSource,
  getGlobalConfigDir,
  getLocalConfigDir,
  getGlobalConfigPath,
  getLocalConfigPath,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG,
  type CrewConfig,
} from '../../src/config'

// Mock fs module with memfs
vi.mock('node:fs', async () => {
  const memfs = await import('memfs')
  return memfs.fs
})

// Mock os.homedir
vi.mock('node:os', () => ({
  homedir: () => '/test/home',
}))

describe('Config Loader', () => {
  const testCwd = '/test/project'
  const testHome = '/test/home'

  beforeEach(() => {
    // Clear memfs
    vol.reset()

    // Mock process.cwd()
    vi.spyOn(process, 'cwd').mockReturnValue(testCwd)

    // Create test directories
    vol.mkdirSync(testCwd, { recursive: true })
    vol.mkdirSync(testHome, { recursive: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vol.reset()
  })

  describe('Path Functions', () => {
    it('should return global config directory', () => {
      const dir = getGlobalConfigDir()
      expect(dir).toBe(join(testHome, '.opencode', 'crew-opencode'))
    })

    it('should return local config directory', () => {
      const dir = getLocalConfigDir()
      expect(dir).toBe(join(testCwd, '.opencode', 'crew-opencode'))
    })

    it('should return global config path', () => {
      const path = getGlobalConfigPath()
      expect(path).toBe(join(testHome, '.opencode', 'crew-opencode', CONFIG_FILE_NAME))
    })

    it('should return local config path', () => {
      const path = getLocalConfigPath()
      expect(path).toBe(join(testCwd, '.opencode', 'crew-opencode', CONFIG_FILE_NAME))
    })

    it('should use correct config file name', () => {
      expect(CONFIG_FILE_NAME).toBe('crew-opencode.json')
    })
  })

  describe('loadConfig', () => {
    it('should return default config when no config files exist', () => {
      const config = loadConfig()

      expect(config).toEqual(DEFAULT_CONFIG)
    })

    it('should load global config', () => {
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(
        globalConfigPath,
        JSON.stringify({
          crew: {
            pm: { temperature: 0.9 },
          },
        })
      )

      const config = loadConfig()

      expect(config.crew.pm.temperature).toBe(0.9)
      expect(config.crew.pm.model).toBe(DEFAULT_CONFIG.crew.pm.model)
    })

    it('should load local config', () => {
      const localConfigPath = getLocalConfigPath()
      const localConfigDir = require('node:path').dirname(localConfigPath)

      vol.mkdirSync(localConfigDir, { recursive: true })
      vol.writeFileSync(
        localConfigPath,
        JSON.stringify({
          crew: {
            ta: { temperature: 0.3 },
          },
        })
      )

      const config = loadConfig()

      expect(config.crew.ta.temperature).toBe(0.3)
      expect(config.crew.ta.model).toBe(DEFAULT_CONFIG.crew.ta.model)
    })

    it('should prioritize local over global config', () => {
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)
      const localConfigPath = getLocalConfigPath()
      const localConfigDir = require('node:path').dirname(localConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.mkdirSync(localConfigDir, { recursive: true })

      vol.writeFileSync(
        globalConfigPath,
        JSON.stringify({
          crew: {
            pm: { temperature: 0.5 },
          },
        })
      )

      vol.writeFileSync(
        localConfigPath,
        JSON.stringify({
          crew: {
            pm: { temperature: 0.9 },
          },
        })
      )

      const config = loadConfig()

      expect(config.crew.pm.temperature).toBe(0.9) // Local wins
    })

    it('should merge nested config objects', () => {
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(
        globalConfigPath,
        JSON.stringify({
          crew: {
            pm: { temperature: 0.8, maxTurns: 5 },
            ta: { temperature: 0.6 },
          },
        })
      )

      const config = loadConfig()

      expect(config.crew.pm.temperature).toBe(0.8)
      expect(config.crew.pm.maxTurns).toBe(5)
      expect(config.crew.pm.model).toBe(DEFAULT_CONFIG.crew.pm.model) // Still has default
      expect(config.crew.ta.temperature).toBe(0.6)
    })

    it('should warn and use defaults for invalid JSON', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(globalConfigPath, 'invalid json {')

      const config = loadConfig()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse config')
      )
      expect(config).toEqual(DEFAULT_CONFIG)

      consoleWarnSpy.mockRestore()
    })

    it('should warn and use defaults for invalid config schema', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(
        globalConfigPath,
        JSON.stringify({
          version: 123, // Invalid: should be string
        })
      )

      const config = loadConfig()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Configuration validation failed')
      )
      expect(config).toEqual(DEFAULT_CONFIG)

      consoleWarnSpy.mockRestore()
    })
  })

  describe('saveConfig', () => {
    it('should save config to local path by default', () => {
      const partialConfig = {
        ...DEFAULT_CONFIG,
        crew: {
          ...DEFAULT_CONFIG.crew,
          pm: { ...DEFAULT_CONFIG.crew.pm, temperature: 0.95 },
        },
      }

      saveConfig(partialConfig)

      const localConfigPath = getLocalConfigPath()
      expect(vol.existsSync(localConfigPath)).toBe(true)

      const saved = JSON.parse(vol.readFileSync(localConfigPath, 'utf-8') as string)
      expect(saved.crew.pm.temperature).toBe(0.95)
    })

    it('should save config to global path when specified', () => {
      const partialConfig = {
        ...DEFAULT_CONFIG,
        crew: {
          ...DEFAULT_CONFIG.crew,
          ta: { ...DEFAULT_CONFIG.crew.ta, temperature: 0.4 },
        },
      }

      saveConfig(partialConfig, 'global')

      const globalConfigPath = getGlobalConfigPath()
      expect(vol.existsSync(globalConfigPath)).toBe(true)

      const saved = JSON.parse(vol.readFileSync(globalConfigPath, 'utf-8') as string)
      expect(saved.crew.ta.temperature).toBe(0.4)
    })

    it('should create config directory if it does not exist', () => {
      const localConfigDir = getLocalConfigDir()
      expect(vol.existsSync(localConfigDir)).toBe(false)

      const validConfig = {
        ...DEFAULT_CONFIG,
        crew: {
          ...DEFAULT_CONFIG.crew,
          pm: { ...DEFAULT_CONFIG.crew.pm, temperature: 0.7 },
        },
      }
      saveConfig(validConfig)

      expect(vol.existsSync(localConfigDir)).toBe(true)
    })

    it('should merge with existing config', () => {
      const localConfigPath = getLocalConfigPath()
      const localConfigDir = require('node:path').dirname(localConfigPath)

      vol.mkdirSync(localConfigDir, { recursive: true })
      vol.writeFileSync(
        localConfigPath,
        JSON.stringify({
          ...DEFAULT_CONFIG,
          crew: {
            ...DEFAULT_CONFIG.crew,
            pm: { ...DEFAULT_CONFIG.crew.pm, temperature: 0.5, maxTurns: 5 },
          },
        })
      )

      const updateConfig = {
        ...DEFAULT_CONFIG,
        crew: {
          ...DEFAULT_CONFIG.crew,
          pm: { ...DEFAULT_CONFIG.crew.pm, temperature: 0.9 },
        },
      }
      saveConfig(updateConfig)

      const saved = JSON.parse(vol.readFileSync(localConfigPath, 'utf-8') as string)
      expect(saved.crew.pm.temperature).toBe(0.9) // Updated
      expect(saved.crew.pm.maxTurns).toBe(10) // From merged DEFAULT_CONFIG
    })

    it('should validate config before saving', () => {
      const partialConfig: Partial<CrewConfig> = {
        crew: {
          pm: { enabled: true, model: 'claude-opus-4.5', maxTurns: 10, temperature: 0.7 },
          ta: { enabled: true, model: 'claude-sonnet-4.5', maxTurns: 15, temperature: 0.5 },
          fe: { enabled: true, model: 'gemini-3-pro', maxTurns: 20, temperature: 0.7 },
          design: { enabled: true, model: 'gpt-5.2-medium', maxTurns: 10, temperature: 0.8 },
          qa: { enabled: true, model: 'claude-haiku-4.5', maxTurns: 15, temperature: 0.3 },
        },
      }

      expect(() => saveConfig(partialConfig)).not.toThrow()
    })
  })

  describe('resetConfig', () => {
    it('should reset local config to defaults', () => {
      const localConfigPath = getLocalConfigPath()
      const localConfigDir = require('node:path').dirname(localConfigPath)

      vol.mkdirSync(localConfigDir, { recursive: true })
      vol.writeFileSync(
        localConfigPath,
        JSON.stringify({ crew: { pm: { temperature: 0.9 } } })
      )

      resetConfig('local')

      const saved = JSON.parse(vol.readFileSync(localConfigPath, 'utf-8') as string)
      expect(saved.crew.pm.temperature).toBe(DEFAULT_CONFIG.crew.pm.temperature)
    })

    it('should reset global config to defaults', () => {
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(
        globalConfigPath,
        JSON.stringify({ crew: { pm: { temperature: 0.9 } } })
      )

      resetConfig('global')

      const saved = JSON.parse(vol.readFileSync(globalConfigPath, 'utf-8') as string)
      expect(saved.crew.pm.temperature).toBe(DEFAULT_CONFIG.crew.pm.temperature)
    })

    it('should reset local config by default', () => {
      const localConfigPath = getLocalConfigPath()

      resetConfig()

      expect(vol.existsSync(localConfigPath)).toBe(true)
    })
  })

  describe('getConfigValue', () => {
    it('should get nested config value', () => {
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(
        globalConfigPath,
        JSON.stringify({
          crew: {
            pm: { temperature: 0.85 },
          },
        })
      )

      const value = getConfigValue('crew.pm.temperature')

      expect(value).toBe(0.85)
    })

    it('should return undefined for non-existent path', () => {
      const value = getConfigValue('crew.nonexistent.path')

      expect(value).toBeUndefined()
    })

    it('should return undefined for null intermediate value', () => {
      const value = getConfigValue('crew.pm.nonexistent.deep')

      expect(value).toBeUndefined()
    })

    it('should get top-level config value', () => {
      const value = getConfigValue('version')

      expect(value).toBe(DEFAULT_CONFIG.version)
    })
  })

  describe('setConfigValue', () => {
    it('should set nested config value in local config', () => {
      // First save a valid complete config
      saveConfig(DEFAULT_CONFIG)

      setConfigValue('crew.pm.temperature', 0.95)

      const value = getConfigValue('crew.pm.temperature')

      expect(value).toBe(0.95)
    })

    it('should set nested config value in global config', () => {
      // First save a valid complete config
      saveConfig(DEFAULT_CONFIG, 'global')

      setConfigValue('crew.ta.temperature', 0.4, 'global')

      const globalConfigPath = getGlobalConfigPath()
      const saved = JSON.parse(vol.readFileSync(globalConfigPath, 'utf-8') as string)

      expect(saved.crew.ta.temperature).toBe(0.4)
    })

    it('should create intermediate objects if they do not exist', () => {
      // First save a valid complete config
      saveConfig(DEFAULT_CONFIG)

      // Set a valid nested path that might not exist in current config
      setConfigValue('sop.default', 'bugfix')

      const value = getConfigValue('sop.default')

      expect(value).toBe('bugfix')
    })

    it('should preserve existing config when setting new value', () => {
      const localConfigPath = getLocalConfigPath()
      const localConfigDir = require('node:path').dirname(localConfigPath)

      vol.mkdirSync(localConfigDir, { recursive: true })
      vol.writeFileSync(
        localConfigPath,
        JSON.stringify({
          ...DEFAULT_CONFIG,
          crew: {
            ...DEFAULT_CONFIG.crew,
            pm: { ...DEFAULT_CONFIG.crew.pm, temperature: 0.5, maxTurns: 5 },
          },
        })
      )

      setConfigValue('crew.pm.temperature', 0.9)

      const saved = JSON.parse(vol.readFileSync(localConfigPath, 'utf-8') as string)
      expect(saved.crew.pm.temperature).toBe(0.9)
      expect(saved.crew.pm.maxTurns).toBe(5)
    })
  })

  describe('configExists', () => {
    it('should return false when no config exists', () => {
      expect(configExists('local')).toBe(false)
      expect(configExists('global')).toBe(false)
      expect(configExists('any')).toBe(false)
    })

    it('should return true when local config exists', () => {
      const localConfigPath = getLocalConfigPath()
      const localConfigDir = require('node:path').dirname(localConfigPath)

      vol.mkdirSync(localConfigDir, { recursive: true })
      vol.writeFileSync(localConfigPath, JSON.stringify({}))

      expect(configExists('local')).toBe(true)
      expect(configExists('any')).toBe(true)
    })

    it('should return true when global config exists', () => {
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(globalConfigPath, JSON.stringify({}))

      expect(configExists('global')).toBe(true)
      expect(configExists('any')).toBe(true)
    })

    it('should return true for any when either config exists', () => {
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(globalConfigPath, JSON.stringify({}))

      expect(configExists('any')).toBe(true)
    })
  })

  describe('getConfigSource', () => {
    it('should return default when no config exists', () => {
      expect(getConfigSource()).toBe('default')
    })

    it('should return local when local config exists', () => {
      const localConfigPath = getLocalConfigPath()
      const localConfigDir = require('node:path').dirname(localConfigPath)

      vol.mkdirSync(localConfigDir, { recursive: true })
      vol.writeFileSync(localConfigPath, JSON.stringify({}))

      expect(getConfigSource()).toBe('local')
    })

    it('should return global when only global config exists', () => {
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(globalConfigPath, JSON.stringify({}))

      expect(getConfigSource()).toBe('global')
    })

    it('should prioritize local over global', () => {
      const localConfigPath = getLocalConfigPath()
      const localConfigDir = require('node:path').dirname(localConfigPath)
      const globalConfigPath = getGlobalConfigPath()
      const globalConfigDir = require('node:path').dirname(globalConfigPath)

      vol.mkdirSync(localConfigDir, { recursive: true })
      vol.mkdirSync(globalConfigDir, { recursive: true })
      vol.writeFileSync(localConfigPath, JSON.stringify({}))
      vol.writeFileSync(globalConfigPath, JSON.stringify({}))

      expect(getConfigSource()).toBe('local')
    })
  })
})
