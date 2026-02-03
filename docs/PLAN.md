# crew-opencode Implementation Plan

## Overview

Build an OpenCode plugin called **crew-opencode** that provides multi-agent orchestration with a professional crew of specialized agents, using TypeScript + Bun runtime.

> **"Low-cost tasks to affordable agents; high-level reasoning to top-tier models."**

## Core Philosophy

1. **Cost-Effective**: Simple, repetitive tasks are delegated to lightweight models, while complex reasoning is reserved for high-performance models.
2. **Specialization**: Rather than relying on generalists who do "everything," we aim for expert agents specialized in their specific **Roles**.
3. **Accountability**: When a task fails, a clear root cause analysis (The Apology Letter) is mandatory to prevent recurrence.

## Requirements

- **Multi-agent orchestration** with cost-optimized model selection
- **Role-based crew**: PM, TA, FE, Design, QA
- **`crew` command system** with structured SOPs
- **Automated Incident Reports** ("Apology Letter") for error handling
- **TypeScript + Bun** runtime for modern, fast execution
- Installable via `bunx crew-opencode install`
- Compatible with OpenCode's plugin system

## The Crew

| Role | Position | Model | Description |
|:-----|:---------|:------|:------------|
| **PM** | Project Manager | Opus 4.5 | Coordinates parallel team members (agents). Manages product strategy, determines priorities, and executes plans. |
| **TA** | Technical Analyst | Claude Sonnet 4.5 | Conducts research on official documentation and open-source implementations, performs deep analysis of the codebase. |
| **FE** | UI/UX Engineer | Gemini 3 Pro | Develops frontend logic and implements user interfaces reflecting the latest trends. |
| **Design** | Designer | GPT 5.2 Medium | Reviews UI/UX flows and proposes design systems. |
| **QA** | Quality Assurance | Claude Haiku 4.5 | Performs Unit Tests and E2E tests to verify stability and analyze quality. |

## Architecture

```
crew-opencode/
├── src/
│   ├── cli/                    # CLI commands
│   │   ├── index.ts            # Entry point
│   │   ├── install.ts          # Install command
│   │   ├── uninstall.ts        # Uninstall command
│   │   ├── crew.ts             # Main crew command
│   │   └── config.ts           # Configuration management
│   ├── core/                   # Orchestration engine
│   │   ├── orchestrator.ts     # PM coordinator
│   │   ├── agent-runner.ts     # Agent execution
│   │   ├── task-queue.ts       # Task management
│   │   ├── context-manager.ts  # Shared state
│   │   └── incident-report.ts  # Apology Letter system
│   ├── agents/                 # Role-based agents
│   │   ├── pm.md               # Project Manager agent
│   │   ├── ta.md               # Technical Analyst agent
│   │   ├── fe.md               # UI/UX Engineer agent
│   │   ├── design.md           # Designer agent
│   │   └── qa.md               # Quality Assurance agent
│   ├── sop/                    # Standard Operating Procedures
│   │   ├── feature.md          # Feature development SOP
│   │   ├── bugfix.md           # Bug fix SOP
│   │   └── refactor.md         # Refactoring SOP
│   ├── tools/                  # Custom tools
│   │   ├── index.ts
│   │   └── crew-tools.ts
│   ├── hooks/                  # OpenCode hooks
│   │   ├── pre-tool-use.ts
│   │   ├── post-tool-use.ts
│   │   └── stop.ts
│   └── config/                 # Configuration
│       ├── schema.ts           # Zod schemas
│       └── defaults.ts         # Default configuration
├── templates/                  # Project templates
│   └── crew-opencode.json      # Default config template
├── tests/                      # Test suite
│   ├── core/
│   ├── cli/
│   └── agents/
├── docs/                       # Documentation
│   ├── getting-started.md
│   ├── agents.md
│   ├── sop.md
│   └── configuration.md
├── package.json
├── tsconfig.json
├── bunfig.toml
└── README.md
```

## Implementation Phases

### Phase 1: Project Foundation

**Goal**: Set up project structure and build pipeline

**Tasks**:
- [ ] Initialize Bun project with TypeScript
- [ ] Configure tsconfig.json for strict mode
- [ ] Set up bunfig.toml for builds
- [ ] Create package.json with bin entries
- [ ] Add dev dependencies (vitest, @types/node)
- [ ] Create basic CLI entry point
- [ ] Set up build script for standalone binaries

**Files to create**:
- `package.json`
- `tsconfig.json`
- `bunfig.toml`
- `src/cli/index.ts`

### Phase 2: Configuration System

**Goal**: Define and validate plugin configuration

**Tasks**:
- [ ] Define configuration schema with Zod
- [ ] Create default configuration
- [ ] Implement config loading (project-level, user-level)
- [ ] Add config command to CLI
- [ ] Create config template

