# Standard Operating Procedures (SOPs)

SOPs define how the crew tackles different types of development tasks. This guide explains each SOP, when to use it, and how to customize it.

## Table of Contents

- [Overview](#overview)
- [Feature Development SOP](#feature-development-sop)
- [Bug Fix SOP](#bug-fix-sop)
- [Refactoring SOP](#refactoring-sop)
- [Choosing the Right SOP](#choosing-the-right-sop)
- [Customizing SOPs](#customizing-sops)
- [Creating Custom SOPs](#creating-custom-sops)

## Overview

SOPs (Standard Operating Procedures) are predefined workflows that ensure consistent, high-quality results. Each SOP defines:

- **Steps**: Sequence of agent actions
- **Agents**: Which agents participate
- **Dependencies**: Which steps must complete before others
- **Parallel execution**: Which steps can run simultaneously
- **Duration**: Estimated time to complete

### Available SOPs

| SOP | Duration | Steps | Agents | Best For |
|-----|----------|-------|--------|----------|
| **feature** | 60-90 min | 6 | PM, TA, Design, FE, QA | New features, enhancements |
| **bugfix** | 40-70 min | 5 | PM, TA, FE, QA | Bug fixes, corrections |
| **refactor** | 100-160 min | 6 | PM, TA, FE, QA | Code improvements, restructuring |

---

## Feature Development SOP

### Overview

The feature SOP is designed for implementing new functionality from scratch. It includes research, design, implementation, and thorough testing.

**Use for:**
- ✅ New features
- ✅ Major enhancements
- ✅ New components or modules
- ✅ Complex integrations

**Don't use for:**
- ❌ Simple bug fixes
- ❌ Minor tweaks
- ❌ Quick patches

### Workflow Steps

```
User Request
     ↓
[1] PM - Planning & Analysis (5-10 min)
     ↓
[2] TA - Research & Specs (15-20 min)
     ↓ (parallel with Design if enabled)
[3] Design - UX Review (10-15 min)
     ↓
[4] FE - Implementation (20-30 min)
     ↓
[5] QA - Testing (10-15 min)
     ↓
[6] PM - Final Review (5 min)
     ↓
  Result
```

### Step Details

**Step 1: PM Planning**
- Analyzes user request
- Determines scope and complexity
- Creates high-level plan
- Assigns tasks to agents

**Step 2: TA Research**
- Researches best practices
- Reviews official documentation
- Analyzes existing codebase
- Provides technical specifications
- Identifies dependencies and risks

**Step 3: Design Review** (optional, parallel with TA)
- Reviews UX flows
- Recommends design patterns
- Ensures consistency with design system
- Identifies accessibility concerns

**Step 4: FE Implementation**
- Implements based on TA specs and Design guidelines
- Writes clean, maintainable code
- Follows project conventions
- Adds necessary documentation

**Step 5: QA Testing**
- Writes unit tests
- Writes integration tests
- Verifies functionality
- Checks edge cases
- Ensures code quality

**Step 6: PM Final Review**
- Reviews all outputs
- Ensures requirements met
- Generates summary
- Creates completion report

### Example Usage

```bash
# Basic feature implementation
crew-opencode crew "Add user authentication with email/password"

# Explicit feature SOP
crew-opencode crew "Add dark mode toggle" --sop feature

# With project path
crew-opencode crew "Add API rate limiting" --sop feature --project /path/to/project
```

### Configuration

```json
{
  "sop": {
    "feature": {
      "enabled": true,
      "parallel": ["ta", "design"]  // TA and Design run simultaneously
    }
  }
}
```

### Cost & Time

**Typical Duration**: 60-90 minutes
**Typical Cost**: $0.50 - $2.00

**Factors affecting time:**
- Complexity of feature
- Amount of research needed
- Number of files to modify
- Test coverage requirements

---

## Bug Fix SOP

### Overview

The bugfix SOP is optimized for identifying and fixing bugs quickly with minimal, targeted changes.

**Use for:**
- ✅ Fixing crashes or errors
- ✅ Correcting logic bugs
- ✅ Resolving UI issues
- ✅ Performance problems

**Don't use for:**
- ❌ Adding new features
- ❌ Major refactoring
- ❌ Architecture changes

### Workflow Steps

```
Bug Report
     ↓
[1] PM - Triage & Prioritization (3-5 min)
     ↓
[2] TA - Root Cause Analysis (10-15 min)
     ↓
[3] FE - Minimal Fix (15-25 min)
     ↓
[4] QA - Regression Testing (10-15 min)
     ↓
[5] PM - Verification (5 min)
     ↓
  Fixed
```

### Step Details

**Step 1: PM Triage**
- Assesses bug severity
- Determines priority
- Creates fix strategy
- Assigns resources

**Step 2: TA Root Cause Analysis**
- Investigates the issue
- Identifies root cause
- Analyzes impact
- Recommends minimal fix approach

**Step 3: FE Implementation**
- Implements targeted fix
- Avoids unnecessary changes
- Preserves existing functionality
- Documents the fix

**Step 4: QA Regression Testing**
- Verifies bug is fixed
- Tests related functionality
- Checks for new issues
- Validates edge cases

**Step 5: PM Verification**
- Confirms fix works
- Reviews for side effects
- Generates fix summary

### Example Usage

```bash
# Basic bug fix
crew-opencode crew "Fix crash when clicking logout button" --sop bugfix

# With description
crew-opencode crew "Memory leak in dashboard component" --sop bugfix

# Specific project
crew-opencode crew "API returning 500 error" --sop bugfix --project ./backend
```

### Configuration

```json
{
  "sop": {
    "bugfix": {
      "enabled": true,
      "parallel": []  // No parallel execution (sequential for safety)
    }
  }
}
```

### Cost & Time

**Typical Duration**: 40-70 minutes
**Typical Cost**: $0.30 - $1.00

**Factors affecting time:**
- Bug complexity
- Time to reproduce
- Code coverage
- Dependency analysis

---

## Refactoring SOP

### Overview

The refactor SOP is designed for improving code quality without changing functionality. It includes comprehensive testing to ensure nothing breaks.

**Use for:**
- ✅ Code restructuring
- ✅ Performance optimization
- ✅ Modernizing legacy code
- ✅ Improving maintainability
- ✅ Reducing technical debt

**Don't use for:**
- ❌ Bug fixes
- ❌ New features
- ❌ Quick improvements

### Workflow Steps

```
Refactor Request
     ↓
[1] PM - Strategy & Planning (10-15 min)
     ↓
[2] TA - Dependency Analysis (20-30 min)
     ↓
[3] FE - Refactoring (40-60 min)
     ↓
[4] QA - Comprehensive Testing (20-30 min)
     ↓
[5] PM - Impact Review (10 min)
     ↓
  Refactored
```

### Step Details

**Step 1: PM Strategy**
- Defines refactoring goals
- Identifies risks
- Creates rollback plan
- Sets success criteria

**Step 2: TA Dependency Analysis**
- Maps all dependencies
- Identifies breaking points
- Analyzes impact scope
- Recommends approach
- Plans incremental steps

**Step 3: FE Refactoring**
- Performs code changes
- Maintains functionality
- Improves code quality
- Updates documentation
- Follows best practices

**Step 4: QA Comprehensive Testing**
- Runs all existing tests
- Adds new tests if needed
- Verifies no regression
- Checks performance
- Validates edge cases

**Step 5: PM Impact Review**
- Reviews all changes
- Assesses improvement
- Documents benefits
- Creates migration notes

### Example Usage

```bash
# Class to functional components
crew-opencode crew "Convert User component to use hooks" --sop refactor

# Performance optimization
crew-opencode crew "Optimize database queries in API" --sop refactor

# Modernization
crew-opencode crew "Migrate from JavaScript to TypeScript" --sop refactor
```

### Configuration

```json
{
  "sop": {
    "refactor": {
      "enabled": true,
      "parallel": ["ta"]  // TA can run parallel analysis
    }
  }
}
```

### Cost & Time

**Typical Duration**: 100-160 minutes
**Typical Cost**: $1.00 - $3.00

**Factors affecting time:**
- Size of refactoring
- Complexity of dependencies
- Test coverage needs
- Number of files affected

---

## Choosing the Right SOP

### Decision Tree

```
Is it a bug?
  ├─ Yes → Use BUGFIX
  └─ No ↓

Are you changing functionality?
  ├─ No → Use REFACTOR
  └─ Yes ↓

Is it a new feature?
  ├─ Yes → Use FEATURE
  └─ Unclear → Use FEATURE (default)
```

### Examples by Task Type

**Use FEATURE for:**
- "Add user authentication"
- "Create admin dashboard"
- "Implement payment integration"
- "Add email notifications"
- "Build API endpoints"

**Use BUGFIX for:**
- "Fix crash on logout"
- "Resolve memory leak"
- "Correct validation logic"
- "Fix broken link"
- "Resolve API 500 error"

**Use REFACTOR for:**
- "Convert to TypeScript"
- "Optimize performance"
- "Modernize code"
- "Improve error handling"
- "Restructure components"

### Ambiguous Cases

**"Update homepage design"**
- Use FEATURE if adding new elements
- Use REFACTOR if just improving existing

**"Improve API performance"**
- Use REFACTOR if changing implementation
- Use BUGFIX if fixing specific slow query

**"Add error handling"**
- Use FEATURE if adding comprehensive system
- Use BUGFIX if fixing specific missing error

---

## Customizing SOPs

### Disabling SOPs

If you don't need a particular SOP:

```json
{
  "sop": {
    "refactor": {
      "enabled": false  // Disable refactor SOP
    }
  }
}
```

### Configuring Parallel Execution

Control which agents run in parallel:

```json
{
  "sop": {
    "feature": {
      "parallel": ["ta", "design", "qa"]  // Multiple agents parallel
    },
    "bugfix": {
      "parallel": []  // All sequential (safer for bugs)
    }
  }
}
```

**Parallel execution benefits:**
- ⚡ Faster total time
- 💰 Same cost (just faster)
- 🎯 Good for independent tasks

**Sequential execution benefits:**
- 🔒 Safer (less chance of conflicts)
- 📊 Easier to debug
- 🎯 Good for dependent tasks

---

## Creating Custom SOPs

### SOP Structure (Future Feature)

In v1.1, you'll be able to create custom SOPs:

```json
{
  "sop": {
    "api-development": {
      "enabled": true,
      "description": "Develop backend API endpoints",
      "steps": [
        {
          "agent": "pm",
          "action": "Plan API structure",
          "order": 1
        },
        {
          "agent": "ta",
          "action": "Design data models",
          "order": 2
        },
        {
          "agent": "fe",
          "action": "Implement endpoints",
          "order": 3
        },
        {
          "agent": "qa",
          "action": "Test API",
          "order": 4
        }
      ],
      "parallel": ["ta"]
    }
  }
}
```

### Template System (Coming Soon)

Future versions will support:
- SOP templates marketplace
- Community-contributed SOPs
- Industry-specific workflows
- Team custom SOPs

---

## Best Practices

### 1. Use the Right SOP

Don't try to force a bug fix through the feature SOP. Use the appropriate workflow for better results.

### 2. Default to Feature

When in doubt, use the feature SOP. It's comprehensive and catches most cases.

### 3. Sequential for Critical Tasks

Use sequential execution (no parallel) for:
- Security-sensitive features
- Database migrations
- Complex refactoring

### 4. Parallel for Speed

Use parallel execution for:
- Research + Design phases
- Independent components
- Documentation tasks

### 5. Monitor Duration

Track how long workflows take:

```bash
# Check workflow duration
crew-opencode reports --stats

# View specific workflow
crew-opencode status <workflow-id>
```

### 6. Customize Per Project

Different projects may need different SOP configurations:

```bash
# Project A (backend-heavy)
cd project-a
cat .opencode/crew-opencode/config.json
# → design disabled, parallel TA

# Project B (frontend-heavy)
cd project-b
cat .opencode/crew-opencode/config.json
# → all agents enabled, parallel design
```

---

## Troubleshooting

### Issue: SOP Takes Too Long

**Solution 1**: Use a simpler SOP
```bash
# Use bugfix instead of feature for small changes
crew-opencode crew "Fix typo" --sop bugfix
```

**Solution 2**: Enable parallel execution
```json
{
  "sop": {
    "feature": {
      "parallel": ["ta", "design"]
    }
  }
}
```

**Solution 3**: Disable optional agents
```json
{
  "crew": {
    "design": { "enabled": false }
  }
}
```

### Issue: Wrong SOP Selected

**Solution**: Explicitly specify the SOP
```bash
# Don't rely on auto-detection
crew-opencode crew "Your task" --sop feature
```

### Issue: SOP Not Found

**Check**: SOP is enabled
```bash
crew-opencode config sop.feature.enabled
```

**Solution**: Enable the SOP
```json
{
  "sop": {
    "feature": {
      "enabled": true
    }
  }
}
```

---

## Cost Comparison

**Feature SOP** (60-90 min):
- PM (Opus): $0.15
- TA (Sonnet): $0.024
- Design (GPT): $0.018
- FE (Gemini): $0.024
- QA (Haiku): $0.0045
- **Total**: ~$0.22

**Bugfix SOP** (40-70 min):
- PM (Opus): $0.10
- TA (Sonnet): $0.016
- FE (Gemini): $0.016
- QA (Haiku): $0.003
- **Total**: ~$0.14

**Refactor SOP** (100-160 min):
- PM (Opus): $0.20
- TA (Sonnet): $0.032
- FE (Gemini): $0.048
- QA (Haiku): $0.006
- **Total**: ~$0.29

---

**Next**: Learn about [Configuration](configuration.md) or return to [Getting Started](getting-started.md).
