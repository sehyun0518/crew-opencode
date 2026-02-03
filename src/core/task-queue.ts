import type {
  Task,
  TaskStatus,
  OrchestratorEvent,
  OrchestratorEventHandler,
} from './types'

/**
 * TaskQueue - Manages task execution with parallel and sequential support
 *
 * Responsibilities:
 * - Queue tasks for execution
 * - Determine which tasks can run in parallel
 * - Respect task dependencies
 * - Track task status
 * - Emit events for task lifecycle
 */
export class TaskQueue {
  private tasks: Map<string, Task> = new Map()
  private eventHandlers: OrchestratorEventHandler[] = []

  /**
   * Add a task to the queue
   */
  addTask(task: Task): void {
    this.tasks.set(task.id, task)
  }

  /**
   * Add multiple tasks to the queue
   */
  addTasks(tasks: ReadonlyArray<Task>): void {
    for (const task of tasks) {
      this.addTask(task)
    }
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * Get all tasks
   */
  getAllTasks(): ReadonlyArray<Task> {
    return Array.from(this.tasks.values())
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): ReadonlyArray<Task> {
    return Array.from(this.tasks.values()).filter((t) => t.status === status)
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    const updatedTask = {
      ...task,
      status,
      startedAt: status === 'running' ? new Date() : task.startedAt,
      completedAt:
        status === 'completed' || status === 'failed' ? new Date() : undefined,
    }

    this.tasks.set(taskId, updatedTask)
  }

  /**
   * Mark task as failed with error
   */
  markTaskFailed(taskId: string, error: Error): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    const updatedTask = {
      ...task,
      status: 'failed' as TaskStatus,
      error,
      completedAt: new Date(),
    }

    this.tasks.set(taskId, updatedTask)
  }

  /**
   * Get next executable tasks (tasks that are ready to run)
   *
   * A task is ready to run if:
   * - Status is 'pending'
   * - All dependencies are completed
   * - No parallel conflicts with currently running tasks
   */
  getNextExecutableTasks(): ReadonlyArray<Task> {
    const pending = this.getTasksByStatus('pending')
    const running = this.getTasksByStatus('running')

    const executable: Task[] = []

    for (const task of pending) {
      // Check if dependencies are met
      if (task.dependsOn) {
        const allDependenciesMet = task.dependsOn.every((depId) => {
          const depTask = this.tasks.get(depId)
          return depTask && depTask.status === 'completed'
        })

        if (!allDependenciesMet) {
          continue
        }
      }

      // Check if any parallel tasks are already running
      const hasConflicts = running.some((runningTask) => {
        // If task has parallel constraints, check conflicts
        if (task.parallelWith) {
          return !task.parallelWith.includes(runningTask.id)
        }
        // By default, tasks don't run in parallel unless explicitly specified
        return true
      })

      if (!hasConflicts || running.length === 0) {
        executable.push(task)
      }
    }

    // Sort by priority (critical > high > medium > low)
    return executable.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Check if all tasks are completed
   */
  isComplete(): boolean {
    const allTasks = Array.from(this.tasks.values())
    return allTasks.every(
      (task) => task.status === 'completed' || task.status === 'skipped'
    )
  }

  /**
   * Check if any tasks have failed
   */
  hasFailed(): boolean {
    return Array.from(this.tasks.values()).some((task) => task.status === 'failed')
  }

  /**
   * Get failed tasks
   */
  getFailedTasks(): ReadonlyArray<Task> {
    return this.getTasksByStatus('failed')
  }

  /**
   * Get completed tasks
   */
  getCompletedTasks(): ReadonlyArray<Task> {
    return this.getTasksByStatus('completed')
  }

  /**
   * Get running tasks
   */
  getRunningTasks(): ReadonlyArray<Task> {
    return this.getTasksByStatus('running')
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): ReadonlyArray<Task> {
    return this.getTasksByStatus('pending')
  }

  /**
   * Calculate progress percentage
   */
  getProgress(): number {
    const allTasks = Array.from(this.tasks.values())
    if (allTasks.length === 0) return 0

    const completedCount = allTasks.filter(
      (t) => t.status === 'completed' || t.status === 'skipped'
    ).length

    return Math.round((completedCount / allTasks.length) * 100)
  }

  /**
   * Register an event handler
   */
  on(handler: OrchestratorEventHandler): void {
    this.eventHandlers.push(handler)
  }

  /**
   * Emit an event
   */
  emit(event: OrchestratorEvent): void {
    for (const handler of this.eventHandlers) {
      handler(event)
    }
  }

  /**
   * Get execution summary
   */
  getSummary(): {
    total: number
    pending: number
    running: number
    completed: number
    failed: number
    skipped: number
    progress: number
  } {
    const allTasks = Array.from(this.tasks.values())

    return {
      total: allTasks.length,
      pending: allTasks.filter((t) => t.status === 'pending').length,
      running: allTasks.filter((t) => t.status === 'running').length,
      completed: allTasks.filter((t) => t.status === 'completed').length,
      failed: allTasks.filter((t) => t.status === 'failed').length,
      skipped: allTasks.filter((t) => t.status === 'skipped').length,
      progress: this.getProgress(),
    }
  }

  /**
   * Reset the queue (clear all tasks)
   */
  reset(): void {
    this.tasks.clear()
  }

  /**
   * Create dependency graph for visualization
   */
  getDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>()

    for (const [taskId, task] of this.tasks) {
      graph.set(taskId, task.dependsOn ? [...task.dependsOn] : [])
    }

    return graph
  }

  /**
   * Detect circular dependencies
   */
  hasCircularDependencies(): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (taskId: string): boolean => {
      visited.add(taskId)
      recursionStack.add(taskId)

      const task = this.tasks.get(taskId)
      if (task?.dependsOn) {
        for (const depId of task.dependsOn) {
          if (!visited.has(depId)) {
            if (hasCycle(depId)) return true
          } else if (recursionStack.has(depId)) {
            return true
          }
        }
      }

      recursionStack.delete(taskId)
      return false
    }

    for (const taskId of this.tasks.keys()) {
      if (!visited.has(taskId)) {
        if (hasCycle(taskId)) return true
      }
    }

    return false
  }
}
