/**
 * Cloudflare Pages 中間件
 * 處理 API 路由和靜態資源
 */

export async function onRequest(context: any) {
  const { request, next, env } = context
  const url = new URL(request.url)
  
  // CORS 頭
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // OPTIONS 請求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // API 路由 - 轉發到後端 API
  if (url.pathname.startsWith('/api/')) {
    // 這裡可以加入後端 API 邏輯
    // 目前返回錯誤，因為還沒有實現
    return new Response(
      JSON.stringify({
        success: false,
        error: 'API not implemented yet. Please use direct API calls.',
      }),
      {
        status: 501,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }

  // 靜態資源 - 繼續處理
  return next()
}
