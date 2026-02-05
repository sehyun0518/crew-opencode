import { z } from 'zod'

/**
 * Model providers and their available models
 */
export const ModelProviderSchema = z.enum([
  'anthropic',
  'openai',
  'google',
])

export const ModelIdSchema = z.enum([
  // Anthropic
  'claude-opus-4.5',
  'claude-sonnet-4.5',
  'claude-haiku-4.5',
  // OpenAI
  'gpt-5.2-medium',
  'gpt-5.2-mini',
  // Google
  'gemini-3-pro',
  'gemini-3-flash',
])

/**
 * Agent configuration schema
 */
export const AgentConfigSchema = z.object({
  enabled: z.boolean().default(true),
  model: ModelIdSchema,
  maxTurns: z.number().int().min(1).max(100).default(10),
  temperature: z.number().min(0).max(2).default(0.7),
  systemPrompt: z.string().optional(),
})

export type AgentConfig = z.infer<typeof AgentConfigSchema>

/**
 * SOP Step schema
 */
export const SOPStepSchema = z.object({
  order: z.number().int().min(1),
  agent: z.enum(['pm', 'ta', 'fe', 'design', 'qa']),
  action: z.string(),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  parallel: z.array(z.string()).optional(),
  validation: z.string().optional(),
})

export type SOPStep = z.infer<typeof SOPStepSchema>

/**
 * SOP Definition schema
 */
export const SOPDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  steps: z.array(SOPStepSchema),
  requiredAgents: z.array(z.enum(['pm', 'ta', 'fe', 'design', 'qa'])),
})

export type SOPDefinition = z.infer<typeof SOPDefinitionSchema>

/**
 * Incident Report configuration
 */
export const IncidentReportConfigSchema = z.object({
  enabled: z.boolean().default(true),
  outputDir: z.string().default('reports'),
  format: z.enum(['json', 'markdown']).default('json'),
  includeContext: z.boolean().default(true),
})

export type IncidentReportConfig = z.infer<typeof IncidentReportConfigSchema>

/**
 * Hooks configuration
 */
export const HooksConfigSchema = z.object({
  preToolUse: z.array(z.string()).default([]),
  postToolUse: z.array(z.string()).default([]),
  stop: z.array(z.string()).default([]),
})

export type HooksConfig = z.infer<typeof HooksConfigSchema>

/**
 * Crew (all agents) configuration
 */
export const CrewAgentsConfigSchema = z.object({
  pm: AgentConfigSchema.default({
    enabled: true,
    model: 'claude-opus-4.5',
    maxTurns: 10,
    temperature: 0.7,
  }),
  ta: AgentConfigSchema.default({
    enabled: true,
    model: 'claude-sonnet-4.5',
    maxTurns: 15,
    temperature: 0.5,
  }),
  fe: AgentConfigSchema.default({
    enabled: true,
    model: 'gemini-3-pro',
    maxTurns: 20,
    temperature: 0.7,
  }),
  design: AgentConfigSchema.default({
    enabled: true,
    model: 'gpt-5.2-medium',
    maxTurns: 10,
    temperature: 0.8,
  }),
  qa: AgentConfigSchema.default({
    enabled: true,
    model: 'claude-haiku-4.5',
    maxTurns: 15,
    temperature: 0.3,
  }),
})

export type CrewAgentsConfig = z.infer<typeof CrewAgentsConfigSchema>

/**
 * SOP configurations
 */
export const SOPConfigSchema = z.object({
  default: z.enum(['feature', 'bugfix', 'refactor']).default('feature'),
  feature: SOPDefinitionSchema.optional(),
  bugfix: SOPDefinitionSchema.optional(),
  refactor: SOPDefinitionSchema.optional(),
})

export type SOPConfig = z.infer<typeof SOPConfigSchema>

/**
 * Main crew-opencode configuration schema
 */
export const CrewConfigSchema = z.object({
  version: z.string().default('1.0'),
  crew: CrewAgentsConfigSchema.default(() => ({
    pm: { enabled: true, model: 'claude-opus-4.5' as const, maxTurns: 10, temperature: 0.7 },
    ta: { enabled: true, model: 'claude-sonnet-4.5' as const, maxTurns: 15, temperature: 0.5 },
    fe: { enabled: true, model: 'gemini-3-pro' as const, maxTurns: 20, temperature: 0.7 },
    design: { enabled: true, model: 'gpt-5.2-medium' as const, maxTurns: 10, temperature: 0.8 },
    qa: { enabled: true, model: 'claude-haiku-4.5' as const, maxTurns: 15, temperature: 0.3 },
  })),
  sop: SOPConfigSchema.default(() => ({ default: 'feature' as const })),
  incidentReport: IncidentReportConfigSchema.default(() => ({
    enabled: true,
    outputDir: 'reports',
    format: 'json' as const,
    includeContext: true,
  })),
  hooks: HooksConfigSchema.default(() => ({
    preToolUse: [],
    postToolUse: [],
    stop: [],
  })),
})

export type CrewConfig = z.infer<typeof CrewConfigSchema>

/**
 * Validate configuration object
 */
export function validateConfig(config: unknown): CrewConfig {
  return CrewConfigSchema.parse(config)
}

/**
 * Safe validate configuration (returns result instead of throwing)
 */
export function safeValidateConfig(config: unknown): {
  success: boolean
  data?: CrewConfig
  error?: z.ZodError
} {
  const result = CrewConfigSchema.safeParse(config)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}
