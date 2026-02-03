import { join } from 'path'
import { readFileSync } from 'fs'

/**
 * Agent definition file paths
 */
export const AGENT_PATHS = {
  pm: join(__dirname, 'pm.md'),
  ta: join(__dirname, 'ta.md'),
  fe: join(__dirname, 'fe.md'),
  design: join(__dirname, 'design.md'),
  qa: join(__dirname, 'qa.md'),
} as const

/**
 * Load an agent definition by role
 */
export function loadAgentDefinition(agent: keyof typeof AGENT_PATHS): string {
  const path = AGENT_PATHS[agent]
  return readFileSync(path, 'utf-8')
}

/**
 * Get agent description for logging
 */
export function getAgentDescription(agent: keyof typeof AGENT_PATHS): string {
  const descriptions = {
    pm: 'Project Manager - Orchestration and strategy (Opus 4.5)',
    ta: 'Technical Analyst - Research and deep analysis (Sonnet 4.5)',
    fe: 'UI/UX Engineer - Frontend implementation (Gemini 3 Pro)',
    design: 'Designer - UI/UX design and flows (GPT 5.2 Medium)',
    qa: 'Quality Assurance - Testing and verification (Haiku 4.5)',
  }

  return descriptions[agent]
}

/**
 * Get all agent definitions
 */
export function loadAllAgentDefinitions(): Record<keyof typeof AGENT_PATHS, string> {
  return {
    pm: loadAgentDefinition('pm'),
    ta: loadAgentDefinition('ta'),
    fe: loadAgentDefinition('fe'),
    design: loadAgentDefinition('design'),
    qa: loadAgentDefinition('qa'),
  }
}

/**
 * Agent metadata
 */
export const AGENT_METADATA = {
  pm: {
    name: 'Project Manager',
    model: 'claude-opus-4.5',
    costTier: 'high',
    description: 'Coordinates all agents, manages strategy and priorities',
  },
  ta: {
    name: 'Technical Analyst',
    model: 'claude-sonnet-4.5',
    costTier: 'medium',
    description: 'Conducts research, analyzes codebase, provides technical specs',
  },
  fe: {
    name: 'UI/UX Engineer',
    model: 'gemini-3-pro',
    costTier: 'medium',
    description: 'Implements frontend components and user interfaces',
  },
  design: {
    name: 'Designer',
    model: 'gpt-5.2-medium',
    costTier: 'medium',
    description: 'Reviews UX flows, proposes design systems',
  },
  qa: {
    name: 'Quality Assurance',
    model: 'claude-haiku-4.5',
    costTier: 'low',
    description: 'Writes tests, verifies quality, ensures stability',
  },
} as const

export type AgentRole = keyof typeof AGENT_PATHS
