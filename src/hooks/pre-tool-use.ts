/**
 * PreToolUse Hook
 *
 * Executes before any tool is used by OpenCode agents.
 * Use for validation, parameter modification, or preventing tool execution.
 */

export interface PreToolUseContext {
  tool: string
  parameters: Record<string, unknown>
  agent?: string
  conversation?: unknown
}

export interface PreToolUseResult {
  /**
   * If true, allows the tool to execute
   * If false, blocks the tool execution
   */
  allow: boolean

  /**
   * Optional message to display if blocking
   */
  message?: string

  /**
   * Modified parameters (if needed)
   */
  modifiedParameters?: Record<string, unknown>
}

/**
 * Pre-tool-use hook handler
 */
export async function preToolUse(context: PreToolUseContext): Promise<PreToolUseResult> {
  const { tool, parameters } = context

  // Example: Validate crew-specific tools
  if (tool === 'CrewOrchestrate') {
    // Ensure required parameters are present
    if (!parameters.task || typeof parameters.task !== 'string') {
      return {
        allow: false,
        message: 'CrewOrchestrate requires a "task" parameter (string)',
      }
    }

    if (parameters.sop && !['feature', 'bugfix', 'refactor'].includes(parameters.sop as string)) {
      return {
        allow: false,
        message: 'Invalid SOP type. Must be: feature, bugfix, or refactor',
      }
    }
  }

  // Example: Add workflow ID to crew commands
  if (tool.startsWith('Crew')) {
    const workflowId = `wf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`

    return {
      allow: true,
      modifiedParameters: {
        ...parameters,
        workflowId,
      },
    }
  }

  // Example: Log high-risk tool usage
  const highRiskTools = ['Bash', 'Write', 'Edit']
  if (highRiskTools.includes(tool)) {
    console.log(`[crew-opencode] High-risk tool: ${tool}`)
  }

  // Default: allow all tools
  return {
    allow: true,
  }
}

/**
 * Export hook for OpenCode
 */
export default preToolUse
