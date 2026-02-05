# Contributing to crew-opencode

Thank you for your interest in contributing to crew-opencode! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Format](#commit-message-format)
- [Project Structure](#project-structure)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0 or [Node.js](https://nodejs.org/) >= 18.0
- Git
- TypeScript knowledge
- Familiarity with AI agent systems (helpful but not required)

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/crew-opencode.git
   cd crew-opencode
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Build the project:
   ```bash
   bun run build
   ```

5. Run tests to verify setup:
   ```bash
   bun test
   ```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/improvements

### Making Changes

1. **Write tests first** (TDD approach)
2. Implement your changes
3. Ensure all tests pass
4. Update documentation if needed
5. Run linter and formatter

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run with coverage
bun run test:coverage

# Run specific test file
bun test tests/core/task-queue.test.ts
```

### Building

```bash
# Development build
bun run dev

# Production build
bun run build
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `bun test`
2. Verify test coverage is >= 80%: `bun run test:coverage`
3. Update documentation if needed
4. Add yourself to the contributors list in README.md
5. Ensure your code follows our coding standards

### Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Link to any related issues
   - Screenshots/examples if applicable

3. Address review feedback promptly

4. Once approved, a maintainer will merge your PR

### Pull Request Template

```markdown
## Description
[Clear description of the changes]

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
[Describe the tests you ran and how to reproduce]

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Test coverage is >= 80%
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` if type is truly unknown

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Semicolons are required
- Max line length: 100 characters
- Use camelCase for variables and functions
- Use PascalCase for classes and types

### Immutability

**CRITICAL**: Always create new objects, never mutate:

```typescript
// WRONG: Mutation
function updateTask(task: Task, status: string) {
  task.status = status  // MUTATION!
  return task
}

// CORRECT: Immutability
function updateTask(task: Task, status: string) {
  return {
    ...task,
    status
  }
}
```

### File Organization

- Many small files over few large files
- 200-400 lines typical, 800 max per file
- High cohesion, low coupling
- Organize by feature/domain, not by type

### Error Handling

Always handle errors comprehensively:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## Testing Guidelines

### Test Structure

Use `describe` and `it` blocks:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('MyModule', () => {
  beforeEach(() => {
    // Setup
  })

  describe('myFunction', () => {
    it('should handle valid input', () => {
      expect(myFunction('valid')).toBe('expected')
    })

    it('should throw on invalid input', () => {
      expect(() => myFunction('invalid')).toThrow()
    })
  })
})
```

### Coverage Requirements

- **Minimum**: 80% overall coverage
- **Lines**: >= 80%
- **Functions**: >= 80%
- **Branches**: >= 75%
- **Statements**: >= 80%

### Test Categories

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test components working together
3. **E2E Tests**: Test complete workflows

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test additions/improvements
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```
feat: add parallel execution support to task queue

Implements parallel task execution with dependency management.
Tasks without dependencies can now run simultaneously.

Closes #123
```

```
fix: prevent circular dependencies in task queue

Added validation to detect and reject circular dependencies
before execution starts.
```

## Project Structure

```
crew-opencode/
├── src/
│   ├── agents/         # Agent definitions (PM, TA, FE, Design, QA)
│   ├── cli/            # CLI commands
│   ├── config/         # Configuration system
│   ├── core/           # Orchestration engine
│   │   ├── orchestrator.ts      # Main orchestration logic
│   │   ├── task-queue.ts        # Task execution management
│   │   ├── agent-runner.ts      # Agent execution with retry
│   │   ├── context-manager.ts   # Context management
│   │   └── incident-report.ts   # Incident reporting
│   ├── hooks/          # OpenCode hooks
│   ├── sop/            # SOP workflows
│   └── tools/          # Custom tools
├── tests/              # Test suite
│   ├── core/           # Core system tests
│   ├── config/         # Configuration tests
│   └── sop/            # SOP tests
├── templates/          # Report templates
└── docs/               # Additional documentation
```

## Debugging Tips

### Running in Development Mode

```bash
# Run with debug logging
CREW_OPENCODE_DEBUG=true bun run dev

# Test specific functionality
bun run dev crew "test task" --dry-run

# Check configuration
bun run dev config

# Run health check
bun run dev doctor
```

### Common Issues

**Issue: Tests failing locally but passing in CI**
- Clear node_modules: `rm -rf node_modules && bun install`
- Check Bun version: `bun --version`
- Verify test isolation

**Issue: TypeScript errors**
- Run type check: `bun run typecheck`
- Check for readonly property issues (spread arrays)
- Verify Zod v4 compatibility

**Issue: Mock errors in Vitest v4**
- Use class-based mocks, not object literals
- Ensure all methods are mocked
- Track state in mock functions

### Debugging Workflow Issues

1. **Check workflow state**: `.opencode/crew-opencode/workflows/*.json`
2. **Review incident reports**: `.opencode/crew-opencode/incidents/*.md`
3. **Enable verbose logging**: Set `DEBUG=crew:*`
4. **Test individual agents**: Mock other agents and test in isolation

## Security Guidelines

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: security@crew-opencode (not monitored yet - use GitHub Security)
2. Use GitHub's private vulnerability reporting
3. Wait for acknowledgment before public disclosure

### Security Best Practices

When contributing code:
- ✅ Never commit API keys, tokens, or secrets
- ✅ Use environment variables for sensitive data
- ✅ Validate all user inputs
- ✅ Sanitize file paths
- ✅ Use parameterized queries (if adding DB code)
- ✅ Implement rate limiting for API calls
- ✅ Add security tests for new features

**Example: Safe API key handling**
```typescript
// ❌ WRONG
const apiKey = "sk-proj-xxxxx"

// ✅ CORRECT
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY not configured')
}
```

## Release Process

### Version Numbers

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features, backward compatible (v1.1.0)
- **PATCH**: Bug fixes (v1.0.1)

### Creating a Release (Maintainers Only)

1. **Update version**:
   ```bash
   # Update package.json and src/cli/index.ts
   # Update CHANGELOG.md
   ```

2. **Run tests**:
   ```bash
   bun run test:full
   bun run test:coverage
   ```

3. **Build binaries**:
   ```bash
   bun run build:bin
   ```

4. **Create tag**:
   ```bash
   git tag -a v1.x.x -m "Release v1.x.x"
   git push origin v1.x.x
   ```

5. **Create GitHub release**:
   ```bash
   gh release create v1.x.x \
     bin/* \
     --title "v1.x.x" \
     --notes-file RELEASE_NOTES.md
   ```

## Community Guidelines

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, showcases
- **Pull Requests**: Code contributions

### Response Times

We aim to respond within:
- **Critical bugs**: 24 hours
- **Regular issues**: 3-5 days
- **Pull requests**: 5-7 days
- **Questions**: 2-3 days

### Code of Conduct Violations

Report violations to: conduct@crew-opencode.dev (or GitHub)

We will:
1. Review the report within 48 hours
2. Investigate thoroughly
3. Take appropriate action
4. Keep the reporter informed

## Recognition and Rewards

### Contributor Levels

**First-time Contributors**:
- Added to README contributors list
- Welcome badge on GitHub

**Regular Contributors** (3+ merged PRs):
- Listed in docs/CONTRIBUTORS.md
- Mentioned in release notes
- Special recognition badge

**Core Contributors** (10+ PRs, ongoing involvement):
- Commit access (after review)
- Decision-making participation
- Listed as project maintainer

### Hall of Fame

Outstanding contributions that:
- Fix critical security issues
- Add major features
- Significantly improve documentation
- Help other contributors

Will be featured in:
- README.md top section
- Project website (future)
- Conference presentations

## Development Resources

### Recommended Reading

**Multi-Agent Systems**:
- [LangChain Multi-Agent Documentation](https://python.langchain.com/docs/modules/agents/)
- [AutoGPT Architecture](https://github.com/Significant-Gravitas/AutoGPT)
- [CrewAI Design](https://github.com/joaomdmoura/crewAI)

**LLM Integration**:
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google AI Documentation](https://ai.google.dev/docs)

**TypeScript Best Practices**:
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Effective TypeScript](https://effectivetypescript.com/)

### Tools We Use

- **Runtime**: Bun
- **Testing**: Vitest
- **Validation**: Zod
- **CLI**: Commander
- **Styling**: Chalk
- **Linting**: ESLint + TypeScript ESLint

## Areas for Contribution

### High Priority

- ✅ **Additional agent roles**: Backend, DevOps, Documentation, etc.
- ✅ **More SOP workflows**: Deployment, migration, etc.
- ✅ **Enhanced incident report analytics**: ML-based root cause analysis
- ✅ **Performance optimizations**: Caching, parallel execution improvements
- ✅ **Cross-platform testing**: Windows and Linux binary verification

### Documentation

- ✅ **Tutorial videos**: YouTube series or documentation site
- ✅ **Example projects**: Real-world usage examples
- ✅ **Best practices guide**: Advanced patterns and anti-patterns
- ✅ **Troubleshooting guide**: Common issues and solutions
- ✅ **API reference**: Auto-generated from TypeScript

### Testing

- ✅ **Increase test coverage**: From 79% to 85%+
- ✅ **Add E2E tests**: Complete workflow testing with real LLM calls
- ✅ **Performance benchmarks**: Track execution time, token usage
- ✅ **Load testing**: Concurrent workflow execution

### Features

- ✅ **Agent customization UI**: Web-based agent configuration
- ✅ **Real-time collaboration**: Multiple developers on same workflow
- ✅ **Integration with dev tools**: VS Code extension, IDE plugins
- ✅ **Cost tracking**: Detailed token and cost analytics
- ✅ **Workflow templates**: Marketplace for custom SOPs
- ✅ **Agent memory persistence**: Learning from past workflows

### v1.1 Roadmap Priorities

See [docs/PLAN.md](docs/PLAN.md) for detailed roadmap.

## Questions?

If you have questions:
- Check existing [Issues](https://github.com/sehyun0518/crew-opencode/issues)
- Start a [Discussion](https://github.com/sehyun0518/crew-opencode/discussions)
- Read the [README](README.md) and [documentation](docs/)

## Recognition

Contributors will be:
- Listed in the README.md contributors section
- Mentioned in release notes
- Acknowledged in documentation

Thank you for contributing to crew-opencode!

---

© 2026 crew-opencode. All rights reserved.
