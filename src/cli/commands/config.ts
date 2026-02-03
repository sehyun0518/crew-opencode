import chalk from 'chalk'
import {
  loadConfig,
  resetConfig,
  getConfigValue,
  setConfigValue,
  getConfigSource,
  getLocalConfigPath,
  getGlobalConfigPath,
} from '../../config'

interface ConfigOptions {
  list?: boolean
  reset?: boolean
  global?: boolean
}

export async function configCommand(
  key: string | undefined,
  value: string | undefined,
  options: ConfigOptions
): Promise<void> {
  const location = options.global ? 'global' : 'local'

  console.log(chalk.bold('\ncrew-opencode configuration\n'))

  // Reset config
  if (options.reset) {
    resetConfig(location)
    const path = location === 'global' ? getGlobalConfigPath() : getLocalConfigPath()
    console.log(chalk.green(`Configuration reset to defaults.`))
    console.log(chalk.dim(`Location: ${path}`))
    return
  }

  // List all config
  if (options.list || (!key && !value)) {
    const config = loadConfig()
    const source = getConfigSource()

    console.log(chalk.dim(`Source: ${source}`))
    if (source === 'local') {
      console.log(chalk.dim(`Path: ${getLocalConfigPath()}`))
    } else if (source === 'global') {
      console.log(chalk.dim(`Path: ${getGlobalConfigPath()}`))
    }
    console.log()
    console.log(JSON.stringify(config, null, 2))
    return
  }

  // Get value
  if (key && !value) {
    const configValue = getConfigValue(key)
    if (configValue === undefined) {
      console.log(chalk.yellow(`Key "${key}" not found.`))
      console.log(chalk.dim('\nAvailable top-level keys: version, crew, sop, incidentReport, hooks'))
      return
    }

    console.log(chalk.dim(`${key}:`))
    if (typeof configValue === 'object') {
      console.log(JSON.stringify(configValue, null, 2))
    } else {
      console.log(configValue)
    }
    return
  }

  // Set value
  if (key && value) {
    // Parse value
    let parsedValue: unknown = value

    // Try to parse as JSON
    try {
      parsedValue = JSON.parse(value)
    } catch {
      // Try to parse as boolean
      if (value === 'true') {
        parsedValue = true
      } else if (value === 'false') {
        parsedValue = false
      } else if (!isNaN(Number(value))) {
        // Try to parse as number
        parsedValue = Number(value)
      }
      // Otherwise keep as string
    }

    try {
      setConfigValue(key, parsedValue, location)
      console.log(chalk.green(`Set ${key} = ${JSON.stringify(parsedValue)}`))
      console.log(chalk.dim(`Location: ${location === 'global' ? getGlobalConfigPath() : getLocalConfigPath()}`))
    } catch (error) {
      console.error(chalk.red(`Failed to set value:`), error)
    }
  }
}
