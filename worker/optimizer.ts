// Parameter Optimizer for Flux AI Pro V2

import type {
  FluxModel,
  QualityMode,
  StylePreset,
  OptimizedParams,
  StyleConfig,
  Env,
} from './types'

// 模型預設參數
const MODEL_DEFAULTS: Record<FluxModel, { steps: number; guidance: number }> = {
  zimage: { steps: 4, guidance: 3.5 },
  flux: { steps: 20, guidance: 7.5 },
  turbo: { steps: 8, guidance: 3.5 },
  kontext: { steps: 25, guidance: 7.5 },
}

// 質量模式參數調整
const QUALITY_ADJUSTMENTS: Record<QualityMode, { stepsMultiplier: number; guidanceBoost: number }> = {
  economy: { stepsMultiplier: 0.5, guidanceBoost: 0 },
  standard: { stepsMultiplier: 1.0, guidanceBoost: 0 },
  ultra: { stepsMultiplier: 1.5, guidanceBoost: 1.0 },
}

// 樣式配置
const STYLE_CONFIGS: Record<StylePreset, StyleConfig> = {
  none: {
    positivePrompt: '',
    negativePrompt: 'blurry, low quality, distorted',
    guidance: 0,
    steps: 0,
  },
  anime: {
    positivePrompt: 'anime style, manga art, vibrant colors, detailed shading, studio quality',
    negativePrompt: 'realistic, photograph, 3d render, blurry, low quality',
    guidance: 1.0,
    steps: 5,
  },
  photorealistic: {
    positivePrompt: 'photorealistic, ultra detailed, 8k uhd, professional photography, sharp focus, natural lighting',
    negativePrompt: 'cartoon, anime, painting, drawing, blurry, low quality',
    guidance: 1.5,
    steps: 8,
  },
  'oil-painting': {
    positivePrompt: 'oil painting, classical art, fine art, textured brush strokes, museum quality',
    negativePrompt: 'photograph, digital art, low quality, blurry',
    guidance: 1.0,
    steps: 5,
  },
  watercolor: {
    positivePrompt: 'watercolor painting, soft edges, flowing colors, artistic, traditional media',
    negativePrompt: 'photograph, digital, sharp edges, low quality',
    guidance: 0.5,
    steps: 3,
  },
  cyberpunk: {
    positivePrompt: 'cyberpunk style, neon lights, futuristic, high tech, dark atmosphere, cinematic',
    negativePrompt: 'medieval, historical, natural, blurry, low quality',
    guidance: 1.5,
    steps: 8,
  },
  fantasy: {
    positivePrompt: 'fantasy art, magical, epic, detailed, concept art, dramatic lighting',
    negativePrompt: 'realistic, modern, photograph, blurry, low quality',
    guidance: 1.0,
    steps: 5,
  },
  minimalist: {
    positivePrompt: 'minimalist, clean, simple, modern, professional, elegant composition',
    negativePrompt: 'cluttered, busy, complex, ornate, low quality',
    guidance: 0.5,
    steps: 3,
  },
}

/**
 * 優化生成參數
 */
export function optimizeParameters(
  model: FluxModel,
  quality: QualityMode,
  style: StylePreset,
  width: number,
  height: number,
  userSteps?: number,
  userGuidance?: number
): OptimizedParams {
  // 基礎參數
  const baseParams = MODEL_DEFAULTS[model]
  const qualityAdj = QUALITY_ADJUSTMENTS[quality]
  const styleConfig = STYLE_CONFIGS[style]

  // 計算優化後的 steps
  let optimizedSteps = userSteps ?? baseParams.steps
  optimizedSteps = Math.round(optimizedSteps * qualityAdj.stepsMultiplier)
  optimizedSteps += styleConfig.steps

  // 根據圖像大小調整
  const pixelCount = width * height
  if (pixelCount > 1024 * 1024) {
    optimizedSteps = Math.round(optimizedSteps * 1.2) // 大圖增加 20%
  } else if (pixelCount < 512 * 512) {
    optimizedSteps = Math.round(optimizedSteps * 0.8) // 小圖減少 20%
  }

  // 限制範圍
  optimizedSteps = Math.max(1, Math.min(50, optimizedSteps))

  // 計算優化後的 guidance
  let optimizedGuidance = userGuidance ?? baseParams.guidance
  optimizedGuidance += qualityAdj.guidanceBoost
  optimizedGuidance += styleConfig.guidance

  // 限制範圍
  optimizedGuidance = Math.max(1.0, Math.min(15.0, optimizedGuidance))

  return {
    steps: optimizedSteps,
    guidance: parseFloat(optimizedGuidance.toFixed(1)),
    enhancement: quality === 'ultra' ? 'hd' : quality === 'standard' ? 'balanced' : 'fast',
  }
}

/**
 * 增強提示詞 (添加樣式和負面提示)
 */
export function enhancePrompt(prompt: string, style: StylePreset): { positive: string; negative: string } {
  const styleConfig = STYLE_CONFIGS[style]

  // 正面提示
  let positive = prompt.trim()
  if (styleConfig.positivePrompt && style !== 'none') {
    positive = `${positive}, ${styleConfig.positivePrompt}`
  }

  // 負面提示
  const negative = styleConfig.negativePrompt

  return { positive, negative }
}

/**
 * 中文翻譯 (使用 Cloudflare Workers AI)
 */
export async function translatePrompt(prompt: string, env: Env): Promise<string> {
  // 檢查是否含中文
  if (!/[\u4e00-\u9fa5]/.test(prompt)) {
    return prompt // 無中文，直接返回
  }

  try {
    if (!env.AI) {
      console.warn('Workers AI not available, skipping translation')
      return prompt
    }

    const response = await env.AI.run('@cf/meta/m2m100-1.2b', {
      text: prompt,
      source_lang: 'zh',
      target_lang: 'en',
    })

    if (response?.translated_text) {
      console.log(`Translated: ${prompt} -> ${response.translated_text}`)
      return response.translated_text
    }
  } catch (error) {
    console.error('Translation failed:', error)
  }

  return prompt // 翻譯失敗，返回原文
}

/**
 * 生成緩存鍵
 */
export function generateCacheKey(params: {
  prompt: string
  model: FluxModel
  width: number
  height: number
  seed: number
  style: StylePreset
  steps: number
  guidance: number
}): string {
  const normalized = {
    ...params,
    prompt: params.prompt.toLowerCase().trim(),
  }
  const json = JSON.stringify(normalized)
  return `flux_v2_${hashString(json)}`
}

/**
 * 簡單雜湊函數
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * 驗證參數
 */
export function validateParameters(params: any): { valid: boolean; error?: string } {
  // 提示詞檢查
  if (!params.prompt || typeof params.prompt !== 'string' || params.prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required' }
  }

  if (params.prompt.length > 2000) {
    return { valid: false, error: 'Prompt too long (max 2000 characters)' }
  }

  // 尺寸檢查
  if (params.width < 256 || params.width > 2048) {
    return { valid: false, error: 'Width must be between 256 and 2048' }
  }

  if (params.height < 256 || params.height > 2048) {
    return { valid: false, error: 'Height must be between 256 and 2048' }
  }

  // 模型檢查
  const validModels: FluxModel[] = ['zimage', 'flux', 'turbo', 'kontext']
  if (!validModels.includes(params.model)) {
    return { valid: false, error: 'Invalid model' }
  }

  // 數量檢查
  if (params.n < 1 || params.n > 4) {
    return { valid: false, error: 'n must be between 1 and 4' }
  }

  return { valid: true }
}
