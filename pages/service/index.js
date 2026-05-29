var measureHeader = require('../../utils/headerLayout.js').measureHeader
var request = require('../../utils/request.js')

var INDUSTRY_LABELS = {
  computing: '⭐ 算力设施',
  hydrogen: '⭐ 绿色氢氨醇',
  manufacturing: '工业制造',
  export: '出口外向型企业',
  keyEnergy: '重点用能单位',
  carbon: '碳排放重点企业',
  other: '其他'
}

var ENERGY_TYPE_LABELS = {
  wind: '风电',
  solar: '地面光伏',
  rooftop: '屋顶分布式光伏',
  biomass: '生物质',
  other: '其他'
}

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    reportText: '',
    reportExpanded: false,
    aiLoading: false,
    aiContent: '',
    aiError: ''
  },

  _loadReportText: function () {
    var text = ''
    try {
      text = wx.getStorageSync('yuanliu_report_text') || ''
    } catch (e) {
      text = ''
    }
    if (typeof text !== 'string') {
      text = ''
    }
    this.setData({ reportText: text })
  },

  _buildAnalyzePayload: function (raw) {
    var types = []
    var typeMap = {}
    var sources = raw.energySources || []
    var i
    for (i = 0; i < sources.length; i++) {
      var label = ENERGY_TYPE_LABELS[sources[i].type] || sources[i].type
      if (label && !typeMap[label]) {
        typeMap[label] = true
        types.push(label)
      }
    }
    var tags = raw.industryTags || []
    var tagLabels = []
    for (i = 0; i < tags.length; i++) {
      tagLabels.push(INDUSTRY_LABELS[tags[i]] || tags[i])
    }
    var userType = tagLabels.length ? tagLabels.join('、') : ((raw.userCount || 0) + '个用电用户')
    var totalGen = raw.totalGeneration || 0
    var selfUse = raw.selfUse || 0
    var gridFeedIn = Math.max(0, Math.round((totalGen - selfUse) * 10) / 10)

    return {
      report: {
        step1: {
          projectName: raw.projectName || '',
          projectType: raw.projectType || '',
          energyType: types.length ? types.join('、') : '未填写',
          userType: userType,
          targetYear: raw.targetYear || ''
        },
        step3: {
          totalGeneration: totalGen,
          selfUseAmount: selfUse,
          totalConsumption: raw.totalConsumption || 0,
          gridFeedIn: gridFeedIn
        },
        step4: {
          ratio1: raw.ratio1 != null ? raw.ratio1 : 0,
          ratio1Pass: !!raw.ratio1Pass,
          ratio2: raw.ratio2 != null ? raw.ratio2 : 0,
          ratio2Pass: !!raw.ratio2Pass,
          ratio2Threshold: raw.ratio2Threshold != null ? raw.ratio2Threshold : 35,
          ratio3: raw.ratio3 != null ? raw.ratio3 : 0,
          ratio3Pass: !!raw.ratio3Pass,
          overallPass: !!raw.overallPass
        },
        step5: {
          carbonReduction: raw.carbonReduction || 0,
          greenCertAmount: raw.greenCertAmount || 0
        }
      }
    }
  },

  onLoad: function () {
    this.setData(measureHeader())
    this._loadReportText()
  },

  onShow: function () {
    var t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ selected: 2 })
    this._loadReportText()
  },

  onToggleReport: function () {
    this.setData({ reportExpanded: !this.data.reportExpanded })
  },

  onStartAiAnalysis: function () {
    if (!this.data.reportText) {
      return
    }
    var raw = null
    try {
      raw = wx.getStorageSync('yuanliu_report_latest')
    } catch (e) {
      raw = null
    }
    if (!raw || typeof raw !== 'object' || !raw.generateTime) {
      wx.showToast({ title: '暂无报告数据', icon: 'none' })
      return
    }
    var self = this
    var payload = this._buildAnalyzePayload(raw)
    this.setData({ aiLoading: true, aiError: '', aiContent: '' })
    request.postAnalyze(payload).then(function (res) {
      self.setData({
        aiContent: res.content || '',
        aiLoading: false,
        aiError: ''
      })
    }).catch(function () {
      self.setData({
        aiLoading: false,
        aiError: '分析失败，请重试'
      })
    })
  }
})
