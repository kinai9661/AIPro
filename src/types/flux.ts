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

export interface GenerateParams {
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

export interface GenerateResponse {
  success: boolean
  data?: {
    image: string // base64 or url
    seed: number
    model: FluxModel
    generation_time: number
  }[]
  error?: string
}

export interface HistoryItem {
  id: string
  timestamp: number
  prompt: string
  params: GenerateParams
  result: string // base64 image
}

export interface ModelConfig {
  name: string
  description: string
  speed: number
  quality: number
  maxSize: number
}
