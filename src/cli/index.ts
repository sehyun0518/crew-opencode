#!/usr/bin/env bun
import { Command } from 'commander'
import chalk from 'chalk'
import { installCommand } from './commands/install'
import { uninstallCommand } from './commands/uninstall'
import { crewCommand } from './commands/crew'
import { configCommand } from './commands/config'
import { listCommand } from './commands/list'
import { doctorCommand } from './commands/doctor'
import { reportsCommand } from './commands/reports'

const VERSION = '1.0.0'

const program = new Command()

program
  .name('crew-opencode')
  .description(
    chalk.bold('crew-opencode') +
      ' - Multi-agent orchestration plugin for OpenCode\n\n' +
      chalk.dim('"Low-cost tasks to affordable agents; high-level reasoning to top-tier models."')
  )
  .version(VERSION, '-v, --version', 'Display version number')

program
  .command('install')
  .description('Install crew-opencode plugin to OpenCode')
  .option('-g, --global', 'Install globally to ~/.opencode/')
  .option('-l, --local', 'Install locally to .opencode/ (default)')
  .action(installCommand)

program
  .command('uninstall')
  .description('Remove crew-opencode plugin from OpenCode')
  .option('-g, --global', 'Uninstall from ~/.opencode/')
  .option('-l, --local', 'Uninstall from .opencode/ (default)')
  .action(uninstallCommand)

program
  .command('crew [task]')
  .description('Execute a task with the crew (like a strict manager)')
  .option('-s, --sop <type>', 'SOP type: feature, bugfix, refactor', 'feature')
  .option('--dry-run', 'Show execution plan without running')
  .action(crewCommand)

program
  .command('config [key] [value]')
  .description('Get or set configuration values')
  .option('--list', 'List all configuration values')
  .option('--reset', 'Reset configuration to defaults')
  .option('-g, --global', 'Use global configuration')
  .action(configCommand)

program
  .command('list')
  .description('List available agents and SOPs')
  .option('-a, --agents', 'List agents only')
  .option('-s, --sops', 'List SOPs only')
  .action(listCommand)

program
  .command('doctor')
  .description('Diagnose installation and configuration issues')
  .action(doctorCommand)

program
  .command('reports')
  .description('View incident reports (Apology Letters)')
  .option('-n, --limit <number>', 'Number of reports to show', '10')
  .option('--clear', 'Clear all reports')
  .action(reportsCommand)

program.parse()
