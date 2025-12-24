import type { GenerateParams, GenerateResponse } from '@/types/flux'

// 風格提示詞映射
const STYLE_PROMPTS: Record<string, string> = {
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

export async function generateImage(params: GenerateParams): Promise<GenerateResponse> {
  try {
    const results: GenerateResponse['data'] = []
    
    // 構建最終提示詞
    let finalPrompt = params.prompt
    
    // 添加風格
    if (params.style && params.style !== 'none' && STYLE_PROMPTS[params.style]) {
      finalPrompt = `${finalPrompt}, ${STYLE_PROMPTS[params.style]}`
    }
    
    // 質量增強
    if (params.quality_mode === 'ultra' || params.auto_hd) {
      finalPrompt += ', high quality, detailed, sharp focus, 8k uhd'
    } else if (params.quality_mode === 'standard') {
      finalPrompt += ', good quality, detailed'
    }
    
    // 生成多張圖片
    for (let i = 0; i < params.n; i++) {
      const currentSeed = params.seed === -1 ? Math.floor(Math.random() * 1000000) : params.seed + i
      
      // 直接生成圖片 URL
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(finalPrompt)}?width=${params.width}&height=${params.height}&seed=${currentSeed}&nologo=true&enhance=${params.auto_optimize}`
      
      results.push({
        image: imageUrl,  // 直接使用 URL
        seed: currentSeed,
        model: params.model,
        generation_time: 0,  // 即時生成
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

export async function checkHealth(): Promise<{ status: string; version: string }> {
  return { status: 'ok', version: '2.0.0' }
}

export async function getModels(): Promise<any[]> {
  return [
    {
      id: 'flux',
      name: 'Flux Pro',
      description: '高質量 AI 圖像生成',
      speed: 5,
      quality: 5,
    },
  ]
}
