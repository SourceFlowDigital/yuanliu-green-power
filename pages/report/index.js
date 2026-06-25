var config = require('../../utils/config.js')
var measureHeader = require('../../utils/headerLayout.js').measureHeader
var payment = require('../../utils/payment.js')

var INDUSTRY_LABELS = {  computing: '⭐ 算力设施',
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

var SAMPLE_REPORT_IMAGES = [
  'https://green.sourceflower.com/static/sample/sample_p1.jpg',
  'https://green.sourceflower.com/static/sample/sample_p2.jpg',
  'https://green.sourceflower.com/static/sample/sample_p3.jpg',
  'https://green.sourceflower.com/static/sample/sample_p4.jpg',
  'https://green.sourceflower.com/static/sample/sample_p5.jpg',
  'https://green.sourceflower.com/static/sample/sample_p6.jpg',
  'https://green.sourceflower.com/static/sample/sample_p7.jpg'
]

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

function markdownToHtml(md) {
  if (!md) return ''
  var html = md
  html = html.replace(/&/g, '&amp;')
  html = html.replace(/</g, '&lt;')
  html = html.replace(/>/g, '&gt;')

  var lines = html.split('\n')
  var result = []
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim()

    if (!line) {
      result.push('<view style="height:8px"></view>')
      continue
    }

    if (line === '---' || line === '***') {
      result.push('<view style="border-top:1px solid #e0e0e0;margin:8px 0"></view>')
      continue
    }

    if (line === '===') {
      result.push('<view style="border-top:2px solid #003060;margin:12px 0"></view>')
      continue
    }

    if (line.startsWith('### ')) {
      var text = line.substring(4)
      text = inlineFormat(text)
      result.push('<view style="font-size:15px;font-weight:bold;color:#003060;margin:12px 0 6px 0">' + text + '</view>')
      continue
    }

    if (line.startsWith('## ')) {
      var text = line.substring(3)
      text = inlineFormat(text)
      result.push('<view style="font-size:16px;font-weight:bold;color:#003060;margin:14px 0 6px 0">' + text + '</view>')
      continue
    }

    if (line.startsWith('# ')) {
      var text = line.substring(2)
      text = inlineFormat(text)
      result.push('<view style="font-size:17px;font-weight:bold;color:#003060;margin:16px 0 8px 0">' + text + '</view>')
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      var text = line.substring(2)
      text = inlineFormat(text)
      result.push('<view style="display:flex;flex-direction:row;margin:3px 0"><text style="color:#D6A84F;margin-right:6px">•</text><text style="flex:1;color:#333;font-size:14px;line-height:1.6">' + text + '</text></view>')
      continue
    }

    var numMatch = line.match(/^(\d+)\.\s+(.+)/)
    if (numMatch) {
      var num = numMatch[1]
      var text = inlineFormat(numMatch[2])
      result.push('<view style="display:flex;flex-direction:row;margin:3px 0"><text style="color:#D6A84F;margin-right:6px;min-width:16px">' + num + '.</text><text style="flex:1;color:#333;font-size:14px;line-height:1.6">' + text + '</text></view>')
      continue
    }

    var text = inlineFormat(line)
    result.push('<view style="color:#333;font-size:14px;line-height:1.6;margin:3px 0">' + text + '</view>')
  }
  return result.join('')
}

