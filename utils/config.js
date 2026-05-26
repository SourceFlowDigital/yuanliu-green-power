/** 政策 API 基址：读取 app.js 的 USE_MOCK 开关动态切换 */
function getApiBase() {
  const fallback = 'http://127.0.0.1:8000/api/mock'
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

/** 服务根（identity、资讯、纠错等）：始终返回生产 origin，不受 USE_MOCK 影响 */
function getApiOrigin() {
  const fallback = 'http://127.0.0.1:8000'
  try {
    const app = getApp()
    const raw = app && app.globalData && app.globalData.apiOrigin
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim().replace(/\/+$/, '')
    }
  } catch (e) {}
  return fallback
}

/** 生产主机 https://ruienergy.top 上 FastAPI 的 X-API-Key 鉴权（与本地 127.0.0.1 联调无害） */
function withPolicyApiKeyHeader(header) {
  return Object.assign(
    { 'X-API-Key': 'ruijing-policy-2026' },
    header || {}
  )
}

module.exports = {
  getApiBase,
  getApiOrigin,
  withPolicyApiKeyHeader,
}
