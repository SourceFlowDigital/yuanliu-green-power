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
  base['X-Api-Token'] = API_TOKEN
  return base
}

// FA4 + FA5: 集中常量 — API 基址、固定价格
var BASE_URL = 'https://green.sourceflower.com'
var PAYMENT_AMOUNT = 1990  // 单位：分，¥19.9

module.exports = {
  API_TOKEN: API_TOKEN,
  BASE_URL: BASE_URL,
  PAYMENT_AMOUNT: PAYMENT_AMOUNT,
  getApiBase: getApiBase,
  getApiOrigin: getApiOrigin,
  withPolicyApiKeyHeader: withPolicyApiKeyHeader,
}
