Component({
  data: {
    selected: 0,
    color: '#6B7280',
    selectedColor: '#D6A84F',
    list: [
      {
        pagePath: '/pages/green-direct/index',
        text: '自测',
        iconName: 'liebiao',
        unicode: ''
      },
      {
        pagePath: '/pages/about/index',
        text: '关于',
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
