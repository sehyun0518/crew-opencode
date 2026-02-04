import { describe, it, expect, beforeEach } from 'vitest'
import { ContextManager } from '../../src/core/context-manager'

describe('ContextManager', () => {
  let manager: ContextManager

  beforeEach(() => {
    manager = new ContextManager('feature', 'Test task', '/test/path')
  })

  describe('constructor', () => {
    it('should initialize with correct values', () => {
      const context = manager.getContext()

      expect(context.sopName).toBe('feature')
      expect(context.userRequest).toBe('Test task')
      expect(context.projectPath).toBe('/test/path')
      expect(context.workflowId).toBeTruthy()
      expect(context.data).toEqual({})
      expect(context.outputs).toEqual({})
      expect(context.artifacts).toEqual([])
      expect(context.history).toEqual([])
    })
  })

  describe('setData / getData', () => {
    it('should store and retrieve data', () => {
      manager.setData('key1', 'value1')

      expect(manager.getData('key1')).toBe('value1')
    })

    it('should return undefined for non-existent key', () => {
      expect(manager.getData('non-existent')).toBeUndefined()
    })

    it('should handle complex data types', () => {
      const obj = { nested: { value: 123 } }
      manager.setData('complex', obj)

      expect(manager.getData('complex')).toEqual(obj)
    })
  })

  describe('setOutput / getOutput', () => {
    it('should store and retrieve outputs', () => {
      manager.setOutput('result', 'success')

      expect(manager.getOutput('result')).toBe('success')
    })

    it('should get all outputs', () => {
      manager.setOutput('out1', 'value1')
      manager.setOutput('out2', 'value2')

      const all = manager.getAllOutputs()

      expect(all).toEqual({ out1: 'value1', out2: 'value2' })
    })
  })

  describe('addArtifact / getArtifacts', () => {
    it('should add and retrieve artifacts', () => {
      manager.addArtifact({
        type: 'code',
        name: 'test.ts',
        path: '/test/test.ts',
      })

      const artifacts = manager.getArtifacts()

      expect(artifacts).toHaveLength(1)
      expect(artifacts[0].name).toBe('test.ts')
    })

    it('should filter artifacts by type', () => {
      manager.addArtifact({ type: 'code', name: 'code.ts' })
      manager.addArtifact({ type: 'test', name: 'test.ts' })

      const codeArtifacts = manager.getArtifactsByType('code')

      expect(codeArtifacts).toHaveLength(1)
      expect(codeArtifacts[0].name).toBe('code.ts')
    })
  })

  describe('addHistoryEntry / getHistory', () => {
    it('should add and retrieve history entries', () => {
      manager.addHistoryEntry('pm', 'Plan created', 'completed', 'Success')

      const history = manager.getHistory()

      expect(history).toHaveLength(1)
      expect(history[0].agent).toBe('pm')
      expect(history[0].action).toBe('Plan created')
      expect(history[0].status).toBe('completed')
    })

    it('should filter history by agent', () => {
      manager.addHistoryEntry('pm', 'Action 1', 'completed')
      manager.addHistoryEntry('ta', 'Action 2', 'completed')

      const pmHistory = manager.getAgentHistory('pm')

      expect(pmHistory).toHaveLength(1)
      expect(pmHistory[0].agent).toBe('pm')
    })
  })

  describe('createContextSummary', () => {
    it('should create a summary string', () => {
      manager.setOutput('plan', 'Execution plan created')
      manager.addHistoryEntry('pm', 'Planning', 'completed')

      const summary = manager.createContextSummary('ta')

      expect(summary).toContain('Execution Context Summary')
      expect(summary).toContain('feature')
      expect(summary).toContain('Test task')
    })
  })

  describe('export / import', () => {
    it('should export context', () => {
      manager.setData('key', 'value')
      const exported = manager.export()

      expect(exported.data.key).toBe('value')
    })

    it('should import context', () => {
      const exported = manager.export()
      const imported = ContextManager.import(exported)

      expect(imported.getContext()).toEqual(manager.getContext())
    })
  })
})
