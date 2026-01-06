/**
 * Banana Slides 前端 - 接收主系统传递的认证Token
 * 此脚本在Banana Slides的HTML中加载，用于接收父窗口传递的Token
 */

(function() {
  console.log('[Banana Auth] Token receiver initialized')
  
  let authToken = null
  
  // 监听来自父窗口的消息
  window.addEventListener('message', function(event) {
    // 安全检查：验证消息来源
    if (event.origin !== 'http://localhost:3000') {
      console.warn('[Banana Auth] Rejected message from unknown origin:', event.origin)
      return
    }
    
    // 检查消息类型
    if (event.data && event.data.type === 'AUTH_TOKEN') {
      console.log('[Banana Auth] Received auth token from parent window')
      authToken = event.data.token
      
      // 存储到localStorage
      localStorage.setItem('unified_auth_token', authToken)
      console.log('[Banana Auth] Token stored successfully')
      
      // 通知应用Token已就绪
      window.dispatchEvent(new CustomEvent('unified-auth-ready', {
        detail: { token: authToken }
      }))
    }
  })
  
  // 提供获取Token的函数
  window.getUnifiedAuthToken = function() {
    // 优先使用内存中的token
    if (authToken) {
      return authToken
    }
    
    // 其次从localStorage获取
    const storedToken = localStorage.getItem('unified_auth_token')
    if (storedToken) {
      authToken = storedToken
      return authToken
    }
    
    return null
  }
  
  // 拦截fetch请求，自动添加Authorization头
  const originalFetch = window.fetch
  window.fetch = function(url, options = {}) {
    const token = window.getUnifiedAuthToken()
    
    // 只为API请求添加Token
    if (token && (url.includes('/api/') || url.startsWith('/api/'))) {
      options.headers = options.headers || {}
      
      // 如果是Headers对象
      if (options.headers instanceof Headers) {
        options.headers.set('Authorization', `Bearer ${token}`)
      } else {
        // 如果是普通对象
        options.headers['Authorization'] = `Bearer ${token}`
      }
      
      console.log('[Banana Auth] Added auth header to request:', url)
    }
    
    return originalFetch.call(this, url, options)
  }
  
  console.log('[Banana Auth] Fetch interceptor installed')
})()
