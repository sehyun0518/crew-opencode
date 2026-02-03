import { writeFile, mkdir } from 'fs/promises'
import { join, resolve } from 'path'
import { existsSync } from 'fs'
import type { IncidentReport, Task, AgentError, AgentRole } from './types'
import type { IncidentReportConfig } from '../config'

/**
 * IncidentReportManager - Manages "Apology Letter" generation and storage
 *
 * When an agent fails, it must write an Apology Letter (Incident Report) that includes:
 * - Root Cause: Why did it stop?
 * - Risk Analysis: What impact does this error have on the project?
 * - Prevention Strategy: How will we ensure this doesn't happen again?
 *
 * This is not just a log; it is a Self-Reflection process for the agent.
 */
export class IncidentReportManager {
  private config: IncidentReportConfig
  private projectPath: string

  constructor(config: IncidentReportConfig, projectPath: string = process.cwd()) {
    this.config = config
    this.projectPath = projectPath
  }

  /**
   * Create an incident report from a failed task
   */
  createReport(
    workflowId: string,
    task: Task,
    error: AgentError
  ): IncidentReport {
    const report: IncidentReport = {
      id: this.generateReportId(),
      timestamp: new Date(),
      workflowId,
      agent: task.agent,
      task,
      rootCause: this.analyzeRootCause(task, error),
      riskAnalysis: this.analyzeRisk(task, error),
      preventionStrategy: this.suggestPrevention(task, error),
      context: {
        ...error.context,
        taskId: task.id,
        retryCount: task.retryCount,
        maxRetries: task.maxRetries,
      },
      stackTrace: error instanceof Error ? (error as Error).stack : undefined,
    }

    return report
  }

  /**
   * Save incident report to disk
   */
  async saveReport(report: IncidentReport): Promise<string> {
    if (!this.config.enabled) {
      return ''
    }

    // Ensure output directory exists
    const outputDir = resolve(this.projectPath, this.config.outputDir)
    await this.ensureDirectory(outputDir)

    // Generate filename
    const filename = this.generateFilename(report)
    const filepath = join(outputDir, filename)

    // Format report based on config
    const content =
      this.config.format === 'json'
        ? this.formatAsJson(report)
        : this.formatAsMarkdown(report)

    // Write to file
    await writeFile(filepath, content, 'utf-8')

    return filepath
  }

  /**
   * Analyze root cause of failure
   */
  private analyzeRootCause(task: Task, error: AgentError): string {
    const lines: string[] = []

    // Error details
    lines.push(`**Error Code**: ${error.code}`)
    lines.push(`**Error Message**: ${error.message}`)
    lines.push(``)

    // Task context
    lines.push(`**Task Details**:`)
    lines.push(`- Agent: ${task.agent}`)
    lines.push(`- Action: ${task.action}`)
    lines.push(`- Priority: ${task.priority}`)
    lines.push(`- Retry Count: ${task.retryCount}/${task.maxRetries}`)
    lines.push(``)

    // Determine likely cause
    lines.push(`**Likely Cause**:`)

    if (error.code.includes('TIMEOUT')) {
      lines.push(`The agent exceeded the maximum execution time. This could be due to:`)
      lines.push(`- Task complexity is too high for the allocated time`)
      lines.push(`- Agent is stuck in an infinite loop or waiting for external resources`)
      lines.push(`- Network latency or API rate limiting`)
    } else if (error.code.includes('RATE_LIMIT')) {
      lines.push(`The API rate limit was exceeded. This indicates:`)
      lines.push(`- Too many requests in a short time period`)
      lines.push(`- Need for better request throttling`)
      lines.push(`- Consider using a higher tier API plan`)
    } else if (error.code.includes('VALIDATION')) {
      lines.push(`Input validation failed. This suggests:`)
      lines.push(`- Required inputs are missing or malformed`)
      lines.push(`- Schema mismatch between expected and actual data`)
      lines.push(`- Previous agent did not produce expected outputs`)
    } else if (error.code.includes('AUTH')) {
      lines.push(`Authentication or authorization failed:`)
      lines.push(`- API key is missing or invalid`)
      lines.push(`- Credentials have expired`)
      lines.push(`- Insufficient permissions for the requested operation`)
    } else {
      lines.push(`The agent encountered an unexpected error during execution.`)
      lines.push(`Further investigation of the error message and stack trace is needed.`)
    }

    return lines.join('\n')
  }

