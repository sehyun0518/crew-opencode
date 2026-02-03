import type {
  AgentRole,
  AgentConfig,
  Task,
  AgentResult,
  AgentError,
  Artifact,
  TokenUsage,
} from './types'
import type { ContextManager } from './context-manager'

/**
 * AgentRunner - Executes individual agent tasks
 *
 * Responsibilities:
 * - Execute agent with proper configuration
 * - Track execution time and token usage
 * - Handle agent errors and retries
 * - Emit progress events
 * - Manage agent context
 */
export class AgentRunner {
  private contextManager: ContextManager

  constructor(contextManager: ContextManager) {
    this.contextManager = contextManager
  }

  /**
   * Execute an agent task
   */
  async executeTask(
    task: Task,
    config: AgentConfig,
    options?: {
      timeout?: number
      onProgress?: (phase: string, message: string, percentage?: number) => void
    }
  ): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      // Emit starting event
      options?.onProgress?.('starting', `Starting ${task.agent} agent for: ${task.action}`, 0)

      // Create context summary for the agent
      const contextSummary = this.contextManager.createContextSummary(task.agent)

      // Emit thinking event
      options?.onProgress?.(
        'thinking',
        `${task.agent} is analyzing the task and planning approach`,
        25
      )

      // Build agent prompt
      const prompt = this.buildAgentPrompt(task, contextSummary)

      // Emit executing event
      options?.onProgress?.('executing', `${task.agent} is executing: ${task.action}`, 50)

      // Execute agent (this would integrate with actual LLM APIs)
      const executionResult = await this.executeAgent(task.agent, prompt, config, options?.timeout)

      // Emit completing event
      options?.onProgress?.('completing', `${task.agent} is finalizing results`, 90)

      // Extract outputs and artifacts from agent response
      const outputs = this.extractOutputs(executionResult.response, task.expectedOutputs)
      const artifacts = this.extractArtifacts(executionResult.response)

      // Store outputs in context
      for (const [key, value] of Object.entries(outputs)) {
        this.contextManager.setOutput(key, value)
      }

      // Store artifacts
      for (const artifact of artifacts) {
        this.contextManager.addArtifact(artifact)
      }

      // Add to history
      this.contextManager.addHistoryEntry(
        task.agent,
        task.action,
        'completed',
        `Completed successfully in ${Date.now() - startTime}ms`
      )

      const duration = Date.now() - startTime

