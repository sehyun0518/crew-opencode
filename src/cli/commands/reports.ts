import chalk from 'chalk'
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

interface ReportsOptions {
  limit?: string
  clear?: boolean
}

function getReportsDir(): string {
  const localPath = join(process.cwd(), '.opencode', 'crew-opencode', 'reports')
  const globalPath = join(homedir(), '.opencode', 'crew-opencode', 'reports')

  if (existsSync(localPath)) {
    return localPath
  }
  return globalPath
}

export async function reportsCommand(options: ReportsOptions): Promise<void> {
  const reportsDir = getReportsDir()
  const limit = parseInt(options.limit ?? '10', 10)

  console.log(chalk.bold('\ncrew-opencode - Incident Reports (Apology Letters)\n'))

  if (options.clear) {
    if (existsSync(reportsDir)) {
      rmSync(reportsDir, { recursive: true, force: true })
      console.log(chalk.green('All incident reports cleared.'))
    } else {
      console.log(chalk.yellow('No reports to clear.'))
    }
    return
  }

  if (!existsSync(reportsDir)) {
    console.log(chalk.dim('No incident reports found.'))
    console.log(chalk.dim('\nIncident reports are generated when agents encounter errors.'))
    return
  }

  const files = readdirSync(reportsDir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, limit)

  if (files.length === 0) {
    console.log(chalk.dim('No incident reports found.'))
    return
  }

  console.log(chalk.dim(`Showing ${files.length} most recent reports:\n`))

  for (const file of files) {
    try {
      const content = readFileSync(join(reportsDir, file), 'utf-8')
      const report = JSON.parse(content)

      console.log(chalk.bold.red(`[${report.timestamp}] ${report.agent}`))
      console.log(chalk.dim(`  Task: ${report.task}`))
      console.log(chalk.yellow(`  Root Cause: ${report.rootCause}`))
      console.log(chalk.dim(`  Risk: ${report.riskAnalysis}`))
      console.log(chalk.green(`  Prevention: ${report.preventionStrategy}`))
      console.log()
    } catch {
      console.log(chalk.dim(`  Could not parse ${file}`))
    }
  }
}
