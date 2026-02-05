import { describe, it, expect } from 'vitest'
import {
  parseOutputs,
  validateOutputs,
  formatOutputs,
  formatOutputInstruction,
} from '../../src/core/output-parser'

describe('Output Parser', () => {
  describe('parseOutputs - XML format', () => {
    it('should parse simple XML outputs', () => {
      const text = `
        <output name="summary">This is a summary</output>
        <output name="recommendation">Use TypeScript</output>
      `

      const outputs = parseOutputs(text)

      expect(outputs.summary).toBe('This is a summary')
      expect(outputs.recommendation).toBe('Use TypeScript')
    })

    it('should parse XML with type="json"', () => {
      const text = `
        <output name="config" type="json">{"enabled": true, "count": 42}</output>
      `

      const outputs = parseOutputs(text)

      expect(outputs.config).toEqual({ enabled: true, count: 42 })
    })

    it('should parse XML with type="number"', () => {
      const text = `
        <output name="score" type="number">95.5</output>
      `

      const outputs = parseOutputs(text)

      expect(outputs.score).toBe(95.5)
    })

    it('should parse XML with type="boolean"', () => {
      const text = `
        <output name="success" type="boolean">true</output>
        <output name="failed" type="boolean">false</output>
      `

      const outputs = parseOutputs(text)

      expect(outputs.success).toBe(true)
      expect(outputs.failed).toBe(false)
    })

    it('should handle multiline XML content', () => {
      const text = `
        <output name="code">
function hello() {
  console.log("Hello World")
}
        </output>
      `

      const outputs = parseOutputs(text)

      expect(outputs.code).toContain('function hello()')
      expect(outputs.code).toContain('console.log')
    })

    it('should handle invalid JSON gracefully', () => {
      const text = `
        <output name="data" type="json">invalid json {</output>
      `

      const outputs = parseOutputs(text)

      expect(outputs.data).toBe('invalid json {')
    })
  })

  describe('parseOutputs - JSON blocks', () => {
    it('should parse JSON code blocks', () => {
      const text = `
Here is the analysis:

\`\`\`json
{
  "summary": "Code looks good",
  "issues": 3,
  "severity": "low"
}
\`\`\`
      `

      const outputs = parseOutputs(text)

      expect(outputs.summary).toBe('Code looks good')
      expect(outputs.issues).toBe(3)
      expect(outputs.severity).toBe('low')
    })

    it('should merge multiple JSON blocks', () => {
      const text = `
\`\`\`json
{"key1": "value1"}
\`\`\`

\`\`\`json
{"key2": "value2"}
\`\`\`
      `

      const outputs = parseOutputs(text)

      expect(outputs.key1).toBe('value1')
      expect(outputs.key2).toBe('value2')
    })

    it('should skip invalid JSON blocks', () => {
      const text = `
\`\`\`json
{"valid": "json"}
\`\`\`

\`\`\`json
invalid json
\`\`\`
      `

      const outputs = parseOutputs(text)

      expect(outputs.valid).toBe('json')
      expect(Object.keys(outputs)).toHaveLength(1)
    })
  })

  describe('parseOutputs - Markdown sections', () => {
    it('should parse markdown sections', () => {
      const text = `
## Output: summary

This is the summary section with multiple lines
and some details.

## Output: recommendation

Use TypeScript for better type safety.
      `

      const outputs = parseOutputs(text)

      expect(outputs.summary).toContain('This is the summary section')
      expect(outputs.recommendation).toContain('Use TypeScript')
    })

    it('should parse ## headings without "Output:" prefix', () => {
      const text = `
## analysis

Code quality is good.

## nextSteps

Refactor the auth module.
      `

      const outputs = parseOutputs(text)

      expect(outputs.analysis).toContain('Code quality')
      expect(outputs.nextSteps).toContain('Refactor')
    })
  })

  describe('parseOutputs - Key-value pairs', () => {
    it('should parse key: value lines', () => {
      const text = `
summary: This is a quick summary
status: completed
count: 42
      `

      const outputs = parseOutputs(text)

      expect(outputs.summary).toBe('This is a quick summary')
      expect(outputs.status).toBe('completed')
      expect(outputs.count).toBe('42')
    })

    it('should handle values with colons', () => {
      const text = `
url: https://example.com:8080/path
time: 10:30:45
      `

      const outputs = parseOutputs(text)

      expect(outputs.url).toBe('https://example.com:8080/path')
      expect(outputs.time).toBe('10:30:45')
    })
  })

  describe('parseOutputs - Priority and filtering', () => {
    it('should prioritize XML over other formats', () => {
      const text = `
key: from-kv-pair

<output name="key">from-xml</output>

\`\`\`json
{"key": "from-json"}
\`\`\`
      `

      const outputs = parseOutputs(text)

      expect(outputs.key).toBe('from-xml')
    })

    it('should filter to expected outputs only', () => {
      const text = `
<output name="summary">Summary text</output>
<output name="extra">Extra data</output>
<output name="recommendation">Do this</output>
      `

      const outputs = parseOutputs(text, ['summary', 'recommendation'])

      expect(outputs.summary).toBe('Summary text')
      expect(outputs.recommendation).toBe('Do this')
      expect(Object.keys(outputs)).toHaveLength(2)
    })

    it('should use raw text as fallback for missing expected outputs', () => {
      const text = `
<output name="found">This was found</output>
      `.trim()

      const outputs = parseOutputs(text, ['found', 'missing'])

      expect(outputs.found).toBe('This was found')
      expect(outputs.missing).toBe(text)
    })
  })

  describe('parseOutputs - Edge cases', () => {
    it('should handle empty text', () => {
      const outputs = parseOutputs('')

      expect(outputs).toEqual({})
    })

    it('should handle null/undefined gracefully', () => {
      expect(parseOutputs(null as any)).toEqual({})
      expect(parseOutputs(undefined as any)).toEqual({})
    })

    it('should handle text with no structured data', () => {
      const text = `
This is just plain text with no structured outputs.
It should not crash the parser.
      `.trim()

      const outputs = parseOutputs(text, ['summary'])

      expect(outputs.summary).toBe(text)
    })
  })

  describe('validateOutputs', () => {
    it('should validate all outputs are present', () => {
      const outputs = {
        summary: 'text',
        recommendation: 'advice',
        score: 95,
      }

      const validation = validateOutputs(outputs, ['summary', 'recommendation', 'score'])

      expect(validation.valid).toBe(true)
      expect(validation.missing).toHaveLength(0)
      expect(validation.present).toHaveLength(3)
    })

    it('should detect missing outputs', () => {
      const outputs = {
        summary: 'text',
      }

      const validation = validateOutputs(outputs, ['summary', 'recommendation', 'score'])

      expect(validation.valid).toBe(false)
      expect(validation.missing).toEqual(['recommendation', 'score'])
      expect(validation.present).toEqual(['summary'])
    })

    it('should treat empty strings as missing', () => {
      const outputs = {
        summary: '',
        recommendation: 'advice',
      }

      const validation = validateOutputs(outputs, ['summary', 'recommendation'])

      expect(validation.valid).toBe(false)
      expect(validation.missing).toContain('summary')
    })

    it('should treat undefined as missing', () => {
      const outputs = {
        summary: undefined,
        recommendation: 'advice',
      }

      const validation = validateOutputs(outputs, ['summary', 'recommendation'])

      expect(validation.valid).toBe(false)
      expect(validation.missing).toContain('summary')
    })
  })

  describe('formatOutputs', () => {
    it('should format simple outputs', () => {
      const outputs = {
        summary: 'text',
        count: 42,
      }

      const formatted = formatOutputs(outputs)

      expect(formatted).toContain('summary: text')
      expect(formatted).toContain('count: 42')
    })

    it('should format object outputs as JSON', () => {
      const outputs = {
        config: { enabled: true, level: 3 },
      }

      const formatted = formatOutputs(outputs)

      expect(formatted).toContain('"enabled": true')
      expect(formatted).toContain('"level": 3')
    })
  })

  describe('formatOutputInstruction', () => {
    it('should format output instructions', () => {
      const instruction = formatOutputInstruction(['summary', 'recommendation'])

      expect(instruction).toContain('<output name="summary">')
      expect(instruction).toContain('<output name="recommendation">')
      expect(instruction).toContain('## Output Format')
    })

    it('should include type examples', () => {
      const instruction = formatOutputInstruction(['data'])

      expect(instruction).toContain('type="json"')
      expect(instruction).toContain('type="number"')
      expect(instruction).toContain('type="boolean"')
    })
  })
})
