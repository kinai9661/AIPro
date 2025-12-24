import type { GenerateParams, GenerateResponse } from '@/types/flux'

export async function generateImage(params: GenerateParams): Promise<GenerateResponse> {
  try {
    const response = await fetch('/_internal/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    // 單圖返回二進制
    if (params.n === 1 && response.headers.get('content-type')?.includes('image')) {
      const blob = await response.blob()
      const base64 = await blobToBase64(blob)
      return {
        success: true,
        data: [{
          image: base64,
          seed: parseInt(response.headers.get('x-seed') || '-1'),
          model: params.model,
          generation_time: parseInt(response.headers.get('x-generation-time') || '0'),
        }],
      }
    }

    // 多圖返回 JSON
    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function checkHealth(): Promise<{ status: string; version: string }> {
  try {
    const response = await fetch('/health')
    return await response.json()
  } catch {
    return { status: 'error', version: 'unknown' }
  }
}
