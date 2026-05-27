var measureHeader = require('../../utils/headerLayout.js').measureHeader

var PRE_CHECK_REJECT = {
  q1: '政策明确规定多用户不包括居民和农业用户，您的项目暂不适用本政策。',
  q2: '政策要求多用户指多个不同法人实体，单用户项目请参考发改能源〔2025〕650号。',
  q3: '绿电直连仅适用于风电、太阳能、生物质等新能源发电项目。',
  q4: '政策明确禁止运营输电业务的公共电网企业担任项目主责单位。',
  q5: '项目必须设立具备独立法人资格的主责单位。',
  q6: '项目须符合国家产业政策，不得借绿电直连开展违法违规活动。'
}

var EMPTY_PRE_CHECK = { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null }

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,

    currentScreen: 0,
    totalScreens: 10,

    progressPercent: 0,
    progressText: '',

    preCheckDone: false,
    showRejectModal: false,
    rejectMsg: '',
    rejectQKey: '',

    preCheckItems: [
      { key: 'q1', text: '项目用电方均为工商业法人实体（不含居民或农业用户）' },
      { key: 'q2', text: '项目用电方有2个或以上独立法人实体' },
      { key: 'q3', text: '项目发电电源包含风电、光伏或生物质等新能源' },
      { key: 'q4', text: '项目主责单位不是公共电网企业（如供电局/国网/南网）' },
      { key: 'q5', text: '项目已成立或拟成立具备独立法人资格的主责单位' },
      { key: 'q6', text: '项目符合国家产业政策，不涉及违法违规活动' }
    ],

    suspectCheckIncomplete: true,

    p3Done: false,
    p3HelpExpanded: false,

    suspectCheckItems: [
      {
        key: 'q1',
        text: '项目风电/光伏规模是否已纳入或计划申报纳入省级新能源开发建设方案？',
        options: [
          { value: 'yes', label: '是' },
          { value: 'no', label: '否' },
          { value: 'uncertain', label: '不确定' }
        ],
        warnMsg: '风电/光伏规模须纳入省级开发建设方案，请尽快履行申报手续',
        warnOn: ['no', 'uncertain']
      },
      {
        key: 'q2',
        text: '并网型项目是否能在消纳困难时段保证不向电网反送电？',
        options: [
          { value: 'yes', label: '是' },
          { value: 'no', label: '否' },
          { value: 'notapply', label: '不涉及' }
        ],
        warnMsg: '消纳困难时段反送电存在合规风险，建议配置储能或提升负荷调节能力',
        warnOn: ['no']
      },
      {
        key: 'q3',
        text: '项目现有购电方式是否为直接市场交易（非电网代理购电）？',
        options: [
          { value: 'yes', label: '是' },
          { value: 'no', label: '否' },
          { value: 'nopower', label: '暂无用电' }
        ],
        warnMsg: '多用户绿电直连项目不得由电网代理购电，需变更为直接市场交易',
        warnOn: ['no']
      },
      {
        key: 'q4',
        text: '涉及存量新能源：该项目是否尚未并网或存在消纳受限问题？',
        options: [
          { value: 'yes', label: '是' },
          { value: 'no', label: '否' },
          { value: 'notapply', label: '不涉及' }
        ],
        warnMsg: '已正常并网且无消纳受限的存量新能源项目转为直连需咨询省级能源主管部门',
        warnOn: ['no']
      },
      {
        key: 'q5',
        text: '涉及分布式光伏：是否拟采用集中汇流方式参与直连？',
        options: [
          { value: 'yes', label: '是' },
          { value: 'no', label: '否' },
          { value: 'notapply', label: '不涉及' }
        ],
        warnMsg: '分布式光伏须通过集中汇流方式参与，分散接入方案需另行咨询',
        warnOn: ['no']
      }
    ],

    appState: {
      preCheck: { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null },
      suspectCheck: { q1: null, q2: null, q3: null, q4: null, q5: null },
      projectType: { gridType: null, targetYear: null },
      projectInfo: {
        name: '',
        province: '',
        resourceZone: '',
        refHours: { solar: 0, wind: 0 },
        inPark: null,
        parkType: '',
        industryTypes: []
      },
      users: [],
      energySources: [],
      storage: {
        hasStorage: null,
        power: 0,
        capacity: 0,
        cyclesPerDay: 1,
        annualStorageEnergy: 0
      },
      results: {}
    }
  },

  onLoad: function () {
    this.setData(measureHeader())
    this.setData({ progressText: '' })
  },

  onShow: function () {
    var t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ selected: 0 })
  },

  goStart: function () {
    this._updateProgress(1)
  },

  goNext: function () {
    var cur = this._screenIndex()
    if (cur === 1 && !this.data.preCheckDone) {
      wx.showToast({ title: '请确认全部条件', icon: 'none' })
      return
    }
    if (cur === 3 && !this.data.p3Done) {
      wx.showToast({ title: '请完成全部选择', icon: 'none' })
      return
    }
    if (cur >= 9) return
    this._updateProgress(cur + 1)
  },

  goPrev: function () {
    var cur = this._screenIndex()
    if (cur <= 0) return
    this._updateProgress(cur - 1)
  },

  onSuspectCheckSelect: function (e) {
    var qKey = e.currentTarget.dataset.q
    var value = e.currentTarget.dataset.value
    if (!qKey || value === undefined || value === '') return
    var suspectCheck = Object.assign({}, this.data.appState.suspectCheck)
    suspectCheck[qKey] = value
    this.setData({
      'appState.suspectCheck': suspectCheck,
      suspectCheckIncomplete: this._hasSuspectCheckIncomplete(suspectCheck)
    })
  },

  onSelectGridType: function (e) {
    var value = e.currentTarget.dataset.value
    if (!value) return
    var projectType = Object.assign({}, this.data.appState.projectType)
    projectType.gridType = value
    this.setData({
      'appState.projectType': projectType,
      p3Done: this._isP3Done(projectType)
    })
  },

  onSelectTargetYear: function (e) {
    var value = e.currentTarget.dataset.value
    if (!value) return
    var projectType = Object.assign({}, this.data.appState.projectType)
    projectType.targetYear = value
    this.setData({
      'appState.projectType': projectType,
      p3Done: this._isP3Done(projectType)
    })
  },

  onToggleP3Help: function () {
    this.setData({ p3HelpExpanded: !this.data.p3HelpExpanded })
  },

  _isP3Done: function (projectType) {
    return !!(projectType && projectType.gridType && projectType.targetYear)
  },

  _hasSuspectCheckIncomplete: function (suspectCheck) {
    var keys = ['q1', 'q2', 'q3', 'q4', 'q5']
    for (var i = 0; i < keys.length; i++) {
      var v = suspectCheck[keys[i]]
      if (v === null || v === undefined || v === '') return true
    }
    return false
  },

  onPreCheckSelect: function (e) {
    var qKey = e.currentTarget.dataset.q
    var value = e.currentTarget.dataset.value
    if (!qKey) return
    if (value === 'yes') {
      this._setPreCheckAnswer(qKey, true)
    } else if (value === 'no') {
      this._setPreCheckAnswer(qKey, false)
    }
  },

  _setPreCheckAnswer: function (qKey, value) {
    var preCheck = Object.assign({}, this.data.appState.preCheck)
    preCheck[qKey] = value

    if (value === false) {
      this.setData({
        'appState.preCheck': preCheck,
        showRejectModal: true,
        rejectMsg: PRE_CHECK_REJECT[qKey] || '',
        rejectQKey: qKey,
        preCheckDone: false
      })
      return
    }

    this.setData({
      'appState.preCheck': preCheck,
      showRejectModal: false,
      rejectMsg: '',
      rejectQKey: '',
      preCheckDone: this._isPreCheckAllYes(preCheck)
    })
  },

  _isPreCheckAllYes: function (preCheck) {
    var keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']
    for (var i = 0; i < keys.length; i++) {
      if (preCheck[keys[i]] !== true) return false
    }
    return true
  },

  onRejectRetry: function () {
    var qKey = this.data.rejectQKey
    var preCheck = Object.assign({}, this.data.appState.preCheck)
    if (qKey) preCheck[qKey] = null
    this.setData({
      'appState.preCheck': preCheck,
      showRejectModal: false,
      rejectMsg: '',
      rejectQKey: '',
      preCheckDone: false
    })
  },

  onRejectExit: function () {
    this.setData({
      'appState.preCheck': Object.assign({}, EMPTY_PRE_CHECK),
      preCheckDone: false,
      showRejectModal: false,
      rejectMsg: '',
      rejectQKey: ''
    })
    this._updateProgress(0)
  },

  _screenIndex: function () {
    var cur = Number(this.data.currentScreen)
    return isNaN(cur) ? 0 : cur
  },

  _updateProgress: function (screen) {
    var cur = typeof screen === 'number' ? screen : this._screenIndex()
    cur = Math.max(0, Math.min(9, Math.floor(cur)))
    var progressPercent = cur === 0 ? 0 : Math.round((cur / 9) * 100)
    var progressText = cur === 0 ? '' : '第' + cur + '步，共9步'
    this.setData({
      currentScreen: cur,
      progressPercent: progressPercent,
      progressText: progressText
    })
  }
})