function inlineFormat(text) {
  if (!text) return ''
  text = text.replace(/\*\*(.+?)\*\*/g, '<text style="font-weight:bold;color:#003060">$1</text>')
  text = text.replace(/✅\s*/g, '<text style="color:#1a7c6e;font-weight:bold">[达标] </text>')
  text = text.replace(/❌\s*/g, '<text style="color:#CC0000;font-weight:bold">[不达标] </text>')
  text = text.replace(/⚠️\s*/g, '<text style="color:#E67E00;font-weight:bold">[注意] </text>')
  return text
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
    gapType: '',
    preCheck: {},
    suspectCheck: {},
    aiPaid: false,
    aiResult: null,
    aiResultHtml: '',
    aiLoading: false,
    sampleReportImages: SAMPLE_REPORT_IMAGES,
    showSampleReport: false,
    sampleReportIndex: 0,
    retryFailCount: 0,
    showRefundModal: false,
    showSwitchingModal: false,
    pendingTradeNo: '',
    recoveringPayment: false
  },

  _loadReport: function () {
    var raw = null
    try {
      raw = wx.getStorageSync('yuanliu_report_latest')
    } catch (e) {
      raw = null
    }
    if (!raw || typeof raw !== 'object' || !raw.generateTime) {
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
        gapType: '',
        preCheck: {},
        suspectCheck: {}
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
    var currentReport = this.data.report || {}
    var isNewReport = currentReport.generateTime !== report.generateTime
    var nextState = {
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
      gapType: report.gapType || '',
      preCheck: report.preCheck || {},
      suspectCheck: report.suspectCheck || {}
    }
    if (isNewReport) {
      nextState.aiResult = null
      nextState.aiResultHtml = ''
      nextState.aiLoading = false
    }
    this.setData(nextState)
    var paidKey = 'yuanliu_ai_paid_' + (report.generateTime || '')
    var autoKey = 'yuanliu_ai_auto_analyze_' + (report.generateTime || '')
    var alreadyPaid = false
    var autoAnalyze = false
    try {
      alreadyPaid = wx.getStorageSync(paidKey) === true
      autoAnalyze = wx.getStorageSync(autoKey) === true
    } catch (e) {}
    var self = this
    this.setData({ aiPaid: alreadyPaid }, function () {
      if (alreadyPaid && autoAnalyze && !self.data.aiLoading) {
        try {
          wx.removeStorageSync(autoKey)
        } catch (e) {}
        self.onDoAIAnalyze()
      }
    })
  },

  onLoad: function () {
    this.setData(measureHeader())
    this._loadReport()
  },

  onShow: function () {
    var t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ currentPath: '/' + this.route, selected: 2 })

    // 查单恢复：检测是否有未完成的支付订单
    var self = this
    try {
      var pendingTradeNo = wx.getStorageSync('yuanliu_pending_order')
    } catch (e) {
      var pendingTradeNo = null
    }
    this.setData({ pendingTradeNo: pendingTradeNo || '' })
    if (pendingTradeNo && !this.data.aiPaid && !this.data.aiResult) {
      payment.confirmOrder(pendingTradeNo, {
        onSuccess: function (result) {
          try { wx.removeStorageSync('yuanliu_pending_order') } catch (e) {}
          var report = self.data.report || {}
          var paidKey = 'yuanliu_ai_paid_' + (report.generateTime || '')
          try { wx.setStorageSync(paidKey, true) } catch (e) {}
          self.setData({ aiPaid: true }, function () {
            self.onDoAIAnalyze()
          })
        },
        onFail: function (err) {
          // 查单失败不阻塞，正常加载已保存的报告
          console.log('[查单恢复] 确认失败', err && err.message || '');
          wx.showToast({ title: '支付确认失败，请稍后重试', icon: 'none', duration: 2000 });
        }
      })
    }

    this._loadReport()
  },

  _buildReportText: function () {
    var report = this.data.report
    if (!report) return ''
    var projectTypeLabel = report.projectType === 'grid' ? '并网型' : '离网型'
    var targetYearLabel = report.targetYear === 'pre2030' ? '2030年前' : '2030年后'
    var ratio1Icon = report.ratio1Pass ? '✅' : '❌'
    var ratio2Icon = report.ratio2Pass ? '✅' : '❌'
    var ratio3Icon = report.ratio3Pass ? '✅' : '❌'
    var overallText = report.overallPass ? '✅ 三项指标满足门槛要求' : '⚠️ 存在未满足门槛的指标'
    var suggestions = report.suggestions || []
    var sugLines = []
    var i
    var u
    var es
    var userLines = []
    var energyLines = []
    var storageLines = []
    var users = this.data.users || []
    var energySources = this.data.energySources || []
    var gapVal = this.data.gap != null ? this.data.gap : report.gap
    var gapTypeVal = this.data.gapType || report.gapType || ''

    for (i = 0; i < suggestions.length; i++) {
      var s = suggestions[i]
      var num = s.index != null ? s.index : (i + 1)
      sugLines.push(num + '. ' + (s.text || ''))
    }
    var sugText = sugLines.length ? sugLines.join('\n') : '无'

    userLines.push('【用电端详情】')
    if (users.length === 0) {
      userLines.push('（暂无用电用户数据）')
    } else {
      for (i = 0; i < users.length; i++) {
        u = users[i]
        var industryLine = u.industry === 'other'
          ? (u.otherIndustry || u.industryText || '其他')
          : (u.industryText || USER_INDUSTRY_LABELS[u.industry] || u.industry || '—')
        if (i > 0) userLines.push('')
        userLines.push('用户' + (i + 1) + '：' + (u.displayName || u.name || '未命名'))
        userLines.push('  行业：' + industryLine)
        userLines.push('  年用电量：' + (u.annualConsumption != null ? u.annualConsumption : '—') + ' 万kWh')
        if (u.consumption2030 > 0) {
          userLines.push('  2030年预测：' + u.consumption2030 + ' 万kWh')
        }
        userLines.push('  屋顶光伏：' + (u.hasRooftop ? '有意向' : '暂无'))
        if (u.hasRooftop) {
          userLines.push('  可安装容量：' + (u.rooftopCapacity != null ? u.rooftopCapacity : '—') + ' MW / 年发电量：' +
            (u.rooftopGeneration != null ? u.rooftopGeneration : '—') + ' 万kWh')
        }
      }
    }

    energyLines.push('【发电端详情】')
    if (energySources.length === 0) {
      energyLines.push('（暂无电源数据）')
    } else {
      for (i = 0; i < energySources.length; i++) {
        es = energySources[i]
        var ps = es.projectStatus
        var statusText = ps === 'new' ? '新建' : (ps === 'existingUngrid' ? '存量未并网' :
          (ps === 'existingLimited' ? '存量消纳受限' : (es.projectStatusLabel || ps || '—')))
        if (i > 0) energyLines.push('')
        energyLines.push('电源' + (i + 1) + '：' + (es.typeLabel || ENERGY_TYPE_LABELS[es.type] || es.type || '—'))
        energyLines.push('  装机容量：' + (es.capacity != null ? es.capacity : '—') + ' MW')
        energyLines.push('  年有效小时：' + (es.annualHours != null ? es.annualHours : '—') + ' h')
        energyLines.push('  年发电量：' + (es.annualGeneration != null ? es.annualGeneration : '—') + ' 万kWh')
        energyLines.push('  项目状态：' + statusText)
      }
    }

    storageLines.push('【储能配置】')
    if (!this.data.hasStorage) {
      storageLines.push('本项目未配置储能')
    } else {
      storageLines.push('  储能功率：' + (this.data.storagePower != null ? this.data.storagePower : '—') + ' MW')
      storageLines.push('  储能容量：' + (this.data.storageCapacity != null ? this.data.storageCapacity : '—') + ' MWh')
      storageLines.push('  日充放次数：' + (this.data.storageCycles != null ? this.data.storageCycles : '—') + ' 次/天')
      storageLines.push('  年运行天数：' + (this.data.storagedays != null ? this.data.storagedays : '—') + ' 天')
      storageLines.push('  年储能增量：' + (this.data.annualStorageEnergy != null ? this.data.annualStorageEnergy : '—') + ' 万kWh')
    }

    var lines = [
      '源流绿电直连 · 项目测算报告',
      '生成时间：' + formatCopyTime(report.generateTime),
      '项目名称：' + (report.projectName || '—'),
      '项目类型：' + projectTypeLabel,
      '省份：' + (report.province || '—'),
      '目标年份：' + targetYearLabel,
      ''
    ]
    lines = lines.concat(userLines)
    lines.push('')
    lines = lines.concat(energyLines)
    lines.push('')
    lines = lines.concat(storageLines)
    lines.push('')
    lines = lines.concat([
      '【源荷平衡】',
      '总发电量：' + (report.totalGeneration != null ? report.totalGeneration : '—') + ' 万kWh',
      '总用电量：' + (report.totalConsumption != null ? report.totalConsumption : '—') + ' 万kWh',
      '自发自用：' + (report.selfUse != null ? report.selfUse : '—') + ' 万kWh',
      '缺口/盈余：' + (gapVal != null ? gapVal : '—') + ' 万kWh（' + gapTypeLabel(gapTypeVal) + '）',
      '',
      '【三项指标】',
      '指标一（自发自用/总发电量）：' + (report.ratio1 != null ? report.ratio1 : '—') + '% ' + ratio1Icon + ' 门槛≥60%',
      '指标二（自发自用/总用电量）：' + (report.ratio2 != null ? report.ratio2 : '—') + '% ' + ratio2Icon + ' 门槛≥' + (report.ratio2Threshold != null ? report.ratio2Threshold : '—') + '%',
      '指标三（上网电量/总发电量）：' + (report.ratio3 != null ? report.ratio3 : '—') + '% ' + ratio3Icon + ' 门槛≤20%',
      '',
      '【综合结论】',
      overallText,
      '',
      '【优化建议】',
      sugText,
      '',
      '---源流 · 基于发改能源〔2026〕688号---'
    ])
    return lines.join('\n')
  },

  onCopyReport: function () {
    if (!this.data.report) {
      wx.showToast({ title: '暂无报告', icon: 'none' })
      return
    }
    var text = this._buildReportText()
    wx.setClipboardData({
      data: text,
      success: function () {
        wx.showToast({ title: '已复制', icon: 'success', duration: 1500 })
      }
    })
  },

  onGoToCheck: function () {
    wx.switchTab({ url: '/pages/green-direct/index' })
  },

  onOpenSampleReport: function () {
    this.setData({
      showSampleReport: true,
      sampleReportIndex: 0
    })
  },

  onCloseSampleReport: function () {
    this.setData({ showSampleReport: false })
  },

  onSampleReportChange: function (e) {
    var current = e.detail && typeof e.detail.current === 'number' ? e.detail.current : 0
    this.setData({ sampleReportIndex: current })
  },

  noop: function () {},

  onDoAIAnalyze: function () {
    var self = this
    var report = this.data.report || {}
    if (!report.generateTime) {
      wx.showToast({ title: '报告数据异常，请重新生成', icon: 'none' })
      return
    }
    self.setData({ aiLoading: true, aiResult: null, aiResultHtml: '' })
    wx.showLoading({ title: 'AI分析中...' })
    if (self.data.retryFailCount >= 1) {
      self.setData({ showSwitchingModal: true })
    }
    var request = require('../../utils/request.js')
    request.postAnalyze({ report: report, out_trade_no: wx.getStorageSync('yuanliu_pending_order') || '' })
      .then(function (res) {
        self.setData({ showSwitchingModal: false })
        wx.hideLoading()
        var resultText = (res && res.result) ? String(res.result).replace(/\r\n/g, '\n').replace(/\r/g, '\n') : ''
        var aiContent = resultText || '分析完成，请查看结果'
        self.setData({
          aiLoading: false,
          aiResult: aiContent,
          aiResultHtml: markdownToHtml(aiContent)
        })
      })
      .catch(function (err) {
        self.setData({ showSwitchingModal: false })
        wx.hideLoading()
        self.setData({ aiLoading: false })
        wx.showToast({ title: 'AI分析失败，请重试', icon: 'none' })
        var count = self.data.retryFailCount + 1
        self.setData({ retryFailCount: count })
        if (count >= 2) {
          self.setData({ showRefundModal: true })
        }
      })
  },

  onDownloadPDF: function () {
    var self = this
    var report = this.data.report || {}
    var aiResult = this.data.aiResult || ''
    if (!aiResult) {
      wx.showToast({ title: '请先生成AI分析报告', icon: 'none' })
      return
    }

    wx.showLoading({ title: 'PDF生成中...' })
    wx.request({
      url: 'https://green.sourceflower.com/api/generate-pdf',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Api-Token': config.API_TOKEN
      },
      data: {
        projectName: report.projectName || '未命名项目',
        aiContent: aiResult,
        report: this.data.report,
        baseReportText: this.data.baseReportText || '',
        out_trade_no: wx.getStorageSync('yuanliu_pending_order') || ''
      },
      success: function (res) {
        wx.hideLoading()
        if (res.statusCode === 200 && res.data && res.data.success) {
          var fileUrl = 'https://green.sourceflower.com' + res.data.downloadUrl
          var projectName = report.projectName || '绿电直连合规报告'

          // iOS系统提示
          var systemInfo = wx.getSystemInfoSync()
          var isIOS = systemInfo.platform === 'ios'
          if (isIOS) {
            wx.showModal({
              title: '温馨提示',
              content: 'iOS系统限制，PDF预览后无法直接保存到手机。\n您可以通过右上角菜单「转发给朋友」或「用其他应用打开」来保存或分享报告。',
              confirmText: '我知道了',
              showCancel: false,
              success: function () {
                doDownloadPDF(fileUrl, projectName)
              }
            })
            return
          }
          doDownloadPDF(fileUrl, projectName)
        } else {
          wx.showToast({ title: 'PDF生成失败，请重试', icon: 'none' })
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      }
    })

    function doDownloadPDF(fileUrl, projectName) {
      var cleanName = (projectName || '绿电直连合规报告').replace(/\s/g, '')
      var filePath = wx.env.USER_DATA_PATH + '/' + cleanName + '.pdf'

      wx.showLoading({ title: 'PDF下载中...' })
      wx.downloadFile({
        url: fileUrl,
        filePath: filePath,
        header: { 'X-Api-Token': config.API_TOKEN },
        success: function (dlRes) {
          wx.hideLoading()
          if (dlRes.statusCode === 200) {
            wx.openDocument({
              filePath: dlRes.filePath,
              fileType: 'pdf',
              showMenu: true,
              success: function () {
                console.log('PDF打开成功')
              },
              fail: function () {
                wx.showToast({ title: '无法打开PDF，请稍后重试', icon: 'none' })
              }
            })
          } else {
            wx.showToast({ title: 'PDF下载失败', icon: 'none' })
          }
        },
        fail: function () {
          wx.hideLoading()
          wx.showToast({ title: 'PDF下载失败，请重试', icon: 'none' })
        }
      })
    }
  },

  onContactAI: function () {
    var self = this
    wx.showModal({
      title: 'AI深度分析报告',
      content: '购买后将基于您的项目数据，生成688号文合规预审专业报告。\n\n价格：¥19.9 / 次',
      confirmText: '立即支付',
      cancelText: '暂不购买',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({ title: '支付处理中...' })
          payment.requestPayment({
            productDesc: 'AI深度分析报告',
            amount: config.PAYMENT_AMOUNT,
            onSuccess: function (result) {
              wx.hideLoading()
              var report = self.data.report || {}
              var paidKey = 'yuanliu_ai_paid_' + (report.generateTime || '')
              var tradeNo = result && result.out_trade_no
              try {
                wx.setStorageSync(paidKey, true)
                if (tradeNo) wx.setStorageSync('yuanliu_pending_order', tradeNo)
              } catch (e) {}
              self.setData({ aiPaid: true }, function () {
                self.onDoAIAnalyze()
              })
            },
            onFail: function (err) {
              wx.hideLoading()
              if (err && err.message === 'USER_CANCEL') return
              wx.showToast({ title: '支付失败，请重试', icon: 'none' })
            }
          })
        }
      }
    })
  },

  onRecoverPayment: function () {
    var self = this
    var tradeNo = this.data.pendingTradeNo || wx.getStorageSync('yuanliu_pending_order') || ''
    if (!tradeNo) {
      wx.showToast({ title: '未找到订单号', icon: 'none' })
      return
    }
    self.setData({ recoveringPayment: true })
    wx.showLoading({ title: '查询中...' })
    payment.confirmOrder(tradeNo, {
      onSuccess: function (result) {
        wx.hideLoading()
        try { wx.removeStorageSync('yuanliu_pending_order') } catch (e) {}
        var report = self.data.report || {}
        var paidKey = 'yuanliu_ai_paid_' + (report.generateTime || '')
        try { wx.setStorageSync(paidKey, true) } catch (e) {}
        self.setData({ aiPaid: true, recoveringPayment: false }, function () {
          self.onDoAIAnalyze()
        })
      },
      onFail: function (err) {
        wx.hideLoading()
        self.setData({ recoveringPayment: false })
        wx.showToast({ title: err.message || '查询失败，请稍后重试', icon: 'none' })
      }
    })
  },

  onCopyTradeNo: function () {
    var tradeNo = this.data.pendingTradeNo || wx.getStorageSync('yuanliu_pending_order') || '未找到订单号'
    wx.setClipboardData({
      data: tradeNo,
      success: function () {
        wx.showToast({ title: '订单号已复制', icon: 'success' })
      }
    })
  },

  onCloseRefundModal: function () {
    this.setData({ showRefundModal: false })
  },

  onRefundApply: function () {
    var tradeNo = this.data.pendingTradeNo || wx.getStorageSync('yuanliu_pending_order') || ''
    if (!tradeNo) {
      wx.showToast({ title: '未找到订单号', icon: 'none' })
      return
    }
    var self = this
    wx.showModal({
      title: '申请退款确认',
      content: '订单号：' + tradeNo + '\n退款金额：¥19.90\n原因：报告未成功生成',
      confirmText: '确认申请',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({ title: '提交中...' })
          wx.request({
            url: 'https://green.sourceflower.com/api/refund/apply',
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'X-Api-Token': config.API_TOKEN
            },
            data: { out_trade_no: tradeNo },
            success: function (res) {
              wx.hideLoading()
              if (res.statusCode === 200 && res.data && res.data.success) {
                wx.showToast({ title: '退款申请已提交', icon: 'success' })
              } else {
                var msg = (res.data && res.data.detail) || '申请失败，请稍后重试'
                wx.showToast({ title: msg, icon: 'none', duration: 2500 })
              }
            },
            fail: function () {
              wx.hideLoading()
              wx.showToast({ title: '申请失败，请稍后重试', icon: 'none' })
            }
          })
        }
      }
    })
  },

  onApplyInvoice: function () {
    var tradeNo = wx.getStorageSync('yuanliu_pending_order') || ''
    if (!tradeNo) {
      wx.showToast({ title: '未找到订单号', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: '/pages/invoice/invoice?out_trade_no=' + tradeNo
    })
  }
})
