import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Orchestrator } from '../../src/core/orchestrator'
import type { CrewConfig } from '../../src/config'
import type { Task, AgentError } from '../../src/core/types'

// Mock dependencies
vi.mock('../../src/core/context-manager', () => ({
  ContextManager: class {
    getContext = vi.fn().mockReturnValue({})
    updateContext = vi.fn()
    getPhase = vi.fn().mockReturnValue('idle')
    getWorkflowId = vi.fn().mockReturnValue('workflow-123')
  },
}))

vi.mock('../../src/core/task-queue', () => ({
  TaskQueue: class {
    addTasks = vi.fn()
    addTask = vi.fn()
    getTask = vi.fn()
    updateTaskStatus = vi.fn()
    markTaskFailed = vi.fn()
    getNextExecutableTasks = vi.fn().mockReturnValue([])
    getPendingTasks = vi.fn().mockReturnValue([])
    getCompletedTasks = vi.fn().mockReturnValue([])
    getFailedTasks = vi.fn().mockReturnValue([])
    getAllTasks = vi.fn().mockReturnValue([])
    isComplete = vi.fn().mockReturnValue(true)
    hasFailed = vi.fn().mockReturnValue(false)
  },
}))

vi.mock('../../src/core/workflow-storage', () => ({
  WorkflowStorage: class {
    save = vi.fn().mockResolvedValue(undefined)
    load = vi.fn().mockResolvedValue(null)
    list = vi.fn().mockResolvedValue([])
    delete = vi.fn().mockResolvedValue(true)
    cleanup = vi.fn().mockResolvedValue(0)
    exists = vi.fn().mockResolvedValue(false)
    getSummary = vi.fn().mockResolvedValue(null)
  },
}))

vi.mock('../../src/core/agent-runner', () => ({
  AgentRunner: class {
    executeWithRetry = vi.fn().mockResolvedValue({
      success: true,
      output: {},
    })
  },
}))

vi.mock('../../src/core/incident-report', () => ({
  IncidentReportManager: class {
    createReport = vi.fn().mockReturnValue({
      id: 'incident-1',
      workflowId: 'workflow-1',
      timestamp: new Date(),
    })
    saveReport = vi.fn().mockResolvedValue('/path/to/report')
  },
}))

const mockConfig: CrewConfig = {
  version: '1.0',
  crew: {
    pm: {
      enabled: true,
      model: 'claude-opus-4.5' as const,
      maxTurns: 10,
      temperature: 0.7,
    },
    ta: {
      enabled: true,
      model: 'claude-sonnet-4.5' as const,
      maxTurns: 15,
      temperature: 0.5,
    },
    fe: {
      enabled: true,
      model: 'gemini-3-pro' as const,
      maxTurns: 20,
      temperature: 0.7,
    },
    design: {
      enabled: true,
      model: 'gpt-5.2-medium' as const,
      maxTurns: 10,
      temperature: 0.8,
    },
    qa: {
      enabled: true,
      model: 'claude-haiku-4.5' as const,
      maxTurns: 15,
      temperature: 0.3,
    },
  },
  sop: {
    default: 'feature' as const,
    feature: {
      name: 'feature',
      description: 'Feature development SOP',
      requiredAgents: ['pm', 'ta', 'fe', 'qa'],
      steps: [
        {
          order: 1,
          agent: 'pm',
          action: 'Plan the feature',
          inputs: ['user_request'],
          outputs: ['plan'],
        },
        {
          order: 2,
          agent: 'ta',
          action: 'Research technical approach',
          inputs: ['plan'],
          outputs: ['technical_spec'],
        },
        {
          order: 3,
          agent: 'fe',
          action: 'Implement feature',
          inputs: ['technical_spec'],
          outputs: ['code'],
        },
        {
          order: 4,
          agent: 'qa',
          action: 'Test implementation',
          inputs: ['code'],
          outputs: ['test_results'],
        },
      ],
    },
    bugfix: {
      name: 'bugfix',
      description: 'Bug fix SOP',
      requiredAgents: ['pm', 'ta', 'fe', 'qa'],
      steps: [
        {
          order: 1,
          agent: 'pm',
          action: 'Analyze bug',
          inputs: ['bug_report'],
          outputs: ['analysis'],
        },
      ],
    },
    refactor: {
      name: 'refactor',
      description: 'Refactoring SOP',
      requiredAgents: ['pm', 'ta', 'fe', 'qa'],
      steps: [
        {
          order: 1,
          agent: 'pm',
          action: 'Define refactoring scope',
          inputs: ['refactor_request'],
          outputs: ['scope'],
        },
      ],
    },
  },
  incidentReport: {
    enabled: true,
    outputDir: 'reports',
    format: 'json' as const,
    includeContext: true,
  },
  hooks: {
    preToolUse: [],
    postToolUse: [],
    stop: [],
  },
}

