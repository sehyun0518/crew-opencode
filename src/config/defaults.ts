import type { CrewConfig, SOPDefinition } from './schema'

/**
 * Default SOP: Feature Development
 */
export const DEFAULT_SOP_FEATURE: SOPDefinition = {
  name: 'feature',
  description: 'Standard procedure for implementing new features',
  requiredAgents: ['pm', 'ta', 'design', 'fe', 'qa'],
  steps: [
    {
      order: 1,
      agent: 'pm',
      action: 'Analyze requirements and create execution plan',
      inputs: ['user_request', 'project_context'],
      outputs: ['execution_plan', 'task_breakdown'],
    },
    {
      order: 2,
      agent: 'ta',
      action: 'Research documentation and analyze codebase',
      inputs: ['execution_plan', 'codebase'],
      outputs: ['technical_spec', 'architecture_recommendations'],
      parallel: ['design'],
    },
    {
      order: 2,
      agent: 'design',
      action: 'Review UI/UX flows and propose design',
      inputs: ['execution_plan', 'user_requirements'],
      outputs: ['design_spec', 'component_hierarchy'],
      parallel: ['ta'],
    },
    {
      order: 3,
      agent: 'fe',
      action: 'Implement feature based on specs',
      inputs: ['technical_spec', 'design_spec'],
      outputs: ['implementation_code', 'components'],
    },
    {
      order: 4,
      agent: 'qa',
      action: 'Write and run tests, verify quality',
      inputs: ['implementation_code', 'technical_spec'],
      outputs: ['test_files', 'coverage_report', 'quality_assessment'],
    },
    {
      order: 5,
      agent: 'pm',
      action: 'Final review and summary',
      inputs: ['implementation_code', 'test_files', 'quality_assessment'],
      outputs: ['final_summary', 'completion_status'],
    },
  ],
}

/**
 * Default SOP: Bug Fix
 */
export const DEFAULT_SOP_BUGFIX: SOPDefinition = {
  name: 'bugfix',
  description: 'Standard procedure for fixing bugs',
  requiredAgents: ['pm', 'ta', 'fe', 'qa'],
  steps: [
    {
      order: 1,
      agent: 'pm',
      action: 'Analyze bug report and prioritize',
      inputs: ['bug_report', 'project_context'],
      outputs: ['bug_analysis', 'fix_plan'],
    },
    {
      order: 2,
      agent: 'ta',
      action: 'Investigate root cause and affected areas',
      inputs: ['bug_analysis', 'codebase'],
      outputs: ['root_cause_analysis', 'affected_files'],
    },
    {
      order: 3,
      agent: 'fe',
      action: 'Implement fix with minimal changes',
      inputs: ['root_cause_analysis', 'affected_files'],
      outputs: ['fix_code', 'changed_files'],
    },
    {
      order: 4,
      agent: 'qa',
      action: 'Verify fix and regression test',
      inputs: ['fix_code', 'bug_report'],
      outputs: ['test_results', 'regression_report'],
    },
    {
      order: 5,
      agent: 'pm',
      action: 'Review and close bug',
      inputs: ['fix_code', 'test_results'],
      outputs: ['closure_summary'],
    },
  ],
}

/**
 * Default SOP: Refactor
 */
export const DEFAULT_SOP_REFACTOR: SOPDefinition = {
  name: 'refactor',
  description: 'Standard procedure for refactoring code',
  requiredAgents: ['pm', 'ta', 'fe', 'qa'],
  steps: [
    {
      order: 1,
      agent: 'pm',
      action: 'Define refactoring scope and goals',
      inputs: ['refactor_request', 'project_context'],
      outputs: ['refactor_plan', 'success_criteria'],
    },
    {
      order: 2,
      agent: 'ta',
      action: 'Analyze current architecture and propose improvements',
      inputs: ['refactor_plan', 'codebase'],
      outputs: ['architecture_analysis', 'improvement_proposals'],
    },
    {
      order: 3,
      agent: 'qa',
      action: 'Create safety net tests before refactoring',
      inputs: ['architecture_analysis', 'codebase'],
      outputs: ['baseline_tests', 'coverage_baseline'],
    },
    {
      order: 4,
      agent: 'fe',
      action: 'Execute refactoring in incremental steps',
      inputs: ['improvement_proposals', 'baseline_tests'],
      outputs: ['refactored_code'],
    },
    {
      order: 5,
      agent: 'qa',
      action: 'Verify refactoring with tests',
      inputs: ['refactored_code', 'baseline_tests'],
      outputs: ['test_results', 'coverage_report'],
    },
    {
      order: 6,
      agent: 'pm',
      action: 'Review and validate against success criteria',
      inputs: ['refactored_code', 'test_results', 'success_criteria'],
      outputs: ['final_review', 'completion_status'],
    },
  ],
}

/**
 * Default configuration for crew-opencode
 */
export const DEFAULT_CONFIG: CrewConfig = {
  version: '1.0',
  crew: {
    pm: {
      enabled: true,
      model: 'claude-opus-4.5',
      maxTurns: 10,
      temperature: 0.7,
    },
    ta: {
      enabled: true,
      model: 'claude-sonnet-4.5',
      maxTurns: 15,
      temperature: 0.5,
    },
    fe: {
      enabled: true,
      model: 'gemini-3-pro',
      maxTurns: 20,
      temperature: 0.7,
    },
    design: {
      enabled: true,
      model: 'gpt-5.2-medium',
      maxTurns: 10,
      temperature: 0.8,
    },
    qa: {
      enabled: true,
      model: 'claude-haiku-4.5',
      maxTurns: 15,
      temperature: 0.3,
    },
  },
  sop: {
    default: 'feature',
    feature: DEFAULT_SOP_FEATURE,
    bugfix: DEFAULT_SOP_BUGFIX,
    refactor: DEFAULT_SOP_REFACTOR,
  },
  incidentReport: {
    enabled: true,
    outputDir: 'reports',
    format: 'json',
    includeContext: true,
  },
  hooks: {
    preToolUse: [],
    postToolUse: [],
    stop: [],
  },
}
