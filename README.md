# crew-opencode

> [!NOTE]
>
> [crewcode - thumbnail](./.github/assets/hero.png)
> 
> **"Low-cost tasks to affordable agents; high-level reasoning to top-tier models."**

[![npm version](https://img.shields.io/npm/v/crew-opencode.svg)](https://www.npmjs.com/package/crew-opencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

Multi-agent orchestration plugin for OpenCode. Coordinate specialized AI agents working together like a professional development team.

[English](README.md) | [한국어](README.ko.md)

## 📑 Table of Contents

- [Introduction](#-introduction)
- [Core Philosophy](#-core-philosophy)
- [The Crew](#-the-crew)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [SOPs](#-sops-standard-operating-procedures)
- [Configuration](#-configuration)
- [CLI Commands](#-cli-commands)
- [Development](#-development)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Introduction

**crew-opencode** is a multi-agent orchestration system that coordinates specialized AI agents to work together on software development tasks. Instead of using a single expensive model for everything, crew-opencode strategically assigns tasks to the right agent with the right model, optimizing both cost and quality.

When you type the `crew` command, you become the **Project Manager**, directing a team of specialized agents that follow structured **Standard Operating Procedures (SOPs)** to deliver high-quality results.

## 💡 Core Philosophy

1. **Cost-Effective**: Simple, repetitive tasks go to lightweight models (Haiku), while complex reasoning uses top-tier models (Opus). This approach reduces costs by 60-70% compared to using premium models for everything.

2. **Specialization**: Each agent is an expert in their domain (PM, Technical Analysis, Frontend, Design, QA) with tailored prompts and optimal model selection.

3. **Accountability**: When agents fail, they generate **Incident Reports ("Apology Letters")** with root cause analysis, risk assessment, and prevention strategies—ensuring continuous improvement.

## 👥 The Crew

Five specialized agents working together:

| Agent | Role | Model | Cost | Specialty |
|-------|------|-------|------|-----------|
| **PM** | Project Manager | Claude Opus 4.5 | 💰💰💰 | Orchestration, strategy, planning |
| **TA** | Technical Analyst | Claude Sonnet 4.5 | 💰💰 | Research, architecture, analysis |
| **FE** | UI/UX Engineer | Gemini 3 Pro | 💰💰 | Frontend implementation |
| **Design** | Designer | GPT 5.2 Medium | 💰💰 | UX flows, design systems |
| **QA** | Quality Assurance | Claude Haiku 4.5 | 💰 | Testing, verification |

**Cost Optimization**: By using Haiku for QA (repetitive testing) and Opus only for PM (critical decisions), you get premium quality at a fraction of the cost.

## ✨ Features

### 🎯 Multi-Agent Orchestration
- **5 specialized agents** with role-specific prompts and optimal models
- **Parallel execution** for tasks that can run simultaneously
- **Dependency management** ensures tasks complete in the correct order

### 📋 Structured Workflows (SOPs)
- **Feature Development** (60-90min): Full feature implementation with research, design, coding, and testing
- **Bug Fix** (40-70min): Root cause analysis and minimal, targeted fixes
- **Refactoring** (100-160min): Safe refactoring with comprehensive test coverage

### 📝 Incident Reporting ("Apology Letters")
- **Automatic generation** when tasks fail
- **Root cause analysis**: Why did it fail?
- **Risk assessment**: What's the impact?
- **Prevention strategy**: How to avoid it next time?

### 🔧 OpenCode Integration
- **Custom tools** for orchestration, status checking, and reporting
- **Hooks** for pre/post tool execution and session cleanup
- **Seamless installation** to OpenCode's plugin system

### 🎨 Beautiful CLI
- **Real-time progress** tracking with event-driven updates
- **Color-coded output** for easy reading
- **Dry-run mode** to preview execution plans
- **Comprehensive help** and error messages

## 📦 Installation

### Prerequisites
- [Bun](https://bun.sh/) >= 1.0 or [Node.js](https://nodejs.org/) >= 18.0
- [OpenCode](https://opencode.ai/) (optional, for plugin integration)

### Install via npm

```bash
npm install -g crew-opencode
```

### Install via Bun

```bash
bun install -g crew-opencode
```

### Install as OpenCode Plugin

```bash
# Install globally
crew-opencode install --global

# Or install locally in current project
crew-opencode install --local
```

## 🚀 Quick Start

### 1. Install crew-opencode

```bash
npm install -g crew-opencode
```

### 2. Run your first task

```bash
crew-opencode crew "Add authentication to the API"
```

### 3. Check available agents and SOPs

```bash
crew-opencode list
```

### 4. View incident reports

```bash
crew-opencode reports
```

## 📖 Usage

### Basic Command

```bash
crew-opencode crew "your task description"
```

### With SOP Selection

```bash
# Feature development (default)
crew-opencode crew "Add user profile page"

# Bug fixing
crew-opencode crew "Fix login timeout issue" --sop bugfix

# Refactoring
crew-opencode crew "Refactor authentication service" --sop refactor
```

### Dry Run Mode

Preview the execution plan without running:

```bash
crew-opencode crew "Add comments feature" --dry-run
```

### Example Workflows

**Adding a New Feature**:
```bash
crew-opencode crew "Add dark mode toggle to settings"
```

Output:
```
🎯 crew-opencode - Multi-Agent Orchestration

Task: Add dark mode toggle to settings
SOP: feature
Mode: Live

📋 Execution Plan:

Workflow: feature
Steps: 5
Required Agents: PM, TA, DESIGN, FE, QA

  1. PM
     Analyze requirements and create execution plan

  2. TA + DESIGN [Parallel]
     • TA: Research documentation and analyze codebase
     • DESIGN: Review UI/UX flows and propose design

  3. FE
     Implement feature based on specs

  4. QA
     Write and run tests, verify quality

  5. PM
     Final review and summary

🚀 Starting execution...
```

**Fixing a Bug**:
```bash
crew-opencode crew "Fix navbar overflow on mobile" --sop bugfix
```

**Refactoring Code**:
```bash
crew-opencode crew "Extract API client into separate module" --sop refactor
```

## 📋 SOPs (Standard Operating Procedures)

### Feature Development (60-90 minutes)
**When to use**: Implementing new features

**Workflow**:
1. **PM**: Requirements analysis and planning
2. **TA + Design** (Parallel): Technical research and UX design
3. **FE**: Implementation
4. **QA**: Testing (≥80% coverage)
5. **PM**: Final review

**Success Criteria**:
- All requirements met
- 80%+ test coverage
- No critical bugs
- PM approval

### Bug Fix (40-70 minutes)
**When to use**: Fixing bugs or issues

**Workflow**:
1. **PM**: Bug analysis and prioritization
2. **TA**: Root cause investigation
3. **FE**: Minimal fix implementation
4. **QA**: Regression testing
5. **PM**: Review and closure

**Principles**:
- Fix root cause, not symptoms
- Minimal changes only
- Always add regression test

### Refactoring (100-160 minutes)
**When to use**: Improving code quality

**Workflow**:
1. **PM**: Define scope and goals
2. **TA**: Architecture analysis
3. **QA**: Create safety net (baseline tests)
4. **FE**: Incremental refactoring
5. **QA**: Verify no regressions
6. **PM**: Final validation

**Safety First**:
- Tests before refactoring
- Incremental changes
- Continuous verification

## ⚙️ Configuration

Configuration file: `.opencode/crew-opencode/crew-opencode.json`

```json
{
  "version": "1.0",
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-opus-4.5",
      "maxTurns": 10,
      "temperature": 0.7
    },
    "ta": {
      "enabled": true,
      "model": "claude-sonnet-4.5",
      "maxTurns": 15,
      "temperature": 0.5
    }
    // ... other agents
  },
  "sop": {
    "default": "feature"
  },
  "incidentReport": {
    "enabled": true,
    "outputDir": "reports",
    "format": "json"
  }
}
```

### Agent Configuration

Each agent can be configured:
- `enabled`: Enable/disable the agent
- `model`: Model to use
- `maxTurns`: Maximum conversation turns
- `temperature`: Model temperature (0-2)

## 🛠️ CLI Commands

### Main Commands

```bash
# Execute a task with the crew
crew-opencode crew "task description" [options]

# Install plugin to OpenCode
crew-opencode install [--global|--local]

# Uninstall plugin
crew-opencode uninstall [--global|--local]
```

### Utility Commands

```bash
# List available agents and SOPs
crew-opencode list [--agents|--sops]

# Diagnose installation
crew-opencode doctor

# View incident reports
crew-opencode reports [--limit N]

# Manage configuration
crew-opencode config [key] [value]
```

### Options

- `-s, --sop <type>`: SOP type (feature, bugfix, refactor)
- `--dry-run`: Preview execution plan
- `-g, --global`: Global installation
- `-l, --local`: Local installation

## 🔧 Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/sehyun0518/crew-opencode.git
cd crew-opencode

# Install dependencies
bun install

# Build
bun run build

# Run locally
bun run dev
```

### Project Structure

```
crew-opencode/
├── src/
│   ├── agents/         # Agent definitions (PM, TA, FE, Design, QA)
│   ├── cli/            # CLI commands
│   ├── config/         # Configuration system
│   ├── core/           # Orchestration engine
│   ├── hooks/          # OpenCode hooks
│   ├── sop/            # SOP workflows
│   └── tools/          # Custom tools
├── tests/              # Test suite
└── templates/          # Templates
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Run with coverage
bun run test:coverage

# Watch mode
bun test --watch
```

**Coverage Goals**: ≥80% (lines, functions, statements)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests
5. Ensure tests pass (`bun test`)
6. Commit (`git commit -m 'feat: add amazing feature'`)
7. Push (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Workflow

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Maintain ≥80% test coverage
- Update documentation
- Add yourself to contributors list

## 📄 License

MIT © 2026 crew-opencode

See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh/) and [TypeScript](https://www.typescriptlang.org/)
- Powered by [Claude](https://www.anthropic.com/), [Gemini](https://deepmind.google/technologies/gemini/), and [GPT](https://openai.com/)
- Inspired by collaborative software development teams

---

**Made with ❤️ by the crew-opencode team**
* **Root Cause**: Why did it stop?
* **Risk Analysis**: What impact does this error have on the project?
* **Prevention Strategy**: How will we ensure this doesn't happen again?
* *This is not just a log; it is a **Self-Reflection** process for the agent.*

---

## 📦 Installation

OpenCode must be installed first.

```bash
# Install OpenCode first
curl -fsSL https://opencode.ai/install | bash

# Install crew-opencode plugin
bunx crew-opencode install
```

## Quick Start

```bash
# Run with default workflow
opencode

# Or execute a specific workflow
bunx crew-opencode run feature
```

## 🤝 Contributing
We are striving to create a better agent-based coding environment. We acknowledge that our current methods may not be the best, and we eagerly await your wisdom.
- Proposals for new Roles
- Improvements in Prompt Engineering
- Bug reports and fixes
- Etc.

All PRs are welcome. Please join us in becoming a constantly growing organization!

<p align="center"> © 2026 crew-opencode. All rights reserved. </p>
