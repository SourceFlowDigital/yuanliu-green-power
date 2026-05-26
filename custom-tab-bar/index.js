Component({
  data: {
    selected: 0,
    color: '#6B7280',
    selectedColor: '#D6A84F',
    list: [
      {
        pagePath: '/pages/green-direct/index',
        name: '自测',
        unicode: '\ue612'
      },
      {
        pagePath: '/pages/report/index',
        name: '报告',
        unicode: '\ue679'
      },
      {
        pagePath: '/pages/service/index',
        name: '服务',
        unicode: '\ue607'
      },
      {
        pagePath: '/pages/about/index',
        name: '关于',
        unicode: '\ue611'
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