describe('Orchestrator', () => {
  let orchestrator: Orchestrator

  beforeEach(() => {
    vi.clearAllMocks()
    orchestrator = new Orchestrator(mockConfig, '/test/project')
  })

  describe('constructor', () => {
    it('should create an orchestrator instance', () => {
      expect(orchestrator).toBeDefined()
      expect(orchestrator).toBeInstanceOf(Orchestrator)
    })

    it('should initialize with default project path', () => {
      const orch = new Orchestrator(mockConfig)
      expect(orch).toBeDefined()
    })
  })

  describe('execute', () => {
    it.skip('should execute a feature workflow successfully', async () => {
      // Mock the internal methods
      const mockAgentRunner = {
        executeWithRetry: vi.fn().mockResolvedValue({
          success: true,
          output: { result: 'success' },
        }),
      }

      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn()
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn()
          .mockReturnValueOnce([{ id: 'task-1', agent: 'pm', action: 'Plan' }])
          .mockReturnValueOnce([{ id: 'task-2', agent: 'ta', action: 'Research' }])
          .mockReturnValueOnce([{ id: 'task-3', agent: 'fe', action: 'Implement' }])
          .mockReturnValueOnce([{ id: 'task-4', agent: 'qa', action: 'Test' }])
          .mockReturnValueOnce([]),
        updateTaskStatus: vi.fn(),
        markTaskFailed: vi.fn(),
        getPendingTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.agentRunner = mockAgentRunner
      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      const result = await orchestrator.execute('Add login feature', 'feature')

      expect(result).toBeDefined()
      expect(result.status).toBe('completed')
      expect(result.sopName).toBe('feature')
      expect(mockTaskQueue.addTasks).toHaveBeenCalled()
    })

    it('should handle workflow failure', async () => {
      const mockAgentRunner = {
        executeWithRetry: vi.fn().mockRejectedValue(new Error('Agent failed')),
      }

      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(false),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([
          { id: 'task-1', agent: 'pm', action: 'Plan' },
        ]),
        updateTaskStatus: vi.fn(),
        markTaskFailed: vi.fn(),
        getPendingTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.agentRunner = mockAgentRunner
      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await expect(
        orchestrator.execute('Add login feature', 'feature')
      ).rejects.toThrow()
    })

    it('should use bugfix SOP when specified', async () => {
      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      const result = await orchestrator.execute('Fix login bug', 'bugfix')

      expect(result.sopName).toBe('bugfix')
    })

    it('should use refactor SOP when specified', async () => {
      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      const result = await orchestrator.execute('Refactor auth', 'refactor')

      expect(result.sopName).toBe('refactor')
    })

    it('should update project path if different', async () => {
      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await orchestrator.execute('Test task', 'feature', '/different/path')

      // @ts-expect-error - accessing private property for testing
      expect(orchestrator.projectPath).toBe('/different/path')
    })
  })

  describe('event handling', () => {
    it('should emit workflow:start event', async () => {
      const eventHandler = vi.fn()
      orchestrator.on(eventHandler)

      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await orchestrator.execute('Test task', 'feature')

      const startEvents = eventHandler.mock.calls
        .map((call) => call[0])
        .filter((event) => event.type === 'workflow:start')

      expect(startEvents.length).toBeGreaterThan(0)
      expect(startEvents[0]).toMatchObject({
        type: 'workflow:start',
        sopName: 'feature',
      })
    })

    it('should emit workflow:complete event on success', async () => {
      const eventHandler = vi.fn()
      orchestrator.on(eventHandler)

      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await orchestrator.execute('Test task', 'feature')

      const completeEvents = eventHandler.mock.calls
        .map((call) => call[0])
        .filter((event) => event.type === 'workflow:complete')

      expect(completeEvents.length).toBeGreaterThan(0)
      expect(completeEvents[0].type).toBe('workflow:complete')
    })

    it('should emit workflow:fail event on error', async () => {
      const eventHandler = vi.fn()
      orchestrator.on(eventHandler)

      const mockAgentRunner = {
        executeWithRetry: vi.fn().mockRejectedValue(new Error('Test error')),
      }

      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(false),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([
          { id: 'task-1', agent: 'pm', action: 'Plan' },
        ]),
        updateTaskStatus: vi.fn(),
        markTaskFailed: vi.fn(),
        getPendingTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.agentRunner = mockAgentRunner
      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await expect(orchestrator.execute('Test task', 'feature')).rejects.toThrow()

      const failEvents = eventHandler.mock.calls
        .map((call) => call[0])
        .filter((event) => event.type === 'workflow:fail')

      expect(failEvents.length).toBeGreaterThan(0)
    })

    it('should support multiple event handlers', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      orchestrator.on(handler1)
      orchestrator.on(handler2)

      // @ts-expect-error - accessing private property for testing
      expect(orchestrator.eventHandlers).toHaveLength(2)
      // @ts-expect-error - accessing private property for testing
      expect(orchestrator.eventHandlers).toContain(handler1)
      // @ts-expect-error - accessing private property for testing
      expect(orchestrator.eventHandlers).toContain(handler2)
    })
  })

  describe('task execution', () => {
    it('should skip disabled agents', async () => {
      const disabledConfig = {
        ...mockConfig,
        crew: {
          ...mockConfig.crew,
          pm: {
            ...mockConfig.crew.pm,
            enabled: false,
          },
        },
      }

      const orch = new Orchestrator(disabledConfig, '/test/project')

      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn()
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn()
          .mockReturnValueOnce([{ id: 'task-1', agent: 'pm', action: 'Plan' }])
          .mockReturnValueOnce([]),
        updateTaskStatus: vi.fn(),
        getPendingTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orch.taskQueue = mockTaskQueue

      await orch.execute('Test task', 'feature')

      expect(mockTaskQueue.updateTaskStatus).toHaveBeenCalledWith('task-1', 'skipped')
    })

    it('should detect deadlock when tasks are pending but none executable', async () => {
      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(false),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([]),
        getPendingTasks: vi.fn().mockReturnValue([
          { id: 'task-1', status: 'pending' },
        ]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await expect(orchestrator.execute('Test task', 'feature')).rejects.toThrow(
        'Task execution deadlock detected'
      )
    })

    it('should handle task failures properly', async () => {
      const mockAgentRunner = {
        executeWithRetry: vi.fn().mockResolvedValue({
          success: false,
          error: {
            code: 'TEST_ERROR',
            message: 'Test error message',
            recoverable: false,
          },
        }),
      }

      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(false),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([
          { id: 'task-1', agent: 'pm', action: 'Plan' },
        ]),
        updateTaskStatus: vi.fn(),
        markTaskFailed: vi.fn(),
        getPendingTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.agentRunner = mockAgentRunner
      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await expect(orchestrator.execute('Test task', 'feature')).rejects.toThrow(
        'Test error message'
      )

      // Verify task was marked as failed
      expect(mockTaskQueue.markTaskFailed).toHaveBeenCalled()
    })
  })

  describe('SOP handling', () => {
    it('should throw error for unknown SOP', async () => {
      const mockTaskQueue = {
        addTasks: vi.fn(),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await expect(
        // @ts-expect-error - testing with invalid SOP name
        orchestrator.execute('Test task', 'unknown-sop')
      ).rejects.toThrow('SOP not found')
    })

    it('should create execution plan with correct task dependencies', async () => {
      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await orchestrator.execute('Test task', 'feature')

      const addedTasks = mockTaskQueue.addTasks.mock.calls[0][0]
      expect(addedTasks).toHaveLength(4)

      // First task (PM) should have no dependencies
      expect(addedTasks[0].dependsOn).toBeUndefined()

      // Second task (TA) should depend on first
      expect(addedTasks[1].dependsOn).toBeDefined()
      expect(addedTasks[1].dependsOn?.length).toBeGreaterThan(0)
    })
  })

  describe('parallel task execution', () => {
    it.skip('should execute parallel tasks concurrently', async () => {
      const executionOrder: string[] = []

      const mockAgentRunner = {
        executeWithRetry: vi.fn().mockImplementation(async (task: Task) => {
          executionOrder.push(task.id)
          await new Promise((resolve) => setTimeout(resolve, 10))
          return { success: true, output: {} }
        }),
      }

      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn()
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn()
          .mockReturnValueOnce([
            { id: 'task-1', agent: 'ta', action: 'Research' },
            { id: 'task-2', agent: 'design', action: 'Design' },
          ])
          .mockReturnValueOnce([]),
        updateTaskStatus: vi.fn(),
        getPendingTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.agentRunner = mockAgentRunner
      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      await orchestrator.execute('Test parallel tasks', 'feature')

      // Both tasks should have been executed
      expect(executionOrder).toContain('task-1')
      expect(executionOrder).toContain('task-2')
      expect(mockAgentRunner.executeWithRetry).toHaveBeenCalledTimes(2)
    })
  })

  describe('workflow state', () => {
    it('should track workflow state during execution', async () => {
      const mockTaskQueue = {
        addTasks: vi.fn(),
        isComplete: vi.fn().mockReturnValue(true),
        hasFailed: vi.fn().mockReturnValue(false),
        getNextExecutableTasks: vi.fn().mockReturnValue([]),
        getAllTasks: vi.fn().mockReturnValue([
          { id: 'task-1', status: 'completed' },
          { id: 'task-2', status: 'completed' },
        ]),
      }

      // @ts-expect-error - accessing private property for testing
      orchestrator.taskQueue = mockTaskQueue

      const result = await orchestrator.execute('Test task', 'feature')

      expect(result.id).toBeDefined()
      expect(result.sopName).toBe('feature')
      expect(result.status).toBe('completed')
      expect(result.startedAt).toBeInstanceOf(Date)
      expect(result.completedAt).toBeInstanceOf(Date)
      expect(result.currentStep).toBeDefined()
      expect(result.totalSteps).toBeDefined()
    })
  })
})