  /**
   * Analyze risk and impact of failure
   */
  private analyzeRisk(task: Task, error: AgentError): string {
    const lines: string[] = []

    lines.push(`## Risk Analysis`)
    lines.push(``)

    // Severity based on priority
    lines.push(`**Severity**: ${this.calculateSeverity(task, error)}`)
    lines.push(``)

    // Impact assessment
    lines.push(`**Impact on Workflow**:`)

    if (task.priority === 'critical') {
      lines.push(`- 🔴 **CRITICAL**: This task is essential to the workflow`)
      lines.push(`- The entire workflow cannot proceed without this task`)
      lines.push(`- Manual intervention is required immediately`)
    } else if (task.priority === 'high') {
      lines.push(`- 🟠 **HIGH**: This task is important to the workflow`)
      lines.push(`- Other tasks may be blocked by this failure`)
      lines.push(`- Significant impact on project timeline`)
    } else if (task.priority === 'medium') {
      lines.push(`- 🟡 **MEDIUM**: This task has moderate importance`)
      lines.push(`- Some functionality may be affected`)
      lines.push(`- Workflow can continue with degraded functionality`)
    } else {
      lines.push(`- 🟢 **LOW**: This task has minimal impact`)
      lines.push(`- Workflow can proceed without this task`)
      lines.push(`- Can be addressed in a follow-up iteration`)
    }

    lines.push(``)

    // Recoverability
    lines.push(`**Recoverability**: ${error.recoverable ? '✅ Recoverable' : '❌ Not Recoverable'}`)

    if (error.recoverable) {
      lines.push(`- The error may be temporary`)
      lines.push(`- Retry mechanism is applicable`)
      lines.push(`- ${task.maxRetries - task.retryCount} retry attempts remaining`)
    } else {
      lines.push(`- The error is permanent`)
      lines.push(`- Retry will not resolve the issue`)
      lines.push(`- Code or configuration changes required`)
    }

    lines.push(``)

    // Downstream effects
    lines.push(`**Downstream Effects**:`)
    lines.push(`- Expected outputs: ${task.expectedOutputs.join(', ')}`)
    lines.push(`- These outputs will not be available to dependent tasks`)
    lines.push(`- Dependent tasks will fail or require alternative inputs`)

    return lines.join('\n')
  }

  /**
   * Suggest prevention strategies
   */
  private suggestPrevention(task: Task, error: AgentError): string {
    const lines: string[] = []

    lines.push(`## Prevention Strategy`)
    lines.push(``)
    lines.push(`**Immediate Actions**:`)

    // Specific suggestions based on error type
    if (error.code.includes('TIMEOUT')) {
      lines.push(`1. Increase timeout value for ${task.agent} agent`)
      lines.push(`2. Break down the task into smaller, more manageable subtasks`)
      lines.push(`3. Optimize the task action to reduce execution time`)
      lines.push(`4. Add progress checkpoints to monitor execution`)
    } else if (error.code.includes('RATE_LIMIT')) {
      lines.push(`1. Implement exponential backoff between API calls`)
      lines.push(`2. Add request queuing and throttling`)
      lines.push(`3. Upgrade API tier or use multiple API keys`)
      lines.push(`4. Cache responses to reduce API calls`)
    } else if (error.code.includes('VALIDATION')) {
      lines.push(`1. Review SOP definition for ${task.action}`)
      lines.push(`2. Ensure all required inputs are defined in previous steps`)
      lines.push(`3. Add input validation to previous agent outputs`)
      lines.push(`4. Update schema definitions to match expected data`)
    } else if (error.code.includes('AUTH')) {
      lines.push(`1. Verify API credentials are correctly configured`)
      lines.push(`2. Check credential expiration and refresh if needed`)
      lines.push(`3. Ensure correct permissions are granted`)
      lines.push(`4. Review authentication flow in agent configuration`)
    } else {
      lines.push(`1. Review error logs and stack trace for root cause`)
      lines.push(`2. Add error handling for this specific scenario`)
      lines.push(`3. Update agent prompt to handle edge cases`)
      lines.push(`4. Add validation for agent inputs and outputs`)
    }

    lines.push(``)
    lines.push(`**Long-term Improvements**:`)
    lines.push(`1. Add monitoring and alerting for ${task.agent} agent failures`)
    lines.push(`2. Create test cases to reproduce and prevent this error`)
    lines.push(`3. Document this failure mode in agent guidelines`)
    lines.push(`4. Update SOP validation rules to catch this earlier`)

    lines.push(``)
    lines.push(`**Owner**: ${task.agent.toUpperCase()} agent maintainer`)
    lines.push(`**Due Date**: Within 1 sprint`)

    return lines.join('\n')
  }

