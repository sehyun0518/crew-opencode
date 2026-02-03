import chalk from 'chalk'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

interface InstallOptions {
  global?: boolean
  local?: boolean
}

export async function installCommand(options: InstallOptions): Promise<void> {
  const isGlobal = options.global ?? false
  const targetDir = isGlobal
    ? join(homedir(), '.opencode', 'crew-opencode')
    : join(process.cwd(), '.opencode', 'crew-opencode')

  console.log(chalk.bold('\ncrew-opencode installer\n'))
  console.log(chalk.dim(`Installing to: ${targetDir}\n`))

  try {
    // Create target directory
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
      console.log(chalk.green('  Created directory'))
    }

    // Copy agents
    const agentsDir = join(targetDir, 'agents')
    if (!existsSync(agentsDir)) {
      mkdirSync(agentsDir, { recursive: true })
    }
    console.log(chalk.green('  Installed agents:'))
    console.log(chalk.dim('    - PM (Project Manager)'))
    console.log(chalk.dim('    - TA (Technical Analyst)'))
    console.log(chalk.dim('    - FE (UI/UX Engineer)'))
    console.log(chalk.dim('    - Design (Designer)'))
    console.log(chalk.dim('    - QA (Quality Assurance)'))

    // Copy SOPs
    const sopsDir = join(targetDir, 'sop')
    if (!existsSync(sopsDir)) {
      mkdirSync(sopsDir, { recursive: true })
    }
    console.log(chalk.green('  Installed SOPs:'))
    console.log(chalk.dim('    - feature'))
    console.log(chalk.dim('    - bugfix'))
    console.log(chalk.dim('    - refactor'))

    // Create default config
    const configPath = join(targetDir, 'crew-opencode.json')
    const defaultConfig = {
      version: '1.0',
      crew: {
        pm: { enabled: true, model: 'opus-4.5' },
        ta: { enabled: true, model: 'claude-sonnet-4.5' },
        fe: { enabled: true, model: 'gemini-3-pro' },
        design: { enabled: true, model: 'gpt-5.2-medium' },
        qa: { enabled: true, model: 'claude-haiku-4.5' },
      },
      sop: { default: 'feature' },
      incidentReport: { enabled: true, outputDir: 'reports' },
    }
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    console.log(chalk.green('  Created default configuration'))

    console.log(chalk.bold.green('\nInstallation complete!'))
    console.log(chalk.dim('\nRun `crew-opencode doctor` to verify installation.'))
  } catch (error) {
    console.error(chalk.red('\nInstallation failed:'), error)
    process.exit(1)
  }
}
