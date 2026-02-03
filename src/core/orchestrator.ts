import type {
  CrewConfig,
  SOPDefinition,
} from '../config'
import type {
  Task,
  ExecutionPlan,
  WorkflowState,
  OrchestratorEvent,
  OrchestratorEventHandler,
  AgentError,
  IncidentReport,
} from './types'
import { createTaskFromStep, generateWorkflowId } from './types'
import { ContextManager } from './context-manager'
import { TaskQueue } from './task-queue'
import { AgentRunner } from './agent-runner'

/**
 * Orchestrator - PM coordinator for multi-agent workflows
 *
 * The Orchestrator is the brain of crew-opencode. It:
 * 1. Parses user requests
 * 2. Creates execution plans based on SOPs
 * 3. Delegates tasks to appropriate agents
 * 4. Manages parallel/sequential execution
 * 5. Aggregates results
 * 6. Handles failures and generates incident reports
 */
export class Orchestrator {
  private config: CrewConfig
  private contextManager: ContextManager
  private taskQueue: TaskQueue
  private agentRunner: AgentRunner
  private eventHandlers: OrchestratorEventHandler[] = []
  private workflowState?: WorkflowState

  constructor(config: CrewConfig) {
    this.config = config
    this.contextManager = new ContextManager('', '', process.cwd())
    this.taskQueue = new TaskQueue()
    this.agentRunner = new AgentRunner(this.contextManager)
  }

  /**
   * Execute a workflow based on user request
   */
  async execute(
    userRequest: string,
    sopName: 'feature' | 'bugfix' | 'refactor' = 'feature',
    projectPath: string = process.cwd()
  ): Promise<WorkflowState> {
    const workflowId = generateWorkflowId()

    // Initialize context
    this.contextManager = new ContextManager(sopName, userRequest, projectPath)

    // Emit workflow start event
    this.emit({
      type: 'workflow:start',
      workflowId,
      sopName,
    })

    try {
      // Step 1: Get SOP definition
      const sop = this.getSOP(sopName)

      // Step 2: Create execution plan
      const plan = this.createExecutionPlan(sop, workflowId)

      // Step 3: Initialize workflow state
      this.workflowState = {
        id: workflowId,
        sopName,
        status: 'running',
        currentStep: 0,
        totalSteps: plan.tasks.length,
        tasks: [...plan.tasks],
        context: this.contextManager.getContext(),
        startedAt: new Date(),
      }

      // Step 4: Add tasks to queue
      this.taskQueue.addTasks(plan.tasks)

      // Step 5: Execute tasks
      await this.executeTasks()

      // Step 6: Finalize workflow
      const finalState = this.finalizeWorkflow()

      // Emit workflow complete event
      this.emit({
        type: 'workflow:complete',
        workflowId,
        duration: Date.now() - this.workflowState.startedAt.getTime(),
      })

      return finalState
    } catch (error) {
      const agentError = this.createAgentError(error)

      // Update workflow state
      if (this.workflowState) {
        this.workflowState = {
          ...this.workflowState,
          status: 'failed',
          error: agentError,
          completedAt: new Date(),
        }
      }

      // Emit workflow fail event
      this.emit({
        type: 'workflow:fail',
        workflowId,
        error: agentError,
      })

      throw error
    }
  }

