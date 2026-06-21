Page({
  data: {
    url: ''
  },

  onLoad: function (options) {
    var url = options && options.url ? decodeURIComponent(options.url) : ''
    if (!url) {
      wx.showToast({ title: '原文链接无效', icon: 'none' })
      return
    }
    this.setData({ url: url })
  }
})
