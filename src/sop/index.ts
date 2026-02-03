import { join } from 'path'
import { readFileSync } from 'fs'
import type { SOPDefinition } from '../config'
import { DEFAULT_SOP_FEATURE, DEFAULT_SOP_BUGFIX, DEFAULT_SOP_REFACTOR } from '../config'

/**
 * SOP documentation file paths
 */
export const SOP_DOC_PATHS = {
  feature: join(__dirname, 'feature.md'),
  bugfix: join(__dirname, 'bugfix.md'),
  refactor: join(__dirname, 'refactor.md'),
} as const

/**
 * SOP type names
 */
export type SOPType = keyof typeof SOP_DOC_PATHS

/**
 * Load SOP documentation by type
 */
export function loadSOPDocumentation(sopType: SOPType): string {
  const path = SOP_DOC_PATHS[sopType]
  return readFileSync(path, 'utf-8')
}

/**
 * Get SOP definition (executable workflow)
 */
export function getSOPDefinition(sopType: SOPType): SOPDefinition {
  const definitions: Record<SOPType, SOPDefinition> = {
    feature: DEFAULT_SOP_FEATURE,
    bugfix: DEFAULT_SOP_BUGFIX,
    refactor: DEFAULT_SOP_REFACTOR,
  }

  return definitions[sopType]
}

/**
 * Get all SOP definitions
 */
export function getAllSOPDefinitions(): Record<SOPType, SOPDefinition> {
  return {
    feature: DEFAULT_SOP_FEATURE,
    bugfix: DEFAULT_SOP_BUGFIX,
    refactor: DEFAULT_SOP_REFACTOR,
  }
}

/**
 * Load all SOP documentation
 */
export function loadAllSOPDocumentation(): Record<SOPType, string> {
  return {
    feature: loadSOPDocumentation('feature'),
    bugfix: loadSOPDocumentation('bugfix'),
    refactor: loadSOPDocumentation('refactor'),
  }
}

/**
 * Validate SOP definition
 */
export function validateSOPDefinition(sop: SOPDefinition): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check name
  if (!sop.name || sop.name.trim() === '') {
    errors.push('SOP name is required')
  }

  // Check description
  if (!sop.description || sop.description.trim() === '') {
    errors.push('SOP description is required')
  }

  // Check steps
  if (!sop.steps || sop.steps.length === 0) {
    errors.push('SOP must have at least one step')
  }

  // Validate each step
  if (sop.steps) {
    for (let i = 0; i < sop.steps.length; i++) {
      const step = sop.steps[i]

      if (!step) {
        errors.push(`Step ${i + 1}: Step is undefined`)
        continue
      }

      if (!step.agent) {
        errors.push(`Step ${i + 1}: Agent is required`)
      }

      if (!step.action || step.action.trim() === '') {
        errors.push(`Step ${i + 1}: Action is required`)
      }

      if (step.order <= 0) {
        errors.push(`Step ${i + 1}: Order must be positive`)
      }
    }

    // Check for duplicate orders (unless parallel)
    const orderCounts = new Map<number, number>()
    for (const step of sop.steps) {
      const count = orderCounts.get(step.order) || 0
      orderCounts.set(step.order, count + 1)
    }

    for (const [order, count] of orderCounts) {
      if (count > 1) {
        const stepsWithOrder = sop.steps.filter((s) => s.order === order)
        const hasParallel = stepsWithOrder.some((s) => s.parallel && s.parallel.length > 0)

        if (!hasParallel) {
          errors.push(
            `Multiple steps have order ${order} but are not marked as parallel`
          )
        }
      }
    }
  }

  // Check required agents
  if (!sop.requiredAgents || sop.requiredAgents.length === 0) {
    errors.push('SOP must specify required agents')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get SOP metadata
 */
export function getSOPMetadata(sopType: SOPType): {
  name: string
  description: string
  requiredAgents: string[]
  totalSteps: number
  estimatedTime: string
} {
  const sop = getSOPDefinition(sopType)

  const metadata: Record<SOPType, { estimatedTime: string }> = {
    feature: { estimatedTime: '60-90 minutes' },
    bugfix: { estimatedTime: '40-70 minutes' },
    refactor: { estimatedTime: '100-160 minutes' },
  }

  return {
    name: sop.name,
    description: sop.description,
    requiredAgents: [...sop.requiredAgents],
    totalSteps: sop.steps.length,
    estimatedTime: metadata[sopType].estimatedTime,
  }
}

/**
 * Get SOP summary for all SOPs
 */
export function getAllSOPMetadata(): Record<SOPType, ReturnType<typeof getSOPMetadata>> {
  return {
    feature: getSOPMetadata('feature'),
    bugfix: getSOPMetadata('bugfix'),
    refactor: getSOPMetadata('refactor'),
  }
}

/**
 * Check if SOP has parallel steps
 */
export function hasParallelSteps(sopType: SOPType): boolean {
  const sop = getSOPDefinition(sopType)
  return sop.steps.some((step) => step.parallel && step.parallel.length > 0)
}

/**
 * Get critical path for SOP
 */
export function getCriticalPath(sopType: SOPType): number[] {
  const sop = getSOPDefinition(sopType)

  // Group steps by order
  const orderGroups = new Map<number, typeof sop.steps>()
  for (const step of sop.steps) {
    const group = orderGroups.get(step.order) || []
    group.push(step)
    orderGroups.set(step.order, group)
  }

  // Return unique orders (critical path is sequential through order numbers)
  return Array.from(orderGroups.keys()).sort((a, b) => a - b)
}

/**
 * Get steps by order
 */
export function getStepsByOrder(sopType: SOPType, order: number) {
  const sop = getSOPDefinition(sopType)
  return sop.steps.filter((step) => step.order === order)
}

/**
 * Get next steps after a given order
 */
export function getNextSteps(sopType: SOPType, currentOrder: number) {
  const sop = getSOPDefinition(sopType)
  const nextOrder = Math.min(
    ...sop.steps.filter((s) => s.order > currentOrder).map((s) => s.order)
  )

  if (!isFinite(nextOrder)) {
    return []
  }

  return sop.steps.filter((s) => s.order === nextOrder)
}

// Re-export SOP definitions for convenience
export { DEFAULT_SOP_FEATURE, DEFAULT_SOP_BUGFIX, DEFAULT_SOP_REFACTOR }
