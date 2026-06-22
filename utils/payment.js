// ⚠️ SANDBOX_ONLY: doVirtualPayment success回调已跳过查单
// 上线前必须恢复查单逻辑，参考 confirmOrder 函数
var API_BASE = 'https://green.sourceflower.com'
var API_TOKEN = 'ylGreen-8fX2mK9p-2026'

/**
 * 完整支付流程
 * @param {Object} params
 * @param {string} params.productDesc  产品描述，传给后端
 * @param {Function} params.onSuccess  支付+查单成功后回调，参数为 { out_trade_no, order }
 * @param {Function} params.onFail     任意步骤失败回调，参数为 Error
 */
function requestPayment(params) {
  // Step 1: wx.checkSession + wx.login
  wx.checkSession({
    success: function () {
      doLogin(params)
    },
    fail: function () {
      doLogin(params)
    }
  })
}

function doLogin(params) {
  wx.login({
    success: function (loginRes) {
      if (!loginRes.code) {
        params.onFail(new Error('wx.login 未返回 code'))
        return
      }
      createOrder(loginRes.code, params)
    },
    fail: function (err) {
      params.onFail(new Error('wx.login 失败: ' + (err.errMsg || '')))
    }
  })
}

function createOrder(code, params) {
  wx.request({
    url: API_BASE + '/api/payment/create_order',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Api-Token': API_TOKEN
    },
    data: {
      code: code,
      product_desc: params.productDesc || 'AI深度分析报告',
      amount: params.amount || 1990
    },
    timeout: 15000,
    success: function (res) {
      if (res.statusCode === 200 && res.data && res.data.out_trade_no) {
        doVirtualPayment(res.data, params)
      } else {
        var msg = res.data && res.data.detail ? String(res.data.detail) : ('create_order HTTP ' + res.statusCode)
        params.onFail(new Error(msg))
      }
    },
    fail: function (err) {
      params.onFail(new Error('create_order 网络失败: ' + (err.errMsg || '')))
    }
  })
}

function doVirtualPayment(orderData, params) {
  wx.requestVirtualPayment({
    offerId: orderData.offer_id,
    currencyType: 'CNY',
    buyQuantity: 1,
    env: orderData.env || 0,
    mode: 'short_series_goods',
    signData: orderData.sign_data,
    paySig: orderData.pay_sig,
    signature: orderData.signature,
    success: function () {
      // SANDBOX_ONLY: 沙箱环境跳过查单，直接信任支付回调
      // 上线前必须恢复为查单逻辑
      params.onSuccess({
        out_trade_no: orderData.out_trade_no,
        order: { status: 'paid' }
      })
    },
    fail: function (err) {
      // 用户取消支付 errCode=1001，不算错误
      if (err && (err.errCode === 1001 || err.errMsg && err.errMsg.indexOf('cancel') !== -1)) {
        params.onFail(new Error('USER_CANCEL'))
      } else {
        params.onFail(new Error('支付失败: ' + (err.errMsg || JSON.stringify(err))))
      }
    }
  })
}

function confirmOrder(outTradeNo, params) {
  wx.request({
    url: API_BASE + '/api/payment/confirm/' + outTradeNo,
    method: 'GET',
    header: {
      'X-Api-Token': API_TOKEN
    },
    timeout: 10000,
    success: function (res) {
      if (res.statusCode === 200 && res.data && res.data.status === 'paid') {
        params.onSuccess({
          out_trade_no: outTradeNo,
          order: res.data
        })
      } else {
        params.onFail(new Error('查单未确认支付，请联系客服'))
      }
    },
    fail: function (err) {
      params.onFail(new Error('confirm 网络失败: ' + (err.errMsg || '')))
    }
  })
}

module.exports = { requestPayment, confirmOrder }
