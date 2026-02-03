/**
 * Stop Hook
 *
 * Executes when an OpenCode session ends.
 * Use for cleanup, final validation, summary generation, or persistence.
 */

export interface StopContext {
  session?: {
    id?: string
    duration?: number
    totalTools?: number
  }
  conversation?: unknown
  metadata?: Record<string, unknown>
}

export interface StopResult {
  /**
   * Summary message to display
   */
  summary?: string

  /**
   * Whether session cleanup was successful
   */
  success: boolean
}

/**
 * Stop hook handler
 */
export async function stop(context: StopContext): Promise<StopResult> {
  const { session } = context

  console.log('\n[crew-opencode] Session ending...')

  // Display session summary
  if (session) {
    const lines: string[] = []

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('🎯 crew-opencode Session Summary')
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (session.id) {
      lines.push(`Session ID: ${session.id}`)
    }

    if (session.duration) {
      const minutes = Math.floor(session.duration / 60000)
      const seconds = Math.floor((session.duration % 60000) / 1000)
      lines.push(`Duration: ${minutes}m ${seconds}s`)
    }

    if (session.totalTools) {
      lines.push(`Tools Used: ${session.totalTools}`)
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const summary = lines.join('\n')
    console.log(summary)
  }

  // Check for incident reports
  try {
    const { IncidentReportManager } = await import('../core/incident-report')
    const { DEFAULT_CONFIG } = await import('../config')

    const reportManager = new IncidentReportManager(
      DEFAULT_CONFIG.incidentReport,
      process.cwd()
    )

    const allReports = await reportManager.getAllReports()

    if (allReports.length > 0) {
      console.log(`\n⚠️  ${allReports.length} incident report(s) generated during this session`)
      console.log('   Run `crew-opencode reports` to view them\n')
    }
  } catch (error) {
    // Silently fail if unable to check reports
  }

  // Display tips
  console.log('💡 Tips:')
  console.log('   • Run `crew-opencode doctor` to check your setup')
  console.log('   • Run `crew-opencode list` to see available agents and SOPs')
  console.log('   • Run `crew-opencode reports` to view incident reports')
  console.log('')

  return {
    success: true,
  }
}

/**
 * Export hook for OpenCode
 */
export default stop
