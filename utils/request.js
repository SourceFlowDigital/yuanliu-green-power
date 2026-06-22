const config = require('./config.js')

var AI_API_BASE = config.BASE_URL

function get(path, query) {
  return new Promise(function(resolve, reject) {
    var url = config.getApiBase() + path
    if (query) {
      var params = Object.keys(query)
        .filter(function(k) { return query[k] !== undefined && query[k] !== null })
        .map(function(k) { return k + '=' + encodeURIComponent(query[k]) })
        .join('&')
      if (params) url += '?' + params
    }
    wx.request({
      url: url,
      method: 'GET',
      header: config.withPolicyApiKeyHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error('HTTP ' + res.statusCode))
        }
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}

function postAnalyze(payload) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: AI_API_BASE + '/api/analyze',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Api-Token': config.API_TOKEN
      },
      data: payload,
      timeout: 65000,
      success: function(res) {
        if (res.statusCode === 200 && res.data && res.data.success) {
          resolve(res.data)
        } else {
          var detail = res.data && res.data.detail
          reject(new Error(detail ? String(detail) : ('HTTP ' + res.statusCode)))
        }
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}

module.exports = { get, postAnalyze }
