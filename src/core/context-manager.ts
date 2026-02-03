import type {
  ExecutionContext,
  ExecutionHistoryEntry,
  AgentRole,
  TaskStatus,
  Artifact,
} from './types'
import { generateWorkflowId } from './types'

/**
 * Maximum context size before summarization (in characters)
 */
const MAX_CONTEXT_SIZE = 50000

/**
 * ContextManager - Manages shared state between agents
 *
 * Responsibilities:
 * - Store and retrieve execution context
 * - Track execution history
 * - Manage artifacts
 * - Summarize context when it grows too large
 */
export class ContextManager {
  private context: ExecutionContext

  constructor(
    sopName: string,
    userRequest: string,
    projectPath: string = process.cwd()
  ) {
    this.context = {
      workflowId: generateWorkflowId(),
      sopName,
      userRequest,
      projectPath,
      startedAt: new Date(),
      data: {},
      outputs: {},
      artifacts: [],
      history: [],
    }
  }

  /**
   * Get the current execution context
   */
  getContext(): ExecutionContext {
    return this.context
  }

  /**
   * Get workflow ID
   */
  getWorkflowId(): string {
    return this.context.workflowId
  }

  /**
   * Set a data value in the context
   */
  setData(key: string, value: unknown): void {
    this.context = {
      ...this.context,
      data: {
        ...this.context.data,
        [key]: value,
      },
    }
    this.checkAndSummarize()
  }

  /**
   * Get a data value from the context
   */
  getData<T>(key: string): T | undefined {
    return this.context.data[key] as T | undefined
  }

  /**
   * Set an output value (result from an agent)
   */
  setOutput(key: string, value: unknown): void {
    this.context = {
      ...this.context,
      outputs: {
        ...this.context.outputs,
        [key]: value,
      },
    }
    this.checkAndSummarize()
  }

  /**
   * Get an output value
   */
  getOutput<T>(key: string): T | undefined {
    return this.context.outputs[key] as T | undefined
  }

  /**
   * Get all outputs
   */
  getAllOutputs(): Record<string, unknown> {
    return { ...this.context.outputs }
  }

  /**
   * Add an artifact
   */
  addArtifact(artifact: Artifact): void {
    this.context = {
      ...this.context,
      artifacts: [...this.context.artifacts, artifact],
    }
  }

  /**
   * Get all artifacts
   */
  getArtifacts(): ReadonlyArray<Artifact> {
    return this.context.artifacts
  }

  /**
   * Get artifacts by type
   */
  getArtifactsByType(type: Artifact['type']): ReadonlyArray<Artifact> {
    return this.context.artifacts.filter((a) => a.type === type)
  }

  /**
   * Add a history entry
   */
  addHistoryEntry(
    agent: AgentRole,
    action: string,
    status: TaskStatus,
    summary?: string
  ): void {
    const entry: ExecutionHistoryEntry = {
      timestamp: new Date(),
      agent,
      action,
      status,
      summary,
    }

    this.context = {
      ...this.context,
      history: [...this.context.history, entry],
    }
  }

  /**
   * Get execution history
   */
  getHistory(): ReadonlyArray<ExecutionHistoryEntry> {
    return this.context.history
  }

  /**
   * Get history for a specific agent
   */
  getAgentHistory(agent: AgentRole): ReadonlyArray<ExecutionHistoryEntry> {
    return this.context.history.filter((h) => h.agent === agent)
  }

  /**
   * Create a summary of the current context for an agent
   */
  createContextSummary(_forAgent: AgentRole): string {
    const lines: string[] = [
      `# Execution Context Summary`,
      ``,
      `## Workflow: ${this.context.sopName}`,
      `## Request: ${this.context.userRequest}`,
      ``,
      `## Previous Agent Outputs:`,
    ]

    // Add relevant outputs
    for (const [key, value] of Object.entries(this.context.outputs)) {
      const summary = this.summarizeValue(value)
      lines.push(`- ${key}: ${summary}`)
    }

    lines.push(``)
    lines.push(`## Recent History:`)

    // Add last 5 history entries
    const recentHistory = this.context.history.slice(-5)
    for (const entry of recentHistory) {
      lines.push(
        `- [${entry.agent.toUpperCase()}] ${entry.action}: ${entry.status}${entry.summary ? ` - ${entry.summary}` : ''}`
      )
    }

    lines.push(``)
    lines.push(`## Artifacts:`)
    for (const artifact of this.context.artifacts) {
      lines.push(`- ${artifact.type}: ${artifact.name}${artifact.path ? ` (${artifact.path})` : ''}`)
    }

    return lines.join('\n')
  }

  /**
   * Check if context is too large and summarize if needed
   */
  private checkAndSummarize(): void {
    const contextSize = JSON.stringify(this.context).length

    if (contextSize > MAX_CONTEXT_SIZE) {
      this.summarizeContext()
    }
  }

  /**
   * Summarize context to reduce size
   */
  private summarizeContext(): void {
    // Summarize large data values
    const summarizedData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(this.context.data)) {
      summarizedData[key] = this.summarizeIfLarge(value)
    }

    // Summarize large outputs
    const summarizedOutputs: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(this.context.outputs)) {
      summarizedOutputs[key] = this.summarizeIfLarge(value)
    }

    // Keep only recent history
    const recentHistory = this.context.history.slice(-20)

    this.context = {
      ...this.context,
      data: summarizedData,
      outputs: summarizedOutputs,
      history: recentHistory,
    }
  }

  /**
   * Summarize a value if it's too large
   */
  private summarizeIfLarge(value: unknown): unknown {
    const serialized = JSON.stringify(value)
    if (serialized.length > 5000) {
      return {
        _summarized: true,
        _originalLength: serialized.length,
        _preview: serialized.substring(0, 500) + '...',
      }
    }
    return value
  }

  /**
   * Create a short summary of a value for display
   */
  private summarizeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'null'
    }

    if (typeof value === 'string') {
      return value.length > 100 ? value.substring(0, 100) + '...' : value
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `[Array of ${value.length} items]`
      }
      const keys = Object.keys(value)
      return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`
    }

    return String(value)
  }

  /**
   * Export context for persistence
   */
  export(): ExecutionContext {
    return { ...this.context }
  }

  /**
   * Import context from persistence
   */
  static import(context: ExecutionContext): ContextManager {
    const manager = new ContextManager(
      context.sopName,
      context.userRequest,
      context.projectPath
    )
    manager.context = { ...context }
    return manager
  }
}
