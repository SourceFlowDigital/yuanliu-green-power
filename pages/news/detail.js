var measureHeader = require('../../utils/headerLayout.js').measureHeader
var request = require('../../utils/request.js')

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    article: null,
    keywordList: [],
    loading: true,
    errorText: ''
  },

  onLoad: function (options) {
    this.setData(measureHeader())
    var id = options && options.id
    if (!id) {
      this.setData({ loading: false, errorText: '资讯不存在' })
      return
    }
    this.loadDetail(id)
  },

  loadDetail: function (id) {
    var self = this
    wx.showLoading({ title: '加载中' })
    request.get('/news/' + encodeURIComponent(String(id))).then(function (body) {
      var article = body || null
      var keywordList = article && article.keywords
        ? article.keywords.split(',').map(function (item) { return item.trim() }).filter(function (item) { return item })
        : []
      self.setData({
        article: article,
        keywordList: keywordList,
        errorText: article ? '' : '资讯不存在'
      })
    }).catch(function () {
      self.setData({ errorText: '资讯加载失败，请稍后再试' })
    }).then(function () {
      self.setData({ loading: false })
      wx.hideLoading()
    })
  },

  onBack: function () {
    var pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 })
    } else {
      wx.switchTab({ url: '/pages/news/index' })
    }
  },

  onOpenOriginal: function () {
    var url = this.data.article && this.data.article.url
    if (!url || typeof url !== 'string') {
      wx.showToast({ title: '暂无原文链接', icon: 'none' })
      return
    }
    wx.setClipboardData({
      data: url,
      success: function () {
        wx.showModal({
          title: '链接已复制',
          content: '请打开手机浏览器，粘贴链接查看原文。',
          showCancel: false,
          confirmText: '知道了'
        })
      },
      fail: function () {
        wx.showModal({
          title: '原文链接',
          content: url,
          showCancel: false,
          confirmText: '知道了',
          success: function () {}
        })
      }
    })
  }
})
