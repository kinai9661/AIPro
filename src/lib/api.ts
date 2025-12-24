import type { GenerateParams, GenerateResponse } from '@/types/flux'

export async function generateImage(params: GenerateParams): Promise<GenerateResponse> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    // 返回 JSON 格式
    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

export async function checkHealth(): Promise<{ status: string; version: string }> {
  try {
    const response = await fetch('/api/health')
    return await response.json()
  } catch {
    return { status: 'error', version: 'unknown' }
  }
}

export async function getModels(): Promise<any[]> {
  try {
    const response = await fetch('/api/models')
    return await response.json()
  } catch {
    return []
  }
}
