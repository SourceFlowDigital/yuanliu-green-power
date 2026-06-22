Component({
  data: {
    selected: 0,
    currentPath: '/pages/news/index',
    color: '#6B7280',
    selectedColor: '#D6A84F',
    list: [
      {
        pagePath: '/pages/news/index',
        name: '资讯',
        iconPath: '/assets/tab/news.png',
        selectedIconPath: '/assets/tab/news-active.png'
      },
      {
        pagePath: '/pages/green-direct/index',
        name: '自测',
        iconName: 'liebiao',
        unicode: ''
      },
      {
        pagePath: '/pages/report/index',
        name: '报告',
        iconName: 'icnews',
        unicode: ''
      },
      {
        pagePath: '/pages/about/index',
        name: '关于',
        iconName: 'guanyu',
        unicode: ''
      }
    ]
  },
  pageLifetimes: {
    show: function () {
      this.updateSelected()
    }
  },
  methods: {
    updateSelected: function () {
      var pages = getCurrentPages()
      var current = pages && pages.length ? '/' + pages[pages.length - 1].route : this.data.currentPath
      var selected = 0
      for (var i = 0; i < this.data.list.length; i++) {
        if (this.data.list[i].pagePath === current) {
          selected = i
          break
        }
      }
      this.setData({ currentPath: current, selected: selected })
    },
    switchTab: function (e) {
      var data = e.currentTarget.dataset
      var url = data.path
      wx.switchTab({ url: url })
      this.setData({ selected: data.index })
    }
  }
})
