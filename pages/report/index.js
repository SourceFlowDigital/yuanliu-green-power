var measureHeader = require('../../utils/headerLayout.js').measureHeader

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0
  },

  onLoad: function () {
    this.setData(measureHeader())
  },

  onShow: function () {
    var t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ selected: 1 })
  }
})
