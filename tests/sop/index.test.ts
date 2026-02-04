import { describe, it, expect } from 'vitest'
import {
  getSOPDefinition,
  getAllSOPDefinitions,
  validateSOPDefinition,
  getSOPMetadata,
  hasParallelSteps,
  getCriticalPath,
} from '../../src/sop'

describe('SOP Utilities', () => {
  describe('getSOPDefinition', () => {
    it('should return feature SOP', () => {
      const sop = getSOPDefinition('feature')

      expect(sop.name).toBe('feature')
      expect(sop.steps.length).toBeGreaterThan(0)
      expect(sop.requiredAgents.length).toBeGreaterThan(0)
    })

    it('should return bugfix SOP', () => {
      const sop = getSOPDefinition('bugfix')

      expect(sop.name).toBe('bugfix')
    })

    it('should return refactor SOP', () => {
      const sop = getSOPDefinition('refactor')

      expect(sop.name).toBe('refactor')
    })
  })

  describe('getAllSOPDefinitions', () => {
    it('should return all SOPs', () => {
      const all = getAllSOPDefinitions()

      expect(all.feature).toBeDefined()
      expect(all.bugfix).toBeDefined()
      expect(all.refactor).toBeDefined()
    })
  })

  describe('validateSOPDefinition', () => {
    it('should validate feature SOP', () => {
      const sop = getSOPDefinition('feature')
      const result = validateSOPDefinition(sop)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing name', () => {
      const invalid = {
        name: '',
        description: 'Test',
        steps: [],
        requiredAgents: ['pm'],
      }

      const result = validateSOPDefinition(invalid as any)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('name'))).toBe(true)
    })

    it('should detect missing steps', () => {
      const invalid = {
        name: 'test',
        description: 'Test',
        steps: [],
        requiredAgents: ['pm'],
      }

      const result = validateSOPDefinition(invalid as any)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('step'))).toBe(true)
    })
  })

  describe('getSOPMetadata', () => {
    it('should return metadata for feature SOP', () => {
      const metadata = getSOPMetadata('feature')

      expect(metadata.name).toBe('feature')
      expect(metadata.description).toBeTruthy()
      expect(metadata.totalSteps).toBeGreaterThan(0)
      expect(metadata.estimatedTime).toBeTruthy()
      expect(metadata.requiredAgents.length).toBeGreaterThan(0)
    })
  })

  describe('hasParallelSteps', () => {
    it('should detect parallel steps in feature SOP', () => {
      expect(hasParallelSteps('feature')).toBe(true)
    })

    it('should detect no parallel steps in bugfix SOP', () => {
      expect(hasParallelSteps('bugfix')).toBe(false)
    })
  })

  describe('getCriticalPath', () => {
    it('should return critical path', () => {
      const path = getCriticalPath('feature')

      expect(path.length).toBeGreaterThan(0)
      expect(path.every((n) => typeof n === 'number')).toBe(true)
      expect(path).toEqual([...path].sort((a, b) => a - b))
    })
  })
})
