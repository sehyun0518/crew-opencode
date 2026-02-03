/**
 * Hooks for OpenCode integration
 */

export { preToolUse, type PreToolUseContext, type PreToolUseResult } from './pre-tool-use'
export { postToolUse, type PostToolUseContext, type PostToolUseResult } from './post-tool-use'
export { stop, type StopContext, type StopResult } from './stop'

// Re-export defaults for convenience
export { default as preToolUseHook } from './pre-tool-use'
export { default as postToolUseHook } from './post-tool-use'
export { default as stopHook } from './stop'
