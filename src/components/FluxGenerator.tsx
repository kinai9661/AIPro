import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Sparkles, Settings, History, Loader2 } from 'lucide-react'
import { generateImage } from '@/lib/api'
import type { FluxModel, QualityMode, StylePreset } from '@/types/flux'

export default function FluxGenerator() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<FluxModel>('flux')
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  const [seed, setSeed] = useState(-1)
  const [style, setStyle] = useState<StylePreset>('none')
  const [quality, setQuality] = useState<QualityMode>('standard')
  const [steps, setSteps] = useState([20])
  const [guidance, setGuidance] = useState([7.5])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('請輸入提示詞')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await generateImage({
        prompt,
        model,
        width,
        height,
        seed,
        style,
        quality_mode: quality,
        steps: steps[0],
        guidance: guidance[0],
        n: 1,
        auto_optimize: true,
        auto_hd: true,
      })

      if (response.success && response.data?.[0]) {
        setResult(response.data[0].image)
        // 保存到歷史
        const historyItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          prompt,
          params: { prompt, model, width, height, seed, style, quality_mode: quality, steps: steps[0], guidance: guidance[0], n: 1, auto_optimize: true, auto_hd: true },
          result: response.data[0].image,
        }
        const history = JSON.parse(localStorage.getItem('flux-history') || '[]')
        history.unshift(historyItem)
        localStorage.setItem('flux-history', JSON.stringify(history.slice(0, 100)))
      } else {
        setError(response.error || '生成失敗')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Flux AI Pro V2
            </h1>
            <p className="text-muted-foreground mt-2">專業級 AI 圖像生成服務</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <History className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：參數面板 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>生成參數</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 提示詞 */}
              <div>
                <label className="text-sm font-medium">提示詞</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想生成的圖像... 例如: A beautiful sunset over mountains"
                  className="mt-2 resize-none"
                  rows={4}
                />
              </div>

              {/* 模型選擇 */}
              <div>
                <label className="text-sm font-medium">模型</label>
                <Select value={model} onValueChange={(v) => setModel(v as FluxModel)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zimage">Z-Image Turbo (3-8秒)</SelectItem>
                    <SelectItem value="flux">Flux 標準版 (推薦)</SelectItem>
                    <SelectItem value="turbo">Flux Turbo (5-10秒)</SelectItem>
                    <SelectItem value="kontext">Kontext (圖生圖)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 尺寸 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">寬度</label>
                  <Select value={width.toString()} onValueChange={(v) => setWidth(parseInt(v))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512">512px</SelectItem>
                      <SelectItem value="768">768px</SelectItem>
                      <SelectItem value="1024">1024px</SelectItem>
                      <SelectItem value="1536">1536px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">高度</label>
                  <Select value={height.toString()} onValueChange={(v) => setHeight(parseInt(v))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512">512px</SelectItem>
                      <SelectItem value="768">768px</SelectItem>
                      <SelectItem value="1024">1024px</SelectItem>
                      <SelectItem value="1536">1536px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 風格 */}
              <div>
                <label className="text-sm font-medium">風格</label>
                <Select value={style} onValueChange={(v) => setStyle(v as StylePreset)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">無 (原始)</SelectItem>
                    <SelectItem value="anime">動漫</SelectItem>
                    <SelectItem value="photorealistic">寫實</SelectItem>
                    <SelectItem value="oil-painting">油畫</SelectItem>
                    <SelectItem value="watercolor">水彩</SelectItem>
                    <SelectItem value="cyberpunk">賽博朋克</SelectItem>
                    <SelectItem value="fantasy">奇幻</SelectItem>
                    <SelectItem value="minimalist">極簡</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Steps */}
              <div>
                <label className="text-sm font-medium flex justify-between">
                  <span>Steps</span>
                  <span className="text-muted-foreground">{steps[0]}</span>
                </label>
                <Slider
                  value={steps}
                  onValueChange={setSteps}
                  min={1}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Guidance */}
              <div>
                <label className="text-sm font-medium flex justify-between">
                  <span>Guidance</span>
                  <span className="text-muted-foreground">{guidance[0].toFixed(1)}</span>
                </label>
                <Slider
                  value={guidance}
                  onValueChange={setGuidance}
                  min={1}
                  max={15}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              {/* 錯誤提示 */}
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* 生成按鈕 */}
              <Button 
                onClick={handleGenerate} 
                disabled={loading || !prompt.trim()}
                className="w-full" 
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    生成圖像
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 右側：預覽 */}
          <Card>
            <CardHeader>
              <CardTitle>生成結果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {result ? (
                  <img src={result} alt="Generated" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-muted-foreground">等待生成...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
