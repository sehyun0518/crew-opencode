import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import type { WorkflowState } from './types'

/**
 * WorkflowStorage - Persists workflow state to disk
 *
 * Stores workflow states as JSON files in .opencode/crew-opencode/workflows/
 * Enables querying workflow status and resuming interrupted workflows.
 */
export class WorkflowStorage {
  private storagePath: string

  constructor(projectPath: string) {
    this.storagePath = join(projectPath, '.opencode', 'crew-opencode', 'workflows')
    this.ensureStorageDirectory()
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDirectory(): void {
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true })
    }
  }

  /**
   * Save workflow state to disk
   */
  async save(workflow: WorkflowState): Promise<void> {
    const filePath = this.getWorkflowPath(workflow.id)
    const data = JSON.stringify(workflow, null, 2)
    writeFileSync(filePath, data, 'utf-8')
  }

  /**
   * Load workflow state from disk
   */
  async load(workflowId: string): Promise<WorkflowState | null> {
    const filePath = this.getWorkflowPath(workflowId)

    if (!existsSync(filePath)) {
      return null
    }

    try {
      const data = readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(data)

      // Convert date strings back to Date objects and create new WorkflowState
      const workflow: WorkflowState = {
        ...parsed,
        startedAt: new Date(parsed.startedAt),
        completedAt: parsed.completedAt ? new Date(parsed.completedAt) : undefined,
      }

      return workflow
    } catch (error) {
      console.error(`Failed to load workflow ${workflowId}:`, error)
      return null
    }
  }

  /**
   * List all workflows
   */
  async list(options?: {
    status?: WorkflowState['status']
    limit?: number
    sortBy?: 'startedAt' | 'completedAt'
  }): Promise<WorkflowState[]> {
    const files = readdirSync(this.storagePath).filter((f) => f.endsWith('.json'))

    let workflows: WorkflowState[] = []

    for (const file of files) {
      const workflowId = file.replace('.json', '')
      const workflow = await this.load(workflowId)
      if (workflow) {
        workflows.push(workflow)
      }
    }

    // Filter by status
    if (options?.status) {
      workflows = workflows.filter((w) => w.status === options.status)
    }

    // Sort
    const sortBy = options?.sortBy || 'startedAt'
    workflows.sort((a, b) => {
      const aDate = sortBy === 'completedAt' ? a.completedAt : a.startedAt
      const bDate = sortBy === 'completedAt' ? b.completedAt : b.startedAt

      if (!aDate || !bDate) return 0
      return bDate.getTime() - aDate.getTime() // Descending order
    })

    // Limit
    if (options?.limit) {
      workflows = workflows.slice(0, options.limit)
    }

    return workflows
  }

  /**
   * Delete workflow state from disk
   */
  async delete(workflowId: string): Promise<boolean> {
    const filePath = this.getWorkflowPath(workflowId)

    if (!existsSync(filePath)) {
      return false
    }

    try {
      unlinkSync(filePath)
      return true
    } catch (error) {
      console.error(`Failed to delete workflow ${workflowId}:`, error)
      return false
    }
  }

  /**
   * Delete old workflows (older than retentionDays)
   */
  async cleanup(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const workflows = await this.list()
    let deletedCount = 0

    for (const workflow of workflows) {
      // Delete if completed and older than retention period
      if (workflow.status === 'completed' && workflow.completedAt) {
        if (workflow.completedAt < cutoffDate) {
          const deleted = await this.delete(workflow.id)
          if (deleted) {
            deletedCount++
          }
        }
      }
    }

    return deletedCount
  }

  /**
   * Get workflow file path
   */
  private getWorkflowPath(workflowId: string): string {
    return join(this.storagePath, `${workflowId}.json`)
  }

  /**
   * Check if workflow exists
   */
  async exists(workflowId: string): Promise<boolean> {
    return existsSync(this.getWorkflowPath(workflowId))
  }

  /**
   * Get workflow summary (without loading full state)
   */
  async getSummary(workflowId: string): Promise<{
    id: string
    status: WorkflowState['status']
    sopName: string
    startedAt: Date
    completedAt?: Date
    currentStep: number
    totalSteps: number
  } | null> {
    const workflow = await this.load(workflowId)
    if (!workflow) {
      return null
    }

    return {
      id: workflow.id,
      status: workflow.status,
      sopName: workflow.sopName,
      startedAt: workflow.startedAt,
      completedAt: workflow.completedAt,
      currentStep: workflow.currentStep,
      totalSteps: workflow.totalSteps,
    }
  }
}
