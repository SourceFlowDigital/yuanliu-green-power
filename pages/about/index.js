const { measureHeader } = require('../../utils/headerLayout.js')

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    headerSub: '项目数据测算与风险分析工具',
  },

  onLoad() {
    this.setData(measureHeader())
  },

  onShow() {
    const t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ currentPath: '/' + this.route, selected: 3 })
  },

  toTerms() {
    wx.navigateTo({ url: '/pages/legal/terms/terms' })
  },

  toPrivacyDoc() {
    wx.navigateTo({ url: '/pages/legal/privacy/privacy' })
  },

  toThirdParty() {
    wx.navigateTo({ url: '/pages/legal/third-party/third-party' })
  },

  openWxPrivacyGuide() {
    if (typeof wx.openPrivacyContract === 'function') {
      wx.openPrivacyContract({})
    } else {
      wx.showToast({ title: '请更新微信基础库后重试', icon: 'none' })
    }
  },
})
