# Configuration Guide

This guide covers all configuration options for crew-opencode, from basic setup to advanced customization.

## Table of Contents

- [Configuration Hierarchy](#configuration-hierarchy)
- [Configuration File Structure](#configuration-file-structure)
- [Agent Configuration](#agent-configuration)
- [SOP Configuration](#sop-configuration)
- [Incident Report Configuration](#incident-report-configuration)
- [Hooks Configuration](#hooks-configuration)
- [Environment Variables](#environment-variables)
- [Configuration Examples](#configuration-examples)
- [Best Practices](#best-practices)

## Configuration Hierarchy

crew-opencode uses a layered configuration system:

1. **Default Configuration** (built-in)
2. **Global Configuration** (`~/.opencode/crew-opencode/config.json`)
3. **Local Configuration** (`.opencode/crew-opencode/config.json`)
4. **Environment Variables** (highest priority)

Later configurations override earlier ones.

### Example Hierarchy

```
Default Config (built-in)
  ↓ overridden by
Global Config (~/.opencode/crew-opencode/config.json)
  ↓ overridden by
Local Config (.opencode/crew-opencode/config.json)
  ↓ overridden by
Environment Variables
```

## Configuration File Structure

### Complete Configuration Schema

```json
{
  "version": "1.0.0",
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-opus-4-5",
      "apiKey": "${ANTHROPIC_API_KEY}",
      "temperature": 0.7,
      "maxTokens": 4096,
      "timeout": 300000
    },
    "ta": {
      "enabled": true,
      "model": "claude-sonnet-4.5",
      "apiKey": "${ANTHROPIC_API_KEY}",
      "temperature": 0.5,
      "maxTokens": 4096,
      "timeout": 300000
    },
    "fe": {
      "enabled": true,
      "model": "gemini-3-pro",
      "apiKey": "${GOOGLE_API_KEY}",
      "temperature": 0.6,
      "maxTokens": 4096,
      "timeout": 300000
    },
    "design": {
      "enabled": true,
      "model": "gpt-5.2-medium",
      "apiKey": "${OPENAI_API_KEY}",
      "temperature": 0.8,
      "maxTokens": 4096,
      "timeout": 300000
    },
    "qa": {
      "enabled": true,
      "model": "claude-haiku-4.5",
      "apiKey": "${ANTHROPIC_API_KEY}",
      "temperature": 0.3,
      "maxTokens": 2048,
      "timeout": 180000
    }
  },
  "sop": {
    "feature": {
      "enabled": true,
      "parallel": ["ta", "design"]
    },
    "bugfix": {
      "enabled": true,
      "parallel": []
    },
    "refactor": {
      "enabled": true,
      "parallel": ["ta"]
    }
  },
  "incidentReport": {
    "enabled": true,
    "outputDir": ".opencode/crew-opencode/incidents",
    "retentionDays": 30
  },
  "hooks": {
    "preToolUse": [],
    "postToolUse": [],
    "stop": []
  }
}
```

## Agent Configuration

### Agent Properties

Each agent supports the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `enabled` | boolean | Yes | Enable/disable this agent |
| `model` | string | Yes | LLM model identifier |
| `apiKey` | string | Yes | API key (use env var syntax) |
| `temperature` | number | No | Creativity (0.0-1.0, default varies) |
| `maxTokens` | number | No | Max response length (default varies) |
| `timeout` | number | No | Request timeout in ms (default 300000) |

### Available Models

**Anthropic (Claude)**
- `claude-opus-4-5` - Most capable, highest cost
- `claude-sonnet-4.5` - Balanced performance and cost
- `claude-haiku-4.5` - Fast, low cost

**OpenAI (GPT)**
- `gpt-5.2-medium` - Advanced reasoning
- `gpt-4-turbo` - Previous generation
- `gpt-3.5-turbo` - Budget option

**Google (Gemini)**
- `gemini-3-pro` - Advanced multimodal
- `gemini-2-flash` - Fast responses
- `gemini-1.5-pro` - Previous generation

### Temperature Guidelines

| Temperature | Use Case | Agents |
|-------------|----------|--------|
| 0.0 - 0.3 | Deterministic, factual | QA |
| 0.4 - 0.6 | Balanced | TA, FE |
| 0.7 - 0.8 | Creative | PM, Design |
| 0.9 - 1.0 | Very creative | Rarely used |

### Agent Configuration Examples

**Cost-Optimized (Minimal)**
```json
{
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-sonnet-4.5"  // Downgrade from Opus
    },
    "ta": {
      "enabled": true,
      "model": "claude-haiku-4.5"  // Downgrade from Sonnet
    },
    "fe": {
      "enabled": true,
      "model": "gemini-2-flash"  // Use faster model
    },
    "design": {
      "enabled": false  // Disable to save cost
    },
    "qa": {
      "enabled": true,
      "model": "claude-haiku-4.5"
    }
  }
}
```

**Quality-Optimized (Maximum)**
```json
{
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-opus-4-5",  // Highest quality
      "temperature": 0.8
    },
    "ta": {
      "enabled": true,
      "model": "claude-opus-4-5",  // Upgrade to Opus
      "temperature": 0.5
    },
    "fe": {
      "enabled": true,
      "model": "claude-sonnet-4.5",  // High quality
      "temperature": 0.6
    },
    "design": {
      "enabled": true,
      "model": "gpt-5.2-medium",
      "temperature": 0.9
    },
    "qa": {
      "enabled": true,
      "model": "claude-sonnet-4.5",  // Upgrade from Haiku
      "temperature": 0.2
    }
  }
}
```

**Backend-Focused**
```json
{
  "crew": {
    "pm": { "enabled": true },
    "ta": { "enabled": true },
    "fe": { "enabled": false },  // Disable frontend agent
    "design": { "enabled": false },  // Disable design agent
    "qa": { "enabled": true }
  }
}
```

## SOP Configuration

### SOP Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `enabled` | boolean | Yes | Enable/disable this SOP |
| `parallel` | string[] | No | Agents that can run in parallel |

### Parallel Execution

By default, agents run sequentially. You can configure parallel execution for independent tasks:

```json
{
  "sop": {
    "feature": {
      "enabled": true,
      "parallel": ["ta", "design"]  // TA and Design can run simultaneously
    }
  }
}
```

**When to use parallel execution:**
- ✅ Tasks are independent (TA research + Design review)
- ✅ No data dependency between agents
- ✅ Want to reduce total time

**When NOT to use parallel execution:**
- ❌ Later agent needs earlier agent's output
- ❌ API rate limits are tight
- ❌ Want to minimize concurrent costs

## Incident Report Configuration

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `enabled` | boolean | Yes | Generate incident reports on failure |
| `outputDir` | string | Yes | Directory for incident reports |
| `retentionDays` | number | No | Auto-delete reports older than N days |

### Example Configuration

```json
{
  "incidentReport": {
    "enabled": true,
    "outputDir": ".opencode/crew-opencode/incidents",
    "retentionDays": 30
  }
}
```

### Disabling Incident Reports

If you don't need failure analysis:

```json
{
  "incidentReport": {
    "enabled": false
  }
}
```

## Hooks Configuration

Hooks allow you to run custom actions at specific points in the workflow lifecycle.

### Hook Types

- `preToolUse`: Before any tool execution
- `postToolUse`: After any tool execution
- `stop`: When workflow completes or fails

### Example Hook Configuration

```json
{
  "hooks": {
    "preToolUse": [
      "echo 'Starting tool execution...'"
    ],
    "postToolUse": [
      "echo 'Tool execution complete'",
      "git status"
    ],
    "stop": [
      "echo 'Workflow finished'",
      "npm test"
    ]
  }
}
```

## Environment Variables

### Required Variables

```bash
# Anthropic (Claude)
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI (GPT)
export OPENAI_API_KEY="sk-..."

# Google (Gemini)
export GOOGLE_API_KEY="AI..."
```

### Optional Variables

```bash
# Override default config location
export CREW_OPENCODE_CONFIG_PATH="/custom/path/to/config.json"

# Override workflow storage location
export CREW_OPENCODE_WORKFLOWS_DIR="/custom/workflows"

# Enable debug logging
export CREW_OPENCODE_DEBUG=true

# Set default SOP
export CREW_OPENCODE_DEFAULT_SOP="bugfix"
```

### Using Environment Variables in Config

Reference environment variables in your config file:

```json
{
  "crew": {
    "pm": {
      "apiKey": "${ANTHROPIC_API_KEY}"
    }
  }
}
```

## Configuration Examples

### Example 1: Startup/Small Team

**Goal**: Balance cost and quality

```json
{
  "version": "1.0.0",
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-sonnet-4.5"
    },
    "ta": {
      "enabled": true,
      "model": "claude-haiku-4.5"
    },
    "fe": {
      "enabled": true,
      "model": "gemini-2-flash"
    },
    "design": {
      "enabled": false
    },
    "qa": {
      "enabled": true,
      "model": "claude-haiku-4.5"
    }
  },
  "sop": {
    "feature": { "enabled": true, "parallel": [] },
    "bugfix": { "enabled": true, "parallel": [] },
    "refactor": { "enabled": false }
  }
}
```

**Cost**: ~$0.30-$1.00 per workflow
**Quality**: Good for most tasks

### Example 2: Enterprise/High Quality

**Goal**: Maximum quality, cost is secondary

```json
{
  "version": "1.0.0",
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-opus-4-5",
      "temperature": 0.8,
      "maxTokens": 8192
    },
    "ta": {
      "enabled": true,
      "model": "claude-opus-4-5",
      "temperature": 0.5,
      "maxTokens": 8192
    },
    "fe": {
      "enabled": true,
      "model": "claude-sonnet-4.5",
      "temperature": 0.6
    },
    "design": {
      "enabled": true,
      "model": "gpt-5.2-medium",
      "temperature": 0.9
    },
    "qa": {
      "enabled": true,
      "model": "claude-sonnet-4.5",
      "temperature": 0.2,
      "maxTokens": 4096
    }
  },
  "sop": {
    "feature": { "enabled": true, "parallel": ["ta", "design"] },
    "bugfix": { "enabled": true, "parallel": [] },
    "refactor": { "enabled": true, "parallel": ["ta"] }
  }
}
```

**Cost**: ~$2.00-$5.00 per workflow
**Quality**: Excellent

### Example 3: Development/Testing

**Goal**: Fast iteration, minimal cost

```json
{
  "version": "1.0.0",
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-haiku-4.5"
    },
    "ta": {
      "enabled": false
    },
    "fe": {
      "enabled": true,
      "model": "gemini-2-flash"
    },
    "design": {
      "enabled": false
    },
    "qa": {
      "enabled": true,
      "model": "claude-haiku-4.5"
    }
  },
  "sop": {
    "feature": { "enabled": true, "parallel": [] },
    "bugfix": { "enabled": true, "parallel": [] },
    "refactor": { "enabled": false }
  },
  "incidentReport": {
    "enabled": false
  }
}
```

**Cost**: ~$0.10-$0.30 per workflow
**Quality**: Basic, good for prototyping

## Best Practices

### 1. Start with Defaults

Begin with the default configuration and only customize what you need:

```bash
# Use defaults first
crew-opencode crew "Add login form"

# Then customize if needed
```

### 2. Use Local Config for Projects

Keep project-specific settings in local config:

```bash
# In your project
mkdir -p .opencode/crew-opencode
echo '{
  "crew": {
    "fe": {
      "enabled": false
    }
  }
}' > .opencode/crew-opencode/config.json
```

### 3. Keep API Keys in Environment

Never commit API keys to version control:

```bash
# ❌ DON'T DO THIS
{
  "crew": {
    "pm": {
      "apiKey": "sk-ant-actual-key-here"
    }
  }
}

# ✅ DO THIS
{
  "crew": {
    "pm": {
      "apiKey": "${ANTHROPIC_API_KEY}"
    }
  }
}
```

### 4. Optimize for Your Use Case

| Use Case | Recommended Config |
|----------|-------------------|
| Backend APIs | Disable Design, keep TA/QA |
| Frontend | Enable all agents |
| Bug fixes | Use bugfix SOP, minimal agents |
| Prototyping | Disable QA, lower-tier models |
| Production | Enable all, higher-tier models |

### 5. Monitor Costs

Track your API usage:

```bash
# Check workflow logs
ls -la .opencode/crew-opencode/workflows/

# Review incident reports
crew-opencode reports
```

### 6. Test Configuration Changes

Verify your config before running expensive workflows:

```bash
# Check configuration
crew-opencode config

# Dry run to preview
crew-opencode crew "Test task" --dry-run

# Run health check
crew-opencode doctor
```

## Troubleshooting Configuration

### Issue: "Invalid configuration"

**Check**: Run validation
```bash
crew-opencode config validate
```

**Common causes**:
- Invalid JSON syntax
- Missing required fields
- Unknown property names

### Issue: "API key not found"

**Check**: Environment variables
```bash
echo $ANTHROPIC_API_KEY
```

**Solution**: Add to shell profile
```bash
echo 'export ANTHROPIC_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: Agent not executing

**Check**: Agent is enabled
```bash
crew-opencode config crew.pm.enabled
```

**Solution**: Enable the agent
```bash
crew-opencode config crew.pm.enabled true
```

## Configuration Management Commands

```bash
# View entire configuration
crew-opencode config

# Get specific value
crew-opencode config crew.pm.model

# Set value
crew-opencode config crew.pm.model claude-opus-4-5

# Reset to defaults
crew-opencode config --reset

# Export configuration
crew-opencode config --export > my-config.json

# Import configuration
crew-opencode config --import my-config.json
```

---

**Next**: Learn about [Advanced Usage](../README.md#advanced-usage) or return to [Getting Started](getting-started.md).
