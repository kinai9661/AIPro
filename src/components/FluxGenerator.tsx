import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Sparkles, Settings, History, Loader2, Shuffle, Download, Copy, ZoomIn, Trash2, Upload, X } from 'lucide-react'
import { generateImage } from '@/lib/api'
import type { FluxModel, QualityMode, StylePreset } from '@/types/flux'

interface HistoryItem {
  id: string
  timestamp: number
  prompt: string
  params: any
  result: string
}

interface SettingsData {
  darkMode: boolean
  autoSave: boolean
  autoOptimize: boolean
  autoHD: boolean
  apiKey: string
}

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
  const [batchCount, setBatchCount] = useState(1)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [settings, setSettings] = useState<SettingsData>({
    darkMode: false,
    autoSave: true,
    autoOptimize: true,
    autoHD: true,
    apiKey: '',
  })
  
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // 加載歷史和設置
  useEffect(() => {
    const savedHistory = localStorage.getItem('flux-history')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    
    const savedSettings = localStorage.getItem('flux-settings')
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('請輸入提示詞')
      return
    }
    
    setLoading(true)
    setError(null)
    setResults([])
    
    try {
      const allResults: string[] = []
      
      // 批量生成
      for (let i = 0; i < batchCount; i++) {
        const response = await generateImage({
          prompt,
          model,
          width,
          height,
          seed: seed === -1 ? -1 : seed + i,
          style,
          quality_mode: quality,
          steps: steps[0],
          guidance: guidance[0],
          n: 1,
          auto_optimize: settings.autoOptimize,
          auto_hd: settings.autoHD,
          image: referenceImage || undefined,
        })

        if (response.success && response.data?.[0]) {
          allResults.push(response.data[0].image)
        }
      }
      
      setResults(allResults)
      
      // 保存到歷史
      if (settings.autoSave && allResults.length > 0) {
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          prompt,
          params: { prompt, model, width, height, seed, style, quality_mode: quality, steps: steps[0], guidance: guidance[0], batchCount },
          result: allResults[0],
        }
        const newHistory = [historyItem, ...history].slice(0, 100)
        setHistory(newHistory)
        localStorage.setItem('flux-history', JSON.stringify(newHistory))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000))
  }
  
  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `flux-ai-${Date.now()}-${index}.png`
    link.click()
  }
  
  const handleCopy = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert('圖片已複製到剪貼板!')
    } catch (err) {
      alert('複製失敗')
    }
  }
  
  const handleUploadReference = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReferenceImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleLoadFromHistory = (item: HistoryItem) => {
    setPrompt(item.prompt)
    setModel(item.params.model)
    setWidth(item.params.width)
    setHeight(item.params.height)
    setSeed(item.params.seed)
    setStyle(item.params.style)
    setQuality(item.params.quality_mode)
    setSteps([item.params.steps])
    setGuidance([item.params.guidance])
    setShowHistory(false)
  }
  
  const handleClearHistory = () => {
    if (confirm('確定要清空所有歷史記錄嗎？')) {
      setHistory([])
      localStorage.removeItem('flux-history')
    }
  }
  
  const handleSaveSettings = () => {
    localStorage.setItem('flux-settings', JSON.stringify(settings))
    setShowSettings(false)
    alert('設置已保存!')
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
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>生成歷史</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[500px] pr-4">
                  {history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">還沒有歷史記錄</p>
                  ) : (
                    <div className="space-y-4">
                      {history.map((item) => (
                        <Card key={item.id} className="cursor-pointer hover:bg-accent" onClick={() => handleLoadFromHistory(item)}>
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <img src={item.result} alt="" className="w-20 h-20 object-cover rounded" />
                              <div className="flex-1">
                                <p className="text-sm font-medium line-clamp-2">{item.prompt}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(item.timestamp).toLocaleString()}
                                </p>
                                <div className="flex gap-2 mt-2 text-xs">
                                  <span className="bg-primary/10 text-primary px-2 py-1 rounded">{item.params.model}</span>
                                  <span className="bg-secondary px-2 py-1 rounded">{item.params.width}x{item.params.height}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex gap-2 mt-4">
                  <Button variant="destructive" onClick={handleClearHistory}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    清空歷史
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>設置</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">深色模式</label>
                    <Switch checked={settings.darkMode} onCheckedChange={(v) => setSettings({...settings, darkMode: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">自動保存歷史</label>
                    <Switch checked={settings.autoSave} onCheckedChange={(v) => setSettings({...settings, autoSave: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">自動優化提示詞</label>
                    <Switch checked={settings.autoOptimize} onCheckedChange={(v) => setSettings({...settings, autoOptimize: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">啟用 HD 增強</label>
                    <Switch checked={settings.autoHD} onCheckedChange={(v) => setSettings({...settings, autoHD: v})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">API Key (可選)</label>
                    <input
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                      className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="輸入自定義 API Key"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveSettings} className="flex-1">保存</Button>
                    <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">取消</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

              {/* 質量模式 */}
              <div>
                <label className="text-sm font-medium">質量模式</label>
                <Select value={quality} onValueChange={(v) => setQuality(v as QualityMode)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">經濟模式 (快速)</SelectItem>
                    <SelectItem value="standard">標準模式 (推薦)</SelectItem>
                    <SelectItem value="ultra">超高清 (HD)</SelectItem>
                  </SelectContent>
                </Select>
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
              
              {/* 批量生成 */}
              <div>
                <label className="text-sm font-medium flex justify-between">
                  <span>批量生成</span>
                  <span className="text-muted-foreground">{batchCount} 張</span>
                </label>
                <Slider
                  value={[batchCount]}
                  onValueChange={(v) => setBatchCount(v[0])}
                  min={1}
                  max={4}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              {/* 圖生圖 */}
              <div>
                <label className="text-sm font-medium">參考圖片 (可選)</label>
                <div className="mt-2">
                  {referenceImage ? (
                    <div className="relative inline-block">
                      <img src={referenceImage} alt="Reference" className="w-32 h-32 object-cover rounded" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setReferenceImage(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">點擊上傳圖片</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadReference} />
                    </label>
                  )}
                </div>
              </div>

              {/* Seed */}
              <div>
                <label className="text-sm font-medium flex justify-between">
                  <span>Seed</span>
                  <span className="text-muted-foreground">{seed === -1 ? '隨機' : seed}</span>
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="-1 為隨機"
                  />
                  <Button variant="outline" size="icon" onClick={handleRandomSeed}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
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
                    生成 {batchCount} 張圖像
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
              <div className="space-y-4">
                {results.length === 0 ? (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">等待生成...</p>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${results.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {results.map((result, i) => (
                      <div key={i} className="relative group">
                        <img src={result} alt={`Result ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" onClick={() => handleDownload(result, i)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="secondary" onClick={() => handleCopy(result)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="secondary" onClick={() => setSelectedImage(result)}>
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 圖片放大查看 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <img src={selectedImage || ''} alt="Preview" className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
