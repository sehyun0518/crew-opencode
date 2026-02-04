# crew-opencode Tests

Test suite for crew-opencode using Vitest.

## Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun run test:coverage

# Run in watch mode
bun test --watch

# Run specific test file
bun test tests/core/task-queue.test.ts
```

## Coverage Goals

- **Minimum**: 80% overall coverage
- **Lines**: ≥ 80%
- **Functions**: ≥ 80%
- **Branches**: ≥ 75%
- **Statements**: ≥ 80%

## Test Structure

```
tests/
├── core/               # Core orchestration tests
│   ├── task-queue.test.ts
│   ├── context-manager.test.ts
│   └── ...
├── config/             # Configuration tests
│   └── schema.test.ts
├── sop/                # SOP utility tests
│   └── index.test.ts
├── agents/             # Agent tests
├── cli/                # CLI command tests
├── tools/              # Custom tools tests
└── hooks/              # Hook tests
```

## Writing Tests

Follow these guidelines:

1. **Test Structure**: Use `describe` and `it` blocks
2. **Setup**: Use `beforeEach` for test setup
3. **Assertions**: Use `expect` from vitest
4. **Coverage**: Aim for comprehensive test coverage
5. **Naming**: Use descriptive test names

Example:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('MyModule', () => {
  beforeEach(() => {
    // Setup
  })

  describe('myFunction', () => {
    it('should do something', () => {
      expect(myFunction()).toBe(expected)
    })
  })
})
```

## Test Categories

### Unit Tests
- Test individual functions and classes in isolation
- Mock external dependencies
- Fast execution

### Integration Tests
- Test multiple components working together
- Minimal mocking
- Test real workflows

### E2E Tests
- Test complete user workflows
- No mocking
- Slower execution
