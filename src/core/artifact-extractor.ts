import type { Artifact } from './types'

/**
 * Extract artifacts from agent response text
 * Supports:
 * - Code blocks: ```language\ncode```
 * - File references: file://path, @file:path, [file](path)
 * - Inline files: <file path="...">content</file>
 */
export function extractArtifacts(response: string): Artifact[] {
  const artifacts: Artifact[] = []

  // Extract code blocks
  artifacts.push(...extractCodeBlocks(response))

  // Extract file references
  artifacts.push(...extractFileReferences(response))

  // Extract inline files
  artifacts.push(...extractInlineFiles(response))

  // Deduplicate artifacts
  return deduplicateArtifacts(artifacts)
}

/**
 * Extract code blocks from markdown-style code fences
 * Supports: ```language\ncode```, ```language filename\ncode```
 */
export function extractCodeBlocks(text: string): Artifact[] {
  const artifacts: Artifact[] = []
  // Match code blocks with optional filename after language
  // Use [ \t]+ instead of \s+ to avoid matching newlines in the optional filename part
  const codeBlockRegex = /```(\w+)(?: +([^\n]+?))?\r?\n([\s\S]*?)```/g

  let match: RegExpExecArray | null
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const language = match[1]
    const filename = match[2]?.trim()
    const content = match[3]

    // Only include non-empty code blocks (but preserve whitespace)
    if (content && content.trim()) {
      artifacts.push({
        type: 'code',
        name: filename || `code.${language}`,
        content,
        path: filename,
      })
    }
  }

  return artifacts
}

/**
 * Extract file references from various formats:
 * - file://path/to/file.ext
 * - @file:path/to/file.ext
 * - [filename](path/to/file.ext)
 * - [filename](file://path/to/file.ext)
 */
export function extractFileReferences(text: string): Artifact[] {
  const artifacts: Artifact[] = []
  const seenPaths = new Set<string>()

  // Match file:// protocol
  const fileProtocolRegex = /file:\/\/([^\s)]+)/g
  let match: RegExpExecArray | null
  while ((match = fileProtocolRegex.exec(text)) !== null) {
    const path = match[1]
    if (!seenPaths.has(path)) {
      seenPaths.add(path)
      artifacts.push({
        type: 'file',
        name: extractFilename(path),
        path,
      })
    }
  }

  // Match @file:path format
  const atFileRegex = /@file:([^\s]+)/g
  while ((match = atFileRegex.exec(text)) !== null) {
    const path = match[1]
    if (!seenPaths.has(path)) {
      seenPaths.add(path)
      artifacts.push({
        type: 'file',
        name: extractFilename(path),
        path,
      })
    }
  }

  // Match markdown link format [name](path)
  // Exclude http:// and https:// URLs
  const markdownLinkRegex = /\[([^\]]+)\]\((?:file:\/\/)?([^)]+)\)/g
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    const name = match[1]
    const path = match[2]

    // Skip HTTP/HTTPS URLs
    if (path.startsWith('http://') || path.startsWith('https://')) {
      continue
    }

    // Only treat as file reference if path looks like a file path
    if (isFilePath(path) && !seenPaths.has(path)) {
      seenPaths.add(path)
      artifacts.push({
        type: 'file',
        name,
        path,
      })
    }
  }

  return artifacts
}

/**
 * Extract inline file content from XML-style tags
 * Format: <file path="path/to/file.ext">content</file>
 */
export function extractInlineFiles(text: string): Artifact[] {
  const artifacts: Artifact[] = []
  const inlineFileRegex = /<file\s+path="([^"]+)"\s*>([\s\S]*?)<\/file>/g

  let match: RegExpExecArray | null
  while ((match = inlineFileRegex.exec(text)) !== null) {
    const path = match[1]
    const content = match[2].trim()

    if (content) {
      artifacts.push({
        type: 'file',
        name: extractFilename(path),
        path,
        content,
      })
    }
  }

  return artifacts
}

/**
 * Extract filename from a file path
 */
function extractFilename(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

/**
 * Check if a string looks like a file path
 */
function isFilePath(str: string): boolean {
  // Check for file extensions
  if (/\.[a-z0-9]+$/i.test(str)) {
    return true
  }

  // Check for path separators
  if (str.includes('/') || str.includes('\\')) {
    return true
  }

  // URLs are not file paths
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return false
  }

  return false
}

/**
 * Deduplicate artifacts by path and content
 */
export function deduplicateArtifacts(artifacts: Artifact[]): Artifact[] {
  const seen = new Set<string>()
  const result: Artifact[] = []

  for (const artifact of artifacts) {
    // Create unique key based on type, path, and content
    const key = `${artifact.type}:${artifact.path || ''}:${artifact.content?.substring(0, 100) || ''}`

    if (!seen.has(key)) {
      seen.add(key)
      result.push(artifact)
    }
  }

  return result
}

/**
 * Filter artifacts by type
 */
export function filterArtifactsByType(
  artifacts: Artifact[],
  type: Artifact['type']
): Artifact[] {
  return artifacts.filter((artifact) => artifact.type === type)
}

/**
 * Get artifact summary for logging
 */
export function summarizeArtifacts(artifacts: Artifact[]): string {
  if (artifacts.length === 0) {
    return 'No artifacts extracted'
  }

  const counts: Record<string, number> = {}
  for (const artifact of artifacts) {
    counts[artifact.type] = (counts[artifact.type] || 0) + 1
  }

  const summary = Object.entries(counts)
    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
    .join(', ')

  return `Extracted ${artifacts.length} artifact${artifacts.length > 1 ? 's' : ''}: ${summary}`
}
