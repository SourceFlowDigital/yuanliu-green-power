var config = require('../../utils/config.js')

Page({
  data: {
    outTradeNo: '',
    productName: 'AI合规报告服务',
    productNameIndex: 0,
    productNames: ['AI合规报告服务', '软件咨询服务', '技术咨询服务', '信息技术服务'],
    productDisplayFormat: '*信息技术服务*AI合规报告服务',
    taxRate: '1%',
    title: '',
    taxNumber: '',
    recipientEmail: '',
    remark: '',
    submitting: false
  },

  onLoad: function (options) {
    this.setData({
      outTradeNo: options.out_trade_no || ''
    })
  },

  onProductNameChange: function (e) {
    var index = e.detail.value
    var name = this.data.productNames[index]
    var format = ''
    if (name === '技术咨询服务') {
      format = '*鉴证咨询服务*技术咨询服务'
    } else {
      format = '*信息技术服务*' + name
    }
    this.setData({
      productName: name,
      productNameIndex: index,
      productDisplayFormat: format
    })
  },

  onInputTitle: function (e) {
    this.setData({ title: e.detail.value })
  },

  onInputTaxNumber: function (e) {
    this.setData({ taxNumber: e.detail.value })
  },

  onInputEmail: function (e) {
    this.setData({ recipientEmail: e.detail.value })
  },

  onInputRemark: function (e) {
    this.setData({ remark: e.detail.value })
  },

  onSubmit: function () {
    var self = this
    var data = this.data

    // 校验必填项
    if (!data.title || !data.title.trim()) {
      wx.showToast({ title: '请填写发票抬头', icon: 'none' })
      return
    }
    if (!data.taxNumber || !data.taxNumber.trim()) {
      wx.showToast({ title: '请填写纳税人识别号', icon: 'none' })
      return
    }
    if (!data.recipientEmail || !data.recipientEmail.trim()) {
      wx.showToast({ title: '请填写接收发票邮箱', icon: 'none' })
      return
    }
    if (data.recipientEmail.indexOf('@') === -1) {
      wx.showToast({ title: '请填写正确的邮箱地址', icon: 'none' })
      return
    }

    self.setData({ submitting: true })

    wx.request({
      url: config.BASE_URL + '/api/invoice/apply',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Api-Token': config.API_TOKEN
      },
      data: {
        order_id: data.outTradeNo,
        product_name: data.productName,
        title: data.title.trim(),
        tax_number: data.taxNumber.trim(),
        recipient_email: data.recipientEmail.trim(),
        remark: data.remark.trim()
      },
      success: function (res) {
        self.setData({ submitting: false })
        if (res.statusCode === 200 && res.data && res.data.success) {
          wx.showToast({
            title: '申请已提交，48小时内发送至您邮箱',
            icon: 'none',
            duration: 2000
          })
          setTimeout(function () {
            wx.navigateBack()
          }, 1000)
        } else {
          var msg = (res.data && res.data.detail) ? res.data.detail : '提交失败，请重试'
          wx.showToast({ title: msg, icon: 'none' })
        }
      },
      fail: function () {
        self.setData({ submitting: false })
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      }
    })
  }
})
