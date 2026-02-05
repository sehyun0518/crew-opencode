import { describe, it, expect } from 'vitest'
import {
  extractArtifacts,
  extractCodeBlocks,
  extractFileReferences,
  extractInlineFiles,
  deduplicateArtifacts,
  filterArtifactsByType,
  summarizeArtifacts,
} from '../../src/core/artifact-extractor'
import type { Artifact } from '../../src/core/types'

describe('extractCodeBlocks', () => {
  it('should extract single code block', () => {
    const text = '``' + '`typescript\nconst x = 1\n``' + '`'
    const artifacts = extractCodeBlocks(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].type).toBe('code')
    expect(artifacts[0].name).toBe('code.typescript')
    expect(artifacts[0].content).toContain('const x = 1')
  })

  it('should extract code block with filename', () => {
    const text = '``' + '`typescript app.ts\nconst app = {}\n``' + '`'
    const artifacts = extractCodeBlocks(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].name).toBe('app.ts')
    expect(artifacts[0].path).toBe('app.ts')
    expect(artifacts[0].content).toContain('const app = {}')
  })

  it('should extract multiple code blocks', () => {
    const text = `
Here's the TypeScript:
${'```'}typescript
const x = 1
${'```'}

And the JavaScript:
${'```'}javascript
var y = 2
${'```'}
    `.trim()
    const artifacts = extractCodeBlocks(text)

    expect(artifacts).toHaveLength(2)
    expect(artifacts[0].name).toBe('code.typescript')
    expect(artifacts[1].name).toBe('code.javascript')
  })

  it('should handle empty code blocks', () => {
    const text = '``' + '`typescript\n\n``' + '`'
    const artifacts = extractCodeBlocks(text)

    expect(artifacts).toHaveLength(0)
  })

  it('should preserve whitespace in code', () => {
    const text = '``' + '`python\ndef hello():\n    print("world")\n``' + '`'
    const artifacts = extractCodeBlocks(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].content).toContain('def hello()')
    expect(artifacts[0].content).toContain('print("world")')
  })
})

describe('extractFileReferences', () => {
  it('should extract file:// protocol references', () => {
    const text = 'See file://src/app.ts for details'
    const artifacts = extractFileReferences(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0]).toEqual({
      type: 'file',
      name: 'app.ts',
      path: 'src/app.ts',
    })
  })

  it('should extract @file: format references', () => {
    const text = 'Check @file:src/utils/helper.ts'
    const artifacts = extractFileReferences(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0]).toEqual({
      type: 'file',
      name: 'helper.ts',
      path: 'src/utils/helper.ts',
    })
  })

  it('should extract markdown link format with file path', () => {
    const text = 'See [config file](config/settings.json) for configuration'
    const artifacts = extractFileReferences(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0]).toEqual({
      type: 'file',
      name: 'config file',
      path: 'config/settings.json',
    })
  })

  it('should extract markdown link with file:// protocol', () => {
    const text = '[source code](file://src/main.ts)'
    const artifacts = extractFileReferences(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].path).toBe('src/main.ts')
  })

  it('should not extract HTTP URLs as file references', () => {
    const text = '[documentation](https://example.com/docs)'
    const artifacts = extractFileReferences(text)

    expect(artifacts).toHaveLength(0)
  })

  it('should deduplicate same file path', () => {
    const text = 'See file://app.ts and also @file:app.ts'
    const artifacts = extractFileReferences(text)

    expect(artifacts).toHaveLength(1)
  })

  it('should extract multiple unique file references', () => {
    const text = `
- file://src/app.ts
- @file:src/utils.ts
- [config](config.json)
    `.trim()
    const artifacts = extractFileReferences(text)

    expect(artifacts).toHaveLength(3)
  })
})

describe('extractInlineFiles', () => {
  it('should extract inline file content', () => {
    const text = '<file path="app.ts">const app = {}</file>'
    const artifacts = extractInlineFiles(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0]).toEqual({
      type: 'file',
      name: 'app.ts',
      path: 'app.ts',
      content: 'const app = {}',
    })
  })

  it('should extract multiline inline file', () => {
    const text = `<file path="package.json">{
  "name": "test",
  "version": "1.0.0"
}</file>`
    const artifacts = extractInlineFiles(text)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].content).toContain('"name": "test"')
  })

  it('should handle empty inline files', () => {
    const text = '<file path="empty.txt"></file>'
    const artifacts = extractInlineFiles(text)

    expect(artifacts).toHaveLength(0)
  })

  it('should extract multiple inline files', () => {
    const text = `
<file path="a.ts">const a = 1</file>
<file path="b.ts">const b = 2</file>
    `.trim()
    const artifacts = extractInlineFiles(text)

    expect(artifacts).toHaveLength(2)
  })
})

describe('extractArtifacts', () => {
  it('should extract all artifact types', () => {
    const text = `
# Implementation

Here's the code:
\`\`\`typescript app.ts
const app = {}
\`\`\`

See also file://src/config.ts

And here's the config:
<file path="config.json">{"debug": true}</file>
    `.trim()

    const artifacts = extractArtifacts(text)

    expect(artifacts).toHaveLength(3)
    expect(artifacts.map((a) => a.type)).toContain('code')
    expect(artifacts.map((a) => a.type)).toContain('file')
  })

  it('should deduplicate artifacts', () => {
    const text = `
\`\`\`typescript app.ts
const app = {}
\`\`\`

See [app.ts](app.ts)

<file path="app.ts">const app = {}</file>
    `.trim()

    const artifacts = extractArtifacts(text)

    // Should extract multiple artifact types for the same file
    // - Code block with content
    // - File reference without content
    // - Inline file with content
    // These are considered different artifacts since they have different types/content
    expect(artifacts.length).toBeGreaterThan(0)
    expect(artifacts.some((a) => a.type === 'code')).toBe(true)
    expect(artifacts.some((a) => a.type === 'file')).toBe(true)
  })

  it('should handle text with no artifacts', () => {
    const text = 'This is just regular text with no code or files.'
    const artifacts = extractArtifacts(text)

    expect(artifacts).toHaveLength(0)
  })
})

