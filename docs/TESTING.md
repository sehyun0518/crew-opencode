# Testing Guide

## 🚀 Quick Reference

### Fast Tests (Default - Recommended)
```bash
# Run fast tests (excludes slow integration tests)
bun run test               # ~300ms
bun run test:fast          # Same as above

# Watch mode for development
bun run test:watch         # Excludes slow tests
```

**Important**: Use `bun run test` (NOT `bun test`) to ensure package.json scripts are executed.
- `bun test` = Bun's built-in test runner (finds ALL test files)
- `bun run test` = Runs package.json script (vitest with exclusions)

**What's excluded**: All tests in `tests/slow/` directory (~30-60s)
- Config tests with memfs mocking
- Integration tests with heavy I/O

### Slow Tests (Separate Directory)
```bash
# Run only slow tests
bun run test:slow          # ~30-60s (50 tests in tests/slow/)

# Run ALL tests (fast + slow)
bun run test:full          # ~30-60s (150 tests total)

# Full coverage report
bun run test:coverage:full # ~30-60s + coverage
```

**When to use**: Before releasing, testing config changes, full validation

### Coverage Reports
```bash
# Fast coverage (recommended for development)
bun run test:coverage      # ~1-2s

# Full coverage (for final verification)
bun run test:coverage:full # ~30-60s
```

---

## 📊 Test Breakdown

### Fast Tests (tests/core + tests/sop)
| Test Suite | Tests | Speed |
|------------|-------|-------|
| `core/task-queue.test.ts` | 24 | ~5ms |
| `core/output-parser.test.ts` | 27 | ~10ms |
| `core/context-manager.test.ts` | 13 | ~5ms |
| `core/orchestrator.test.ts` | 18 | ~20ms |
| `core/llm-clients.test.ts` | 7 | ~3ms |
| `sop/index.test.ts` | 11 | ~3ms |

**Total**: 100 tests in ~300ms

### Slow Tests (tests/slow/)
| Test Suite | Tests | Speed |
|------------|-------|-------|
| `slow/loader.test.ts` | 36 | ~30s |
| `slow/index.test.ts` | 9 | ~1s |
| `slow/schema.test.ts` | 5 | ~1s |

**Total**: 50 tests in ~30-60s
**Full suite**: 150 tests total

---

## 🎯 Workflow Recommendations

### During Development
```bash
# Quick validation (fast!)
bun run test

# Watch mode for TDD
bun run test:watch
```

### Before Committing
```bash
# TypeScript check
bun run typecheck

# Fast tests
bun run test

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
bun run test              # Not: bun run test:full
```

### Need Specific Test
```bash
# Run single file
bun run test tests/core/output-parser.test.ts

# Run pattern
bun run test tests/core/*.test.ts
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
- Use `bun run test` for rapid iteration
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
        run: bun run test

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
| `bun run test` | ~400ms | ⚡ Development |
| `bun run test:watch` | ~400ms | 🔄 TDD |
| `bun run test:coverage` | ~1-2s | 📊 Quick coverage |
| `bun run test:full` | ~30-60s | ✅ Pre-commit |
| `bun run test:coverage:full` | ~30-60s | 🎯 Final validation |

---

**Recommendation**: Use `bun run test` (fast) 99% of the time. Use `bun run test:full` before commits/releases.
