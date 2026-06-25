App({
  globalData: {
    apiBase: '',
    apiOrigin: '',
    userConsent: false
  },

  onLaunch() {
    // 隐私授权检查（微信基础库要求）
    wx.getPrivacySetting({
      success: function(res) {
        if (res.needAuthorization) {
          wx.requirePrivacyAuthorize({
            success: function() {
              // 用户同意隐私授权，继续正常流程
            },
            fail: function() {
              // 用户拒绝，给出提示
              wx.showToast({
                title: '需要同意隐私政策才能继续使用',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })

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
