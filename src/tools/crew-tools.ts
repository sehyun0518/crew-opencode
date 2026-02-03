/**
 * Custom Tools for crew-opencode
 *
 * These tools are available to OpenCode agents when crew-opencode is installed.
 */

import { Orchestrator } from '../core/orchestrator'
import { loadConfig } from '../config'
import type { WorkflowState } from '../core/types'

/**
 * Tool: CrewOrchestrate
 *
 * Execute a task using the crew-opencode orchestration system.
 */
export async function crewOrchestrate(params: {
  task: string
  sop?: 'feature' | 'bugfix' | 'refactor'
  projectPath?: string
  workflowId?: string
}): Promise<{
  success: boolean
  workflowState?: WorkflowState
  summary?: string
  error?: string
}> {
  const { task, sop = 'feature', projectPath = process.cwd() } = params

  try {
    // Load configuration
    const config = await loadConfig()

    // Create orchestrator
    const orchestrator = new Orchestrator(config, projectPath)

    // Execute workflow
    const workflowState = await orchestrator.execute(task, sop, projectPath)

    // Generate summary
    const summary = generateWorkflowSummary(workflowState)

    return {
      success: workflowState.status === 'completed',
      workflowState,
      summary,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Tool: CrewStatus
 *
 * Get the status of a running crew workflow.
 */
export async function crewStatus(_params: { workflowId: string }): Promise<{
  success: boolean
  status?: string
  progress?: number
  error?: string
}> {
  // TODO: Implement workflow tracking/persistence
  // For now, return a placeholder

  return {
    success: false,
    error: 'Workflow tracking not yet implemented',
  }
}

/**
 * Tool: CrewList
 *
 * List available agents and SOPs.
 */
export async function crewList(params?: {
  type?: 'agents' | 'sops' | 'all'
}): Promise<{
  success: boolean
  agents?: Array<{ role: string; name: string; model: string }>
  sops?: Array<{ name: string; description: string; steps: number }>
  error?: string
}> {
  try {
    const { AGENT_METADATA } = await import('../agents')
    const { getAllSOPMetadata } = await import('../sop')

    const type = params?.type || 'all'

    const result: {
      success: boolean
      agents?: Array<{ role: string; name: string; model: string }>
      sops?: Array<{ name: string; description: string; steps: number }>
    } = {
      success: true,
    }

    if (type === 'agents' || type === 'all') {
      result.agents = Object.entries(AGENT_METADATA).map(([role, metadata]) => ({
        role,
        name: metadata.name,
        model: metadata.model,
      }))
    }

    if (type === 'sops' || type === 'all') {
      const sopMetadata = getAllSOPMetadata()
      result.sops = Object.values(sopMetadata).map((sop) => ({
        name: sop.name,
        description: sop.description,
        steps: sop.totalSteps,
      }))
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Tool: CrewIncidents
 *
 * Get incident reports from the current project.
 */
export async function crewIncidents(params?: {
  agent?: string
  workflowId?: string
  limit?: number
}): Promise<{
  success: boolean
  incidents?: Array<{
    id: string
    agent: string
    timestamp: string
    rootCause: string
  }>
  total?: number
  error?: string
}> {
  try {
    const { IncidentReportManager } = await import('../core/incident-report')
    const { loadConfig } = await import('../config')

    const config = await loadConfig()
    const reportManager = new IncidentReportManager(config.incidentReport, process.cwd())

    let reports: string[]

    if (params?.agent) {
      reports = await reportManager.getReportsByAgent(params.agent as any)
    } else if (params?.workflowId) {
      const fullReports = await reportManager.getReportsByWorkflow(params.workflowId)
      return {
        success: true,
        incidents: fullReports.map((r) => ({
          id: r.id,
          agent: r.agent,
          timestamp: r.timestamp.toISOString(),
          rootCause: r.rootCause,
        })),
        total: fullReports.length,
      }
    } else {
      reports = await reportManager.getAllReports()
    }

    const limit = params?.limit || 10
    const limitedReports = reports.slice(0, limit)

    // For file-based reports, we can't easily parse them without reading
    // So return file paths for now
    return {
      success: true,
      total: reports.length,
      incidents: limitedReports.map((path) => ({
        id: path.split('/').pop() || path,
        agent: 'unknown',
        timestamp: new Date().toISOString(),
        rootCause: 'See report file for details',
      })),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Helper: Generate workflow summary
 */
function generateWorkflowSummary(workflow: WorkflowState): string {
  const lines: string[] = []

  lines.push(`Workflow: ${workflow.sopName}`)
  lines.push(`Status: ${workflow.status}`)
  lines.push(`Steps: ${workflow.currentStep}/${workflow.totalSteps}`)

  if (workflow.completedAt && workflow.startedAt) {
    const duration = workflow.completedAt.getTime() - workflow.startedAt.getTime()
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    lines.push(`Duration: ${minutes}m ${seconds}s`)
  }

  const completed = workflow.tasks.filter((t) => t.status === 'completed').length
  const failed = workflow.tasks.filter((t) => t.status === 'failed').length

  lines.push(`Tasks: ${completed} completed, ${failed} failed`)

  return lines.join('\n')
}

/**
 * Export all tools
 */
export const CREW_TOOLS = {
  CrewOrchestrate: {
    name: 'CrewOrchestrate',
    description: 'Execute a task using the crew-opencode multi-agent system',
    parameters: {
      task: { type: 'string', required: true, description: 'Task description' },
      sop: {
        type: 'string',
        required: false,
        description: 'SOP type: feature, bugfix, or refactor',
      },
      projectPath: { type: 'string', required: false, description: 'Project path' },
    },
    handler: crewOrchestrate,
  },
  CrewStatus: {
    name: 'CrewStatus',
    description: 'Get the status of a running crew workflow',
    parameters: {
      workflowId: { type: 'string', required: true, description: 'Workflow ID' },
    },
    handler: crewStatus,
  },
  CrewList: {
    name: 'CrewList',
    description: 'List available agents and SOPs',
    parameters: {
      type: {
        type: 'string',
        required: false,
        description: 'Type to list: agents, sops, or all',
      },
    },
    handler: crewList,
  },
  CrewIncidents: {
    name: 'CrewIncidents',
    description: 'Get incident reports (Apology Letters)',
    parameters: {
      agent: { type: 'string', required: false, description: 'Filter by agent' },
      workflowId: { type: 'string', required: false, description: 'Filter by workflow ID' },
      limit: { type: 'number', required: false, description: 'Limit number of results' },
    },
    handler: crewIncidents,
  },
} as const

export type CrewToolName = keyof typeof CREW_TOOLS
