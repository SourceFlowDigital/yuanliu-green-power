var measureHeader = require('../../utils/headerLayout.js').measureHeader

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    blocks: [
      {
        title: '平台简介',
        lines: [
          '源流绿电直连，基于发改能源〔2026〕688号，面向新能源开发商、EPC单位、工业园区能源管理人员提供政策合规自测服务。'
        ]
      },
      {
        title: '主体信息',
        lines: [
          '技术支持：源流数字',
          '联系邮箱：sourceflowdigital@163.com'
        ]
      },
      {
        title: '免责声明',
        lines: [
          '本工具测算结果仅供参考，不构成投资或法律建议。'
        ]
      }
    ]
  },

  onLoad: function () {
    this.setData(measureHeader())
  },

  onShow: function () {
    var t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ selected: 3 })
  }
})
