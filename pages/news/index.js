var measureHeader = require('../../utils/headerLayout.js').measureHeader
var request = require('../../utils/request.js')

var CATEGORY_TABS = [
  { label: '全部', value: '' },
  { label: '政策', value: '政策' },
  { label: '新闻', value: '新闻' }
]

function truncate(text, maxLen) {
  var value = text ? String(text) : ''
  return value.length > maxLen ? value.slice(0, maxLen) + '...' : value
}

function normalizeItem(item) {
  return {
    id: item.id,
    title: item.title || '',
    source: item.source || '资讯',
    pub_date: item.pub_date || '',
    summary: truncate(item.summary || '', 100),
    category: item.category || '新闻'
  }
}

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    tabs: CATEGORY_TABS,
    activeCategory: '',
    list: [],
    page: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    refreshing: false,
    finished: false,
    errorText: '',
    userConsent: true
  },

  onLoad: function () {
    this.setData(measureHeader())
    this.loadNews(true)
  },

  onShow: function () {
    var app = getApp()
    if (!app.hasConsent()) {
      this.setData({ userConsent: false })
    } else {
      this.setData({ userConsent: true })
    }

    var tab = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tab && typeof tab.updateSelected === 'function') tab.updateSelected()
  },

  onAgreeConsent: function () {
    var app = getApp()
    app.grantConsent()
    this.setData({ userConsent: true })
  },

  onDenyConsent: function () {
    wx.showModal({
      title: '需要您的同意',
      content: '您需要同意服务协议才能使用本工具。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  onTabTap: function (e) {
    var value = e.currentTarget.dataset.value || ''
    if (value === this.data.activeCategory) return
    this.setData({
      activeCategory: value,
      list: [],
      page: 1,
      total: 0,
      finished: false,
      errorText: ''
    })
    this.loadNews(true)
  },

  loadNews: function (reset) {
    if (this.data.loading) return
    var page = reset ? 1 : this.data.page
    var self = this
    this.setData({ loading: true, errorText: '' })
    wx.showLoading({ title: '加载中' })
    request.get('/news', {
      category: this.data.activeCategory || undefined,
      page: page,
      page_size: this.data.pageSize
    }).then(function (body) {
      var items = body && Array.isArray(body.items) ? body.items.map(normalizeItem) : []
      var merged = reset ? items : self.data.list.concat(items)
      var total = body && typeof body.total === 'number' ? body.total : merged.length
      self.setData({
        list: merged,
        total: total,
        page: page + 1,
        finished: merged.length >= total || items.length < self.data.pageSize
      })
    }).catch(function () {
      self.setData({
        errorText: '资讯加载失败，请稍后再试',
        finished: true
      })
    }).then(function () {
      self.setData({ loading: false, refreshing: false })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  onPullDownRefresh: function () {
    this.setData({ refreshing: true, page: 1, finished: false })
    this.loadNews(true)
  },

  onReachBottom: function () {
    if (this.data.finished || this.data.loading) return
    this.loadNews(false)
  },

  onCardTap: function (e) {
    var id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: '/pages/news/detail?id=' + encodeURIComponent(String(id)) })
  }
})
