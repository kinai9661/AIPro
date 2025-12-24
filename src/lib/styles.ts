import type { StylePreset, StyleInfo } from '@/types/flux'

export const STYLE_CATEGORIES = [
  {
    name: '無風格',
    styles: [
      { value: 'none', label: '無 (原始)', description: '不應用任何風格', category: '無風格' },
    ]
  },
  {
    name: '🎨 藝術風格',
    styles: [
      { value: 'anime', label: '日式動漫', description: '日本動畫風格，明亮色彩', category: '藝術風格' },
      { value: 'manga', label: '漫畫風', description: '黑白漫畫風格，線條感強', category: '藝術風格' },
      { value: 'comic-book', label: '美式漫畫', description: '美式超級英雄風格', category: '藝術風格' },
      { value: 'cartoon', label: '卡通', description: '可愛卡通風格，簡化造型', category: '藝術風格' },
      { value: 'pixel-art', label: '像素風', description: '8-bit/16-bit 遊戲風格', category: '藝術風格' },
      { value: 'line-art', label: '線稿畫', description: '純線條藝術，無上色', category: '藝術風格' },
      { value: 'sketch', label: '素描', description: '鑓筆素描風格', category: '藝術風格' },
      { value: 'watercolor', label: '水彩畫', description: '水彩渲染效果', category: '藝術風格' },
      { value: 'oil-painting', label: '油畫', description: '厚重油畫質感', category: '藝術風格' },
      { value: 'digital-art', label: '數位藝術', description: '現代數位繪畫風格', category: '藝術風格' },
    ]
  },
  {
    name: '📷 寫實風格',
    styles: [
      { value: 'photorealistic', label: '超寫實', description: '照片級真實感', category: '寫實風格' },
      { value: 'portrait', label: '人像攝影', description: '專業人像風格', category: '寫實風格' },
      { value: 'landscape', label: '風景攝影', description: '大自然風景照', category: '寫實風格' },
      { value: 'cinematic', label: '電影感', description: '電影畫面質感', category: '寫實風格' },
      { value: 'documentary', label: '紀錄片', description: '紀實風格攝影', category: '寫實風格' },
      { value: 'studio-photo', label: '棚內攝影', description: '專業棚內打光', category: '寫實風格' },
      { value: 'street-photography', label: '街頭攝影', description: '街頭拍攝風格', category: '寫實風格' },
      { value: 'macro', label: '微距攝影', description: '微觀細節拍攝', category: '寫實風格' },
    ]
  },
  {
    name: '✨ 奇幻風格',
    styles: [
      { value: 'fantasy', label: '奇幻', description: '魔幻奇幻世界', category: '奇幻風格' },
      { value: 'sci-fi', label: '科幻', description: '未來科技感', category: '奇幻風格' },
      { value: 'cyberpunk', label: '賽博朋克', description: '高科技低生活', category: '奇幻風格' },
      { value: 'steampunk', label: '蒸汽龐輪朋克', description: '維多利亞蒸汽時代', category: '奇幻風格' },
      { value: 'gothic', label: '哥德風', description: '黑暗哥德美學', category: '奇幻風格' },
      { value: 'dark-fantasy', label: '黑暗奇幻', description: '黑暗風格奇幻', category: '奇幻風格' },
      { value: 'mythological', label: '神話', description: '古代神話風格', category: '奇幻風格' },
      { value: 'surreal', label: '超現實', description: '夢境般超現實', category: '奇幻風格' },
    ]
  },
  {
    name: '🕸️ 現代藝術',
    styles: [
      { value: 'minimalist', label: '極簡主義', description: '簡約線條設計', category: '現代藝術' },
      { value: 'abstract', label: '抽象藝術', description: '抽象色彩與形狀', category: '現代藝術' },
      { value: 'pop-art', label: '流行藝術', description: '明亮流行風格', category: '現代藝術' },
      { value: 'graffiti', label: '塗鴉', description: '街頭塗鴉藝術', category: '現代藝術' },
      { value: 'low-poly', label: '低多邊形', description: '3D 低多邊形風格', category: '現代藝術' },
      { value: 'vaporwave', label: '蒸汽浪潮', description: '80s 復古未來感', category: '現代藝術' },
      { value: 'synthwave', label: '合成器浪潮', description: '霍光幻彩未來感', category: '現代藝術' },
    ]
  },
  {
    name: '🏛️ 經典藝術',
    styles: [
      { value: 'renaissance', label: '文藝復興', description: '文藝復興時期風格', category: '經典藝術' },
      { value: 'baroque', label: '巴洛克', description: '華麗巴洛克藝術', category: '經典藝術' },
      { value: 'impressionist', label: '印象派', description: '印象派繪畫風格', category: '經典藝術' },
      { value: 'art-nouveau', label: '新藝術運動', description: '裝飾性新藝術', category: '經典藝術' },
      { value: 'art-deco', label: '裝飾藝術', description: '1920s 裝飾風格', category: '經典藝術' },
      { value: 'ukiyo-e', label: '浮世繪', description: '日本浮世繪風格', category: '經典藝術' },
    ]
  },
  {
    name: '🌙 氣氛風格',
    styles: [
      { value: 'noir', label: '黑色電影', description: '黑白黑色電影風', category: '氣氛風格' },
      { value: 'vintage', label: '复古', description: '老照片質感', category: '氣氛風格' },
      { value: 'retro', label: '复古未來', description: '50-80年代復古風', category: '氣氛風格' },
      { value: 'horror', label: '恐怖', description: '黑暗恐怖氣氛', category: '氣氛風格' },
      { value: 'ethereal', label: '空靈感', description: '輕盈夢幻感', category: '氣氛風格' },
    ]
  },
] as const

export const ALL_STYLES: StyleInfo[] = STYLE_CATEGORIES.flatMap(cat => cat.styles)

export function getStyleInfo(value: StylePreset): StyleInfo | undefined {
  return ALL_STYLES.find(s => s.value === value)
}

export function getStylesByCategory(category: string): StyleInfo[] {
  return ALL_STYLES.filter(s => s.category === category)
}
