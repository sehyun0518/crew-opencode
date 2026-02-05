# Agent Documentation

This guide provides detailed information about each agent in the crew-opencode system.

## Table of Contents

- [Overview](#overview)
- [PM (Project Manager)](#pm-project-manager)
- [TA (Technical Analyst)](#ta-technical-analyst)
- [FE (UI/UX Engineer)](#fe-uiux-engineer)
- [Design (Designer)](#design-designer)
- [QA (Quality Assurance)](#qa-quality-assurance)
- [Cost Optimization](#cost-optimization)
- [Customizing Agents](#customizing-agents)

## Overview

crew-opencode uses 5 specialized agents, each with a specific role, model, and cost tier. This multi-agent approach ensures optimal cost-to-quality ratio by assigning the right model to each task type.

### The Crew at a Glance

| Agent | Role | Model | Cost Tier | Specialty |
|-------|------|-------|-----------|-----------|
| **PM** | Project Manager | Claude Opus 4.5 | 💰💰💰 HIGH | Strategy, orchestration, planning |
| **TA** | Technical Analyst | Claude Sonnet 4.5 | 💰💰 MEDIUM | Research, architecture, deep analysis |
| **FE** | UI/UX Engineer | Gemini 3 Pro | 💰💰 MEDIUM | Frontend implementation, UI code |
| **Design** | Designer | GPT 5.2 Medium | 💰💰 MEDIUM | UX flows, design systems, patterns |
| **QA** | Quality Assurance | Claude Haiku 4.5 | 💰 LOW | Testing, verification, quality checks |

### Cost Optimization Strategy

The crew is designed to minimize costs while maintaining high quality:

- **High-cost models** (Opus) only for complex reasoning (PM)
- **Medium-cost models** (Sonnet, Gemini, GPT) for balanced tasks
- **Low-cost models** (Haiku) for repetitive, predictable tasks (QA)

**Result**: 60-70% cost reduction compared to using Opus for everything.

---

## PM (Project Manager)

### Role Description

The PM is the brain of the operation. It coordinates all other agents, manages strategy, and ensures the workflow stays on track.

**Key Responsibilities:**
- Analyze user requests and break them into actionable tasks
- Create execution plans based on SOPs
- Coordinate parallel/sequential agent execution
- Make strategic decisions about implementation approach
- Review final outputs and ensure quality
- Generate project summaries

### Model Configuration

**Default Model**: `claude-opus-4-5`

**Why Opus?**
- Highest reasoning capability
- Best at strategic planning
- Excellent at coordinating complex workflows
- Can handle ambiguous requirements

**Configuration:**
```json
{
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-opus-4-5",
      "temperature": 0.7,
      "maxTokens": 4096,
      "timeout": 300000
    }
  }
}
```

### When PM Runs

The PM agent runs at these points in every workflow:

1. **Start**: Analyzes request, creates plan
2. **Checkpoints**: Reviews agent outputs during workflow
3. **End**: Final review and summary

### PM Output Examples

**Planning Phase:**
```
📋 Analysis Complete
  - Feature type: Authentication system
  - Complexity: Medium-High
  - Estimated time: 75 minutes
  - Agents needed: TA, FE, QA

📝 Execution Plan:
  1. TA: Research auth patterns (OAuth, JWT, session)
  2. FE: Implement login/signup forms
  3. QA: Test auth flows
```

### Cost Notes

- **Most expensive agent** (~$0.015 per 1K tokens)
- **Worth the cost** for complex reasoning
- **Downgrade option**: Use Sonnet for simpler tasks

---

## TA (Technical Analyst)

### Role Description

The TA is the research specialist. It conducts deep technical analysis, researches best practices, and provides detailed specifications.

**Key Responsibilities:**
- Research official documentation
- Analyze codebase architecture
- Identify dependencies and risks
- Provide technical specifications
- Recommend implementation approaches
- Review security implications

### Model Configuration

**Default Model**: `claude-sonnet-4.5`

**Why Sonnet?**
- Excellent analytical capabilities
- Strong at understanding complex codebases
- Good balance of quality and cost
- Fast enough for iterative research

**Configuration:**
```json
{
  "crew": {
    "ta": {
      "enabled": true,
      "model": "claude-sonnet-4.5",
      "temperature": 0.5,
      "maxTokens": 4096,
      "timeout": 300000
    }
  }
}
```

### When TA Runs

The TA runs early in workflows to provide research and context:

1. **After PM planning**: Researches technical approach
2. **Before FE implementation**: Provides specs and examples
3. **Optionally in parallel** with Design agent

### TA Output Examples

**Research Phase:**
```
🔍 Technical Analysis Complete

Authentication Approach:
  - Recommended: JWT with refresh tokens
  - Libraries: jsonwebtoken, bcrypt
  - Storage: httpOnly cookies for security

Architecture:
  - Middleware: auth.middleware.ts
  - Routes: /api/auth/login, /api/auth/signup
  - Models: User with password hashing

Security Considerations:
  - Use bcrypt for password hashing (cost factor: 12)
  - Implement rate limiting on auth endpoints
  - Add CSRF protection for state-changing operations
```

### Cost Notes

- **Medium cost** (~$0.003 per 1K tokens)
- **High value** for complex research
- **Downgrade option**: Use Haiku for simple lookups

---

## FE (UI/UX Engineer)

### Role Description

The FE agent implements frontend components and user interfaces based on specifications from TA and Design.

**Key Responsibilities:**
- Implement React/Vue/Angular components
- Create responsive layouts
- Handle user interactions
- Integrate with backend APIs
- Follow design system guidelines
- Ensure accessibility

### Model Configuration

**Default Model**: `gemini-3-pro`

**Why Gemini?**
- Strong at code generation
- Good understanding of modern frameworks
- Competitive cost
- Fast response times

**Configuration:**
```json
{
  "crew": {
    "fe": {
      "enabled": true,
      "model": "gemini-3-pro",
      "temperature": 0.6,
      "maxTokens": 4096,
      "timeout": 300000
    }
  }
}
```

### When FE Runs

The FE runs after research/design phases:

1. **After TA research**: Implements based on technical specs
2. **After Design review**: Follows UX patterns
3. **Before QA testing**: Completes implementation

### FE Output Examples

**Implementation:**
```typescript
// LoginForm.tsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Cost Notes

- **Medium cost** (~$0.002 per 1K tokens)
- **Good value** for code generation
- **Alternative**: Use Sonnet for complex UI logic

---

## Design (Designer)

### Role Description

The Design agent reviews UX flows and proposes design patterns and systems.

**Key Responsibilities:**
- Review user experience flows
- Recommend design patterns
- Suggest component libraries
- Ensure consistency with design systems
- Identify usability issues
- Propose accessibility improvements

### Model Configuration

**Default Model**: `gpt-5.2-medium`

**Why GPT-5.2?**
- Creative thinking for design
- Strong at UX reasoning
- Good at pattern recognition
- Understanding of design systems

**Configuration:**
```json
{
  "crew": {
    "design": {
      "enabled": true,
      "model": "gpt-5.2-medium",
      "temperature": 0.8,
      "maxTokens": 4096,
      "timeout": 300000
    }
  }
}
```

### When Design Runs

Design runs in parallel with TA (if configured):

1. **After PM planning**: Reviews UX approach
2. **In parallel with TA**: Provides design perspective
3. **Before FE implementation**: Guides UI decisions

### Design Output Examples

**UX Review:**
```
🎨 Design Review Complete

Login Form UX:
  - Use single-column layout for clarity
  - Add "Remember me" checkbox
  - Include "Forgot password?" link
  - Show password visibility toggle
  - Display clear error messages inline

Design System:
  - Use primary button for login action
  - Input fields: 44px height for touch targets
  - Spacing: 16px between form elements
  - Colors: Use brand colors for CTAs

Accessibility:
  - Add proper labels for screen readers
  - Ensure 4.5:1 contrast ratio
  - Support keyboard navigation
  - Add focus indicators
```

### Cost Notes

- **Medium cost** (~$0.003 per 1K tokens)
- **Optional**: Can be disabled for backend-only tasks
- **Alternative**: Use Sonnet if GPT unavailable

---

## QA (Quality Assurance)

### Role Description

The QA agent writes tests, verifies quality, and ensures the implementation meets requirements.

**Key Responsibilities:**
- Write unit tests
- Write integration tests
- Write E2E tests
- Verify code quality
- Check for edge cases
- Validate against requirements
- Ensure test coverage

### Model Configuration

**Default Model**: `claude-haiku-4.5`

**Why Haiku?**
- Fast and efficient
- Good enough for test generation
- Very cost-effective
- Consistent output quality

**Configuration:**
```json
{
  "crew": {
    "qa": {
      "enabled": true,
      "model": "claude-haiku-4.5",
      "temperature": 0.3,
      "maxTokens": 2048,
      "timeout": 180000
    }
  }
}
```

### When QA Runs

QA runs at the end of workflows:

1. **After FE implementation**: Tests the code
2. **Before final review**: Ensures quality
3. **Last step**: Validates everything works

### QA Output Examples

**Test Suite:**
```typescript
// LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from './LoginForm'
import { useAuth } from '../hooks/useAuth'

jest.mock('../hooks/useAuth')

describe('LoginForm', () => {
  it('should render email and password inputs', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('should call login on form submit', async () => {
    const mockLogin = jest.fn()
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false
    })

    render(<LoginForm />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should disable button while loading', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: true
    })

    render(<LoginForm />)
    expect(screen.getByText('Logging in...')).toBeDisabled()
  })
})
```

### Cost Notes

- **Lowest cost** (~$0.0003 per 1K tokens)
- **Best value**: 10x cheaper than Opus
- **Perfect for repetitive tasks** like test generation

---

## Cost Optimization

### Cost Comparison

**Full workflow with all agents** (feature SOP, ~75 minutes):

| Agent | Tokens Used | Cost | Percentage |
|-------|-------------|------|------------|
| PM | ~10,000 | $0.15 | 40% |
| TA | ~8,000 | $0.024 | 6% |
| FE | ~12,000 | $0.024 | 6% |
| Design | ~6,000 | $0.018 | 5% |
| QA | ~15,000 | $0.0045 | 1% |
| **Total** | ~51,000 | **~$0.22** | 100% |

**If using Opus for everything**:
- Total cost: ~$0.75 (3.4x more expensive)

### Cost-Saving Strategies

**1. Disable Optional Agents**
```json
{
  "crew": {
    "design": {
      "enabled": false  // Save ~5% per workflow
    }
  }
}
```

**2. Downgrade Models**
```json
{
  "crew": {
    "pm": {
      "model": "claude-sonnet-4.5"  // Save 60% on PM costs
    },
    "ta": {
      "model": "claude-haiku-4.5"  // Save 80% on TA costs
    }
  }
}
```

**3. Use Simpler SOPs**
```bash
# Use bugfix instead of feature for small changes
crew-opencode crew "Fix typo" --sop bugfix
```

### When to Splurge on Quality

Use premium models when:
- ✅ Critical production features
- ✅ Complex architecture decisions
- ✅ Security-sensitive implementations
- ✅ Large refactoring projects

Use budget models when:
- ✅ Prototyping and experimentation
- ✅ Simple bug fixes
- ✅ Documentation updates
- ✅ Learning and testing

---

## Customizing Agents

### Changing Models

You can use different models for any agent:

```json
{
  "crew": {
    "fe": {
      "model": "claude-sonnet-4.5"  // Use Sonnet instead of Gemini
    }
  }
}
```

### Adjusting Temperature

Control creativity vs consistency:

```json
{
  "crew": {
    "pm": {
      "temperature": 0.9  // More creative (default: 0.7)
    },
    "qa": {
      "temperature": 0.1  // More deterministic (default: 0.3)
    }
  }
}
```

### Increasing Token Limits

For complex tasks:

```json
{
  "crew": {
    "ta": {
      "maxTokens": 8192  // Double the default (4096)
    }
  }
}
```

### Disabling Agents

For specialized workflows:

```json
{
  "crew": {
    "design": { "enabled": false },  // No design review
    "qa": { "enabled": false }       // No testing (not recommended!)
  }
}
```

---

## Best Practices

### 1. Keep PM Enabled

The PM agent is essential for coordination. Don't disable it unless you know what you're doing.

### 2. QA is Worth It

Even though it's optional, QA catches bugs early and saves debugging time.

### 3. Disable Design for Backend

If you're working on APIs, databases, or backend logic, you can safely disable the Design agent.

### 4. Parallel Execution

Configure TA and Design to run in parallel for faster workflows:

```json
{
  "sop": {
    "feature": {
      "parallel": ["ta", "design"]
    }
  }
}
```

### 5. Monitor Costs

Track your agent costs over time:

```bash
# Review workflow logs
ls -la .opencode/crew-opencode/workflows/

# Check total tokens used
crew-opencode reports --stats
```

---

## Troubleshooting

### Issue: Agent Not Executing

**Check**: Agent is enabled
```bash
crew-opencode config crew.pm.enabled
```

**Solution**: Enable the agent
```bash
crew-opencode config crew.pm.enabled true
```

### Issue: Agent Timing Out

**Check**: Timeout setting
```bash
crew-opencode config crew.ta.timeout
```

**Solution**: Increase timeout
```json
{
  "crew": {
    "ta": {
      "timeout": 600000  // 10 minutes
    }
  }
}
```

### Issue: Poor Quality Output

**Try**:
1. Increase temperature for more creativity
2. Upgrade to a better model
3. Increase maxTokens for longer responses
4. Check that correct agent is assigned to task

---

**Next**: Learn about [SOPs](sop.md) or return to [Getting Started](getting-started.md).
