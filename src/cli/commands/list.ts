import chalk from 'chalk'
import { AGENT_METADATA } from '../../agents'
import { getAllSOPMetadata } from '../../sop'

interface ListOptions {
  agents?: boolean
  sops?: boolean
}

export async function listCommand(options: ListOptions): Promise<void> {
  const showAgents = options.agents ?? !options.sops
  const showSops = options.sops ?? !options.agents

  console.log(chalk.bold('\n📋 crew-opencode - Available Resources\n'))

  if (showAgents) {
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log(chalk.bold.cyan('Agents'))
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log()

    const agents = Object.entries(AGENT_METADATA)

    for (const [role, metadata] of agents) {
      const costBadge =
        metadata.costTier === 'high'
          ? chalk.red('⬆ HIGH')
          : metadata.costTier === 'medium'
            ? chalk.yellow('➡ MED')
            : chalk.green('⬇ LOW')

      console.log(
        chalk.bold(`  ${role.toUpperCase()}`),
        chalk.dim(`- ${metadata.name}`)
      )
      console.log(chalk.dim(`    Model: ${metadata.model}`), costBadge)
      console.log(chalk.dim(`    Role: ${metadata.description}`))
      console.log()
    }

    console.log(chalk.dim('Cost Tiers: ⬆ HIGH (complex reasoning) | ➡ MEDIUM (balanced) | ⬇ LOW (fast, repetitive)\n'))
  }

  if (showSops) {
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log(chalk.bold.cyan('SOPs (Standard Operating Procedures)'))
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log()

    const sops = getAllSOPMetadata()

    for (const [sopName, metadata] of Object.entries(sops)) {
      console.log(chalk.bold(`  ${sopName}`), chalk.dim(`(${metadata.estimatedTime})`))
      console.log(chalk.dim(`    ${metadata.description}`))
      console.log(
        chalk.dim(`    Steps: ${metadata.totalSteps} | Agents: ${metadata.requiredAgents.map((a) => a.toUpperCase()).join(', ')}`)
      )
      console.log()
    }

    console.log(chalk.dim('Usage: crew-opencode crew "task" --sop <name>\n'))
  }

  console.log(chalk.dim('For more details, run:'))
  console.log(chalk.dim('  • crew-opencode doctor    - Verify installation'))
  console.log(chalk.dim('  • crew-opencode reports   - View incident reports'))
  console.log(chalk.dim('  • crew "task"             - Execute a task\n'))
}
