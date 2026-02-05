/**
 * Output Parser
 *
 * Parses structured outputs from agent responses.
 * Supports multiple formats:
 * - XML tags: <output name="key">value</output>
 * - JSON blocks: ```json { "key": "value" } ```
 * - Markdown sections: ## Output: key\nvalue
 */

/**
 * Output format
 */
export interface ParsedOutput {
  [key: string]: unknown
}

/**
 * Parse XML-style outputs
 * Format: <output name="key">value</output>
 */
function parseXMLOutputs(text: string): ParsedOutput {
  const outputs: ParsedOutput = {}

  // Match <output name="key">value</output> or <output name="key" type="json">...</output>
  const xmlPattern = /<output\s+name="([^"]+)"(?:\s+type="([^"]+)")?\s*>([\s\S]*?)<\/output>/gi

  let match
  while ((match = xmlPattern.exec(text)) !== null) {
    const [, name, type, value] = match

    if (!name || value === undefined) continue

    // Parse based on type attribute
    if (type === 'json') {
      try {
        outputs[name] = JSON.parse(value.trim())
      } catch {
        outputs[name] = value.trim()
      }
    } else if (type === 'number') {
      const num = parseFloat(value.trim())
      outputs[name] = isNaN(num) ? value.trim() : num
    } else if (type === 'boolean') {
      const lower = value.trim().toLowerCase()
      outputs[name] = lower === 'true' || lower === '1' || lower === 'yes'
    } else {
      outputs[name] = value.trim()
    }
  }

  return outputs
}

/**
 * Parse JSON code blocks
 * Format: ```json { "key": "value" } ```
 */
function parseJSONBlocks(text: string): ParsedOutput {
  const outputs: ParsedOutput = {}

  // Match ```json ... ``` blocks
  const jsonPattern = /```json\s*([\s\S]*?)\s*```/gi

  let match
  while ((match = jsonPattern.exec(text)) !== null) {
    const [, content] = match

    if (!content) continue

    try {
      const parsed = JSON.parse(content.trim())

      // If it's an object, merge all keys
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        Object.assign(outputs, parsed)
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  return outputs
}

/**
 * Parse markdown sections
 * Format:
 * ## Output: key
 * value
 */
function parseMarkdownSections(text: string): ParsedOutput {
  const outputs: ParsedOutput = {}

  // Match ## Output: key\nvalue or ### key\nvalue
  const sectionPattern = /##\s*(?:Output:\s*)?(\w+)\s*\n([\s\S]*?)(?=\n##|\n###|$)/gi

  let match
  while ((match = sectionPattern.exec(text)) !== null) {
    const [, name, value] = match

    if (!name || !value) continue

    outputs[name] = value.trim()
  }

  return outputs
}

/**
 * Extract key-value pairs from simple formats
 * Format: key: value
 */
function parseKeyValuePairs(text: string): ParsedOutput {
  const outputs: ParsedOutput = {}

  // Match "key: value" lines
  const kvPattern = /^([a-zA-Z_]\w*)\s*:\s*(.+)$/gm

  let match
  while ((match = kvPattern.exec(text)) !== null) {
    const [, key, value] = match

    if (!key || !value) continue

    outputs[key] = value.trim()
  }

  return outputs
}

/**
 * Parse structured outputs from agent response
 *
 * Tries multiple formats in order of preference:
 * 1. XML tags (most explicit)
 * 2. JSON blocks (structured)
 * 3. Markdown sections (readable)
 * 4. Key-value pairs (simple)
 */
export function parseOutputs(
  text: string,
  expectedOutputs?: ReadonlyArray<string>
): ParsedOutput {
  if (!text || typeof text !== 'string') {
    return {}
  }

  // Try all parsers and merge results (first match wins for each key)
  const xmlOutputs = parseXMLOutputs(text)
  const jsonOutputs = parseJSONBlocks(text)
  const markdownOutputs = parseMarkdownSections(text)
  const kvOutputs = parseKeyValuePairs(text)

  // Merge with priority: XML > JSON > Markdown > KV
  const allOutputs = {
    ...kvOutputs,
    ...markdownOutputs,
    ...jsonOutputs,
    ...xmlOutputs,
  }

  // If expectedOutputs specified, filter to only those keys
  if (expectedOutputs && expectedOutputs.length > 0) {
    const filtered: ParsedOutput = {}

    for (const key of expectedOutputs) {
      if (key in allOutputs) {
        filtered[key] = allOutputs[key]
      } else {
        // Key not found, use raw text as fallback
        filtered[key] = text
      }
    }

    return filtered
  }

  return allOutputs
}

/**
 * Validate outputs against expected schema
 */
export function validateOutputs(
  outputs: ParsedOutput,
  expectedOutputs: ReadonlyArray<string>
): {
  valid: boolean
  missing: string[]
  present: string[]
} {
  const missing: string[] = []
  const present: string[] = []

  for (const key of expectedOutputs) {
    if (key in outputs && outputs[key] !== undefined && outputs[key] !== '') {
      present.push(key)
    } else {
      missing.push(key)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    present,
  }
}

/**
 * Format outputs for display
 */
export function formatOutputs(outputs: ParsedOutput): string {
  const lines: string[] = []

  for (const [key, value] of Object.entries(outputs)) {
    const formatted = typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value)

    lines.push(`${key}: ${formatted}`)
  }

  return lines.join('\n')
}

/**
 * Extract outputs in XML format (for agent prompts)
 */
export function formatOutputInstruction(expectedOutputs: ReadonlyArray<string>): string {
  const examples: string[] = []

  for (const key of expectedOutputs) {
    examples.push(`<output name="${key}">your ${key} here</output>`)
  }

  return `
## Output Format

Provide your outputs using XML tags:

${examples.join('\n')}

You can optionally specify types:
- <output name="key" type="json">{"data": "value"}</output>
- <output name="key" type="number">42</output>
- <output name="key" type="boolean">true</output>
`.trim()
}
