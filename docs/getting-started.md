# Getting Started with crew-opencode

This guide will help you install and start using crew-opencode for multi-agent orchestration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Your First Workflow](#your-first-workflow)
- [Understanding SOPs](#understanding-sops)
- [Working with Agents](#working-with-agents)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

1. **API Keys** for your chosen LLM providers:
   - [Anthropic API](https://console.anthropic.com/) - For Claude models (PM, TA, QA)
   - [OpenAI API](https://platform.openai.com/) - For GPT models (Design)
   - [Google AI](https://makersuite.google.com/) - For Gemini models (FE)

2. **Runtime** (only for npm installation):
   - [Node.js](https://nodejs.org/) >= 18.0 or [Bun](https://bun.sh/) >= 1.0
   - Standalone binaries don't require a runtime

3. **Optional**: [OpenCode CLI](https://opencode.ai/) for plugin integration

## Installation

### Option 1: Standalone Binary (Recommended)

Download the binary for your platform and add it to your PATH:

**macOS (Apple Silicon - M1/M2/M3)**
```bash
curl -L https://github.com/sehyun0518/crew-opencode/releases/download/v1.0.0/crew-opencode-macos-arm64 -o crew-opencode
chmod +x crew-opencode
sudo mv crew-opencode /usr/local/bin/
```

**macOS (Intel)**
```bash
curl -L https://github.com/sehyun0518/crew-opencode/releases/download/v1.0.0/crew-opencode-macos -o crew-opencode
chmod +x crew-opencode
sudo mv crew-opencode /usr/local/bin/
```

**Linux (x64)**
```bash
curl -L https://github.com/sehyun0518/crew-opencode/releases/download/v1.0.0/crew-opencode-linux-x64 -o crew-opencode
chmod +x crew-opencode
sudo mv crew-opencode /usr/local/bin/
```

**Windows (x64)**
1. Download [crew-opencode-windows-x64.exe](https://github.com/sehyun0518/crew-opencode/releases/download/v1.0.0/crew-opencode-windows-x64.exe)
2. Add the directory to your PATH or run directly

**Verify Installation**
```bash
crew-opencode --version
# Should output: 1.0.0
```

### Option 2: npm (GitHub Packages)

```bash
# Configure npm to use GitHub Packages
echo "@sehyun0518:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install globally
npm install -g @sehyun0518/crew-opencode

# Verify installation
crew-opencode --version
```

### Option 3: Bun

```bash
bunx @sehyun0518/crew-opencode install
```

## Configuration

### Step 1: Set API Keys

Set your API keys as environment variables:

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export ANTHROPIC_API_KEY="your-anthropic-key-here"
export OPENAI_API_KEY="your-openai-key-here"
export GOOGLE_API_KEY="your-google-key-here"
```

**Don't have all API keys?** You can disable agents you don't need (see Configuration File below).

### Step 2: Initialize Configuration (Optional)

crew-opencode works with default configuration, but you can customize it:

**Global Configuration** (applies to all projects):
```bash
mkdir -p ~/.opencode/crew-opencode
```

Create `~/.opencode/crew-opencode/config.json`:
```json
{
  "version": "1.0.0",
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-opus-4-5",
      "apiKey": "${ANTHROPIC_API_KEY}"
    },
    "ta": {
      "enabled": true,
      "model": "claude-sonnet-4.5",
      "apiKey": "${ANTHROPIC_API_KEY}"
    },
    "fe": {
      "enabled": true,
      "model": "gemini-3-pro",
      "apiKey": "${GOOGLE_API_KEY}"
    },
    "design": {
      "enabled": false,
      "model": "gpt-5.2-medium",
      "apiKey": "${OPENAI_API_KEY}"
    },
    "qa": {
      "enabled": true,
      "model": "claude-haiku-4.5",
      "apiKey": "${ANTHROPIC_API_KEY}"
    }
  },
  "sop": {
    "feature": { "enabled": true },
    "bugfix": { "enabled": true },
    "refactor": { "enabled": true }
  },
  "incidentReport": {
    "enabled": true,
    "outputDir": ".opencode/crew-opencode/incidents"
  }
}
```

**Local Configuration** (project-specific):
```bash
mkdir -p .opencode/crew-opencode
cp ~/.opencode/crew-opencode/config.json .opencode/crew-opencode/
```

### Step 3: Verify Configuration

```bash
crew-opencode doctor
```

This will check:
- ✓ OpenCode directory exists
- ✓ Configuration is valid
- ✓ API keys are set
- ✓ Agents are configured
- ✓ SOPs are available

## Your First Workflow

### Example 1: Simple Feature Implementation

```bash
crew-opencode crew "Add a user login form with email and password fields"
```

This will:
1. **PM** analyzes the request and creates a plan
2. **TA** researches best practices for login forms
3. **Design** reviews UX patterns (if enabled)
4. **FE** implements the login form component
5. **QA** writes and runs tests

**Expected Output:**
```
🚀 Starting workflow: feature
📋 Total steps: 5

[1/5] PM - Planning
  ⚙ Analyzing request...
  ✓ Plan created

[2/5] TA - Research
  ⚙ Researching login form patterns...
  ✓ Technical specs ready

[3/5] FE - Implementation
  ⚙ Creating login component...
  ✓ Component implemented

[4/5] QA - Testing
  ⚙ Writing tests...
  ✓ Tests passing

[5/5] PM - Final Review
  ✓ Workflow complete!

📊 Summary:
  Duration: 8m 32s
  Tasks: 5 completed
  Status: Success
```

### Example 2: Bug Fix

```bash
crew-opencode crew "Fix the crash when clicking the logout button" --sop bugfix
```

This will:
1. **PM** prioritizes the bug
2. **TA** analyzes root cause
3. **FE** implements minimal fix
4. **QA** verifies fix doesn't break anything

### Example 3: Refactoring

```bash
crew-opencode crew "Refactor the authentication module to use hooks instead of class components" --sop refactor
```

This will:
1. **PM** creates refactoring strategy
2. **TA** analyzes dependencies
3. **FE** performs refactoring
4. **QA** ensures all tests still pass

## Understanding SOPs

SOPs (Standard Operating Procedures) define how the crew tackles different types of tasks.

### Available SOPs

**1. Feature Development** (`feature`)
- **Duration**: 60-90 minutes
- **Steps**: 6
- **Agents**: PM → TA → Design → FE → QA → PM
- **Best for**: New features, enhancements

**2. Bug Fix** (`bugfix`)
- **Duration**: 40-70 minutes
- **Steps**: 5
- **Agents**: PM → TA → FE → QA → PM
- **Best for**: Fixing bugs, small corrections

**3. Refactoring** (`refactor`)
- **Duration**: 100-160 minutes
- **Steps**: 6
- **Agents**: PM → TA → FE → QA → PM
- **Best for**: Code improvements, restructuring

### Selecting an SOP

```bash
# Default: feature SOP
crew-opencode crew "Add dark mode"

# Explicit SOP selection
crew-opencode crew "Fix memory leak" --sop bugfix
crew-opencode crew "Convert to TypeScript" --sop refactor
```

## Working with Agents

### The Crew

Your crew consists of 5 specialized agents:

| Agent | Role | Model | Cost | Specialty |
|-------|------|-------|------|-----------|
| **PM** | Project Manager | Claude Opus 4.5 | 💰💰💰 | Strategy, orchestration |
| **TA** | Technical Analyst | Claude Sonnet 4.5 | 💰💰 | Research, architecture |
| **FE** | UI/UX Engineer | Gemini 3 Pro | 💰💰 | Implementation |
| **Design** | Designer | GPT 5.2 Medium | 💰💰 | UX/UI patterns |
| **QA** | Quality Assurance | Claude Haiku 4.5 | 💰 | Testing, verification |

### Viewing Available Agents

```bash
crew-opencode list
```

### Disabling Agents

To reduce costs, you can disable agents you don't need:

**Edit your config file:**
```json
{
  "crew": {
    "design": {
      "enabled": false  // Disable Design agent
    }
  }
}
```

**Common configurations:**

1. **Minimal** (PM + TA + FE + QA): Best balance of quality and cost
2. **Full** (All 5 agents): Maximum quality, higher cost
3. **Budget** (PM + FE + QA): Lower cost, still functional

## Advanced Usage

### Dry Run Mode

Preview what the crew will do without executing:

```bash
crew-opencode crew "Add user profiles" --dry-run
```

### Custom Project Path

Run crew-opencode in a different directory:

```bash
crew-opencode crew "Update homepage" --project /path/to/project
```

### Viewing Workflow Status

Check the status of a running workflow:

```bash
crew-opencode status <workflow-id>
```

### Incident Reports

When tasks fail, crew-opencode generates "Apology Letters" with:
- Root cause analysis
- Risk assessment
- Prevention strategy

**View recent incidents:**
```bash
crew-opencode reports
```

**View specific incident:**
```bash
crew-opencode reports --id <incident-id>
```

### Configuration Management

**View current configuration:**
```bash
crew-opencode config
```

**Get specific value:**
```bash
crew-opencode config crew.pm.model
```

**Set configuration value:**
```bash
crew-opencode config crew.pm.enabled true
```

## Troubleshooting

### Issue: "401 Unauthorized" or "API key not found"

**Solution**: Verify your API keys are set:
```bash
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY
echo $GOOGLE_API_KEY
```

If empty, add them to your shell profile and restart your terminal.

### Issue: "Agent not found" or "SOP not found"

**Solution**: Run the install command to set up agents and SOPs:
```bash
crew-opencode install --global
```

### Issue: Workflow takes too long

**Solution**: Disable unnecessary agents or use simpler SOPs:
- Use `bugfix` SOP for smaller changes
- Disable Design agent if not needed
- Check if tasks can be broken into smaller chunks

### Issue: "Rate limit exceeded"

**Solution**:
1. Wait a few minutes and retry
2. Upgrade your API plan for higher limits
3. Reduce parallel agent execution

### Issue: Tests failing after implementation

**Solution**: Review the incident report:
```bash
crew-opencode reports
```

The QA agent will have documented:
- What went wrong
- Why it failed
- How to prevent it

### Getting Help

**Check system status:**
```bash
crew-opencode doctor
```

**View logs:**
```bash
ls -la .opencode/crew-opencode/workflows/
```

**Report issues:**
- GitHub Issues: https://github.com/sehyun0518/crew-opencode/issues
- Documentation: https://github.com/sehyun0518/crew-opencode#readme

## Next Steps

Now that you're set up:

1. **Try the examples** above to get familiar with the crew
2. **Customize your configuration** for your workflow
3. **Read the [Configuration Guide](configuration.md)** for advanced options
4. **Review [Example Workflows](../README.md#usage)** for inspiration
5. **Join the community** to share your experience

## Cost Estimation

Typical costs per workflow (approximate):

- **Feature** (60-90min): $0.50 - $2.00
- **Bug Fix** (40-70min): $0.30 - $1.00
- **Refactor** (100-160min): $1.00 - $3.00

Cost varies based on:
- Complexity of the task
- Which agents are enabled
- Your API plan rates
- Amount of context needed

**Cost-saving tips:**
1. Disable Design agent for backend tasks
2. Use bugfix SOP for simple changes
3. Break large tasks into smaller workflows
4. Keep context windows small

---

**Need more help?** Check out the [full documentation](../README.md) or [join discussions](https://github.com/sehyun0518/crew-opencode/discussions).