**Configuration Schema**:
```typescript
interface CrewConfig {
  version: string
  crew: {
    pm: AgentConfig      // Opus 4.5
    ta: AgentConfig      // Claude Sonnet 4.5
    fe: AgentConfig      // Gemini 3 Pro
    design: AgentConfig  // GPT 5.2 Medium
    qa: AgentConfig      // Claude Haiku 4.5
  }
  sop: {
    feature: SOPDefinition
    bugfix: SOPDefinition
    refactor: SOPDefinition
  }
  incidentReport: {
    enabled: boolean
    outputDir: string
  }
  hooks: {
    preToolUse: string[]
    postToolUse: string[]
    stop: string[]
  }
}
```

**Files to create**:
- `src/config/schema.ts`
- `src/config/defaults.ts`
- `src/cli/config.ts`
- `templates/crew-opencode.json`

### Phase 3: Core Orchestration Engine

**Goal**: Build the multi-agent coordination system with PM as orchestrator

**Tasks**:
- [ ] Implement PM Orchestrator class
- [ ] Create AgentRunner for individual agent execution
- [ ] Build TaskQueue with parallel/sequential support
- [ ] Implement ContextManager for shared state
- [ ] Add agent handoff logic with context summarization
- [ ] Create workflow execution engine

**PM Orchestrator Responsibilities**:
1. Parse user request
2. Create execution plan (SOP-based)
3. Delegate tasks to appropriate agents (TA, FE, Design, QA)
4. Manage agent dependencies (parallel vs sequential)
5. Aggregate results
6. Handle failures and trigger Incident Reports

**Files to create**:
- `src/core/orchestrator.ts`
- `src/core/agent-runner.ts`
- `src/core/task-queue.ts`
- `src/core/context-manager.ts`
- `src/core/types.ts`

### Phase 4: Incident Report System ("Apology Letter")

**Goal**: Implement automated error reporting and self-reflection for agents

**Tasks**:
- [ ] Define Incident Report schema
- [ ] Implement report generation on agent failure
- [ ] Create root cause analysis template
- [ ] Add risk analysis assessment
- [ ] Implement prevention strategy suggestions
- [ ] Store reports in designated directory

**Incident Report Structure**:
```typescript
interface IncidentReport {
  timestamp: string
  agent: string
  task: string
  rootCause: string        // Why did it stop?
  riskAnalysis: string     // What impact does this error have?
  preventionStrategy: string // How to prevent recurrence?
  context: object          // Relevant state at time of failure
}
```

**Files to create**:
- `src/core/incident-report.ts`
- `src/templates/incident-report.md`

### Phase 5: Role-Based Agents

**Goal**: Create the five core agents with specialized roles

**Agent Definitions**:

#### PM Agent (Project Manager)
- **Model**: Opus 4.5 (highest reasoning)
- **Role**: Orchestration, strategy, priority management
- **Inputs**: User requirements, project context
- **Outputs**: Execution plan, task assignments, final summary

#### TA Agent (Technical Analyst)
- **Model**: Claude Sonnet 4.5 (deep analysis)
- **Role**: Research, documentation analysis, codebase deep-dive
- **Inputs**: Technical requirements, existing codebase
- **Outputs**: Technical specifications, architecture recommendations

#### FE Agent (UI/UX Engineer)
- **Model**: Gemini 3 Pro (frontend specialist)
- **Role**: Frontend development, UI implementation
- **Inputs**: Design specs, component requirements
- **Outputs**: React/Vue/Svelte components, styling

#### Design Agent (Designer)
- **Model**: GPT 5.2 Medium (design thinking)
- **Role**: UI/UX flow review, design system proposals
- **Inputs**: User flows, design requirements
- **Outputs**: Design recommendations, component hierarchy

#### QA Agent (Quality Assurance)
- **Model**: Claude Haiku 4.5 (fast, cost-effective)
- **Role**: Testing, quality verification
- **Inputs**: Implementation code, test requirements
- **Outputs**: Test files, coverage reports, quality assessment

**Files to create**:
- `src/agents/pm.md`
- `src/agents/ta.md`
- `src/agents/fe.md`
- `src/agents/design.md`
- `src/agents/qa.md`
- `src/agents/index.ts`

### Phase 6: SOP (Standard Operating Procedures)

**Goal**: Define structured workflows to prevent agents from straying

**Tasks**:
- [ ] Define feature development SOP
- [ ] Define bug fix SOP
- [ ] Define refactoring SOP
- [ ] Implement SOP enforcement in orchestrator
- [ ] Add SOP validation hooks

**SOP Structure**:
```typescript
interface SOPDefinition {
  name: string
  steps: SOPStep[]
  requiredAgents: string[]
  checkpoints: Checkpoint[]
}

interface SOPStep {
  order: number
  agent: string
  action: string
  inputs: string[]
  outputs: string[]
  validation: string
}
```

**Files to create**:
- `src/sop/feature.md`
- `src/sop/bugfix.md`
- `src/sop/refactor.md`
- `src/sop/index.ts`

### Phase 7: OpenCode Integration

**Goal**: Integrate with OpenCode plugin system

