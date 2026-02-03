import chalk from 'chalk'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

interface InstallOptions {
  global?: boolean
  local?: boolean
}

/**
 * Get the source directory for crew-opencode
 */
function getSourceDir(): string {
  // When built, this will be in dist/cli/commands/
  // Source files are in src/
  const currentFile = fileURLToPath(import.meta.url)
  const currentDir = dirname(currentFile)

  // Try to find the src directory
  const srcDir = join(currentDir, '..', '..', 'src')

  if (existsSync(srcDir)) {
    return srcDir
  }

  // Fallback: assume we're in the package directory
  return join(currentDir, '..', '..')
}

/**
 * Copy directory recursively
 */
function copyDirectory(src: string, dest: string): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }

  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

export async function installCommand(options: InstallOptions): Promise<void> {
  const isGlobal = options.global ?? false
  const targetDir = isGlobal
    ? join(homedir(), '.opencode', 'crew-opencode')
    : join(process.cwd(), '.opencode', 'crew-opencode')

  console.log(chalk.bold('\n🚀 crew-opencode installer\n'))
  console.log(chalk.dim(`Installing to: ${targetDir}\n`))

  try {
    const sourceDir = getSourceDir()

    // Create target directory
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
      console.log(chalk.green('✓ Created plugin directory'))
    } else {
      console.log(chalk.yellow('⚠ Plugin directory already exists'))
    }

    // Copy agents
    const agentsSrcDir = join(sourceDir, 'agents')
    const agentsDestDir = join(targetDir, 'agents')

    if (existsSync(agentsSrcDir)) {
      copyDirectory(agentsSrcDir, agentsDestDir)
      console.log(chalk.green('✓ Installed agent definitions:'))
      console.log(chalk.dim('    • PM (Project Manager - Opus 4.5)'))
      console.log(chalk.dim('    • TA (Technical Analyst - Sonnet 4.5)'))
      console.log(chalk.dim('    • FE (UI/UX Engineer - Gemini 3 Pro)'))
      console.log(chalk.dim('    • Design (Designer - GPT 5.2 Medium)'))
      console.log(chalk.dim('    • QA (Quality Assurance - Haiku 4.5)'))
    }

    // Copy SOPs
    const sopsSrcDir = join(sourceDir, 'sop')
    const sopsDestDir = join(targetDir, 'sop')

    if (existsSync(sopsSrcDir)) {
      copyDirectory(sopsSrcDir, sopsDestDir)
      console.log(chalk.green('✓ Installed SOP workflows:'))
      console.log(chalk.dim('    • feature (60-90min)'))
      console.log(chalk.dim('    • bugfix (40-70min)'))
      console.log(chalk.dim('    • refactor (100-160min)'))
    }

    // Copy hooks
    const hooksSrcDir = join(sourceDir, 'hooks')
    const hooksDestDir = join(targetDir, 'hooks')

    if (existsSync(hooksSrcDir)) {
      copyDirectory(hooksSrcDir, hooksDestDir)
      console.log(chalk.green('✓ Installed hooks:'))
      console.log(chalk.dim('    • pre-tool-use'))
      console.log(chalk.dim('    • post-tool-use'))
      console.log(chalk.dim('    • stop'))
    }

    // Copy tools
    const toolsSrcDir = join(sourceDir, 'tools')
    const toolsDestDir = join(targetDir, 'tools')

    if (existsSync(toolsSrcDir)) {
      copyDirectory(toolsSrcDir, toolsDestDir)
      console.log(chalk.green('✓ Installed custom tools:'))
      console.log(chalk.dim('    • CrewOrchestrate'))
      console.log(chalk.dim('    • CrewStatus'))
      console.log(chalk.dim('    • CrewList'))
      console.log(chalk.dim('    • CrewIncidents'))
    }

    // Create default config
    const configPath = join(targetDir, 'crew-opencode.json')

    if (!existsSync(configPath)) {
      const { DEFAULT_CONFIG } = await import('../../config')
      writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2))
      console.log(chalk.green('✓ Created default configuration'))
    } else {
      console.log(chalk.yellow('⚠ Configuration already exists (skipping)'))
    }

    // Create reports directory
    const reportsDir = join(process.cwd(), 'reports')
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true })
      console.log(chalk.green('✓ Created reports directory'))
    }

    // Create README
    const readmePath = join(targetDir, 'README.md')
    const readme = `# crew-opencode

Multi-agent orchestration plugin for OpenCode.

## Agents

- **PM** (Opus 4.5): Project Manager - Orchestration and strategy
- **TA** (Sonnet 4.5): Technical Analyst - Research and analysis
- **FE** (Gemini 3 Pro): UI/UX Engineer - Frontend implementation
- **Design** (GPT 5.2 Medium): Designer - UX flows and design systems
- **QA** (Haiku 4.5): Quality Assurance - Testing and verification

## SOPs

- **feature**: Complete feature development workflow
- **bugfix**: Root cause analysis and minimal fixes
- **refactor**: Safe refactoring with test safety net

## Commands

- \`crew-opencode list\` - List agents and SOPs
- \`crew-opencode doctor\` - Verify installation
- \`crew-opencode reports\` - View incident reports
- \`crew [task]\` - Execute a task with the crew

## Documentation

For detailed documentation, see: https://github.com/your-repo/crew-opencode
`
    writeFileSync(readmePath, readme)
    console.log(chalk.green('✓ Created README'))

    console.log(chalk.bold.green('\n✨ Installation complete!\n'))
    console.log(chalk.dim('Next steps:'))
    console.log(chalk.dim('  1. Run `crew-opencode doctor` to verify installation'))
    console.log(chalk.dim('  2. Run `crew-opencode list` to see available agents and SOPs'))
    console.log(chalk.dim('  3. Use `crew [task]` to execute tasks with your crew\n'))
  } catch (error) {
    console.error(chalk.red('\n❌ Installation failed:'), error)
    process.exit(1)
  }
}
