import chalk from 'chalk'
import { Orchestrator } from '../../core/orchestrator'
import { loadConfig } from '../../config'
import { getSOPDefinition } from '../../sop'
import type { SOPType } from '../../sop'

interface CrewOptions {
  sop?: string
  dryRun?: boolean
}

export async function crewCommand(
  task: string | undefined,
  options: CrewOptions
): Promise<void> {
  console.log(chalk.bold('\n🎯 crew-opencode - Multi-Agent Orchestration\n'))

  if (!task) {
    console.log(chalk.yellow('⚠  No task specified'))
    console.log(chalk.dim('\nUsage:'))
    console.log(chalk.dim('  crew-opencode crew "your task description"'))
    console.log(chalk.dim('\nOptions:'))
    console.log(chalk.dim('  -s, --sop <type>  SOP type: feature, bugfix, refactor (default: feature)'))
    console.log(chalk.dim('  --dry-run         Show execution plan without running'))
    console.log(chalk.dim('\nExamples:'))
    console.log(chalk.dim('  crew-opencode crew "Add authentication to the API"'))
    console.log(chalk.dim('  crew-opencode crew "Fix login timeout issue" --sop bugfix'))
    console.log(chalk.dim('  crew-opencode crew "Refactor user service" --sop refactor --dry-run'))
    return
  }

  // Validate SOP type
  const sopType = (options.sop ?? 'feature') as SOPType
  if (!['feature', 'bugfix', 'refactor'].includes(sopType)) {
    console.log(chalk.red(`\n❌ Invalid SOP type: ${sopType}`))
    console.log(chalk.dim('Valid types: feature, bugfix, refactor'))
    return
  }

  const isDryRun = options.dryRun ?? false

  console.log(chalk.dim('Task:'), chalk.bold(task))
  console.log(chalk.dim('SOP:'), chalk.cyan(sopType))
  console.log(chalk.dim('Mode:'), isDryRun ? chalk.yellow('Dry Run') : chalk.green('Live'))
  console.log()

  try {
    // Load SOP definition
    const sop = getSOPDefinition(sopType)

    // Display execution plan
    console.log(chalk.bold('📋 Execution Plan:\n'))
    console.log(chalk.dim(`Workflow: ${sop.name}`))
    console.log(chalk.dim(`Steps: ${sop.steps.length}`))
    console.log(chalk.dim(`Required Agents: ${sop.requiredAgents.join(', ').toUpperCase()}`))
    console.log()

    // Group steps by order
    const stepsByOrder = new Map<number, typeof sop.steps>()
    for (const step of sop.steps) {
      const group = stepsByOrder.get(step.order) || []
      group.push(step)
      stepsByOrder.set(step.order, group)
    }

    const orders = Array.from(stepsByOrder.keys()).sort((a, b) => a - b)

    for (const order of orders) {
      const steps = stepsByOrder.get(order) || []

      if (steps.length === 1) {
        const step = steps[0]
        if (step) {
          console.log(chalk.cyan(`  ${order}. ${step.agent.toUpperCase()}`))
          console.log(chalk.dim(`     ${step.action}`))
        }
      } else {
        console.log(chalk.cyan(`  ${order}. ${steps.map((s) => s.agent.toUpperCase()).join(' + ')} [Parallel]`))
        for (const step of steps) {
          console.log(chalk.dim(`     • ${step.agent.toUpperCase()}: ${step.action}`))
        }
      }
      console.log()
    }

    if (isDryRun) {
      console.log(chalk.yellow('✓ Dry run complete. No agents were executed.\n'))
      return
    }

    // Execute workflow
    console.log(chalk.bold('🚀 Starting execution...\n'))

    const config = await loadConfig()
    const orchestrator = new Orchestrator(config, process.cwd())

    // Register event handlers for progress tracking
    orchestrator.on((event) => {
      switch (event.type) {
        case 'workflow:start':
          console.log(chalk.green(`✓ Workflow started: ${event.sopName}`))
          console.log(chalk.dim(`  Workflow ID: ${event.workflowId}\n`))
          break

        case 'task:start':
          console.log(chalk.cyan(`→ ${event.agent.toUpperCase()} starting...`))
          break

        case 'task:complete':
          console.log(chalk.green(`✓ ${event.taskId} completed`))
          break

        case 'task:fail':
          console.log(chalk.red(`✗ ${event.taskId} failed`))
          if (event.error) {
            console.log(chalk.red(`  Error: ${event.error.message}`))
          }
          break

        case 'agent:progress':
          console.log(chalk.dim(`  ${event.progress.agent.toUpperCase()}: ${event.progress.message}`))
          break

        case 'incident:created':
          console.log(chalk.yellow(`⚠  Incident report created: ${event.report.id}`))
          break

        case 'workflow:complete':
          const mins = Math.floor(event.duration / 60000)
          const secs = Math.floor((event.duration % 60000) / 1000)
          console.log(chalk.green(`\n✓ Workflow completed in ${mins}m ${secs}s`))
          break

        case 'workflow:fail':
          console.log(chalk.red(`\n✗ Workflow failed: ${event.error.message}`))
          break
      }
    })

    const workflowState = await orchestrator.execute(task, sopType, process.cwd())

    // Display final summary
    console.log()
    console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log(chalk.bold('📊 Execution Summary'))
    console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log()
    console.log(chalk.dim('Status:'), workflowState.status === 'completed' ? chalk.green('✓ Completed') : chalk.red('✗ Failed'))
    console.log(chalk.dim('SOP:'), chalk.cyan(workflowState.sopName))
    console.log(chalk.dim('Steps:'), `${workflowState.currentStep}/${workflowState.totalSteps}`)

    if (workflowState.completedAt && workflowState.startedAt) {
      const duration = workflowState.completedAt.getTime() - workflowState.startedAt.getTime()
      const mins = Math.floor(duration / 60000)
      const secs = Math.floor((duration % 60000) / 1000)
      console.log(chalk.dim('Duration:'), `${mins}m ${secs}s`)
    }

    const completed = workflowState.tasks.filter((t) => t.status === 'completed').length
    const failed = workflowState.tasks.filter((t) => t.status === 'failed').length

    console.log(chalk.dim('Tasks:'), `${completed} completed, ${failed} failed`)

    console.log()
    console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))

    if (workflowState.status === 'completed') {
      console.log()
      console.log(chalk.green('✨ Task completed successfully!'))
      console.log()
    } else {
      console.log()
      console.log(chalk.red('⚠️  Task failed. Check incident reports for details.'))
      console.log(chalk.dim('Run `crew-opencode reports` to view incident reports\n'))
      process.exit(1)
    }
  } catch (error) {
    console.log()
    console.log(chalk.red('❌ Execution failed:'))
    console.log(chalk.red(error instanceof Error ? error.message : String(error)))
    console.log()
    process.exit(1)
  }
}
