# crew-opencode v1.0.0 Release Notes

**Release Date**: 2026-02-05

We're excited to announce the first stable release of crew-opencode! 🎉

## What is crew-opencode?

crew-opencode is a multi-agent orchestration system that coordinates specialized AI agents to work together on software development tasks. Instead of using a single expensive model for everything, crew-opencode strategically assigns tasks to the right agent with the right model, optimizing both cost and quality.

## Highlights

### 🎯 Complete Multi-Agent Orchestration
- **5 specialized agents** with role-specific expertise (PM, TA, FE, Design, QA)
- **Cost-optimized model selection** reducing costs by 60-70%
- **Parallel execution** for independent tasks
- **79.28% test coverage** with 192 passing tests

### 🚀 Production-Ready Features
- **Full LLM Integration**: Anthropic (Claude), OpenAI (GPT), Google (Gemini)
- **Workflow Tracking**: Save and resume workflows from disk
- **Incident Reports**: Automated "Apology Letters" with root cause analysis
- **Artifact Extraction**: Share code, files, and documents between agents
- **3 SOPs**: Feature development, bug fixes, refactoring

### 📦 Easy Installation
- **Standalone binaries** for macOS, Linux, Windows (no runtime required)
- **npm package** published to GitHub Packages
- **OpenCode plugin** integration for seamless workflow

## Installation

### Option 1: Standalone Binary (Recommended)

**macOS (ARM64 - M1/M2/M3)**
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
- Download: [crew-opencode-windows-x64.exe](https://github.com/sehyun0518/crew-opencode/releases/download/v1.0.0/crew-opencode-windows-x64.exe)
- Add to PATH or run directly

### Option 2: npm (GitHub Packages)

```bash
# Configure npm to use GitHub Packages
echo "@sehyun0518:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install globally
npm install -g @sehyun0518/crew-opencode
```

### Option 3: Bun

```bash
bunx @sehyun0518/crew-opencode install
```

## Quick Start

```bash
# Install as OpenCode plugin
crew-opencode install --global

# Run your first workflow
crew-opencode crew "Add authentication to the API"

# Check available agents and SOPs
crew-opencode list

# View incident reports
crew-opencode reports
```

## What's Included

### Core Features
- Multi-agent orchestration with PM coordinator
- 5 specialized agents with optimal model selection
- 3 Standard Operating Procedures (SOPs)
- Incident Report System with root cause analysis
- Workflow tracking and persistence
- Artifact extraction and sharing

### LLM Integration
- Anthropic API (Claude Opus 4.5, Sonnet 4.5, Haiku 4.5)
- OpenAI API (GPT-5.2 Medium)
- Google Generative AI (Gemini 3 Pro)
- Structured output parsing
- Retry logic with exponential backoff

### CLI Commands
- `install` - Install plugin to OpenCode
- `uninstall` - Remove plugin from OpenCode
- `crew` - Execute multi-agent workflow
- `config` - Manage configuration
- `list` - List agents and SOPs
- `doctor` - System health check
- `reports` - View incident reports

## Technical Specifications

### Build Information
- **Version**: 1.0.0
- **Runtime**: Bun 1.3.8
- **TypeScript**: 5.7.2
- **Test Coverage**: 79.28% (lines), 75.40% (functions), 70.96% (branches)
- **Tests**: 192 passing, 2 skipped

### Binary Checksums (SHA256)

```
44f01d8161b8a9df359c599bef6099780f5677fcc65c0d9b76890b76bd17cf00  crew-opencode-linux-x64
f3ad038e1559eb8eededbd067abc50678fe4564862b7249140b981f345603402  crew-opencode-macos
573909bd72237807601a152d33d089a1366196dfae2f583f16cf5bc5a1d1c7f4  crew-opencode-macos-arm64
511f996178a1a0053a4df7738bd854380a13528405c07cc70407e7c60539e124  crew-opencode-windows-x64.exe
```

### Binary Sizes
- macOS (Intel): 58MB
- macOS (ARM64): 58MB
- Linux x64: 98MB
- Windows x64: 110MB

## Known Limitations

- 2 orchestrator integration tests skipped pending mock updates
- Test coverage at 79.28% (target was 80%)
- Cross-platform testing done on macOS only (Linux/Windows binaries built but untested)

## Documentation

- **README**: [README.md](https://github.com/sehyun0518/crew-opencode#readme)
- **Korean README**: [README.ko.md](https://github.com/sehyun0518/crew-opencode/blob/main/README.ko.md)
- **Changelog**: [CHANGELOG.md](https://github.com/sehyun0518/crew-opencode/blob/main/CHANGELOG.md)
- **Plan**: [docs/PLAN.md](https://github.com/sehyun0518/crew-opencode/blob/main/docs/PLAN.md)

## Requirements

- API keys for LLM providers (Anthropic, OpenAI, Google)
- For npm installation: Node.js >= 18.0 or Bun >= 1.0
- For OpenCode integration: OpenCode CLI installed

## Configuration

Set your API keys:

```bash
export ANTHROPIC_API_KEY="your-key-here"
export OPENAI_API_KEY="your-key-here"
export GOOGLE_API_KEY="your-key-here"
```

Or configure via `.opencode/crew-opencode.json`:

```json
{
  "version": "1.0.0",
  "crew": {
    "pm": {
      "enabled": true,
      "model": "claude-opus-4-5",
      "apiKey": "${ANTHROPIC_API_KEY}"
    }
  }
}
```

## What's Next?

Check out the [v1.1 Roadmap](https://github.com/sehyun0518/crew-opencode/blob/main/docs/PLAN.md#-future-enhancements-post-v10) for upcoming features:
- Custom agent definitions
- Custom SOP creation
- Workflow templates marketplace
- Web dashboard
- CI/CD integration

## Support

- **Issues**: [GitHub Issues](https://github.com/sehyun0518/crew-opencode/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sehyun0518/crew-opencode/discussions)
- **Email**: sehyun0518@github.com

## Contributors

- [@sehyun0518](https://github.com/sehyun0518) - Project Lead & Primary Developer

## License

MIT License - see [LICENSE](https://github.com/sehyun0518/crew-opencode/blob/main/LICENSE) for details

---

**Thank you for using crew-opencode!** 🎉

We hope this tool helps you build better software faster with the power of multi-agent orchestration.