      return {
        taskId: task.id,
        agent: task.agent,
        success: true,
        outputs,
        artifacts,
        duration,
        tokenUsage: executionResult.tokenUsage,
      }
    } catch (error) {
      const duration = Date.now() - startTime

      // Log error to history
      this.contextManager.addHistoryEntry(
        task.agent,
        task.action,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      )

      const agentError: AgentError = this.createAgentError(error, task)

      return {
        taskId: task.id,
        agent: task.agent,
        success: false,
        outputs: {},
        duration,
        error: agentError,
      }
    }
  }

  /**
   * Execute agent with retry logic
   */
  async executeWithRetry(
    task: Task,
    config: AgentConfig,
    options?: {
      timeout?: number
      onProgress?: (phase: string, message: string, percentage?: number) => void
    }
  ): Promise<AgentResult> {
    let lastError: AgentError | undefined

    for (let attempt = 0; attempt <= task.maxRetries; attempt++) {
      if (attempt > 0) {
        options?.onProgress?.(
          'starting',
          `Retrying ${task.agent} (attempt ${attempt + 1}/${task.maxRetries + 1})`,
          0
        )
      }

      const result = await this.executeTask(task, config, options)

      if (result.success) {
        return result
      }

      lastError = result.error

      // Check if error is recoverable
      if (!lastError?.recoverable) {
        break
      }

      // Wait before retrying (exponential backoff)
      if (attempt < task.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    // All retries failed
    return {
      taskId: task.id,
      agent: task.agent,
      success: false,
      outputs: {},
      duration: 0,
      error: lastError || {
        code: 'UNKNOWN_ERROR',
        message: 'Task failed after all retries',
        recoverable: false,
      },
    }
  }

  /**
   * Build agent prompt from task and context
   */
  private buildAgentPrompt(task: Task, contextSummary: string): string {
    const lines: string[] = [
      `# Agent Role: ${task.agent.toUpperCase()}`,
      ``,
      `## Task`,
      `${task.action}`,
      ``,
      `## Inputs`,
    ]

    for (const input of task.inputs) {
      const value = this.contextManager.getOutput(input) || this.contextManager.getData(input)
      if (value) {
        lines.push(`- **${input}**: ${JSON.stringify(value, null, 2)}`)
      } else {
        lines.push(`- **${input}**: (not available)`)
      }
    }

    lines.push(``)
    lines.push(`## Expected Outputs`)
    for (const output of task.expectedOutputs) {
      lines.push(`- ${output}`)
    }

    lines.push(``)
    lines.push(`## Context`)
    lines.push(contextSummary)

    return lines.join('\n')
  }

  /**
   * Execute agent via LLM API
   *
   * NOTE: This is a placeholder for actual LLM integration
   * In production, this would call the appropriate LLM API based on the agent's model
   */
  private async executeAgent(
    agent: AgentRole,
    _prompt: string,
    _config: AgentConfig,
    _timeout?: number
  ): Promise<{
    response: string
    tokenUsage?: TokenUsage
  }> {
    // TODO: Implement actual LLM API calls
    // This would integrate with:
    // - Anthropic API for Claude models (PM, TA, QA)
    // - OpenAI API for GPT models (Design)
    // - Google API for Gemini models (FE)

    // For now, return a mock response
    return {
      response: `Mock response from ${agent} agent`,
      tokenUsage: {
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        estimatedCost: 0.001,
      },
    }
  }

  /**
   * Extract outputs from agent response
   */
  private extractOutputs(
    _response: string,
    expectedOutputs: ReadonlyArray<string>
  ): Record<string, unknown> {
    const outputs: Record<string, unknown> = {}

    // TODO: Implement structured output parsing
    // This would parse the agent's response and extract the expected outputs
    // For now, just store the raw response

    for (const outputKey of expectedOutputs) {
      outputs[outputKey] = _response
    }

    return outputs
  }

  /**
   * Extract artifacts from agent response
   */
  private extractArtifacts(_response: string): Artifact[] {
    const artifacts: Artifact[] = []

    // TODO: Implement artifact extraction
    // This would parse code blocks, file references, etc. from the agent's response

    return artifacts
  }

  /**
   * Create structured error from exception
   */
  private createAgentError(error: unknown, task: Task): AgentError {
    if (error instanceof Error) {
      // Determine if error is recoverable
      const recoverable = this.isRecoverableError(error)

      return {
        code: error.name || 'AGENT_ERROR',
        message: error.message,
        recoverable,
        context: {
          agent: task.agent,
          action: task.action,
          taskId: task.id,
        },
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      recoverable: false,
      context: {
        agent: task.agent,
        action: task.action,
        taskId: task.id,
      },
    }
  }

  /**
   * Determine if an error is recoverable
   */
  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      /timeout/i,
      /rate limit/i,
      /temporary/i,
      /network/i,
      /connection/i,
    ]

    return recoverablePatterns.some((pattern) => pattern.test(error.message))
  }

  /**
   * Get agent description for logging
   */
  getAgentDescription(agent: AgentRole): string {
    const descriptions: Record<AgentRole, string> = {
      pm: 'Project Manager - Orchestration and strategy',
      ta: 'Technical Analyst - Research and analysis',
      fe: 'UI/UX Engineer - Frontend implementation',
      design: 'Designer - UI/UX design and flows',
      qa: 'Quality Assurance - Testing and verification',
    }

    return descriptions[agent] || agent
  }
}
