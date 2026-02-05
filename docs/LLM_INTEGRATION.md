# LLM API Integration

## Overview

crew-opencode integrates with three LLM providers to power its multi-agent system:

- **Anthropic** (Claude models) - PM, TA, QA agents
- **OpenAI** (GPT models) - Design agent
- **Google** (Gemini models) - FE agent

## Setup

### 1. Install Dependencies

```bash
bun add @anthropic-ai/sdk openai @google/generative-ai
```

### 2. Configure API Keys

Set environment variables for the providers you'll use:

```bash
# Required for PM, TA, QA agents (Claude models)
export ANTHROPIC_API_KEY=your-anthropic-key

# Required for Design agent (GPT models)
export OPENAI_API_KEY=your-openai-key

# Required for FE agent (Gemini models)
export GOOGLE_API_KEY=your-google-key
```

Add to your `~/.bashrc` or `~/.zshrc` for persistence.

### 3. Verify Configuration

```typescript
import { validateAPIKeys } from './src/core/llm-clients'

const status = validateAPIKeys()
console.log('Configured:', status)
// { anthropic: true, openai: true, google: true, missing: [] }
```

## Usage

### Automatic Provider Routing

The system automatically routes requests to the correct provider based on the model name:

```typescript
import { callLLM } from './src/core/llm-clients'

const response = await callLLM({
  model: 'claude-sonnet-4.5', // Automatically uses Anthropic
  prompt: 'Analyze this codebase...',
  systemPrompt: 'You are a technical analyst...',
  temperature: 0.7,
  maxTokens: 4096,
})

console.log(response.content)
console.log(response.tokenUsage)
```

### Supported Models

#### Anthropic (Claude)
- `claude-opus-4.5` - Highest reasoning (PM agent)
- `claude-sonnet-4.5` - Deep analysis (TA agent)
- `claude-haiku-4.5` - Fast, cost-effective (QA agent)

#### OpenAI (GPT)
- `gpt-5.2-medium` - Design thinking (Design agent)
- `gpt-5.2-mini` - Lightweight alternative

#### Google (Gemini)
- `gemini-3-pro` - Frontend implementation (FE agent)
- `gemini-3-flash` - Faster alternative

## Cost Optimization

### Agent-to-Model Mapping

| Agent | Model | Cost Tier | Use Case |
|-------|-------|-----------|----------|
| PM | claude-opus-4.5 | 💰💰💰 High | Complex orchestration, strategy |
| TA | claude-sonnet-4.5 | 💰💰 Medium | Deep analysis, research |
| FE | gemini-3-pro | 💰💰 Medium | Frontend implementation |
| Design | gpt-5.2-medium | 💰💰 Medium | Design thinking, UX flows |
| QA | claude-haiku-4.5 | 💰 Low | Fast, repetitive testing |

### Cost Estimation

The system automatically calculates costs based on token usage:

```typescript
const response = await callLLM({ ... })

console.log(`Cost: $${response.tokenUsage?.estimatedCost.toFixed(4)}`)
```

**Approximate Pricing (per 1M tokens)**:

| Model | Input | Output |
|-------|-------|--------|
| claude-opus-4.5 | $15 | $75 |
| claude-sonnet-4.5 | $3 | $15 |
| claude-haiku-4.5 | $0.25 | $1.25 |
| gpt-5.2-medium | $5 | $15 |
| gemini-3-pro | $2.50 | $10 |

### Optimization Strategy

1. **Use Haiku for repetitive tasks** (QA testing) - 60-70% cost savings
2. **Reserve Opus for critical decisions** (PM orchestration only)
3. **Medium models for specialized work** (TA, FE, Design)

**Example**: A typical feature development workflow costs ~$0.50-2.00 depending on complexity, compared to $3-5 if using Opus for everything.

## Error Handling

### Missing API Keys

```typescript
import { callLLM } from './src/core/llm-clients'

try {
  await callLLM({ model: 'claude-opus-4.5', prompt: '...' })
} catch (error) {
  // Error: ANTHROPIC_API_KEY not found. Please set it in your environment variables.
  // Example: export ANTHROPIC_API_KEY=your-api-key-here
}
```

### API Failures

The system includes automatic error context:

```typescript
try {
  await callLLM({ model: 'claude-opus-4.5', prompt: '...' })
} catch (error) {
  // Error: LLM API call failed (anthropic): Rate limit exceeded
}
```

### Rate Limiting

**Best Practices**:
- Implement exponential backoff for retries
- Monitor usage in provider dashboards
- Set up billing alerts
- Use batch processing for bulk operations

## Architecture

### LLM Client Factory (`src/core/llm-clients.ts`)

- **getProviderFromModel()** - Determines provider from model name
- **callLLM()** - Unified interface for all providers
- **validateAPIKeys()** - Checks API key configuration

### Agent Runner Integration (`src/core/agent-runner.ts`)

The AgentRunner automatically:
1. Loads agent definition as system prompt
2. Builds request with proper context
3. Routes to correct LLM provider
4. Handles errors with context
5. Tracks token usage and costs

## Testing

### Unit Tests

See `tests/core/llm-clients.test.ts`:

```bash
bun test tests/core/llm-clients.test.ts
```

### Integration Tests

To test with real API calls (requires API keys):

```typescript
// Set API keys first
process.env.ANTHROPIC_API_KEY = 'your-key'

const response = await callLLM({
  model: 'claude-haiku-4.5', // Use cheapest model for testing
  prompt: 'Say hello',
  temperature: 0,
  maxTokens: 100,
})

expect(response.content).toBeTruthy()
```

## Troubleshooting

### Issue: "Unknown model provider"

**Cause**: Invalid model name
**Solution**: Use supported model names (claude-*, gpt-*, gemini-*)

### Issue: API key errors

**Cause**: Environment variables not set
**Solution**:
```bash
# Check current environment
echo $ANTHROPIC_API_KEY

# Set for current session
export ANTHROPIC_API_KEY=your-key

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export ANTHROPIC_API_KEY=your-key' >> ~/.bashrc
```

### Issue: Rate limiting

**Cause**: Too many requests too quickly
**Solution**: Implement retry logic with exponential backoff

### Issue: High costs

**Cause**: Using expensive models for simple tasks
**Solution**: Review agent-to-model mapping, use cheaper models where possible

## Future Enhancements

- [ ] Streaming response support
- [ ] Response caching
- [ ] Custom model overrides per task
- [ ] Batch request optimization
- [ ] Usage analytics dashboard
- [ ] Alternative provider support (Azure OpenAI, AWS Bedrock)

## References

- [Anthropic API Documentation](https://docs.anthropic.com)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
