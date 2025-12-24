import type { GenerateParams, GenerateResponse } from '@/types/flux'

// 使用外部 API
const API_BASE = 'https://pollinations.ai'

export async function generateImage(params: GenerateParams): Promise<GenerateResponse> {
  try {
    const results: GenerateResponse['data'] = []
    
    // 生成多張圖片
    for (let i = 0; i < params.n; i++) {
      const currentSeed = params.seed === -1 ? Math.floor(Math.random() * 1000000) : params.seed + i
      
      // 構建提示詞
      let finalPrompt = params.prompt
      
      // 添加風格提示
      if (params.style && params.style !== 'none') {
        const stylePrompts: Record<string, string> = {
          anime: 'anime style, vibrant colors, manga art',
          manga: 'manga style, black and white, ink drawing',
          'comic-book': 'comic book style, bold lines, superhero art',
          cartoon: 'cartoon style, cute, simplified shapes',
          'pixel-art': 'pixel art, 8-bit, retro game style',
          'line-art': 'line art, clean lines, no color',
          sketch: 'pencil sketch, hand drawn',
          watercolor: 'watercolor painting, soft colors',
          'oil-painting': 'oil painting, thick paint texture',
          'digital-art': 'digital art, modern illustration',
          photorealistic: 'photorealistic, highly detailed, 8k',
          portrait: 'professional portrait photography',
          landscape: 'landscape photography, natural scenery',
          cinematic: 'cinematic, movie scene, dramatic lighting',
          documentary: 'documentary style, realistic',
          'studio-photo': 'studio photography, professional lighting',
          'street-photography': 'street photography, candid moment',
          macro: 'macro photography, extreme close-up',
          fantasy: 'fantasy art, magical world',
          'sci-fi': 'sci-fi, futuristic, high-tech',
          cyberpunk: 'cyberpunk, neon lights, dystopian',
          steampunk: 'steampunk, victorian era, brass and steam',
          gothic: 'gothic, dark aesthetic',
          'dark-fantasy': 'dark fantasy, grim atmosphere',
          mythological: 'mythological, ancient gods',
          surreal: 'surreal, dreamlike, abstract',
          minimalist: 'minimalist, clean design, simple',
          abstract: 'abstract art, geometric shapes',
          'pop-art': 'pop art, bright colors, bold style',
          graffiti: 'graffiti art, street art',
          'low-poly': 'low poly, 3D geometric',
          vaporwave: 'vaporwave, 80s retro futuristic',
          synthwave: 'synthwave, neon, retro futuristic',
          renaissance: 'renaissance painting style',
          baroque: 'baroque art, ornate, dramatic',
          impressionist: 'impressionist painting',
          'art-nouveau': 'art nouveau, decorative',
          'art-deco': 'art deco, 1920s style',
          'ukiyo-e': 'ukiyo-e, japanese woodblock print',
          noir: 'film noir, black and white',
          vintage: 'vintage, old photo aesthetic',
          retro: 'retro, 50s-80s style',
          horror: 'horror, dark, scary atmosphere',
          ethereal: 'ethereal, dreamy, light',
        }
        
        const stylePrompt = stylePrompts[params.style]
        if (stylePrompt) {
          finalPrompt = `${finalPrompt}, ${stylePrompt}`
        }
      }
      
      // 質量增強
      if (params.quality_mode === 'ultra' || params.auto_hd) {
        finalPrompt += ', high quality, detailed, sharp focus, 8k uhd'
      }
      
      // 生成圖片 URL
      const imageUrl = `${API_BASE}/prompt/${encodeURIComponent(finalPrompt)}?width=${params.width}&height=${params.height}&seed=${currentSeed}&nologo=true&enhance=${params.auto_optimize}`
      
      // 獲取圖片
      const startTime = Date.now()
      const response = await fetch(imageUrl)
      
      if (!response.ok) {
        throw new Error(`生成失敗: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const base64 = await blobToBase64(blob)
      const generationTime = Date.now() - startTime
      
      results.push({
        image: base64,
        seed: currentSeed,
        model: params.model,
        generation_time: generationTime,
      })
    }
    
    return {
      success: true,
      data: results,
    }
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
    const response = await fetch(`${API_BASE}/`)
    return { 
      status: response.ok ? 'ok' : 'error', 
      version: '2.0.0' 
    }
  } catch {
    return { status: 'error', version: '2.0.0' }
  }
}

export async function getModels(): Promise<any[]> {
  return [
    {
      id: 'flux',
      name: 'Flux Pro',
      description: '高質量 AI 圖像生成',
      speed: 4,
      quality: 5,
    },
  ]
}
