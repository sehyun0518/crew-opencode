import chalk from 'chalk'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

interface UninstallOptions {
  global?: boolean
  local?: boolean
}

export async function uninstallCommand(options: UninstallOptions): Promise<void> {
  const isGlobal = options.global ?? false
  const targetDir = isGlobal
    ? join(homedir(), '.opencode', 'crew-opencode')
    : join(process.cwd(), '.opencode', 'crew-opencode')

  console.log(chalk.bold('\ncrew-opencode uninstaller\n'))
  console.log(chalk.dim(`Removing from: ${targetDir}\n`))

  try {
    if (!existsSync(targetDir)) {
      console.log(chalk.yellow('crew-opencode is not installed at this location.'))
      return
    }

    rmSync(targetDir, { recursive: true, force: true })
    console.log(chalk.green('  Removed agents'))
    console.log(chalk.green('  Removed SOPs'))
    console.log(chalk.green('  Removed configuration'))

    console.log(chalk.bold.green('\nUninstallation complete!'))
  } catch (error) {
    console.error(chalk.red('\nUninstallation failed:'), error)
    process.exit(1)
  }
}