  /**
   * Calculate severity level
   */
  private calculateSeverity(
    task: Task,
    error: AgentError
  ): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (task.priority === 'critical' || !error.recoverable) {
      return 'CRITICAL'
    } else if (task.priority === 'high') {
      return 'HIGH'
    } else if (task.priority === 'medium') {
      return 'MEDIUM'
    } else {
      return 'LOW'
    }
  }

  /**
   * Format report as JSON
   */
  private formatAsJson(report: IncidentReport): string {
    const jsonReport = {
      ...report,
      timestamp: report.timestamp.toISOString(),
      task: {
        id: report.task.id,
        agent: report.task.agent,
        action: report.task.action,
        status: report.task.status,
        priority: report.task.priority,
        retryCount: report.task.retryCount,
      },
    }

    return JSON.stringify(jsonReport, null, 2)
  }

  /**
   * Format report as Markdown (Apology Letter format)
   */
  private formatAsMarkdown(report: IncidentReport): string {
    const lines: string[] = []

    // Header
    lines.push(`# Incident Report (Apology Letter)`)
    lines.push(``)
    lines.push(`> **Agent**: ${report.agent.toUpperCase()}`)
    lines.push(`> **Workflow**: ${report.workflowId}`)
    lines.push(`> **Timestamp**: ${report.timestamp.toISOString()}`)
    lines.push(`> **Report ID**: ${report.id}`)
    lines.push(``)

    // Apology statement
    lines.push(`## Apology Statement`)
    lines.push(``)
    lines.push(
      `I, the **${report.agent.toUpperCase()}** agent, sincerely apologize for failing to complete the assigned task.`
    )
    lines.push(`I take full responsibility for this failure and have conducted a thorough analysis.`)
    lines.push(``)

    // Task details
    lines.push(`## Task Details`)
    lines.push(``)
    lines.push(`- **Task ID**: ${report.task.id}`)
    lines.push(`- **Action**: ${report.task.action}`)
    lines.push(`- **Priority**: ${report.task.priority}`)
    lines.push(`- **Status**: ${report.task.status}`)
    lines.push(`- **Attempts**: ${report.task.retryCount + 1}/${report.task.maxRetries + 1}`)
    lines.push(``)

    // Root cause
    lines.push(`## Root Cause Analysis`)
    lines.push(``)
    lines.push(report.rootCause)
    lines.push(``)

    // Risk analysis
    lines.push(report.riskAnalysis)
    lines.push(``)

    // Prevention strategy
    lines.push(report.preventionStrategy)
    lines.push(``)

    // Context
    if (this.config.includeContext && Object.keys(report.context).length > 0) {
      lines.push(`## Execution Context`)
      lines.push(``)
      lines.push('```json')
      lines.push(JSON.stringify(report.context, null, 2))
      lines.push('```')
      lines.push(``)
    }

    // Stack trace
    if (report.stackTrace) {
      lines.push(`## Stack Trace`)
      lines.push(``)
      lines.push('```')
      lines.push(report.stackTrace)
      lines.push('```')
      lines.push(``)
    }

    // Footer
    lines.push(`---`)
    lines.push(``)
    lines.push(`*This incident report was automatically generated by the crew-opencode orchestrator.*`)
    lines.push(
      `*The ${report.agent.toUpperCase()} agent will learn from this failure and improve.*`
    )

    return lines.join('\n')
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `incident-${timestamp}-${random}`
  }

  /**
   * Generate filename for report
   */
  private generateFilename(report: IncidentReport): string {
    const isoString = report.timestamp.toISOString()
    const date = isoString.split('T')[0] || 'unknown-date'
    const timePart = isoString.split('T')[1] || '00:00:00.000'
    const time = (timePart.split('.')[0] || '00:00:00').replace(/:/g, '-')
    const ext = this.config.format === 'json' ? 'json' : 'md'

    return `${date}_${time}_${report.agent}_${report.id}.${ext}`
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dir: string): Promise<void> {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }

  /**
   * Get all incident reports
   */
  async getAllReports(): Promise<string[]> {
    const outputDir = resolve(this.projectPath, this.config.outputDir)

    if (!existsSync(outputDir)) {
      return []
    }

    const fs = await import('fs/promises')
    const files = await fs.readdir(outputDir)

    return files
      .filter((f) => f.startsWith('incident-') || f.match(/^\d{4}-\d{2}-\d{2}_/))
      .map((f) => join(outputDir, f))
  }

  /**
   * Get reports for a specific agent
   */
  async getReportsByAgent(agent: AgentRole): Promise<string[]> {
    const allReports = await this.getAllReports()
    return allReports.filter((path) => path.includes(`_${agent}_`))
  }

  /**
   * Get reports for a specific workflow
   */
  async getReportsByWorkflow(workflowId: string): Promise<IncidentReport[]> {
    const allReports = await this.getAllReports()
    const reports: IncidentReport[] = []

    const fs = await import('fs/promises')

    for (const filepath of allReports) {
      if (filepath.endsWith('.json')) {
        const content = await fs.readFile(filepath, 'utf-8')
        const report = JSON.parse(content) as IncidentReport

        if (report.workflowId === workflowId) {
          reports.push(report)
        }
      }
    }

    return reports
  }
}
