import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { type CrewConfig, validateConfig, safeValidateConfig } from './schema'
import { DEFAULT_CONFIG } from './defaults'

/**
 * Configuration file name
 */
export const CONFIG_FILE_NAME = 'crew-opencode.json'

/**
 * Get global config directory path
 */
export function getGlobalConfigDir(): string {
  return join(homedir(), '.opencode', 'crew-opencode')
}

/**
 * Get local config directory path
 */
export function getLocalConfigDir(): string {
  return join(process.cwd(), '.opencode', 'crew-opencode')
}

/**
 * Get global config file path
 */
export function getGlobalConfigPath(): string {
  return join(getGlobalConfigDir(), CONFIG_FILE_NAME)
}

/**
 * Get local config file path
 */
export function getLocalConfigPath(): string {
  return join(getLocalConfigDir(), CONFIG_FILE_NAME)
}

/**
 * Deep merge two objects (immutable)
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T]
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T]
    }
  }

  return result
}

/**
 * Load configuration from a file
 */
function loadConfigFile(path: string): Partial<CrewConfig> | null {
  if (!existsSync(path)) {
    return null
  }

  try {
    const content = readFileSync(path, 'utf-8')
    return JSON.parse(content)
  } catch {
    console.warn(`Warning: Failed to parse config at ${path}`)
    return null
  }
}

/**
 * Load and merge configuration from all sources
 * Priority: local > global > defaults
 */
export function loadConfig(): CrewConfig {
  let config = { ...DEFAULT_CONFIG }

  // Load global config
  const globalConfig = loadConfigFile(getGlobalConfigPath())
  if (globalConfig) {
    config = deepMerge(config, globalConfig)
  }

  // Load local config (higher priority)
  const localConfig = loadConfigFile(getLocalConfigPath())
  if (localConfig) {
    config = deepMerge(config, localConfig)
  }

  // Validate final config
  const result = safeValidateConfig(config)
  if (!result.success || !result.data) {
    console.warn('Warning: Configuration validation failed, using defaults')
    console.warn(result.error?.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n'))
    return DEFAULT_CONFIG
  }

  return result.data
}

/**
 * Save configuration to file
 */
export function saveConfig(
  config: Partial<CrewConfig>,
  location: 'local' | 'global' = 'local'
): void {
  const configPath = location === 'global' ? getGlobalConfigPath() : getLocalConfigPath()
  const configDir = dirname(configPath)

  // Create directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  // Merge with existing config
  const existingConfig = loadConfigFile(configPath) ?? {}
  const mergedConfig = deepMerge(existingConfig as CrewConfig, config)

  // Validate before saving
  const validated = validateConfig(mergedConfig)

  // Write to file
  writeFileSync(configPath, JSON.stringify(validated, null, 2))
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(location: 'local' | 'global' = 'local'): void {
  saveConfig(DEFAULT_CONFIG, location)
}

/**
 * Get a specific config value by path (e.g., 'crew.pm.model')
 */
export function getConfigValue(path: string): unknown {
  const config = loadConfig()
  const keys = path.split('.')

  let current: unknown = config
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return current
}

/**
 * Set a specific config value by path (e.g., 'crew.pm.model', 'claude-sonnet-4.5')
 */
export function setConfigValue(
  path: string,
  value: unknown,
  location: 'local' | 'global' = 'local'
): void {
  const configPath = location === 'global' ? getGlobalConfigPath() : getLocalConfigPath()
  const existingConfig = loadConfigFile(configPath) ?? {}

  const keys = path.split('.')
  let current: Record<string, unknown> = existingConfig as Record<string, unknown>

  // Navigate to parent
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  // Set value
  const lastKey = keys[keys.length - 1]!
  current[lastKey] = value

  saveConfig(existingConfig as Partial<CrewConfig>, location)
}

/**
 * Check if configuration exists
 */
export function configExists(location: 'local' | 'global' | 'any' = 'any'): boolean {
  switch (location) {
    case 'local':
      return existsSync(getLocalConfigPath())
    case 'global':
      return existsSync(getGlobalConfigPath())
    case 'any':
      return existsSync(getLocalConfigPath()) || existsSync(getGlobalConfigPath())
  }
}

/**
 * Get config source (which file is being used)
 */
export function getConfigSource(): 'local' | 'global' | 'default' {
  if (existsSync(getLocalConfigPath())) {
    return 'local'
  }
  if (existsSync(getGlobalConfigPath())) {
    return 'global'
  }
  return 'default'
}
