Component({
  data: {
    selected: 0,
    color: '#6B7280',
    selectedColor: '#D6A84F',
    list: [
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
        pagePath: '/pages/service/index',
        name: '服务',
        iconName: 'dingyue',
        unicode: ''
      },
      {
        pagePath: '/pages/about/index',
        name: '关于',
        iconName: 'guanyu',
        unicode: ''
      }
    ]
  },
  methods: {
    switchTab: function (e) {
      var data = e.currentTarget.dataset
      var url = data.path
      wx.switchTab({ url: url })
      this.setData({ selected: data.index })
    }
  }
})
