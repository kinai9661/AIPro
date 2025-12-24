// Worker Types for Flux AI Pro V2

export type FluxModel = 'zimage' | 'flux' | 'turbo' | 'kontext'
export type QualityMode = 'economy' | 'standard' | 'ultra'
export type StylePreset = 
  | 'none'
  | 'anime'
  | 'photorealistic'
  | 'oil-painting'
  | 'watercolor'
  | 'cyberpunk'
  | 'fantasy'
  | 'minimalist'

// Cloudflare Worker Environment
export interface Env {
  POLLINATIONS_API_KEY: string
  FLUX_CACHE?: KVNamespace
  ASSETS: Fetcher
  AI?: any // Cloudflare Workers AI
}

// 生成請求參數
export interface GenerateRequest {
  prompt: string
  model: FluxModel
  width: number
  height: number
  seed: number
  style: StylePreset
  quality_mode: QualityMode
  steps?: number
  guidance?: number
  n: number
  auto_optimize: boolean
  auto_hd: boolean
  reference_images?: string[]
}

// 生成響應
export interface GenerateResponse {
  success: boolean
  data?: {
    image: string // base64 or url
    seed: number
    model: FluxModel
    generation_time: number
    optimized_prompt?: string
  }[]
  error?: string
  metadata?: {
    original_prompt: string
    translated_prompt?: string
    optimized_params?: OptimizedParams
    cost?: number
  }
}

// 優化後的參數
export interface OptimizedParams {
  steps: number
  guidance: number
  sampler?: string
  enhancement?: string
}

// Pollinations API 配置
export interface PollinationsConfig {
  model: FluxModel
  prompt: string
  width: number
  height: number
  seed: number
  nologo?: boolean
  enhance?: boolean
  model_version?: string
}

// 模型配置映射
export interface ModelConfig {
  endpoint: string
  defaultSteps: number
  defaultGuidance: number
  maxSize: number
  supportsReference: boolean
  costMultiplier: number
}

// 緩存鍵配置
export interface CacheConfig {
  enabled: boolean
  ttl: number // seconds
  keyPrefix: string
}

// 樣式增強配置
export interface StyleConfig {
  positivePrompt: string
  negativePrompt: string
  guidance: number
  steps: number
}

// 錯誤響應
export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}

// 健康檢查響應
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error'
  version: string
  models: FluxModel[]
  uptime?: number
  cache_enabled?: boolean
}
