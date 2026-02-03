import chalk from 'chalk'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

interface ConfigOptions {
  list?: boolean
  reset?: boolean
}

const DEFAULT_CONFIG = {
  version: '1.0',
  crew: {
    pm: { enabled: true, model: 'opus-4.5' },
    ta: { enabled: true, model: 'claude-sonnet-4.5' },
    fe: { enabled: true, model: 'gemini-3-pro' },
    design: { enabled: true, model: 'gpt-5.2-medium' },
    qa: { enabled: true, model: 'claude-haiku-4.5' },
  },
  sop: {
    default: 'feature',
  },
  incidentReport: {
    enabled: true,
    outputDir: '.opencode/crew-opencode/reports',
  },
}

function getConfigPath(): string {
  const localPath = join(process.cwd(), '.opencode', 'crew-opencode', 'crew-opencode.json')
  const globalPath = join(homedir(), '.opencode', 'crew-opencode', 'crew-opencode.json')

  if (existsSync(localPath)) {
    return localPath
  }
  return globalPath
}

function loadConfig(): Record<string, unknown> {
  const configPath = getConfigPath()
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf-8')
    return JSON.parse(content)
  }
  return DEFAULT_CONFIG
}

export async function configCommand(
  key: string | undefined,
  value: string | undefined,
  options: ConfigOptions
): Promise<void> {
  console.log(chalk.bold('\ncrew-opencode configuration\n'))

  if (options.reset) {
    const configPath = getConfigPath()
    writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2))
    console.log(chalk.green('Configuration reset to defaults.'))
    return
  }

  const config = loadConfig()

  if (options.list || (!key && !value)) {
    console.log(chalk.dim('Current configuration:\n'))
    console.log(JSON.stringify(config, null, 2))
    return
  }

  if (key && !value) {
    // Get value
    const keys = key.split('.')
    let current: unknown = config
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = (current as Record<string, unknown>)[k]
      } else {
        console.log(chalk.yellow(`Key "${key}" not found.`))
        return
      }
    }
    console.log(chalk.dim(`${key}:`), current)
    return
  }

  if (key && value) {
    // Set value
    console.log(chalk.green(`Set ${key} = ${value}`))
    console.log(chalk.dim('(Config persistence not yet implemented)'))
  }
}
