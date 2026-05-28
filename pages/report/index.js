var measureHeader = require('../../utils/headerLayout.js').measureHeader

var INDUSTRY_LABELS = {
  computing: '⭐ 算力设施',
  hydrogen: '⭐ 绿色氢氨醇',
  manufacturing: '工业制造',
  export: '出口外向型企业',
  keyEnergy: '重点用能单位',
  carbon: '碳排放重点企业',
  other: '其他'
}

var USER_INDUSTRY_LABELS = {
  computing: '⭐ 算力设施',
  hydrogen: '⭐ 绿色氢氨醇',
  manufacturing: '工业制造',
  export: '出口外贸',
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

var PROJECT_STATUS_LABELS = {
  new: '新建',
  existingUngrid: '存量未并网',
  existingLimited: '存量消纳受限'
}

function gapTypeLabel(t) {
  if (t === 'surplus') return '盈余'
  if (t === 'deficit' || t === 'short') return '缺口'
  if (t === 'balanced' || t === 'match') return '平衡'
  return t || '—'
}

function enrichUser(u, idx) {
  var industryText = USER_INDUSTRY_LABELS[u.industry] || u.industry || '—'
  if (u.industry === 'other' && u.otherIndustry) {
    industryText = u.otherIndustry
  }
  return Object.assign({}, u, {
    displayName: u.name ? String(u.name).trim() : ('用户' + (idx + 1)),
    industryText: industryText
  })
}

function enrichEnergySource(s) {
  return Object.assign({}, s, {
    typeLabel: ENERGY_TYPE_LABELS[s.type] || s.type || '—',
    projectStatusLabel: PROJECT_STATUS_LABELS[s.projectStatus] || s.projectStatus || '—'
  })
}

function pad2(n) {
  return n < 10 ? '0' + n : '' + n
}

function formatReportTime(ts) {
  if (!ts) return ''
  var d = new Date(ts)
  if (isNaN(d.getTime())) return ''
  return d.getFullYear() + '年' + pad2(d.getMonth() + 1) + '月' + pad2(d.getDate()) + '日 ' +
    pad2(d.getHours()) + ':' + pad2(d.getMinutes())
}

function formatCopyTime(ts) {
  if (!ts) return '—'
  var d = new Date(ts)
  if (isNaN(d.getTime())) return '—'
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
    pad2(d.getHours()) + ':' + pad2(d.getMinutes())
}

function enrichReport(raw) {
  if (!raw) return null
  var r = Object.assign({}, raw)
  r.projectTypeLabel = r.projectType === 'offgrid' ? '离网型' : (r.projectType === 'grid' ? '并网型' : '—')
  r.targetYearLabel = r.targetYear === 'post2030' ? '2030年后' : (r.targetYear === 'pre2030' ? '2030年前（含2030年）' : '—')
  var tags = r.industryTags || []
  var labels = []
  for (var i = 0; i < tags.length; i++) {
    labels.push(INDUSTRY_LABELS[tags[i]] || tags[i])
  }
  r.industryTagLabels = labels
  r.gapTypeLabel = gapTypeLabel(r.gapType)
  return r
}

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    report: null,
    hasReport: false,
    generateTimeStr: '',
    users: [],
    energySources: [],
    hasStorage: false,
    storagePower: 0,
    storageCapacity: 0,
    storageCycles: 0,
    storagedays: 0,
    annualStorageEnergy: 0,
    gap: 0,
    gapType: ''
  },

  _loadReport: function () {
    var raw = null
    try {
      raw = wx.getStorageSync('yuanliu_report_latest')
    } catch (e) {
      raw = null
    }
    if (!raw || typeof raw !== 'object') {
      this.setData({
        report: null,
        hasReport: false,
        generateTimeStr: '',
        users: [],
        energySources: [],
        hasStorage: false,
        storagePower: 0,
        storageCapacity: 0,
        storageCycles: 0,
        storagedays: 0,
        annualStorageEnergy: 0,
        gap: 0,
        gapType: ''
      })
      return
    }
    var report = enrichReport(raw)
    var usersRaw = report.users || []
    var users = []
    for (var i = 0; i < usersRaw.length; i++) {
      users.push(enrichUser(usersRaw[i], i))
    }
    var sourcesRaw = report.energySources || []
    var energySources = []
    for (var j = 0; j < sourcesRaw.length; j++) {
      energySources.push(enrichEnergySource(sourcesRaw[j]))
    }
    this.setData({
      report: report,
      hasReport: true,
      generateTimeStr: formatReportTime(report.generateTime),
      users: users,
      energySources: energySources,
      hasStorage: report.hasStorage || false,
      storagePower: report.storagePower || 0,
      storageCapacity: report.storageCapacity || 0,
      storageCycles: report.storageCycles || 0,
      storagedays: report.storagedays || 0,
      annualStorageEnergy: report.annualStorageEnergy || 0,
      gap: report.gap || 0,
      gapType: report.gapType || ''
    })
  },

  onLoad: function () {
    this.setData(measureHeader())
    this._loadReport()
  },

  onShow: function () {
    var t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ selected: 1 })
    this._loadReport()
  },

  onCopyReport: function () {
    var report = this.data.report
    if (!report) {
      wx.showToast({ title: '暂无报告', icon: 'none' })
      return
    }
    var projectTypeLabel = report.projectType === 'grid' ? '并网型' : '离网型'
    var targetYearLabel = report.targetYear === 'pre2030' ? '2030年前' : '2030年后'
    var ratio1Icon = report.ratio1Pass ? '✅' : '❌'
    var ratio2Icon = report.ratio2Pass ? '✅' : '❌'
    var ratio3Icon = report.ratio3Pass ? '✅' : '❌'
    var overallText = report.overallPass ? '✅ 符合合规要求' : '❌ 存在不达标项'
    var suggestions = report.suggestions || []
    var sugLines = []
    var i
    for (i = 0; i < suggestions.length; i++) {
      var s = suggestions[i]
      var num = s.index != null ? s.index : (i + 1)
      sugLines.push(num + '. ' + (s.text || ''))
    }
    var sugText = sugLines.length ? sugLines.join('\n') : '无'
    var lines = [
      '源流绿电直连 · 合规自测报告',
      '生成时间：' + formatCopyTime(report.generateTime),
      '项目名称：' + (report.projectName || '—'),
      '项目类型：' + projectTypeLabel,
      '省份：' + (report.province || '—'),
      '目标年份：' + targetYearLabel,
      '',
      '【源荷平衡】',
      '总发电量：' + (report.totalGeneration != null ? report.totalGeneration : '—') + ' 万kWh',
      '总用电量：' + (report.totalConsumption != null ? report.totalConsumption : '—') + ' 万kWh',
      '自发自用：' + (report.selfUse != null ? report.selfUse : '—') + ' 万kWh',
      '',
      '【三项指标】',
      '指标一（自发自用/总发电量）：' + (report.ratio1 != null ? report.ratio1 : '—') + '% ' + ratio1Icon + ' 门槛≥60%',
      '指标二（自发自用/总用电量）：' + (report.ratio2 != null ? report.ratio2 : '—') + '% ' + ratio2Icon + ' 门槛≥' + (report.ratio2Threshold != null ? report.ratio2Threshold : '—') + '%',
      '指标三（上网电量/总发电量）：' + (report.ratio3 != null ? report.ratio3 : '—') + '% ' + ratio3Icon + ' 门槛≤20%',
      '',
      '【综合结论】',
      overallText,
      '',
      '【整改建议】',
      sugText,
      '',
      '---源流 · 基于发改能源〔2026〕688号---'
    ]
    var text = lines.join('\n')
    wx.setClipboardData({
      data: text,
      success: function () {
        wx.showToast({ title: '已复制', icon: 'success', duration: 1500 })
      }
    })
  },

  onContactAI: function () {
    wx.showModal({
      title: 'AI深度分析报告',
      content: '请联系顾问获取AI深度报告服务',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#D6A84F'
    })
  }
})
