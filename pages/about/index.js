const { measureHeader } = require('../../utils/headerLayout.js')

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    headerSub: '政策合规自测工具',
    blocks: [
      {
        title: '平台简介',
        lines: [
          '源流绿电直连，基于发改能源〔2026〕688号，面向新能源开发商、EPC单位、工业园区能源管理人员提供政策合规自测服务。',
        ],
      },
      {
        title: '主体信息',
        lines: [
          '技术支持：源流数字',
          '联系邮箱：sourceflowdigital@163.com',
          '使用本小程序即表示您已阅读并理解页面展示的相关信息与提示。如有合作或纠错需求，可通过下方渠道联系。',
        ],
      },
      {
        title: '技术亮点',
        lines: [
          '· Python 全栈爬虫，54个数据源，覆盖30省市',
          '· FastAPI + MySQL + Nginx 后端服务',
          '· DeepSeek AI 政策结构化解读',
          '· 微信小程序前端独立开发',
          '· 12层智能过滤引擎，噪声率 <3%',
          '· 每日自动抓取，实时推送',
        ],
      },
      {
        title: '技术咨询服务',
        lines: [
          '宁夏、甘肃地区新能源风、光、储项目开发咨询服务',
          '政府申请文件、建议书、可行性研究报告（前期阶段）编制',
          '新能源项目经济技术测评',
          '新能源关联类小程序制作',
          '其他新能源相关服务，请联系本栏目作者',
        ],
      },
      {
        title: '联系作者',
        lines: ['邮箱：sourceflowdigital@163.com', '电话：+86 184-6511-4111（微信同号）'],
      },
      {
        title: '数据与外链',
        lines: [
          '政策条目由合作接口或整理数据提供；「查看原文」外链由各发布机构域名承载，请以浏览器或原文页面所示为准。',
          'AI 解读类文字为算法辅助摘要，不构成法律意见或行政许可依据。',
        ],
      },
    ],
  },
  onLoad() {
    this.setData(measureHeader())
  },
  onShow() {
    const t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ selected: 3 })
  },
  toTerms() {
    wx.showToast({ title: '敬请期待', icon: 'none' })
  },
  toPrivacyDoc() {
    wx.showToast({ title: '敬请期待', icon: 'none' })
  },
  openWxPrivacyGuide() {
    if (typeof wx.openPrivacyContract === 'function') {
      wx.openPrivacyContract({})
    } else {
      wx.showToast({ title: '请更新微信基础库后重试', icon: 'none' })
    }
  },
})
