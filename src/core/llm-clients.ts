/**
 * LLM Client Factory
 *
 * Provides unified interface for multiple LLM providers:
 * - Anthropic (Claude models)
 * - OpenAI (GPT models)
 * - Google (Gemini models)
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { TokenUsage } from './types'

/**
 * LLM Provider types
 */
export type LLMProvider = 'anthropic' | 'openai' | 'google'

/**
 * LLM Request parameters
 */
export interface LLMRequest {
  model: string
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
}

/**
 * LLM Response
 */
export interface LLMResponse {
  content: string
  tokenUsage?: TokenUsage
}

/**
 * Get provider from model name
 */
export function getProviderFromModel(model: string): LLMProvider {
  if (model.startsWith('claude-')) {
    return 'anthropic'
  }
  if (model.startsWith('gpt-')) {
    return 'openai'
  }
  if (model.startsWith('gemini-')) {
    return 'google'
  }

  throw new Error(`Unknown model provider for: ${model}`)
}

/**
 * Get API key for provider
 */
function getAPIKey(provider: LLMProvider): string {
  const envVars = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    google: 'GOOGLE_API_KEY',
  }

  const envVar = envVars[provider]
  const apiKey = process.env[envVar]

  if (!apiKey) {
    throw new Error(
      `${envVar} not found. Please set it in your environment variables.\n` +
        `Example: export ${envVar}=your-api-key-here`
    )
  }

  return apiKey
}

/**
 * Call Anthropic API (Claude models)
 */
async function callAnthropic(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getAPIKey('anthropic')
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: request.model,
    max_tokens: request.maxTokens || 4096,
    temperature: request.temperature ?? 0.7,
    system: request.systemPrompt,
    messages: [
      {
        role: 'user',
        content: request.prompt,
      },
    ],
  })

  const content = response.content[0]
  const text = content && content.type === 'text' ? content.text : ''

  return {
    content: text,
    tokenUsage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      estimatedCost: calculateAnthropicCost(
        request.model,
        response.usage.input_tokens,
        response.usage.output_tokens
      ),
    },
  }
}

/**
 * Call OpenAI API (GPT models)
 */
async function callOpenAI(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getAPIKey('openai')
  const client = new OpenAI({ apiKey })

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  if (request.systemPrompt) {
    messages.push({
      role: 'system',
      content: request.systemPrompt,
    })
  }

  messages.push({
    role: 'user',
    content: request.prompt,
  })

  const response = await client.chat.completions.create({
    model: request.model,
    messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens || 4096,
  })

  const content = response.choices[0]?.message?.content || ''

  return {
    content,
    tokenUsage: {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      estimatedCost: calculateOpenAICost(
        request.model,
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      ),
    },
  }
}

/**
 * Call Google API (Gemini models)
 */
async function callGoogle(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getAPIKey('google')
  const genAI = new GoogleGenerativeAI(apiKey)

  const model = genAI.getGenerativeModel({
    model: request.model,
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens || 4096,
    },
    systemInstruction: request.systemPrompt,
  })

  const result = await model.generateContent(request.prompt)
  const response = result.response
  const content = response.text()

  // Note: Gemini doesn't provide detailed token usage in all cases
  const inputTokens = response.usageMetadata?.promptTokenCount || 0
  const outputTokens = response.usageMetadata?.candidatesTokenCount || 0

  return {
    content,
    tokenUsage: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCost: calculateGoogleCost(request.model, inputTokens, outputTokens),
    },
  }
}

/**
 * Calculate Anthropic cost
 * Pricing as of 2026 (approximate)
 */
function calculateAnthropicCost(model: string, inputTokens: number, outputTokens: number): number {
  const defaultRates = { input: 3 / 1_000_000, output: 15 / 1_000_000 }
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-opus-4.5': { input: 15 / 1_000_000, output: 75 / 1_000_000 },
    'claude-sonnet-4.5': defaultRates,
    'claude-haiku-4.5': { input: 0.25 / 1_000_000, output: 1.25 / 1_000_000 },
  }

  const rates = pricing[model] ?? defaultRates
  return inputTokens * rates.input + outputTokens * rates.output
}

/**
 * Calculate OpenAI cost
 * Pricing as of 2026 (approximate)
 */
function calculateOpenAICost(model: string, inputTokens: number, outputTokens: number): number {
  const defaultRates = { input: 5 / 1_000_000, output: 15 / 1_000_000 }
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-5.2-medium': defaultRates,
    'gpt-5.2-mini': { input: 1 / 1_000_000, output: 3 / 1_000_000 },
  }

  const rates = pricing[model] ?? defaultRates
  return inputTokens * rates.input + outputTokens * rates.output
}

/**
 * Calculate Google cost
 * Pricing as of 2026 (approximate)
 */
function calculateGoogleCost(model: string, inputTokens: number, outputTokens: number): number {
  const defaultRates = { input: 2.5 / 1_000_000, output: 10 / 1_000_000 }
  const pricing: Record<string, { input: number; output: number }> = {
    'gemini-3-pro': defaultRates,
    'gemini-3-flash': { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
  }

  const rates = pricing[model] ?? defaultRates
  return inputTokens * rates.input + outputTokens * rates.output
}

/**
 * Call LLM with automatic provider routing
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const provider = getProviderFromModel(request.model)

  try {
    switch (provider) {
      case 'anthropic':
        return await callAnthropic(request)
      case 'openai':
        return await callOpenAI(request)
      case 'google':
        return await callGoogle(request)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more context
      throw new Error(`LLM API call failed (${provider}): ${error.message}`)
    }
    throw error
  }
}

/**
 * Validate API keys are configured
 */
export function validateAPIKeys(): {
  anthropic: boolean
  openai: boolean
  google: boolean
  missing: string[]
} {
  const result = {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    google: !!process.env.GOOGLE_API_KEY,
    missing: [] as string[],
  }

  if (!result.anthropic) result.missing.push('ANTHROPIC_API_KEY')
  if (!result.openai) result.missing.push('OPENAI_API_KEY')
  if (!result.google) result.missing.push('GOOGLE_API_KEY')

  return result
}
