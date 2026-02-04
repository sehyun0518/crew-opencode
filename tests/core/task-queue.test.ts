import { describe, it, expect, beforeEach } from 'vitest'
import { TaskQueue } from '../../src/core/task-queue'
import type { Task } from '../../src/core/types'

describe('TaskQueue', () => {
  let queue: TaskQueue

  beforeEach(() => {
    queue = new TaskQueue()
  })

  const createTask = (id: string, order: number, agent: 'pm' | 'ta' = 'pm'): Task => ({
    id,
    agent,
    action: 'Test action',
    inputs: [],
    expectedOutputs: [],
    status: 'pending',
    priority: 'medium',
    retryCount: 0,
    maxRetries: 3,
  })

  describe('addTask', () => {
    it('should add a task to the queue', () => {
      const task = createTask('task-1', 1)
      queue.addTask(task)

      expect(queue.getTask('task-1')).toEqual(task)
    })

    it('should add multiple tasks', () => {
      queue.addTasks([createTask('task-1', 1), createTask('task-2', 2)])

      expect(queue.getAllTasks()).toHaveLength(2)
    })
  })

  describe('getTask', () => {
    it('should return undefined for non-existent task', () => {
      expect(queue.getTask('non-existent')).toBeUndefined()
    })

    it('should return the correct task', () => {
      const task = createTask('task-1', 1)
      queue.addTask(task)

      expect(queue.getTask('task-1')).toEqual(task)
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status', () => {
      const task = createTask('task-1', 1)
      queue.addTask(task)

      queue.updateTaskStatus('task-1', 'running')

      const updated = queue.getTask('task-1')
      expect(updated?.status).toBe('running')
      expect(updated?.startedAt).toBeInstanceOf(Date)
    })

    it('should set completedAt when status is completed', () => {
      const task = createTask('task-1', 1)
      queue.addTask(task)

      queue.updateTaskStatus('task-1', 'completed')

      const updated = queue.getTask('task-1')
      expect(updated?.completedAt).toBeInstanceOf(Date)
    })

    it('should throw error for non-existent task', () => {
      expect(() => queue.updateTaskStatus('non-existent', 'running')).toThrow()
    })
  })

  describe('getTasksByStatus', () => {
    it('should return tasks with specific status', () => {
      queue.addTask(createTask('task-1', 1))
      queue.addTask(createTask('task-2', 2))
      queue.updateTaskStatus('task-1', 'completed')

      const completed = queue.getTasksByStatus('completed')
      const pending = queue.getTasksByStatus('pending')

      expect(completed).toHaveLength(1)
      expect(pending).toHaveLength(1)
    })

    it('should return empty array when no tasks match', () => {
      expect(queue.getTasksByStatus('completed')).toHaveLength(0)
    })
  })

  describe('getNextExecutableTasks', () => {
    it('should return pending tasks with no dependencies', () => {
      queue.addTask(createTask('task-1', 1))
      queue.addTask(createTask('task-2', 2))

      const executable = queue.getNextExecutableTasks()

      expect(executable.length).toBeGreaterThan(0)
      expect(executable.every((t) => t.status === 'pending')).toBe(true)
    })

    it('should not return tasks with unmet dependencies', () => {
      const task1 = createTask('task-1', 1)
      const task2 = { ...createTask('task-2', 2), dependsOn: ['task-1'] }

      queue.addTask(task1)
      queue.addTask(task2)

      const executable = queue.getNextExecutableTasks()

      expect(executable.some((t) => t.id === 'task-2')).toBe(false)
    })

    it('should return tasks when dependencies are met', () => {
      const task1 = createTask('task-1', 1)
      const task2 = { ...createTask('task-2', 2), dependsOn: ['task-1'] }

      queue.addTask(task1)
      queue.addTask(task2)
      queue.updateTaskStatus('task-1', 'completed')

      const executable = queue.getNextExecutableTasks()

      expect(executable.some((t) => t.id === 'task-2')).toBe(true)
    })

    it('should sort tasks by priority', () => {
      queue.addTask({ ...createTask('low', 1), priority: 'low' })
      queue.addTask({ ...createTask('high', 2), priority: 'high' })
      queue.addTask({ ...createTask('critical', 3), priority: 'critical' })

      const executable = queue.getNextExecutableTasks()

      expect(executable[0].priority).toBe('critical')
    })
  })

  describe('isComplete', () => {
    it('should return true when all tasks are completed', () => {
      queue.addTask(createTask('task-1', 1))
      queue.updateTaskStatus('task-1', 'completed')

      expect(queue.isComplete()).toBe(true)
    })

    it('should return false when tasks are pending', () => {
      queue.addTask(createTask('task-1', 1))

      expect(queue.isComplete()).toBe(false)
    })
  })

  describe('hasFailed', () => {
    it('should return true when any task has failed', () => {
      queue.addTask(createTask('task-1', 1))
      queue.updateTaskStatus('task-1', 'failed')

      expect(queue.hasFailed()).toBe(true)
    })

    it('should return false when no tasks have failed', () => {
      queue.addTask(createTask('task-1', 1))

      expect(queue.hasFailed()).toBe(false)
    })
  })

  describe('getProgress', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.getProgress()).toBe(0)
    })

    it('should calculate progress correctly', () => {
      queue.addTask(createTask('task-1', 1))
      queue.addTask(createTask('task-2', 2))
      queue.updateTaskStatus('task-1', 'completed')

      expect(queue.getProgress()).toBe(50)
    })

    it('should return 100 when all tasks are completed', () => {
      queue.addTask(createTask('task-1', 1))
      queue.updateTaskStatus('task-1', 'completed')

      expect(queue.getProgress()).toBe(100)
    })
  })

  describe('getSummary', () => {
    it('should return correct summary', () => {
      queue.addTask(createTask('task-1', 1))
      queue.addTask(createTask('task-2', 2))
      queue.updateTaskStatus('task-1', 'completed')
      queue.updateTaskStatus('task-2', 'running')

      const summary = queue.getSummary()

      expect(summary.total).toBe(2)
      expect(summary.completed).toBe(1)
      expect(summary.running).toBe(1)
      expect(summary.pending).toBe(0)
    })
  })

  describe('hasCircularDependencies', () => {
    it('should detect circular dependencies', () => {
      const task1 = { ...createTask('task-1', 1), dependsOn: ['task-2'] }
      const task2 = { ...createTask('task-2', 2), dependsOn: ['task-1'] }

      queue.addTask(task1)
      queue.addTask(task2)

      expect(queue.hasCircularDependencies()).toBe(true)
    })

    it('should return false for no circular dependencies', () => {
      const task1 = createTask('task-1', 1)
      const task2 = { ...createTask('task-2', 2), dependsOn: ['task-1'] }

      queue.addTask(task1)
      queue.addTask(task2)

      expect(queue.hasCircularDependencies()).toBe(false)
    })
  })

  describe('reset', () => {
    it('should clear all tasks', () => {
      queue.addTask(createTask('task-1', 1))
      queue.addTask(createTask('task-2', 2))

      queue.reset()

      expect(queue.getAllTasks()).toHaveLength(0)
    })
  })
})