**Tasks**:
- [ ] Create installation command
- [ ] Generate OpenCode-compatible agent files
- [ ] Implement hooks (PreToolUse, PostToolUse, Stop)
- [ ] Register custom tools
- [ ] Add uninstall command
- [ ] Implement `crew` command registration

**Installation Locations**:
- User-level: `~/.opencode/crew-opencode/`
- Project-level: `.opencode/crew-opencode/`

**Files to create**:
- `src/cli/install.ts`
- `src/cli/uninstall.ts`
- `src/cli/crew.ts`
- `src/hooks/pre-tool-use.ts`
- `src/hooks/post-tool-use.ts`
- `src/hooks/stop.ts`
- `src/tools/crew-tools.ts`

### Phase 8: CLI Completion

**Goal**: Finish CLI commands and user experience

**Commands**:
- `crew-opencode install` - Install plugin to OpenCode
- `crew-opencode uninstall` - Remove plugin
- `crew` - Main command to instruct agents (like a strict manager)
- `crew-opencode config [key] [value]` - Manage configuration
- `crew-opencode list` - List available agents and SOPs
- `crew-opencode doctor` - Diagnose installation issues
- `crew-opencode reports` - View incident reports

**Files to create**:
- `src/cli/crew.ts`
- `src/cli/list.ts`
- `src/cli/doctor.ts`
- `src/cli/reports.ts`

### Phase 9: Testing

**Goal**: Achieve 80%+ test coverage

**Tasks**:
- [ ] Unit tests for core orchestration
- [ ] Unit tests for configuration
- [ ] Unit tests for incident report system
- [ ] Integration tests for CLI commands
- [ ] Integration tests for agent execution
- [ ] E2E tests for common workflows

**Files to create**:
- `tests/core/orchestrator.test.ts`
- `tests/core/task-queue.test.ts`
- `tests/core/incident-report.test.ts`
- `tests/cli/install.test.ts`
- `tests/cli/crew.test.ts`

### Phase 10: Documentation & Distribution

**Goal**: Prepare for public release

**Tasks**:
- [ ] Write README.md with quick start
- [ ] Create getting-started guide
- [ ] Document all agents and their capabilities
- [ ] Document SOPs
- [ ] Document incident report system
- [ ] Build standalone binaries
- [ ] Publish to npm
- [ ] Create GitHub releases

## Agent Workflow Example

```
User: crew "Add authentication to the API"
        |
        v
+------------------+
|   PM (Opus 4.5)  |  <-- Analyzes request, creates SOP-based plan
+--------+---------+
         |
    +----+----+
    v         v
+----------+ +----------+
| TA       | | Design   |  <-- Parallel: Research + UX Review
| (Sonnet) | | (GPT)    |
+----+-----+ +----+-----+
     |            |
     v            v
+------------------+
|  FE (Gemini)     |  <-- Implements based on TA specs + Design
+--------+---------+
         |
         v
+------------------+
|  QA (Haiku)      |  <-- Tests, verifies quality
+--------+---------+
         |
         v
+------------------+
|   PM (Opus 4.5)  |  <-- Final review, summary
+------------------+

If any agent fails:
+------------------+
| Incident Report  |  <-- Root cause, risk analysis, prevention
| (Apology Letter) |
+------------------+
```

## Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| bun | Runtime | >= 1.0 |
| zod | Schema validation | ^3.22 |
| commander | CLI parsing | ^12.0 |
| chalk | Terminal styling | ^5.3 |
| vitest | Testing | ^1.0 |

## Model Cost Optimization

| Agent | Model | Cost Tier | Use Case |
|-------|-------|-----------|----------|
| PM | Opus 4.5 | High | Complex reasoning, orchestration |
| TA | Sonnet 4.5 | Medium | Deep analysis, research |
| FE | Gemini 3 Pro | Medium | Frontend implementation |
| Design | GPT 5.2 Medium | Medium | Design thinking |
| QA | Haiku 4.5 | Low | Fast, repetitive testing |

## Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| OpenCode plugin API changes | MEDIUM | Pin to stable API, abstract integration |
| Agent coordination complexity | MEDIUM | Strict SOP enforcement |
| Context window limits | HIGH | Context summarization between handoffs |
| Multi-model API integration | HIGH | Abstract model providers, graceful fallbacks |
| Agent output parsing | MEDIUM | Define strict output schemas, validate responses |
| Cost overruns | MEDIUM | Default to lower-cost models, usage tracking |

## Success Criteria

- [ ] `bunx crew-opencode install` works on macOS, Linux, Windows
- [ ] All 5 agents execute correctly within OpenCode
- [ ] PM orchestrator successfully coordinates multi-agent workflows
- [ ] SOP enforcement prevents agent deviation
- [ ] Incident reports generated on failures
- [ ] 80%+ test coverage
- [ ] Documentation complete
- [ ] Published to npm

## Future Enhancements (Post-v1.0)

- Custom agent definitions
- Custom SOP creation
- Workflow templates marketplace
- Team configuration sharing
- Integration with CI/CD pipelines
- Web dashboard for monitoring
- Cost analytics dashboard
- Plugin system for extending agents
