# Testing Guide

## 🚀 Quick Reference

### Fast Tests (Default - Recommended)
```bash
# Run fast tests (excludes slow integration tests)
bun test                    # ~400ms
bun run test:fast          # Same as above

# Watch mode for development
bun run test:watch         # Excludes slow tests
```

**What's excluded**: Config loader tests with memfs mocking (~30s)

### Full Test Suite (When Needed)
```bash
# Run ALL tests including slow ones
bun run test:full          # ~30-60s

# Full coverage report
bun run test:coverage:full # ~30-60s + coverage
```

**When to use**: Before committing, pre-release, CI/CD

### Coverage Reports
```bash
# Fast coverage (recommended for development)
bun run test:coverage      # ~1-2s

# Full coverage (for final verification)
bun run test:coverage:full # ~30-60s
```

---

## 📊 Test Breakdown

| Test Suite | Tests | Speed | Included in Fast |
|------------|-------|-------|------------------|
| `core/task-queue.test.ts` | 24 | Fast | ✅ Yes |
| `core/output-parser.test.ts` | 27 | Fast | ✅ Yes |
| `core/context-manager.test.ts` | 13 | Fast | ✅ Yes |
| `core/orchestrator.test.ts` | 18 | Fast | ✅ Yes |
| `core/llm-clients.test.ts` | 7 | Fast | ✅ Yes |
| `config/schema.test.ts` | 5 | Fast | ✅ Yes |
| `config/index.test.ts` | 9 | Fast | ✅ Yes |
| `sop/index.test.ts` | 11 | Fast | ✅ Yes |
| **`config/loader.test.ts`** | **36** | **Slow** | ❌ **No** |

**Fast tests**: 114 tests in ~400ms
**Full tests**: 150 tests in ~30-60s

---

## 🎯 Workflow Recommendations

### During Development
```bash
# Quick validation (fast!)
bun test

# Watch mode for TDD
bun run test:watch
```

### Before Committing
```bash
# TypeScript check
bun run typecheck

# Fast tests
bun test

# Optional: Full test suite
bun run test:full
```

### Before Pushing
```bash
# Full validation
bun run typecheck
bun run test:full
bun run lint
```

### CI/CD Pipeline
```bash
# Use full test suite
bun run test:coverage:full
```

---

## 🔍 Why Config Loader Tests Are Slow

The `config/loader.test.ts` file uses **memfs** to mock the file system:
- Creates virtual file system
- Tests file reads/writes
- Tests config loading from disk
- 36 comprehensive tests

**Time**: ~30-60s due to:
- File system mocking overhead
- Multiple file operations per test
- Environment variable manipulation

**When to run**: Only when modifying config loading logic or before release.

---

## 📈 Coverage Targets

| Metric | Target | Current | Fast Tests |
|--------|--------|---------|------------|
| Statements | 80% | 82.37% | ~75% |
| Branches | 80% | 75% | ~70% |
| Functions | 80% | 77.96% | ~75% |
| Lines | 80% | 82.69% | ~75% |

**Note**: Fast tests provide ~75% coverage, sufficient for rapid development iteration.

---

## 🛠️ Troubleshooting

### Tests Hanging
```bash
# Use fast tests instead
bun test              # Not: bun run test:full
```

### Need Specific Test
```bash
# Run single file
bun test tests/core/output-parser.test.ts

# Run pattern
bun test tests/core/*.test.ts
```

### Coverage Not Updating
```bash
# Clear coverage cache
rm -rf coverage/
bun run test:coverage
```

### Want to Add More Slow Tests
Edit `package.json`:
```json
{
  "scripts": {
    "test": "vitest run --exclude 'tests/config/loader.test.ts' --exclude 'tests/slow/*.test.ts'"
  }
}
```

---

## 🎨 Best Practices

### ✅ Do
- Use `bun test` for rapid iteration
- Run `test:full` before committing
- Write fast unit tests when possible
- Use mocks to avoid slow I/O

### ❌ Don't
- Don't use `test:full` during active development
- Don't add more slow integration tests without good reason
- Don't skip tests completely (use fast subset)
- Don't commit without running `test:full` at least once

---

## 📝 Adding New Tests

### Fast Test (Preferred)
```typescript
// tests/core/my-feature.test.ts
import { describe, it, expect } from 'vitest'

describe('My Feature', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})
```

Automatically included in fast tests ✅

### Slow Test (If Necessary)
```typescript
// tests/integration/slow-feature.test.ts
import { describe, it, expect } from 'vitest'

describe('Slow Feature', () => {
  it('should work with real I/O', async () => {
    // File system operations, real API calls, etc.
  })
})
```

Add to exclude list in `package.json`:
```json
"test": "vitest run --exclude 'tests/config/loader.test.ts' --exclude 'tests/integration/*.test.ts'"
```

---

## 🚦 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      # Fast tests for quick feedback
      - name: Fast Tests
        run: bun test

      # Full tests for final validation
      - name: Full Test Suite
        run: bun run test:full

      # Coverage report
      - name: Coverage
        run: bun run test:coverage:full
```

---

## 📊 Performance Benchmarks

| Command | Time | Use Case |
|---------|------|----------|
| `bun test` | ~400ms | ⚡ Development |
| `bun run test:watch` | ~400ms | 🔄 TDD |
| `bun run test:coverage` | ~1-2s | 📊 Quick coverage |
| `bun run test:full` | ~30-60s | ✅ Pre-commit |
| `bun run test:coverage:full` | ~30-60s | 🎯 Final validation |

---

**Recommendation**: Use `bun test` (fast) 99% of the time. Use `bun run test:full` before commits/releases.
