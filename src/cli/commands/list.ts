import chalk from 'chalk'

interface ListOptions {
  agents?: boolean
  sops?: boolean
}

const AGENTS = [
  {
    role: 'PM',
    position: 'Project Manager',
    model: 'Opus 4.5',
    description: 'Coordinates parallel team members. Manages product strategy and executes plans.',
  },
  {
    role: 'TA',
    position: 'Technical Analyst',
    model: 'Claude Sonnet 4.5',
    description: 'Conducts research on documentation and performs deep codebase analysis.',
  },
  {
    role: 'FE',
    position: 'UI/UX Engineer',
    model: 'Gemini 3 Pro',
    description: 'Develops frontend logic and implements user interfaces.',
  },
  {
    role: 'Design',
    position: 'Designer',
    model: 'GPT 5.2 Medium',
    description: 'Reviews UI/UX flows and proposes design systems.',
  },
  {
    role: 'QA',
    position: 'Quality Assurance',
    model: 'Claude Haiku 4.5',
    description: 'Performs Unit Tests and E2E tests to verify stability.',
  },
]

const SOPS = [
  {
    name: 'feature',
    description: 'Standard procedure for implementing new features',
    agents: ['PM', 'TA', 'Design', 'FE', 'QA'],
  },
  {
    name: 'bugfix',
    description: 'Standard procedure for fixing bugs',
    agents: ['PM', 'TA', 'FE', 'QA'],
  },
  {
    name: 'refactor',
    description: 'Standard procedure for refactoring code',
    agents: ['PM', 'TA', 'FE', 'QA'],
  },
]

export async function listCommand(options: ListOptions): Promise<void> {
  const showAgents = options.agents ?? !options.sops
  const showSops = options.sops ?? !options.agents

  console.log(chalk.bold('\ncrew-opencode\n'))

  if (showAgents) {
    console.log(chalk.bold.cyan('Agents:\n'))
    for (const agent of AGENTS) {
      console.log(chalk.bold(`  ${agent.role}`), chalk.dim(`(${agent.position})`))
      console.log(chalk.dim(`    Model: ${agent.model}`))
      console.log(chalk.dim(`    ${agent.description}`))
      console.log()
    }
  }

  if (showSops) {
    console.log(chalk.bold.cyan('SOPs (Standard Operating Procedures):\n'))
    for (const sop of SOPS) {
      console.log(chalk.bold(`  ${sop.name}`))
      console.log(chalk.dim(`    ${sop.description}`))
      console.log(chalk.dim(`    Agents: ${sop.agents.join(' -> ')}`))
      console.log()
    }
  }
}