  /**
   * Execute all tasks in the queue
   */
  private async executeTasks(): Promise<void> {
    while (!this.taskQueue.isComplete() && !this.taskQueue.hasFailed()) {
      // Get next executable tasks
      const executableTasks = this.taskQueue.getNextExecutableTasks()

      if (executableTasks.length === 0) {
        // No tasks ready - check if we're deadlocked
        if (this.taskQueue.getPendingTasks().length > 0) {
          throw new Error('Task execution deadlock detected')
        }
        break
      }

      // Execute tasks (in parallel if multiple are ready)
      const promises = executableTasks.map((task) => this.executeTask(task))
      await Promise.all(promises)
    }

    // Check if any tasks failed
    if (this.taskQueue.hasFailed()) {
      const failedTasks = this.taskQueue.getFailedTasks()
      throw new Error(`Tasks failed: ${failedTasks.map((t) => t.id).join(', ')}`)
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: Task): Promise<void> {
    // Mark task as running
    this.taskQueue.updateTaskStatus(task.id, 'running')

    // Emit task start event
    this.emit({
      type: 'task:start',
      taskId: task.id,
      agent: task.agent,
    })

    try {
      // Get agent config
      const agentConfig = this.config.crew[task.agent]

      if (!agentConfig.enabled) {
        // Skip disabled agents
        this.taskQueue.updateTaskStatus(task.id, 'skipped')
        return
      }

      // Execute task with retry
      const result = await this.agentRunner.executeWithRetry(task, agentConfig, {
        onProgress: (phase, message, percentage) => {
          this.emit({
            type: 'agent:progress',
            progress: {
              taskId: task.id,
              agent: task.agent,
              phase: phase as 'starting' | 'thinking' | 'executing' | 'completing',
              message,
              percentage,
            },
          })
        },
      })

      if (result.success) {
        // Mark task as completed
        this.taskQueue.updateTaskStatus(task.id, 'completed')

        // Emit task complete event
        this.emit({
          type: 'task:complete',
          taskId: task.id,
          result,
        })
      } else {
        // Mark task as failed
        if (result.error) {
          this.taskQueue.markTaskFailed(task.id, new Error(result.error.message))
        }

        // Create incident report
        if (this.config.incidentReport.enabled && result.error) {
          const report = this.createIncidentReport(task, result.error)
          this.emit({
            type: 'incident:created',
            report,
          })
        }

        // Emit task fail event
        this.emit({
          type: 'task:fail',
          taskId: task.id,
          error: result.error || {
            code: 'UNKNOWN_ERROR',
            message: 'Task failed',
            recoverable: false,
          },
        })

        throw new Error(`Task ${task.id} failed: ${result.error?.message}`)
      }
    } catch (error) {
      // Mark task as failed
      this.taskQueue.markTaskFailed(
        task.id,
        error instanceof Error ? error : new Error(String(error))
      )

      throw error
    }
  }

  /**
   * Get SOP definition
   */
  private getSOP(sopName: 'feature' | 'bugfix' | 'refactor'): SOPDefinition {
    const sop = this.config.sop[sopName]

    if (!sop) {
      throw new Error(`SOP not found: ${sopName}`)
    }

    return sop
  }

  /**
   * Create execution plan from SOP
   */
  private createExecutionPlan(sop: SOPDefinition, workflowId: string): ExecutionPlan {
    const tasks: Task[] = []

    // Convert SOP steps to tasks
    for (const step of sop.steps) {
      const task = createTaskFromStep(step, workflowId)

      // Add dependencies based on step order
      // Tasks with the same order can run in parallel (if marked as parallel)
      // Tasks with higher order depend on all lower order tasks
      const dependsOn: string[] = []

      for (const prevStep of sop.steps) {
        if (prevStep.order < step.order) {
          const prevTaskId = `${workflowId}-${prevStep.order}-${prevStep.agent}`

          // Only add dependency if not explicitly marked as parallel
          if (!step.parallel || !step.parallel.includes(prevStep.agent)) {
            dependsOn.push(prevTaskId)
          }
        }
      }

      tasks.push({
        ...task,
        dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
      })
    }

    // Calculate critical path (longest path through dependencies)
    const criticalPath = this.calculateCriticalPath(tasks)

    return {
      workflowId,
      sopName: sop.name,
      tasks,
      criticalPath,
    }
  }

  /**
   * Calculate critical path through task dependencies
   */
  private calculateCriticalPath(tasks: ReadonlyArray<Task>): string[] {
    // Simple implementation: find longest chain of dependencies
    const taskMap = new Map(tasks.map((t) => [t.id, t]))
    let longestPath: string[] = []

    const findPath = (taskId: string, currentPath: string[]): string[] => {
      const task = taskMap.get(taskId)
      if (!task) return currentPath

      const newPath = [...currentPath, taskId]

      if (!task.dependsOn || task.dependsOn.length === 0) {
        return newPath
      }

      let longest = newPath
      for (const depId of task.dependsOn) {
        const path = findPath(depId, newPath)
        if (path.length > longest.length) {
          longest = path
        }
      }

      return longest
    }

    for (const task of tasks) {
      const path = findPath(task.id, [])
      if (path.length > longestPath.length) {
        longestPath = path
      }
    }

    return longestPath
  }

  /**
   * Finalize workflow and return final state
   */
  private finalizeWorkflow(): WorkflowState {
    if (!this.workflowState) {
      throw new Error('Workflow state not initialized')
    }

    const finalState: WorkflowState = {
      ...this.workflowState,
      status: this.taskQueue.hasFailed() ? 'failed' : 'completed',
      currentStep: this.workflowState.totalSteps,
      context: this.contextManager.getContext(),
      completedAt: new Date(),
    }

    return finalState
  }

  /**
   * Create incident report from failed task
   */
  private createIncidentReport(task: Task, error: AgentError): IncidentReport {
    const workflowId = this.contextManager.getWorkflowId()

    return {
      id: `incident-${Date.now()}`,
      timestamp: new Date(),
      workflowId,
      agent: task.agent,
      task,
      rootCause: error.message,
      riskAnalysis: this.analyzeRisk(task, error),
      preventionStrategy: this.suggestPrevention(task, error),
      context: error.context || {},
      stackTrace: error instanceof Error ? (error as Error).stack : undefined,
    }
  }

  /**
   * Analyze risk of a failed task
   */
  private analyzeRisk(task: Task, error: AgentError): string {
    const lines: string[] = [
      `## Risk Analysis`,
      ``,
      `**Agent**: ${task.agent}`,
      `**Action**: ${task.action}`,
      `**Error**: ${error.code}`,
      ``,
      `**Impact**:`,
    ]

    // Determine impact based on task priority and position in workflow
    if (task.priority === 'critical') {
      lines.push(`- This is a CRITICAL task - workflow cannot proceed`)
    } else if (task.priority === 'high') {
      lines.push(`- This is a HIGH priority task - significant impact on workflow`)
    } else {
      lines.push(`- This is a ${task.priority.toUpperCase()} priority task`)
    }

    if (!error.recoverable) {
      lines.push(`- Error is NOT recoverable - manual intervention required`)
    } else {
      lines.push(`- Error may be recoverable - retry possible`)
    }

    return lines.join('\n')
  }

  /**
   * Suggest prevention strategy for error
   */
  private suggestPrevention(task: Task, error: AgentError): string {
    const lines: string[] = [`## Prevention Strategy`, ``]

    // Suggest based on error code
    if (error.code.includes('TIMEOUT')) {
      lines.push(`- Increase timeout for ${task.agent} agent`)
      lines.push(`- Break down task into smaller subtasks`)
    } else if (error.code.includes('RATE_LIMIT')) {
      lines.push(`- Implement rate limiting and backoff strategy`)
      lines.push(`- Consider using a different model provider`)
    } else if (error.code.includes('VALIDATION')) {
      lines.push(`- Review input validation in SOP definition`)
      lines.push(`- Ensure all required inputs are available`)
    } else {
      lines.push(`- Review agent configuration for ${task.agent}`)
      lines.push(`- Check agent prompt and expected outputs`)
      lines.push(`- Verify model availability and API access`)
    }

    return lines.join('\n')
  }

  /**
   * Create agent error from exception
   */
  private createAgentError(error: unknown): AgentError {
    if (error instanceof Error) {
      return {
        code: error.name || 'ORCHESTRATOR_ERROR',
        message: error.message,
        recoverable: false,
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      recoverable: false,
    }
  }

  /**
   * Register event handler
   */
  on(handler: OrchestratorEventHandler): void {
    this.eventHandlers.push(handler)
  }

  /**
   * Emit event to all handlers
   */
  private emit(event: OrchestratorEvent): void {
    for (const handler of this.eventHandlers) {
      handler(event)
    }
  }

  /**
   * Get current workflow state
   */
  getWorkflowState(): WorkflowState | undefined {
    return this.workflowState
  }

  /**
   * Get task queue summary
   */
  getQueueSummary() {
    return this.taskQueue.getSummary()
  }

  /**
   * Get execution context
   */
  getContext() {
    return this.contextManager.getContext()
  }
}
