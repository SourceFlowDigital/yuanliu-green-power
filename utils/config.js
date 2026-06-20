/** 政策 API 基址：读取 app.js 的 USE_MOCK 开关动态切换 */
function getApiBase() {
  const fallback = 'https://green.sourceflower.com/api'
  try {
    const app = getApp()
    if (typeof app.getEffectiveApiBase === 'function') {
      return app.getEffectiveApiBase()
    }
    const raw = app && app.globalData && app.globalData.apiBase
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim().replace(/\/+$/, '')
    }
  } catch (e) {}
  return fallback
}

/** 服务根：始终返回生产 origin */
function getApiOrigin() {
  const fallback = 'https://green.sourceflower.com'
  try {
    const app = getApp()
    const raw = app && app.globalData && app.globalData.apiOrigin
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim().replace(/\/+$/, '')
    }
  } catch (e) {}
  return fallback
}

/** 请求头注入 Token（Nginx 鉴权） */
function withPolicyApiKeyHeader(header) {
  var base = header || {}
  base['X-Api-Token'] = 'ylGreen-8fX2mK9p-2026'
  return base
}

module.exports = {
  getApiBase,
  getApiOrigin,
  withPolicyApiKeyHeader,
}