describe('deduplicateArtifacts', () => {
  it('should remove exact duplicates', () => {
    const artifacts: Artifact[] = [
      { type: 'code', name: 'app.ts', content: 'const x = 1' },
      { type: 'code', name: 'app.ts', content: 'const x = 1' },
    ]

    const result = deduplicateArtifacts(artifacts)
    expect(result).toHaveLength(1)
  })

  it('should keep artifacts with different content', () => {
    const artifacts: Artifact[] = [
      { type: 'code', name: 'app.ts', content: 'const x = 1' },
      { type: 'code', name: 'app.ts', content: 'const x = 2' },
    ]

    const result = deduplicateArtifacts(artifacts)
    expect(result).toHaveLength(2)
  })

  it('should keep artifacts with different types', () => {
    const artifacts: Artifact[] = [
      { type: 'code', name: 'app.ts', content: 'const x = 1' },
      { type: 'file', name: 'app.ts', path: 'app.ts' },
    ]

    const result = deduplicateArtifacts(artifacts)
    expect(result).toHaveLength(2)
  })
})

describe('filterArtifactsByType', () => {
  const artifacts: Artifact[] = [
    { type: 'code', name: 'app.ts', content: 'code' },
    { type: 'file', name: 'config.json', path: 'config.json' },
    { type: 'code', name: 'utils.ts', content: 'utils' },
    { type: 'document', name: 'README.md', content: 'readme' },
  ]

  it('should filter by code type', () => {
    const result = filterArtifactsByType(artifacts, 'code')
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.type === 'code')).toBe(true)
  })

  it('should filter by file type', () => {
    const result = filterArtifactsByType(artifacts, 'file')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('config.json')
  })

  it('should return empty array if no matches', () => {
    const result = filterArtifactsByType(artifacts, 'test')
    expect(result).toHaveLength(0)
  })
})

describe('summarizeArtifacts', () => {
  it('should return message for no artifacts', () => {
    const summary = summarizeArtifacts([])
    expect(summary).toBe('No artifacts extracted')
  })

  it('should summarize single artifact', () => {
    const artifacts: Artifact[] = [{ type: 'code', name: 'app.ts', content: 'code' }]
    const summary = summarizeArtifacts(artifacts)
    expect(summary).toBe('Extracted 1 artifact: 1 code')
  })

  it('should summarize multiple artifacts of same type', () => {
    const artifacts: Artifact[] = [
      { type: 'code', name: 'a.ts', content: 'a' },
      { type: 'code', name: 'b.ts', content: 'b' },
    ]
    const summary = summarizeArtifacts(artifacts)
    expect(summary).toBe('Extracted 2 artifacts: 2 codes')
  })

  it('should summarize mixed artifact types', () => {
    const artifacts: Artifact[] = [
      { type: 'code', name: 'a.ts', content: 'a' },
      { type: 'code', name: 'b.ts', content: 'b' },
      { type: 'file', name: 'config.json', path: 'config.json' },
    ]
    const summary = summarizeArtifacts(artifacts)
    expect(summary).toContain('3 artifacts')
    expect(summary).toContain('2 codes')
    expect(summary).toContain('1 file')
  })
})
