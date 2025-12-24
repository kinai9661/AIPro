/**
 * Flux AI Pro V2 - Cloudflare Worker
 * 完整版 TypeScript Worker
 * 
 * 功能:
 * - 多模型支持 (Z-Image, Flux, Turbo, Kontext)
 * - 自動參數優化
 * - 中文翻譯 (Workers AI)
 * - 樣式增強
 * - KV 緩存
 * - 錯誤處理
 * - 健康檢查
 */

import type { Env, GenerateRequest, GenerateResponse, HealthResponse } from './types'
import { generateImage, checkAPIHealth } from './api-service'
import { validateParameters } from './optimizer'

// CORS 頭
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // OPTIONS 請求 (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      })
    }

    try {
      // API 路由 - 優先處理
      if (path.startsWith('/api/')) {
        return handleAPIRoute(path.replace('/api', ''), request, env, ctx)
      }

      // 靜態資源 - 直接返回
      return env.ASSETS.fetch(request)
    } catch (error) {
      console.error('Worker error:', error)
      return jsonError(
        error instanceof Error ? error.message : 'Internal server error',
        500
      )
    }
  },
}

/**
 * 處理 API 路由
 */
async function handleAPIRoute(
  path: string,
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  switch (path) {
    case '/health':
      return handleHealth(env)

    case '/generate':
      if (request.method !== 'POST') {
        return jsonError('Method not allowed', 405)
      }
      return handleGenerate(request, env, ctx)

    case '/models':
      return handleModels()

    case '/cache/clear':
      if (request.method !== 'POST') {
        return jsonError('Method not allowed', 405)
      }
      return handleCacheClear(env)

    default:
      return jsonError('Not found', 404)
  }
}

/**
 * 處理生成請求
 */
async function handleGenerate(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    // 解析請求
    const body = await request.json() as GenerateRequest

    // 驗證參數
    const validation = validateParameters(body)
    if (!validation.valid) {
      return jsonError(validation.error || 'Invalid parameters', 400)
    }

    // 生成圖像
    const result = await generateImage(body, env)

    if (!result.success) {
      return jsonError(result.error || 'Generation failed', 500)
    }

    // 返回 JSON 格式
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    })
  } catch (error) {
    console.error('Generate handler error:', error)
    return jsonError(
      error instanceof Error ? error.message : 'Failed to process request',
      500
    )
  }
}

/**
 * 健康檢查
 */
async function handleHealth(env: Env): Promise<Response> {
  const apiHealth = await checkAPIHealth(env)

  const health: HealthResponse = {
    status: apiHealth.available ? 'ok' : 'degraded',
    version: '2.0.0',
    models: ['zimage', 'flux', 'turbo', 'kontext'],
    cache_enabled: !!env.FLUX_CACHE,
  }

  return new Response(JSON.stringify(health), {
    status: health.status === 'ok' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...CORS_HEADERS,
    },
  })
}

/**
 * 模型列表
 */
function handleModels(): Response {
  const models = [
    {
      id: 'zimage',
      name: 'Z-Image Turbo',
      description: '超快速生成 (3-8秒)',
      speed: 5,
      quality: 3,
      maxSize: 1536,
      cost: 0.0002,
    },
    {
      id: 'flux',
      name: 'Flux Standard',
      description: '平衡性能與質量 (推薦)',
      speed: 4,
      quality: 4,
      maxSize: 2048,
      cost: 0.00012,
    },
    {
      id: 'turbo',
      name: 'Flux Turbo',
      description: '快速高質量 (5-10秒)',
      speed: 4,
      quality: 3,
      maxSize: 1536,
      cost: 0.0003,
    },
    {
      id: 'kontext',
      name: 'Kontext',
      description: '圖生圖專用 (最高質量)',
      speed: 3,
      quality: 5,
      maxSize: 1536,
      cost: 0.04,
      features: ['image-to-image', 'style-transfer'],
    },
  ]

  return new Response(JSON.stringify(models), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      ...CORS_HEADERS,
    },
  })
}

/**
 * 清空緩存
 */
async function handleCacheClear(env: Env): Promise<Response> {
  if (!env.FLUX_CACHE) {
    return jsonError('Cache not enabled', 400)
  }

  try {
    // KV 不支持批量刪除，只能通過 TTL 自動過期
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cache will expire automatically based on TTL',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    )
  } catch (error) {
    return jsonError('Failed to clear cache', 500)
  }
}

/**
 * JSON 錯誤響應
 */
function jsonError(message: string, status: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    }
  )
}
