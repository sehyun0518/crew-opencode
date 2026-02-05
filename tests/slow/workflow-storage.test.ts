import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WorkflowStorage } from '../../src/core/workflow-storage'
import type { WorkflowState } from '../../src/core/types'
import { existsSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const TEST_PROJECT_PATH = join(process.cwd(), 'tests', 'fixtures', 'workflow-storage-test')
const STORAGE_PATH = join(TEST_PROJECT_PATH, '.opencode', 'crew-opencode', 'workflows')

describe('WorkflowStorage', () => {
  let storage: WorkflowStorage

  beforeEach(() => {
    // Clean up test directory
    if (existsSync(TEST_PROJECT_PATH)) {
      rmSync(TEST_PROJECT_PATH, { recursive: true, force: true })
    }
    mkdirSync(TEST_PROJECT_PATH, { recursive: true })

    storage = new WorkflowStorage(TEST_PROJECT_PATH)
  })

  afterEach(() => {
    // Clean up after tests
    if (existsSync(TEST_PROJECT_PATH)) {
      rmSync(TEST_PROJECT_PATH, { recursive: true, force: true })
    }
  })

  describe('save and load', () => {
    it('should save workflow state to disk', async () => {
      const workflow: WorkflowState = {
        id: 'test-workflow-1',
        sopName: 'feature',
        status: 'running',
        currentStep: 1,
        totalSteps: 5,
        tasks: [],
        context: { workflowId: 'test-workflow-1', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-01T00:00:00Z'),
      }

      await storage.save(workflow)

      const filePath = join(STORAGE_PATH, 'test-workflow-1.json')
      expect(existsSync(filePath)).toBe(true)
    })

    it('should load workflow state from disk', async () => {
      const workflow: WorkflowState = {
        id: 'test-workflow-2',
        sopName: 'bugfix',
        status: 'completed',
        currentStep: 3,
        totalSteps: 3,
        tasks: [],
        context: { workflowId: 'test-workflow-2', sopName: 'bugfix', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:15:00Z'),
      }

      await storage.save(workflow)
      const loaded = await storage.load('test-workflow-2')

      expect(loaded).toBeTruthy()
      expect(loaded?.id).toBe('test-workflow-2')
      expect(loaded?.sopName).toBe('bugfix')
      expect(loaded?.status).toBe('completed')
      expect(loaded?.startedAt).toEqual(new Date('2024-01-01T10:00:00Z'))
      expect(loaded?.completedAt).toEqual(new Date('2024-01-01T10:15:00Z'))
    })

    it('should return null for non-existent workflow', async () => {
      const loaded = await storage.load('non-existent-workflow')
      expect(loaded).toBeNull()
    })

    it('should handle JSON parse errors gracefully', async () => {
      const filePath = join(STORAGE_PATH, 'corrupted.json')
      mkdirSync(STORAGE_PATH, { recursive: true })
      require('fs').writeFileSync(filePath, 'invalid json')

      const loaded = await storage.load('corrupted')
      expect(loaded).toBeNull()
    })
  })

  describe('list', () => {
    it('should list all workflows', async () => {
      const workflow1: WorkflowState = {
        id: 'workflow-1',
        sopName: 'feature',
        status: 'completed',
        currentStep: 5,
        totalSteps: 5,
        tasks: [],
        context: { workflowId: 'workflow-1', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-01T00:00:00Z'),
        completedAt: new Date('2024-01-01T01:00:00Z'),
      }

      const workflow2: WorkflowState = {
        id: 'workflow-2',
        sopName: 'bugfix',
        status: 'running',
        currentStep: 2,
        totalSteps: 4,
        tasks: [],
        context: { workflowId: 'workflow-2', sopName: 'bugfix', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-02T00:00:00Z'),
      }

      await storage.save(workflow1)
      await storage.save(workflow2)

      const workflows = await storage.list()
      expect(workflows).toHaveLength(2)
      expect(workflows.map((w) => w.id)).toContain('workflow-1')
      expect(workflows.map((w) => w.id)).toContain('workflow-2')
    })

    it('should filter workflows by status', async () => {
      const workflow1: WorkflowState = {
        id: 'completed-1',
        sopName: 'feature',
        status: 'completed',
        currentStep: 3,
        totalSteps: 3,
        tasks: [],
        context: { workflowId: 'completed-1', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-01'),
      }

      const workflow2: WorkflowState = {
        id: 'running-1',
        sopName: 'bugfix',
        status: 'running',
        currentStep: 1,
        totalSteps: 3,
        tasks: [],
        context: { workflowId: 'running-1', sopName: 'bugfix', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-02'),
      }

      await storage.save(workflow1)
      await storage.save(workflow2)

      const completedWorkflows = await storage.list({ status: 'completed' })
      expect(completedWorkflows).toHaveLength(1)
      expect(completedWorkflows[0].id).toBe('completed-1')

      const runningWorkflows = await storage.list({ status: 'running' })
      expect(runningWorkflows).toHaveLength(1)
      expect(runningWorkflows[0].id).toBe('running-1')
    })

    it('should limit number of results', async () => {
      for (let i = 0; i < 5; i++) {
        const workflow: WorkflowState = {
          id: `workflow-${i}`,
          sopName: 'feature',
          status: 'completed',
          currentStep: 1,
          totalSteps: 1,
          tasks: [],
          context: { workflowId: `workflow-${i}`, sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
          startedAt: new Date(`2024-01-0${i + 1}`),
          completedAt: new Date(`2024-01-0${i + 1}`),
        }
        await storage.save(workflow)
      }

      const workflows = await storage.list({ limit: 3 })
      expect(workflows).toHaveLength(3)
    })

    it('should sort workflows by startedAt descending', async () => {
      const workflow1: WorkflowState = {
        id: 'old-workflow',
        sopName: 'feature',
        status: 'completed',
        currentStep: 1,
        totalSteps: 1,
        tasks: [],
        context: { workflowId: 'old-workflow', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-01'),
      }

      const workflow2: WorkflowState = {
        id: 'new-workflow',
        sopName: 'feature',
        status: 'completed',
        currentStep: 1,
        totalSteps: 1,
        tasks: [],
        context: { workflowId: 'new-workflow', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-10'),
      }

      await storage.save(workflow1)
      await storage.save(workflow2)

      const workflows = await storage.list({ sortBy: 'startedAt' })
      expect(workflows[0].id).toBe('new-workflow')
      expect(workflows[1].id).toBe('old-workflow')
    })
  })

  describe('delete', () => {
    it('should delete workflow from disk', async () => {
      const workflow: WorkflowState = {
        id: 'to-delete',
        sopName: 'feature',
        status: 'completed',
        currentStep: 1,
        totalSteps: 1,
        tasks: [],
        context: { workflowId: 'to-delete', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date(),
        completedAt: new Date(),
      }

      await storage.save(workflow)
      expect(await storage.exists('to-delete')).toBe(true)

      const deleted = await storage.delete('to-delete')
      expect(deleted).toBe(true)
      expect(await storage.exists('to-delete')).toBe(false)
    })

    it('should return false for non-existent workflow', async () => {
      const deleted = await storage.delete('non-existent')
      expect(deleted).toBe(false)
    })
  })

  describe('cleanup', () => {
    it('should delete old completed workflows', async () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 35) // 35 days ago

      const oldWorkflow: WorkflowState = {
        id: 'old-completed',
        sopName: 'feature',
        status: 'completed',
        currentStep: 1,
        totalSteps: 1,
        tasks: [],
        context: { workflowId: 'old-completed', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: oldDate,
        completedAt: oldDate,
      }

      const recentWorkflow: WorkflowState = {
        id: 'recent-completed',
        sopName: 'feature',
        status: 'completed',
        currentStep: 1,
        totalSteps: 1,
        tasks: [],
        context: { workflowId: 'recent-completed', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date(),
        completedAt: new Date(),
      }

      await storage.save(oldWorkflow)
      await storage.save(recentWorkflow)

      const deletedCount = await storage.cleanup(30)
      expect(deletedCount).toBe(1)

      expect(await storage.exists('old-completed')).toBe(false)
      expect(await storage.exists('recent-completed')).toBe(true)
    })

    it('should not delete running workflows', async () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 35)

      const oldRunningWorkflow: WorkflowState = {
        id: 'old-running',
        sopName: 'feature',
        status: 'running',
        currentStep: 1,
        totalSteps: 3,
        tasks: [],
        context: { workflowId: 'old-running', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: oldDate,
      }

      await storage.save(oldRunningWorkflow)

      const deletedCount = await storage.cleanup(30)
      expect(deletedCount).toBe(0)
      expect(await storage.exists('old-running')).toBe(true)
    })
  })

  describe('exists', () => {
    it('should check if workflow exists', async () => {
      expect(await storage.exists('non-existent')).toBe(false)

      const workflow: WorkflowState = {
        id: 'existing',
        sopName: 'feature',
        status: 'running',
        currentStep: 1,
        totalSteps: 1,
        tasks: [],
        context: { workflowId: 'existing', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date(),
      }

      await storage.save(workflow)
      expect(await storage.exists('existing')).toBe(true)
    })
  })

  describe('getSummary', () => {
    it('should get workflow summary without full state', async () => {
      const workflow: WorkflowState = {
        id: 'summary-test',
        sopName: 'feature',
        status: 'completed',
        currentStep: 5,
        totalSteps: 5,
        tasks: [],
        context: { workflowId: 'summary-test', sopName: 'feature', projectPath: '/', data: {}, outputs: {}, artifacts: [], history: [] },
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:30:00Z'),
      }

      await storage.save(workflow)
      const summary = await storage.getSummary('summary-test')

      expect(summary).toBeTruthy()
      expect(summary?.id).toBe('summary-test')
      expect(summary?.status).toBe('completed')
      expect(summary?.sopName).toBe('feature')
      expect(summary?.currentStep).toBe(5)
      expect(summary?.totalSteps).toBe(5)
    })

    it('should return null for non-existent workflow', async () => {
      const summary = await storage.getSummary('non-existent')
      expect(summary).toBeNull()
    })
  })
})
