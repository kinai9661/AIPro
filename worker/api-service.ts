// Pollinations API Service for Flux AI Pro V2

import type {
  FluxModel,
  GenerateRequest,
  GenerateResponse,
  PollinationsConfig,
  ModelConfig,
  Env,
} from './types'
import { optimizeParameters, enhancePrompt, translatePrompt, generateCacheKey } from './optimizer'

// Pollinations API 端點
const POLLINATIONS_BASE = 'https://image.pollinations.ai'

// 模型配置
const MODEL_CONFIGS: Record<FluxModel, ModelConfig> = {
  zimage: {
    endpoint: '/prompt',
    defaultSteps: 4,
    defaultGuidance: 3.5,
    maxSize: 1536,
    supportsReference: false,
    costMultiplier: 0.0002,
  },
  flux: {
    endpoint: '/prompt',
    defaultSteps: 20,
    defaultGuidance: 7.5,
    maxSize: 2048,
    supportsReference: false,
    costMultiplier: 0.00012,
  },
  turbo: {
    endpoint: '/prompt',
    defaultSteps: 8,
    defaultGuidance: 3.5,
    maxSize: 1536,
    supportsReference: false,
    costMultiplier: 0.0003,
  },
  kontext: {
    endpoint: '/prompt',
    defaultSteps: 25,
    defaultGuidance: 7.5,
    maxSize: 1536,
    supportsReference: true,
    costMultiplier: 0.04,
  },
}

/**
 * 生成圖像 (主函數)
 */
export async function generateImage(request: GenerateRequest, env: Env): Promise<GenerateResponse> {
  const startTime = Date.now()

  try {
    // 1. 翻譯中文提示詞
    let translatedPrompt = request.prompt
    if (request.auto_optimize) {
      translatedPrompt = await translatePrompt(request.prompt, env)
    }

    // 2. 優化參數
    const optimizedParams = optimizeParameters(
      request.model,
      request.quality_mode,
      request.style,
      request.width,
      request.height,
      request.steps,
      request.guidance
    )

    // 3. 增強提示詞
    const { positive, negative } = enhancePrompt(translatedPrompt, request.style)

    // 4. 檢查緩存
    const cacheKey = generateCacheKey({
      prompt: positive,
      model: request.model,
      width: request.width,
      height: request.height,
      seed: request.seed,
      style: request.style,
      steps: optimizedParams.steps,
      guidance: optimizedParams.guidance,
    })

    if (env.FLUX_CACHE) {
      const cached = await env.FLUX_CACHE.get(cacheKey, 'arrayBuffer')
      if (cached) {
        console.log('Cache hit:', cacheKey)
        const base64 = arrayBufferToBase64(cached)
        return {
          success: true,
          data: [
            {
              image: `data:image/png;base64,${base64}`,
              seed: request.seed,
              model: request.model,
              generation_time: Date.now() - startTime,
            },
          ],
          metadata: {
            original_prompt: request.prompt,
            translated_prompt: translatedPrompt !== request.prompt ? translatedPrompt : undefined,
            optimized_params: optimizedParams,
          },
        }
      }
    }

    // 5. 調用 Pollinations API
    const results = []
    for (let i = 0; i < request.n; i++) {
      const seed = request.seed === -1 ? Math.floor(Math.random() * 1000000) : request.seed + i

      const imageBuffer = await callPollinationsAPI({
        model: request.model,
        prompt: positive,
        width: request.width,
        height: request.height,
        seed,
        nologo: true,
        enhance: request.auto_hd && request.quality_mode === 'ultra',
      }, env)

      const base64 = arrayBufferToBase64(imageBuffer)

      results.push({
        image: `data:image/png;base64,${base64}`,
        seed,
        model: request.model,
        generation_time: Date.now() - startTime,
        optimized_prompt: positive !== request.prompt ? positive : undefined,
      })

      // 僅緩存第一張
      if (i === 0 && env.FLUX_CACHE) {
        await env.FLUX_CACHE.put(cacheKey, imageBuffer, {
          expirationTtl: 86400, // 24 hours
        })
      }
    }

    // 6. 計算成本
    const modelConfig = MODEL_CONFIGS[request.model]
    const cost = modelConfig.costMultiplier * request.n

    return {
      success: true,
      data: results,
      metadata: {
        original_prompt: request.prompt,
        translated_prompt: translatedPrompt !== request.prompt ? translatedPrompt : undefined,
        optimized_params: optimizedParams,
        cost,
      },
    }
  } catch (error) {
    console.error('Generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 調用 Pollinations API
 */
async function callPollinationsAPI(config: PollinationsConfig, env: Env): Promise<ArrayBuffer> {
  const modelConfig = MODEL_CONFIGS[config.model]

  // 構建 URL
  const url = new URL(`${POLLINATIONS_BASE}${modelConfig.endpoint}`)
  url.searchParams.set('prompt', config.prompt)
  url.searchParams.set('model', mapModelName(config.model))
  url.searchParams.set('width', config.width.toString())
  url.searchParams.set('height', config.height.toString())
  url.searchParams.set('seed', config.seed.toString())
  url.searchParams.set('nologo', config.nologo ? 'true' : 'false')
  url.searchParams.set('enhance', config.enhance ? 'true' : 'false')

  console.log('Calling Pollinations API:', url.toString())

  // 請求頭
  const headers: HeadersInit = {
    'User-Agent': 'Flux-AI-Pro-V2/2.0.0',
  }

  if (env.POLLINATIONS_API_KEY) {
    headers['Authorization'] = `Bearer ${env.POLLINATIONS_API_KEY}`
  }

  // 發送請求
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
    cf: {
      cacheTtl: 3600,
      cacheEverything: true,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Pollinations API error: ${response.status} - ${errorText}`)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('image')) {
    throw new Error(`Unexpected content type: ${contentType}`)
  }

  return await response.arrayBuffer()
}

/**
 * 模型名稱映射
 */
function mapModelName(model: FluxModel): string {
  const mapping: Record<FluxModel, string> = {
    zimage: 'zimage',
    flux: 'flux',
    turbo: 'flux-realism',
    kontext: 'kontext',
  }
  return mapping[model]
}

/**
 * ArrayBuffer 轉 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Base64 轉 ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * 檢查 API 健康狀態
 */
export async function checkAPIHealth(env: Env): Promise<{ available: boolean; latency?: number }> {
  const startTime = Date.now()

  try {
    const testUrl = `${POLLINATIONS_BASE}/prompt?width=64&height=64&seed=1&model=flux&prompt=test`
    const response = await fetch(testUrl, {
      method: 'HEAD',
      headers: env.POLLINATIONS_API_KEY
        ? { Authorization: `Bearer ${env.POLLINATIONS_API_KEY}` }
        : {},
    })

    return {
      available: response.ok,
      latency: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return { available: false }
  }
}
