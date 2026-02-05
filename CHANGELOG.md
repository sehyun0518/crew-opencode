# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-05

### Added

#### Core Features
- **Multi-agent orchestration** with PM coordinator (Opus 4.5)
- **5 specialized agents**: PM, TA, FE, Design, QA with cost-optimized model selection
- **3 Standard Operating Procedures (SOPs)**: feature, bugfix, refactor workflows
- **Incident Report System**: Automated "Apology Letter" generation on agent failures
- **Workflow tracking and persistence**: Save/resume workflows to disk
- **Artifact extraction**: Share code blocks, files, and documents between agents

#### LLM Integration
- Anthropic API integration (Claude Opus 4.5, Sonnet 4.5, Haiku 4.5)
- OpenAI API integration (GPT-5.2 Medium)
- Google Generative AI integration (Gemini 3 Pro)
- Structured output parsing with XML/JSON validation
- Retry logic with exponential backoff
- Progress streaming for long-running tasks

#### CLI Commands
- `crew-opencode install` - Install plugin to OpenCode
- `crew-opencode uninstall` - Remove plugin from OpenCode
- `crew-opencode crew` - Execute multi-agent workflow
- `crew-opencode config` - Manage configuration
- `crew-opencode list` - List agents and SOPs
- `crew-opencode doctor` - System health check
- `crew-opencode reports` - View incident reports

#### OpenCode Integration
- Pre-tool-use hooks for validation
- Post-tool-use hooks for notifications
- Stop hooks for cleanup
- Custom tools: crewExecute, crewStatus

#### Configuration System
- Zod-based schema validation
- Default configuration templates
- Support for global and local config
- Environment variable support for API keys

#### Testing & Quality
- **79.28% test coverage** (194 total tests, 192 passing)
- Comprehensive test suite with unit, integration, and slow tests
- Fast test suite for rapid development (127 tests, ~300ms)
- Full test suite including disk I/O tests (194 tests, ~30s)
- GitHub Actions CI/CD pipeline
- Vitest configuration with coverage thresholds

#### Build & Distribution
- Standalone binaries for all platforms:
  - macOS (Intel): 58MB
  - macOS (ARM64): 58MB
  - Linux x64: 98MB
  - Windows x64: 110MB
- npm package published to GitHub Packages
- TypeScript strict mode with full type safety

### Technical Details

#### Architecture
- **Orchestrator**: PM coordinator managing task queue and agent execution
- **Context Manager**: Shared state between agents with artifact storage
- **Task Queue**: Parallel/sequential task execution with dependency management
- **Agent Runner**: LLM API orchestration with retry logic and progress tracking
- **Incident Report Manager**: Root cause analysis and prevention documentation
- **Workflow Storage**: JSON-based persistence to `.opencode/crew-opencode/workflows/`

#### Performance
- Parallel agent execution where possible
- Context summarization to prevent window overflow
- Model cost optimization (Haiku for repetitive tasks, Opus for complex reasoning)
- Efficient artifact extraction and deduplication

#### Security
- API key validation on install
- Environment variable support for secrets
- Secure file path handling
- Input validation with Zod schemas

### Known Limitations

- 2 orchestrator integration tests skipped pending mock updates
- Test coverage at 79.28% (target was 80%, close enough for v1.0)
- Cross-platform testing done on macOS only (Linux/Windows binaries untested)

### Migration Guide

This is the first stable release (v1.0.0). No migration needed.

To install:

```bash
# Using bunx (recommended)
bunx @sehyun0518/crew-opencode install

# Or download standalone binary from GitHub releases
```

### Contributors

- [@sehyun0518](https://github.com/sehyun0518) - Project Lead & Primary Developer

---

## [0.1.0] - 2026-01-XX

### Added
- Initial project setup
- Basic CLI structure
- Configuration system
- Agent definitions
- SOP templates

### Changed
- N/A (initial release)

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

**Legend**:
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities
