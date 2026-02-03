import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
}

async function runChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  // Check OpenCode installation
  const opencodePath = join(homedir(), '.opencode')
  results.push({
    name: 'OpenCode directory',
    status: existsSync(opencodePath) ? 'pass' : 'warn',
    message: existsSync(opencodePath)
      ? `Found at ${opencodePath}`
      : 'Not found. Run `opencode` to initialize.',
  })

  // Check global installation
  const globalPath = join(homedir(), '.opencode', 'crew-opencode')
  results.push({
    name: 'Global installation',
    status: existsSync(globalPath) ? 'pass' : 'warn',
    message: existsSync(globalPath)
      ? `Installed at ${globalPath}`
      : 'Not installed globally.',
  })

  // Check local installation
  const localPath = join(process.cwd(), '.opencode', 'crew-opencode')
  results.push({
    name: 'Local installation',
    status: existsSync(localPath) ? 'pass' : 'warn',
    message: existsSync(localPath)
      ? `Installed at ${localPath}`
      : 'Not installed in current directory.',
  })

  // Check agents
  const agentsPath = existsSync(join(localPath, 'agents'))
    ? join(localPath, 'agents')
    : join(globalPath, 'agents')
  results.push({
    name: 'Agents',
    status: existsSync(agentsPath) ? 'pass' : 'fail',
    message: existsSync(agentsPath)
      ? 'All 5 agents available (PM, TA, FE, Design, QA)'
      : 'Agents not found. Run `crew-opencode install`.',
  })

  // Check SOPs
  const sopsPath = existsSync(join(localPath, 'sop'))
    ? join(localPath, 'sop')
    : join(globalPath, 'sop')
  results.push({
    name: 'SOPs',
    status: existsSync(sopsPath) ? 'pass' : 'fail',
    message: existsSync(sopsPath)
      ? 'All SOPs available (feature, bugfix, refactor)'
      : 'SOPs not found. Run `crew-opencode install`.',
  })

  // Check config
  const configPath = existsSync(join(localPath, 'crew-opencode.json'))
    ? join(localPath, 'crew-opencode.json')
    : join(globalPath, 'crew-opencode.json')
  results.push({
    name: 'Configuration',
    status: existsSync(configPath) ? 'pass' : 'warn',
    message: existsSync(configPath)
      ? `Found at ${configPath}`
      : 'Using default configuration.',
  })

  return results
}

export async function doctorCommand(): Promise<void> {
  console.log(chalk.bold('\ncrew-opencode doctor\n'))
  console.log(chalk.dim('Checking installation and configuration...\n'))

  const results = await runChecks()

  let hasErrors = false
  let hasWarnings = false

  for (const result of results) {
    let icon: string
    let color: (text: string) => string

    switch (result.status) {
      case 'pass':
        icon = chalk.green('\u2713')
        color = chalk.green
        break
      case 'warn':
        icon = chalk.yellow('\u26A0')
        color = chalk.yellow
        hasWarnings = true
        break
      case 'fail':
        icon = chalk.red('\u2717')
        color = chalk.red
        hasErrors = true
        break
    }

    console.log(`  ${icon} ${chalk.bold(result.name)}`)
    console.log(`    ${color(result.message)}`)
    console.log()
  }

  if (hasErrors) {
    console.log(chalk.red.bold('Some checks failed. Please fix the issues above.'))
  } else if (hasWarnings) {
    console.log(chalk.yellow.bold('Some warnings detected. Consider fixing them.'))
  } else {
    console.log(chalk.green.bold('All checks passed!'))
  }
}
