App({
  globalData: {
    apiBase: '',
    apiOrigin: '',
    userConsent: false
  },

  onLaunch() {
    // 检查用户是否已同意隐私协议
    try {
      var consent = wx.getStorageSync('userConsent')
      this.globalData.userConsent = consent === true
    } catch (e) {
      this.globalData.userConsent = false
    }
  },

  // 用户同意协议后调用
  grantConsent: function () {
    this.globalData.userConsent = true
    try {
      wx.setStorageSync('userConsent', true)
    } catch (e) { }
  },

  // 用户拒绝协议后调用
  denyConsent: function () {
    this.globalData.userConsent = false
    try {
      wx.setStorageSync('userConsent', false)
    } catch (e) { }
  },

  // 判断是否已授权
  hasConsent: function () {
    return this.globalData.userConsent === true
  }
})
