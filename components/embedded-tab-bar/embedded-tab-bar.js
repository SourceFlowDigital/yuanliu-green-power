const { cloneTabListForData } = require('../../utils/tabBarModel.js')

Component({
  properties: {
    /** 当前页非 Tab 根页时用于高亮所属 Tab（0 政策 1 资讯 2 关注 3 关于） */
    activeFallback: {
      type: Number,
      value: -1,
    },
  },

  data: {
    selected: 0,
    color: '#6B7280',
    selectedColor: '#D6A84F',
    list: [],
  },

  lifetimes: {
    attached() {
      this.setData({ list: cloneTabListForData() })
      this.updateSelected()
    },
  },

  pageLifetimes: {
    show() {
      this.setData({ list: cloneTabListForData() })
      this.updateSelected()
    },
  },

  methods: {
    updateSelected() {
      const pages = getCurrentPages()
      if (!pages.length) return
      const route = pages[pages.length - 1].route
      const list = this.data.list
      if (!list || !list.length) return
      let idx = list.findIndex(function (item) {
        return item.url === '/' + route
      })
      if (idx < 0) {
        const fb = Number(this.properties.activeFallback)
        if (fb >= 0 && fb < list.length) idx = fb
      }
      if (idx >= 0) this.setData({ selected: idx })
    },

    switchTab(e) {
      const i = Number(e.currentTarget.dataset.index)
      const item = this.data.list[i]
      if (!item) return
      this.setData({ selected: i })
      wx.switchTab({ url: item.url })
    },
  },
})
