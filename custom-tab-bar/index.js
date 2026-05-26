Component({
  data: {
    selected: 0,
    color: '#6B7280',
    selectedColor: '#003060',
    list: [
      {
        url: '/pages/green-direct/index',
        text: '自测',
        unicode: ''
      }
    ]
  },
  methods: {
    switchTab(e) {
      const i = Number(e.currentTarget.dataset.index)
      const item = this.data.list[i]
      if (!item) return
      this.setData({ selected: i })
      wx.switchTab({ url: item.url })
    }
  }
})
