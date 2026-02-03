/**
 * PostToolUse Hook
 *
 * Executes after a tool has been used by OpenCode agents.
 * Use for logging, validation, side effects, or result modification.
 */

export interface PostToolUseContext {
  tool: string
  parameters: Record<string, unknown>
  result: unknown
  error?: Error
  duration?: number
  agent?: string
}

export interface PostToolUseResult {
  /**
   * Modified result (if needed)
   */
  modifiedResult?: unknown

  /**
   * Log message
   */
  message?: string

  /**
   * Whether to continue execution
   */
  continue: boolean
}

/**
 * Post-tool-use hook handler
 */
export async function postToolUse(context: PostToolUseContext): Promise<PostToolUseResult> {
  const { tool, result, error, duration } = context

  // Log crew tool execution
  if (tool.startsWith('Crew')) {
    const status = error ? '❌ FAILED' : '✅ SUCCESS'
    const time = duration ? `${duration}ms` : 'N/A'

    console.log(`[crew-opencode] ${tool} ${status} (${time})`)

    if (error) {
      console.error(`[crew-opencode] Error:`, error.message)
    }
  }

  // Track incident reports
  if (tool === 'CrewOrchestrate' && result && typeof result === 'object') {
    const workflowResult = result as { incidents?: unknown[] }

    if (workflowResult.incidents && Array.isArray(workflowResult.incidents)) {
      if (workflowResult.incidents.length > 0) {
        console.log(
          `[crew-opencode] ⚠️  ${workflowResult.incidents.length} incident report(s) generated`
        )
      }
    }
  }

  // Example: Auto-format code after Write/Edit
  if ((tool === 'Write' || tool === 'Edit') && !error) {
    const params = context.parameters as { file_path?: string }

    if (params.file_path) {
      const ext = params.file_path.split('.').pop()

      if (ext && ['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
        console.log(`[crew-opencode] 💡 Tip: Run prettier on ${params.file_path}`)
      }
    }
  }

  // Example: Check test coverage after test execution
  if (tool === 'Bash' && context.parameters.command) {
    const command = context.parameters.command as string

    if (command.includes('vitest') || command.includes('jest')) {
      console.log('[crew-opencode] 📊 Check test coverage with --coverage flag')
    }
  }

  // Default: continue with original result
  return {
    continue: true,
  }
}

/**
 * Export hook for OpenCode
 */
export default postToolUse
