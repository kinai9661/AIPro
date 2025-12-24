export type FluxModel = 'zimage' | 'flux' | 'turbo' | 'kontext'

export type QualityMode = 'economy' | 'standard' | 'ultra'

export type StylePreset = 
  // 無風格
  | 'none'
  // 藝術風格 (10)
  | 'anime'
  | 'manga'
  | 'comic-book'
  | 'cartoon'
  | 'pixel-art'
  | 'line-art'
  | 'sketch'
  | 'watercolor'
  | 'oil-painting'
  | 'digital-art'
  // 寫實風格 (8)
  | 'photorealistic'
  | 'portrait'
  | 'landscape'
  | 'cinematic'
  | 'documentary'
  | 'studio-photo'
  | 'street-photography'
  | 'macro'
  // 奇幻風格 (8)
  | 'fantasy'
  | 'sci-fi'
  | 'cyberpunk'
  | 'steampunk'
  | 'gothic'
  | 'dark-fantasy'
  | 'mythological'
  | 'surreal'
  // 現代藝術 (7)
  | 'minimalist'
  | 'abstract'
  | 'pop-art'
  | 'graffiti'
  | 'low-poly'
  | 'vaporwave'
  | 'synthwave'
  // 經典藝術 (6)
  | 'renaissance'
  | 'baroque'
  | 'impressionist'
  | 'art-nouveau'
  | 'art-deco'
  | 'ukiyo-e'
  // 氣氛風格 (5)
  | 'noir'
  | 'vintage'
  | 'retro'
  | 'horror'
  | 'ethereal'

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
  image?: string
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

export interface StyleInfo {
  value: StylePreset
  label: string
  description: string
  category: string
}
