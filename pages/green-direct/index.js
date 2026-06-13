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

function _matchId(a, b) {
  return String(a) === String(b)
}

function _emptyIfZero(val) {
  if (val === 0 || val === '0' || val === null || val === undefined) return ''
  return val
}

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,

    currentScreen: 0,
    totalScreens: 11,

    userConsent: false,

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

    p4Done: false,
    provinceIndex: 0,
    industrySelected: {},
    p4OtherIndustry: '',

    p5Done: false,
    p5Summary: {
      userCount: 0,
      totalAnnual: 0,
      total2030: 0,
      totalRooftop: 0
    },

    userIndustryOptions: [
      { label: '⭐ 算力设施', value: 'computing' },
      { label: '⭐ 绿色氢氨醇', value: 'hydrogen' },
      { label: '工业制造', value: 'manufacturing' },
      { label: '出口外贸', value: 'export' },
      { label: '重点用能单位', value: 'keyEnergy' },
      { label: '碳排放重点企业', value: 'carbon' },
      { label: '其他', value: 'other' }
    ],
    productionShiftOptions: [
      { label: '全天24h', value: 'all24' },
      { label: '白班8-12h', value: 'dayShift' },
      { label: '夜班', value: 'nightShift' },
      { label: '弹性', value: 'flexible' }
    ],
    peakPeriodOptions: [
      { label: '白天为主', value: 'dayPeak' },
      { label: '夜间为主', value: 'nightPeak' },
      { label: '均匀分布', value: 'even' }
    ],
    rooftopStructureOptions: [
      { label: '彩钢瓦', value: '彩钢瓦' },
      { label: '混凝土平顶', value: '混凝土平顶' },
      { label: '其他', value: '其他' }
    ],

    p6Done: false,
    p6Summary: {
      totalCapacity: 0,
      totalGeneration: 0,
      byType: []
    },
    p6RooftopRef: {
      total: 0,
      totalGen: 0,
      show: false
    },

    energyTypeOptions: [
      { label: '风电', value: 'wind' },
      { label: '地面光伏', value: 'solar' },
      { label: '屋顶分布式光伏', value: 'rooftop' },
      { label: '生物质', value: 'biomass' },
      { label: '其他', value: 'other' }
    ],
    existingProjectOptions: [
      { label: '新建', value: 'new' },
      { label: '存量未并网', value: 'existingUngrid' },
      { label: '存量消纳受限', value: 'existingLimited' }
    ],

    energyTypeLabels: {
      wind: '风电',
      solar: '地面光伏',
      rooftop: '屋顶光伏',
      biomass: '生物质',
      other: '其他'
    },

    p7Balance: {
      userCount: 0,
      totalConsumption: 0,
      consumption2030: 0,
      totalCapacity: 0,
      totalGeneration: 0,
      byType: {},
      p7ByTypeList: [],
      gap: 0,
      gapAbs: 0,
      gapType: 'balanced',
      selfUse: 0,
      ratio1: 0,
      ratio2: 0,
      ratio2Threshold: 35,
      ratio1Pass: false,
      ratio2Pass: false,
      isOffgrid: false,
      gridFeedIn: 0,
      ratio3: 0,
      ratio3Pass: true,
      conclusionType: 'failBoth',
      conclusionIcon: '',
      conclusionText: ''
    },

    p9SuspectWarnings: [],
    p9SuspectAllClear: true,
    p9IndustryTags: [],
    p9UserList: [],
    p9EnergyList: [],

    finalResults: {
      totalGeneration: 0,
      totalConsumption: 0,
      selfUseWithStorage: 0,
      gridFeedInWithStorage: 0,
      ratio1: 0,
      ratio1Pass: false,
      ratio2: 0,
      ratio2Pass: false,
      ratio2Threshold: 35,
      ratio3: 0,
      ratio3Pass: false,
      isOffgrid: false,
      overallPass: false,
      suggestions: []
    },
    p10SuspectWarnings: [],
    p10SuspectAllClear: true,
    p10ShowPriority: false,
    p10PriorityText: '',

    p7Preview: {
      totalGeneration: 0,
      totalConsumption: 0,
      gap: 0,
      gapAbs: 0,
      gapKind: 'match',
      selfUseBeforeStorage: 0,
      ratio1Before: 0,
      ratio2Before: 0,
      ratio3Before: 0,
      ratio3PassBefore: true,
      isOffgrid: false,
      selfUseAfterStorage: 0,
      ratio1After: 0,
      ratio2After: 0,
      ratio2Threshold: 35
    },

    storageCalcResult: {
      show: false,
      beforeRatio1: 0,
      beforeRatio2: 0,
      afterRatio1: 0,
      afterRatio2: 0,
      ratio1Pass: false,
      ratio2Pass: false
    },

    provinceEnergyData: {
      '北京': { solar: 1400, wind: 1800, price: 0.360 },
      '天津': { solar: 1350, wind: 1700, price: 0.365 },
      '河北': { solar: 1400, wind: 2100, price: 0.364 },
      '山西': { solar: 1450, wind: 2200, price: 0.332 },
      '内蒙古': { solar: 1550, wind: 2500, price: 0.303 },
      '辽宁': { solar: 1300, wind: 2100, price: 0.374 },
      '吉林': { solar: 1350, wind: 2300, price: 0.373 },
      '黑龙江': { solar: 1300, wind: 2300, price: 0.374 },
      '上海': { solar: 1100, wind: 1600, price: 0.415 },
      '江苏': { solar: 1150, wind: 1900, price: 0.391 },
      '浙江': { solar: 1050, wind: 1700, price: 0.415 },
      '安徽': { solar: 1200, wind: 1900, price: 0.384 },
      '福建': { solar: 1150, wind: 2200, price: 0.394 },
      '江西': { solar: 1150, wind: 1800, price: 0.414 },
      '山东': { solar: 1300, wind: 2100, price: 0.395 },
      '河南': { solar: 1250, wind: 1900, price: 0.377 },
      '湖北': { solar: 1100, wind: 1800, price: 0.416 },
      '湖南': { solar: 1050, wind: 1800, price: 0.450 },
      '广东': { solar: 1150, wind: 1900, price: 0.453 },
      '广西': { solar: 1100, wind: 1900, price: 0.421 },
      '海南': { solar: 1250, wind: 1800, price: 0.430 },
      '重庆': { solar: 900, wind: 1700, price: 0.396 },
      '四川': { solar: 1050, wind: 1800, price: 0.401 },
      '贵州': { solar: 1050, wind: 1900, price: 0.351 },
      '云南': { solar: 1350, wind: 2100, price: 0.336 },
      '西藏': { solar: 1650, wind: 2200, price: 0.499 },
      '陕西': { solar: 1400, wind: 2100, price: 0.354 },
      '甘肃': { solar: 1550, wind: 2400, price: 0.308 },
      '青海': { solar: 1650, wind: 2300, price: 0.325 },
      '宁夏': { solar: 1550, wind: 2300, price: 0.259 },
      '新疆': { solar: 1600, wind: 2500, price: 0.250 },
      '香港': { solar: 1100, wind: 1600, price: 0.500 },
      '澳门': { solar: 1150, wind: 1500, price: 0.500 },
      '台湾': { solar: 1200, wind: 2000, price: 0.500 }
    },

    provinceList: [
      '北京', '天津', '河北', '山西', '内蒙古',
      '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽',
      '福建', '江西', '山东', '河南', '湖北', '湖南', '广东',
      '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏',
      '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾'
    ],

    industryList: [
      { label: '⭐ 算力设施', value: 'computing', priority: true },
      { label: '⭐ 绿色氢氨醇', value: 'hydrogen', priority: true },
      { label: '工业制造', value: 'manufacturing', priority: false },
      { label: '出口外向型企业', value: 'export', priority: false },
      { label: '重点用能单位', value: 'keyEnergy', priority: false },
      { label: '碳排放重点企业', value: 'carbon', priority: false },
      { label: '其他', value: 'other', priority: false }
    ],

    suspectCheckItems: [
      {
        key: 'q1',
        text: '项目风电/光伏规模是否已纳入或计划申报纳入省级新能源开发建设方案？',
        options: [
          { value: 'yes', label: '是' },
          { value: 'no', label: '否' },
          { value: 'uncertain', label: '不确定' }
        ],
        warnMsg: '风电/光伏装机规模须纳入省级新能源开发建设方案，建议在项目核准前完成申报备案',
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
        warnMsg: '并网型项目在省级明确的消纳困难时段禁止向公共电网反送电，建议合理配置储能或签订负荷调节协议',
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
        warnMsg: '本项目不得由电网企业代理购电，须以新型经营主体身份注册并直接参与电力市场交易',
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
        warnMsg: '存量新能源项目已正常并网且无消纳受限，转为直连模式须事先取得省级能源主管部门书面同意',
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
        warnMsg: '分布式光伏参与多用户绿电直连须采用集中汇流方式，分散接入方案暂不适用本政策，请另行咨询省级主管部门',
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
        refPrice: 0,
        inPark: null,
        parkType: '',
        industryTypes: []
      },
      users: [],
      energySources: [],
      storage: {
        hasStorage: null,
        power: '',
        capacity: '',
        cyclesPerDay: 1,
        operateDays: 300,
        annualStorageEnergy: 0
      },
      results: {}
    }
  },

  onLoad: function () {
    this.setData(measureHeader())
    this.setData({ progressText: '' })
    // 检查隐私授权状态
    var app = getApp()
    this.setData({ userConsent: app.hasConsent() })
  },

  onShow: function () {
    var t = typeof this.getTabBar === 'function' && this.getTabBar()
    if (t) t.setData({ selected: 0 })
    // 每次显示时同步授权状态
    var app = getApp()
    this.setData({ userConsent: app.hasConsent() })
  },

  onAgreeConsent: function () {
    var app = getApp()
    app.grantConsent()
    this.setData({ userConsent: true })
  },

  onDenyConsent: function () {
    wx.showModal({
      title: '提示',
      content: '需同意用户协议和隐私政策后方可使用本工具。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onOpenTerms: function () {
    wx.navigateTo({ url: '/pages/legal/terms/terms' })
  },

  onOpenPrivacy: function () {
    wx.navigateTo({ url: '/pages/legal/privacy/privacy' })
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
    if (cur === 4 && !this.data.p4Done) {
      wx.showToast({ title: '请输入项目名称', icon: 'none' })
      return
    }
    if (cur === 5 && !this.data.p5Done) {
      wx.showToast({ title: '请完善所有用户的必填信息', icon: 'none' })
      return
    }
    if (cur === 6 && !this._validateP6Sources(this.data.appState.energySources)) {
      wx.showToast({ title: '请完善所有电源的必填信息', icon: 'none' })
      return
    }
    if (cur === 8) {
      var storageCfg = this.data.appState.storage || {}
      if (storageCfg.hasStorage === true && !this.data.storageCalcResult.show) {
        wx.showToast({
          title: '请先点击「计算配出效果」',
          icon: 'none',
          duration: 2000
        })
        return
      }
    }
    if (cur >= 10) return
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

  onProjectNameInput: function (e) {
    var name = (e.detail && e.detail.value) ? String(e.detail.value).trim() : ''
    var projectInfo = Object.assign({}, this.data.appState.projectInfo, { name: e.detail.value || '' })
    this.setData({
      'appState.projectInfo': projectInfo,
      p4Done: name.length > 0
    })
  },

  onProvinceChange: function (e) {
    var idx = Number(e.detail.value)
    if (isNaN(idx) || idx < 0) return
    var province = this.data.provinceList[idx]
    var energy = this.data.provinceEnergyData[province]
    var projectInfo = Object.assign({}, this.data.appState.projectInfo)
    projectInfo.province = province
    if (energy) {
      projectInfo.refHours = { solar: energy.solar, wind: energy.wind }
      projectInfo.refPrice = energy.price
    }
    this.setData({
      provinceIndex: idx,
      'appState.projectInfo': projectInfo
    })
    var users = this.data.appState.users || []
    if (users.length) this._setUsers(users.slice())
    var sources = this.data.appState.energySources || []
    if (sources.length) this._setEnergySources(sources.slice())
  },

  onSelectInPark: function (e) {
    var value = e.currentTarget.dataset.value
    var inPark = value === 'yes'
    var projectInfo = Object.assign({}, this.data.appState.projectInfo)
    projectInfo.inPark = inPark
    if (!inPark) projectInfo.parkType = ''
    this.setData({ 'appState.projectInfo': projectInfo })
  },

  onSelectParkType: function (e) {
    var value = e.currentTarget.dataset.value
    if (!value) return
    var projectInfo = Object.assign({}, this.data.appState.projectInfo, { parkType: value })
    this.setData({ 'appState.projectInfo': projectInfo })
  },

  onToggleIndustry: function (e) {
    var value = e.currentTarget.dataset.value
    if (!value) return
    var types = (this.data.appState.projectInfo.industryTypes || []).slice()
    var idx = types.indexOf(value)
    if (idx >= 0) types.splice(idx, 1)
    else types.push(value)
    var selected = {}
    for (var i = 0; i < types.length; i++) selected[types[i]] = true
    var projectInfo = Object.assign({}, this.data.appState.projectInfo, { industryTypes: types })
    this.setData({
      'appState.projectInfo': projectInfo,
      industrySelected: selected
    })
  },

  onP4OtherIndustryInput: function (e) {
    var val = (e.detail && e.detail.value) ? String(e.detail.value) : ''
    this.setData({ p4OtherIndustry: val })
  },

  onUserOtherIndustryInput: function (e) {
    var idx = Number(e.currentTarget.dataset.index)
    if (isNaN(idx) || idx < 0) return
    var val = (e.detail && e.detail.value) ? String(e.detail.value) : ''
    var users = (this.data.appState.users || []).slice()
    if (idx >= users.length) return
    users[idx] = Object.assign({}, users[idx], { otherIndustry: val })
    this.setData({ 'appState.users': users })
  },

  _createEmptyUser: function () {
    var ref = this.data.appState.projectInfo.refHours || {}
    return {
      id: Date.now(),
      name: '',
      industry: '',
      otherIndustry: '',
      isAgriResident: null,
      productionShift: '',
      peakPeriod: '',
      annualConsumption: '',
      hasBillData: null,
      transformerCapacity: '',
      hasExpansionPlan: null,
      expansionRate: '',
      consumption2030: 0,
      hasRooftop: null,
      rooftopOwner: '',
      rooftopStructure: '',
      rooftopStructureCustom: '',
      rooftopCapacity: '',
      rooftopHours: '',
      rooftopGeneration: 0
    }
  },

  _ensureP5Users: function () {
    var users = this.data.appState.users || []
    if (users.length === 0) users = [this._createEmptyUser()]
    this._setUsers(users)
    return users
  },

  _calcUser2030: function (user) {
    var annual = parseFloat(user.annualConsumption)
    if (isNaN(annual) || annual <= 0) return 0
    if (user.hasExpansionPlan !== true) {
      return Math.round(annual * 10) / 10
    }
    var rate = parseFloat(user.expansionRate)
    if (isNaN(rate)) rate = 0
    return Math.round(annual * Math.pow(1 + rate / 100, 2030 - 2026) * 10) / 10
  },

  _calcUserRooftopGen: function (user) {
    if (user.hasRooftop !== true) return 0
    var cap = parseFloat(user.rooftopCapacity)
    var hours = parseFloat(user.rooftopHours)
    if (isNaN(cap) || isNaN(hours)) return 0
    return Math.round((cap * hours / 10) * 10) / 10
  },

  _normalizeUser: function (user) {
    var u = Object.assign({}, user)
    u.annualConsumption = _emptyIfZero(u.annualConsumption)
    u.transformerCapacity = _emptyIfZero(u.transformerCapacity)
    u.expansionRate = _emptyIfZero(u.expansionRate)
    u.rooftopCapacity = _emptyIfZero(u.rooftopCapacity)
    u.rooftopHours = _emptyIfZero(u.rooftopHours)
    var ref = this.data.appState.projectInfo.refHours || {}
    u.refRooftopHours = ref.solar || 0
    u.consumption2030 = this._calcUser2030(u)
    u.rooftopGeneration = this._calcUserRooftopGen(u)
    return u
  },

  _calcP5Summary: function (users) {
    var totalAnnual = 0
    var total2030 = 0
    var totalRooftop = 0
    for (var i = 0; i < users.length; i++) {
      var u = users[i]
      var a = parseFloat(u.annualConsumption)
      if (!isNaN(a)) totalAnnual += a
      total2030 += u.consumption2030 || 0
      totalRooftop += u.rooftopGeneration || 0
    }
    return {
      userCount: users.length,
      totalAnnual: Math.round(totalAnnual * 10) / 10,
      total2030: Math.round(total2030 * 10) / 10,
      totalRooftop: Math.round(totalRooftop * 10) / 10
    }
  },

  _validateP5Users: function (users) {
    if (!users || !users.length) return false
    for (var i = 0; i < users.length; i++) {
      var u = users[i]
      if (!String(u.name || '').trim()) return false
      var annualStr = String(u.annualConsumption != null ? u.annualConsumption : '').trim()
      if (annualStr === '') return false
      if (isNaN(parseFloat(annualStr))) return false
    }
    return true
  },

  _setUsers: function (users) {
    var normalized = users.map(this._normalizeUser.bind(this))
    this.setData({
      'appState.users': normalized,
      p5Summary: this._calcP5Summary(normalized),
      p5Done: this._validateP5Users(normalized)
    })
  },

  _patchUser: function (userId, patch) {
    var users = (this.data.appState.users || []).map(function (u) {
      if (!_matchId(u.id, userId)) return u
      return Object.assign({}, u, patch)
    })
    this._setUsers(users)
  },

  onAddUser: function () {
    var users = (this.data.appState.users || []).slice()
    users.push(this._createEmptyUser())
    this._setUsers(users)
  },

  onDeleteUser: function (e) {
    var userId = e.currentTarget.dataset.id
    var users = this.data.appState.users || []
    if (users.length <= 1) return
    var self = this
    wx.showModal({
      title: '提示',
      content: '确定删除该用户？',
      success: function (res) {
        if (!res.confirm) return
        var next = users.filter(function (u) { return !_matchId(u.id, userId) })
        self._setUsers(next)
      }
    })
  },

  onCopyUser: function (e) {
    var userId = e.currentTarget.dataset.id
    var users = this.data.appState.users || []
    var src = null
    for (var i = 0; i < users.length; i++) {
      if (_matchId(users[i].id, userId)) {
        src = users[i]
        break
      }
    }
    if (!src) return
    var copy = Object.assign({}, src, { id: Date.now() + 1 })
    users = users.slice()
    users.push(copy)
    this._setUsers(users)
  },

  onUserInput: function (e) {
    var userId = e.currentTarget.dataset.id
    var field = e.currentTarget.dataset.field
    if (!userId || !field) return
    var patch = {}
    patch[field] = e.detail.value
    this._patchUser(userId, patch)
  },

  onUserSelect: function (e) {
    var userId = e.currentTarget.dataset.id
    var field = e.currentTarget.dataset.field
    var value = e.currentTarget.dataset.value
    if (!userId || !field) return
    var patch = {}
    if (field === 'isAgriResident' || field === 'hasBillData' ||
        field === 'hasExpansionPlan' || field === 'hasRooftop') {
      patch[field] = value === 'yes'
      if (field === 'hasExpansionPlan' && value !== 'yes') patch.expansionRate = ''
      if (field === 'hasRooftop' && value !== 'yes') {
        patch.rooftopOwner = ''
        patch.rooftopStructure = ''
        patch.rooftopStructureCustom = ''
        patch.rooftopCapacity = ''
      }
    } else {
      patch[field] = value
      if (field === 'rooftopStructure' && value !== '其他') {
        patch.rooftopStructureCustom = ''
      }
    }
    this._patchUser(userId, patch)
  },

  onApplyUserRefHours: function (e) {
    var userId = e.currentTarget.dataset.id
    var ref = (this.data.appState.projectInfo.refHours || {}).solar
    if (!ref) return
    this._patchUser(userId, { rooftopHours: String(ref) })
  },

  onApplyEnergyRefHours: function (e) {
    var sourceId = e.currentTarget.dataset.id
    var sources = this.data.appState.energySources || []
    var i
    var srcType = ''
    for (i = 0; i < sources.length; i++) {
      if (sources[i].id === sourceId) {
        srcType = sources[i].type || ''
        break
      }
    }
    var ref = this._getDefaultHoursForType(srcType)
    if (!ref) return
    this._patchSource(sourceId, { hours: String(ref), hoursCustom: true })
  },

  _energyTypeLabels: {
    wind: '风电',
    solar: '地面光伏',
    rooftop: '屋顶分布式光伏',
    biomass: '生物质',
    other: '其他'
  },

  _createEmptySource: function () {
    return {
      id: Date.now(),
      type: '',
      capacity: '',
      hours: '',
      hoursCustom: false,
      generation: 0,
      isExisting: null
    }
  },

  _getDefaultHoursForType: function (type) {
    var ref = this.data.appState.projectInfo.refHours || {}
    if (type === 'wind') return ref.wind || 0
    if (type === 'solar' || type === 'rooftop') return ref.solar || 0
    if (type === 'biomass') return 7000
    return 0
  },

  _calcRooftopFromUsers: function (users) {
    var total = 0
    var totalGen = 0
    for (var i = 0; i < users.length; i++) {
      var u = users[i]
      if (u.hasRooftop !== true) continue
      var cap = parseFloat(u.rooftopCapacity)
      if (!isNaN(cap)) total += cap
      totalGen += u.rooftopGeneration || 0
    }
    return {
      total: Math.round(total * 1000) / 1000,
      totalGen: Math.round(totalGen * 10) / 10,
      show: total > 0
    }
  },

  _normalizeSource: function (source) {
    var s = Object.assign({}, source)
    s.capacity = _emptyIfZero(s.capacity)
    s.hours = _emptyIfZero(s.hours)
    s.refHours = this._getDefaultHoursForType(s.type || '')
    var cap = parseFloat(s.capacity)
    var hours = parseFloat(s.hours)
    if (isNaN(cap) || isNaN(hours)) {
      s.generation = 0
    } else {
      s.generation = Math.round((cap * hours / 10) * 10) / 10
    }
    return s
  },

  _calcP6Summary: function (sources) {
    var knownTypes = ['wind', 'solar', 'rooftop', 'biomass', 'other']
    var labels = this._energyTypeLabels || {}
    var map = {}
    var i
    var j
    for (j = 0; j < knownTypes.length; j++) {
      var kt = knownTypes[j]
      map[kt] = { type: kt, label: labels[kt] || kt, capacity: 0, generation: 0 }
    }
    var totalCapacity = 0
    var totalGeneration = 0
    sources = sources || []
    for (i = 0; i < sources.length; i++) {
      var s = sources[i]
      var cap = parseFloat(s.capacity)
      if (!isNaN(cap)) totalCapacity += cap
      totalGeneration += s.generation || 0
      var t = s.type
      if (knownTypes.indexOf(t) < 0) t = 'other'
      if (!map[t]) {
        map[t] = { type: 'other', label: labels.other || '其他', capacity: 0, generation: 0 }
        t = 'other'
      }
      if (!isNaN(cap)) map[t].capacity += cap
      map[t].generation += s.generation || 0
    }
    var byType = []
    for (j = 0; j < knownTypes.length; j++) {
      var key = knownTypes[j]
      var row = map[key]
      if (!row) continue
      if (row.capacity <= 0 && row.generation <= 0) continue
      byType.push({
        type: key,
        label: row.label,
        capacity: Math.round(row.capacity * 1000) / 1000,
        generation: Math.round(row.generation * 10) / 10
      })
    }
    return {
      totalCapacity: Math.round(totalCapacity * 1000) / 1000,
      totalGeneration: Math.round(totalGeneration * 10) / 10,
      byType: byType
    }
  },

  _validateP6Sources: function (sources) {
    if (!sources || !sources.length) return false
    for (var i = 0; i < sources.length; i++) {
      var s = sources[i]
      if (!s.type) return false
      if (!String(s.capacity || '').trim()) return false
      if (isNaN(parseFloat(s.capacity))) return false
    }
    return true
  },

  _setEnergySources: function (sources) {
    var normalized = sources.map(this._normalizeSource.bind(this))
    var rooftopRef = this._calcRooftopFromUsers(this.data.appState.users || [])
    this.setData({
      'appState.energySources': normalized,
      p6Summary: this._calcP6Summary(normalized),
      p6RooftopRef: rooftopRef,
      p6Done: this._validateP6Sources(normalized)
    })
  },

  _ensureP6Sources: function () {
    var users = (this.data.appState.users || []).map(this._normalizeUser.bind(this))
    var sources = (this.data.appState.energySources || []).slice()
    var activeRooftopUserIds = {}
    var i
    var j
    var user
    var uid
    var foundIdx
    var cap
    var hours
    var gen
    var label
    var rooftopEntry

    for (i = 0; i < users.length; i++) {
      if (users[i].hasRooftop === true) {
        activeRooftopUserIds[users[i].id] = true
      }
    }

    sources = sources.filter(function (s) {
      if (!s.fromRooftop) return true
      return !!activeRooftopUserIds[s.rooftopUserId]
    })

    for (i = 0; i < users.length; i++) {
      user = users[i]
      if (user.hasRooftop !== true) continue
      uid = user.id
      foundIdx = -1
      for (j = 0; j < sources.length; j++) {
        if (sources[j].fromRooftop === true && sources[j].rooftopUserId === uid) {
          foundIdx = j
          break
        }
      }
      cap = user.rooftopCapacity || ''
      hours = user.rooftopHours || ''
      gen = user.rooftopGeneration || 0
      label = user.name && String(user.name).trim()
        ? String(user.name).trim() + '屋顶光伏'
        : '屋顶光伏'
      rooftopEntry = {
        type: 'rooftop',
        capacity: cap,
        hours: hours,
        hoursCustom: !!String(hours || '').trim(),
        generation: gen,
        isExisting: 'new',
        fromRooftop: true,
        rooftopUserId: uid,
        label: label
      }
      if (foundIdx >= 0) {
        sources[foundIdx] = Object.assign({}, sources[foundIdx], rooftopEntry)
      } else {
        rooftopEntry.id = Date.now() + i + 1
        sources.push(rooftopEntry)
      }
    }

    var hasNonRooftop = false
    for (i = 0; i < sources.length; i++) {
      if (!sources[i].fromRooftop) {
        hasNonRooftop = true
        break
      }
    }
    if (sources.length === 0) {
      sources = [this._createEmptySource()]
    } else if (!hasNonRooftop) {
      var onlyRooftop = sources.slice()
      sources = [this._createEmptySource()].concat(onlyRooftop)
    }

    this._setEnergySources(sources)
    return sources
  },

  _patchSource: function (sourceId, patch) {
    var self = this
    var sources = (this.data.appState.energySources || []).map(function (s) {
      if (s.id !== sourceId) return s
      var merged = Object.assign({}, s, patch)
      if ('type' in patch && !merged.hoursCustom) {
        merged.hours = ''
      }
      return merged
    })
    this._setEnergySources(sources)
  },

  onAddEnergySource: function () {
    var sources = (this.data.appState.energySources || []).slice()
    sources.push(this._createEmptySource())
    this._setEnergySources(sources)
  },

  onDeleteEnergySource: function (e) {
    var sourceId = e.currentTarget.dataset.id
    var sources = this.data.appState.energySources || []
    if (sources.length <= 1) return
    var self = this
    wx.showModal({
      title: '提示',
      content: '确定删除该电源？',
      success: function (res) {
        if (!res.confirm) return
        var next = sources.filter(function (s) { return s.id !== sourceId })
        self._setEnergySources(next)
      }
    })
  },

  onCopyEnergySource: function (e) {
    var sourceId = e.currentTarget.dataset.id
    var sources = this.data.appState.energySources || []
    var src = null
    for (var i = 0; i < sources.length; i++) {
      if (sources[i].id === sourceId) {
        src = sources[i]
        break
      }
    }
    if (!src) return
    var copy = Object.assign({}, src, { id: Date.now() + 1 })
    sources = sources.slice()
    sources.push(copy)
    this._setEnergySources(sources)
  },

  onImportRooftopEnergy: function () {
    var ref = this._calcRooftopFromUsers(this.data.appState.users || [])
    if (!ref.show || ref.total <= 0) return
    var newId = Date.now()
    var sources = (this.data.appState.energySources || []).slice()
    sources.push({
      id: newId,
      type: 'rooftop',
      capacity: String(ref.total),
      hours: '',
      hoursCustom: false,
      generation: ref.totalGen,
      isExisting: 'new'
    })
    var normalized = sources.map(this._normalizeSource.bind(this))
    for (var i = 0; i < normalized.length; i++) {
      if (normalized[i].id === newId) {
        normalized[i].generation = ref.totalGen
        break
      }
    }
    var rooftopRef = this._calcRooftopFromUsers(this.data.appState.users || [])
    this.setData({
      'appState.energySources': normalized,
      p6Summary: this._calcP6Summary(normalized),
      p6RooftopRef: rooftopRef,
      p6Done: this._validateP6Sources(normalized)
    })
  },

  onEnergyInput: function (e) {
    var sourceId = e.currentTarget.dataset.id
    var field = e.currentTarget.dataset.field
    if (!sourceId || !field) return
    var patch = {}
    patch[field] = e.detail.value
    if (field === 'hours') {
      patch.hoursCustom = true
      patch.hours = e.detail.value
    }
    this._patchSource(sourceId, patch)
  },

  onEnergySelect: function (e) {
    var sourceId = e.currentTarget.dataset.id
    var field = e.currentTarget.dataset.field
    var value = e.currentTarget.dataset.value
    if (!sourceId || !field) return
    var patch = {}
    patch[field] = value
    this._patchSource(sourceId, patch)
  },

  _round1: function (n) {
    return Math.round(n * 10) / 10
  },

  _buildP8StorageAdvice: function (gapKind, ratio1Before, ratio3Before, isOffgrid) {
    var ratio1Pass = ratio1Before >= 60
    var ratio3Pass = isOffgrid ? true : ratio3Before <= 20

    if (!ratio3Pass) {
      if (gapKind === 'surplus') {
        return '上网电量占比已超20%上限，必须配置储能或增加用电负荷以降低上网量，否则项目存在较大风险'
      }
      return '上网电量占比超标，建议配置储能以提升自发自用比例，确保上网占比降至20%以内'
    }
    if (gapKind === 'surplus') {
      if (ratio1Pass) {
        return '当前指标一已满足门槛，发电略有盈余，配储可进一步提升消纳比例和项目经济性，可根据投资意愿决定'
      }
      return '当前发电过剩，自发自用比例（指标一）可能低于60%门槛，建议配置储能以提升就近消纳能力'
    }
    if (gapKind === 'short') {
      if (ratio1Pass) {
        return '当前指标一已满足门槛，可根据负荷增长预期和投资意愿决定是否扩大电源规模'
      }
      return '当前自发自用比例不足60%，建议增加新能源装机规模或配置储能以提升消纳比例'
    }
    return '源荷匹配良好，可根据投资意愿决定是否在下一步配置储能'
  },

  _calcP7Preview: function (storage) {
    var users = this.data.appState.users || []
    var sources = this.data.appState.energySources || []
    var projectType = this.data.appState.projectType || {}
    var ratio2Threshold = projectType.targetYear === 'post2030' ? 30 : 35

    var totalGeneration = 0
    var i
    for (i = 0; i < sources.length; i++) {
      totalGeneration += sources[i].generation || 0
    }

    var totalConsumption = 0
    for (i = 0; i < users.length; i++) {
      var a = parseFloat(users[i].annualConsumption)
      if (!isNaN(a)) totalConsumption += a
    }

    var gap = totalGeneration - totalConsumption
    var selfBefore = totalGeneration >= totalConsumption ? totalConsumption : totalGeneration
    var ratio1Before = totalGeneration > 0 ? (selfBefore / totalGeneration * 100) : 0
    var ratio2Before = totalConsumption > 0 ? (selfBefore / totalConsumption * 100) : 0

    var gridType = (projectType && projectType.gridType) || 'grid'
    var isOffgrid = gridType === 'offgrid'
    var gridFeedIn = Math.max(totalGeneration - selfBefore, 0)
    var ratio3Before = totalGeneration > 0
      ? Math.round(gridFeedIn / totalGeneration * 1000) / 10 : 0
    var ratio3PassBefore = isOffgrid ? true : ratio3Before <= 20

    storage = storage || {}
    var annualStorage = 0
    if (storage.hasStorage === true) {
      var cap = parseFloat(storage.capacity)
      var cycles = parseFloat(storage.cyclesPerDay)
      var days = parseFloat(storage.operateDays)
      if (isNaN(cycles)) cycles = 1
      if (isNaN(days)) days = 300
      if (!isNaN(cap) && cap > 0) {
        annualStorage = cap * cycles * days / 10
      }
    }
    annualStorage = this._round1(annualStorage)

    var selfAfter = selfBefore
    if (storage.hasStorage === true) {
      selfAfter = Math.min(selfBefore + annualStorage, totalConsumption)
    }
    var ratio1After = totalGeneration > 0 ? (selfAfter / totalGeneration * 100) : 0
    var ratio2After = totalConsumption > 0 ? (selfAfter / totalConsumption * 100) : 0

    var gapKind = 'match'
    if (gap > 0) gapKind = 'surplus'
    else if (gap < 0) gapKind = 'short'

    var ratio1BeforeRounded = this._round1(ratio1Before)
    return {
      totalGeneration: this._round1(totalGeneration),
      totalConsumption: this._round1(totalConsumption),
      gap: this._round1(gap),
      gapAbs: this._round1(Math.abs(gap)),
      gapKind: gapKind,
      selfUseBeforeStorage: this._round1(selfBefore),
      ratio1Before: ratio1BeforeRounded,
      ratio2Before: this._round1(ratio2Before),
      selfUseAfterStorage: this._round1(selfAfter),
      ratio1After: this._round1(ratio1After),
      ratio2After: this._round1(ratio2After),
      ratio2Threshold: ratio2Threshold,
      ratio3Before: ratio3Before,
      ratio3PassBefore: ratio3PassBefore,
      isOffgrid: isOffgrid,
      annualStorageEnergy: annualStorage,
      storageAdvice: this._buildP8StorageAdvice(
        gapKind,
        ratio1BeforeRounded,
        ratio3Before,
        isOffgrid
      )
    }
  },

  _refreshP7Balance: function () {
    var users = (this.data.appState.users || []).map(this._normalizeUser.bind(this))
    var sources = this.data.appState.energySources || []
    var projectType = this.data.appState.projectType || {}
    var labels = this.data.energyTypeLabels || {}
    var ratio2Threshold = projectType.targetYear === 'post2030' ? 30 : 35

    var totalGeneration = 0
    var totalConsumption = 0
    var consumption2030 = 0
    var totalCapacity = 0
    var byType = {
      wind: { capacity: 0, generation: 0 },
      solar: { capacity: 0, generation: 0 },
      rooftop: { capacity: 0, generation: 0 },
      biomass: { capacity: 0, generation: 0 },
      other: { capacity: 0, generation: 0 }
    }
    var i
    var knownTypes = ['wind', 'solar', 'rooftop', 'biomass', 'other']

    for (i = 0; i < sources.length; i++) {
      var s = sources[i]
      totalGeneration += s.generation || 0
      var cap = parseFloat(s.capacity)
      var capVal = isNaN(cap) ? 0 : cap
      totalCapacity += capVal
      var t = s.type || 'other'
      if (!byType[t]) t = 'other'
      byType[t].capacity += capVal
      byType[t].generation += s.generation || 0
    }

    for (i = 0; i < users.length; i++) {
      var u = users[i]
      var a = parseFloat(u.annualConsumption)
      if (!isNaN(a)) totalConsumption += a
      var c2030 = parseFloat(u.consumption2030)
      if (isNaN(c2030)) c2030 = isNaN(a) ? 0 : a
      consumption2030 += c2030
    }

    var gap = totalGeneration - totalConsumption
    var selfUse = totalGeneration >= totalConsumption ? totalConsumption : totalGeneration
    var ratio1 = totalGeneration > 0 ? (selfUse / totalGeneration * 100) : 0
    var ratio2 = totalConsumption > 0 ? (selfUse / totalConsumption * 100) : 0
    var ratio1Pass = ratio1 >= 60
    var ratio2Pass = ratio2 >= ratio2Threshold

    var gridType = (projectType && projectType.gridType) || 'grid'
    var isOffgrid = gridType === 'offgrid'
    var gridFeedIn = Math.max(totalGeneration - selfUse, 0)
    var ratio3 = totalGeneration > 0 ? Math.round(gridFeedIn / totalGeneration * 1000) / 10 : 0
    var ratio3Pass = isOffgrid ? true : ratio3 <= 20

    var gapType = 'balanced'
    if (gap > 0) gapType = 'surplus'
    else if (gap < 0) gapType = 'deficit'

    var conclusionType = 'pass'
    var conclusionIcon = '✅'
    var conclusionText = '源荷匹配良好，可根据投资意愿决定是否在下一步配置储能'
    if (!ratio1Pass && !ratio2Pass) {
      conclusionType = 'failBoth'
      conclusionIcon = '❌'
      conclusionText = '源荷匹配不足，建议返回调整新能源装机规模或用电负荷后重新测算'
    } else if (!ratio1Pass) {
      conclusionType = 'failRatio1'
      conclusionIcon = '⚠️'
      conclusionText = '自发自用占发电量比例偏低，建议适当减少新能源装机规模，或在下一步配置储能提升消纳'
    } else if (!ratio2Pass) {
      conclusionType = 'failRatio2'
      conclusionIcon = '⚠️'
      conclusionText = '绿电消费占用电量比例偏低，建议适当增加内部用电负荷，或减少新能源装机规模'
    } else if (!ratio3Pass) {
      conclusionType = 'failRatio3'
      conclusionIcon = '⚠️'
      conclusionText = '上网电量占比超过20%红线，建议配置储能或增加用电负荷以提升就近消纳比例'
    }

    var byTypeFiltered = {}
    var p7ByTypeList = []
    for (i = 0; i < knownTypes.length; i++) {
      var key = knownTypes[i]
      var row = byType[key]
      if (!row || row.generation <= 0) continue
      byTypeFiltered[key] = {
        capacity: this._round1(row.capacity),
        generation: this._round1(row.generation)
      }
      p7ByTypeList.push({
        key: key,
        label: labels[key] || key,
        capacity: this._round1(row.capacity),
        generation: this._round1(row.generation)
      })
    }

    var self = this
    var done = arguments.length > 0 && typeof arguments[0] === 'function' ? arguments[0] : null
    this.setData({
      p7Balance: {
        userCount: users.length,
        totalConsumption: this._round1(totalConsumption),
        consumption2030: this._round1(consumption2030),
        totalCapacity: this._round1(totalCapacity),
        totalGeneration: this._round1(totalGeneration),
        byType: byTypeFiltered,
        p7ByTypeList: p7ByTypeList,
        gap: this._round1(gap),
        gapAbs: this._round1(Math.abs(gap)),
        gapType: gapType,
        selfUse: this._round1(selfUse),
        ratio1: this._round1(ratio1),
        ratio2: this._round1(ratio2),
        ratio2Threshold: ratio2Threshold,
        ratio1Pass: ratio1Pass,
        ratio2Pass: ratio2Pass,
        isOffgrid: isOffgrid,
        gridFeedIn: this._round1(gridFeedIn),
        ratio3: ratio3,
        ratio3Pass: ratio3Pass,
        conclusionType: conclusionType,
        conclusionIcon: conclusionIcon,
        conclusionText: conclusionText
      }
    }, function () {
      if (done) done.call(self)
    })
  },

  _collectSuspectWarnings: function () {
    var items = this.data.suspectCheckItems || []
    var check = this.data.appState.suspectCheck || {}
    var warnings = []
    var i
    var j

    for (i = 0; i < items.length; i++) {
      var item = items[i]
      var val = check[item.key]
      var warnOn = item.warnOn || []
      var shouldWarn = false
      if (val === null || val === undefined || val === '') {
        shouldWarn = true
      } else {
        for (j = 0; j < warnOn.length; j++) {
          if (warnOn[j] === val) {
            shouldWarn = true
            break
          }
        }
      }
      if (shouldWarn) {
        warnings.push({ key: item.key, warnMsg: item.warnMsg })
      }
    }
    return warnings
  },

  _calcFinalResults: function () {
    var appState = this.data.appState || {}
    var p7 = this.data.p7Balance || {}
    var projectType = appState.projectType || {}
    var storage = appState.storage || {}
    var totalGeneration = p7.totalGeneration || 0
    var totalConsumption = p7.totalConsumption || 0
    var storageAnnual = storage.hasStorage === true ? (storage.annualStorageEnergy || 0) : 0
    var targetYear = projectType.targetYear
    var gridType = projectType.gridType
    var isOffgrid = gridType === 'offgrid'

    var selfUse = totalGeneration >= totalConsumption ? totalConsumption : totalGeneration
    var selfUseWithStorage = Math.min(selfUse + storageAnnual, totalConsumption)
    var gridFeedIn = totalGeneration > totalConsumption ? totalGeneration - totalConsumption : 0
    var gridFeedInWithStorage = Math.max(totalGeneration - selfUseWithStorage, 0)

    var ratio1 = totalGeneration > 0 ? (selfUseWithStorage / totalGeneration * 100) : 0
    var ratio1Pass = ratio1 >= 60
    var ratio2Threshold = targetYear === 'pre2030' ? 35 : 30
    var ratio2 = totalConsumption > 0 ? (selfUseWithStorage / totalConsumption * 100) : 0
    var ratio2Pass = ratio2 >= ratio2Threshold
    var ratio3 = totalGeneration > 0 ? (gridFeedInWithStorage / totalGeneration * 100) : 0
    var ratio3Pass = ratio3 <= 20

    var storageCalc = this.data.storageCalcResult || {}
    if (storageCalc.show === true) {
      var preview = this.data.p7Preview || {}
      selfUseWithStorage = (p7.selfUse || 0) + (preview.annualStorageEnergy || 0)
      gridFeedInWithStorage = Math.max(totalGeneration - selfUseWithStorage, 0)
      ratio1 = storageCalc.afterRatio1
      ratio1Pass = storageCalc.ratio1Pass
      ratio2 = storageCalc.afterRatio2
      ratio2Pass = storageCalc.ratio2Pass
      ratio2Threshold = p7.ratio2Threshold || ratio2Threshold
      ratio3 = totalGeneration > 0 ? (gridFeedInWithStorage / totalGeneration * 100) : 0
      ratio3Pass = ratio3 <= 20
    }

    var overallPass = ratio1Pass && ratio2Pass && (isOffgrid || ratio3Pass)

    var suggestions = []
    var sugIdx = 1
    var totalCapacity = p7.totalCapacity || 0

    if (!ratio1Pass) {
      var diff1 = this._round1(Math.max(0, 60 - ratio1))
      var shortfall1 = this._round1(Math.max(0, totalGeneration * 0.6 - selfUseWithStorage))
      var reduceMW = 0
      if (totalGeneration > 0 && totalCapacity > 0) {
        reduceMW = this._round1(shortfall1 * totalCapacity / totalGeneration)
      } else if (shortfall1 > 0) {
        reduceMW = this._round1(shortfall1 * 10 / 1400)
      }
      suggestions.push({
        index: sugIdx++,
        text: '指标一未满足门槛（差' + diff1 + '个百分点）：建议减少新能源装机约' + reduceMW +
          ' MW，或增加用电负荷约' + shortfall1 + '万kWh，或增加储能容量'
      })
    }

    if (!ratio2Pass) {
      var diff2 = this._round1(Math.max(0, ratio2Threshold - ratio2))
      var thresholdRatio2 = ratio2Threshold / 100
      var needSelf2 = totalConsumption * thresholdRatio2
      var shortfall2 = this._round1(Math.max(0, needSelf2 - selfUseWithStorage))
      if (totalGeneration < totalConsumption) {
        var maxConsumption2 = this._round1(selfUseWithStorage / thresholdRatio2)
        suggestions.push({
          index: sugIdx++,
          text: '指标二未满足门槛（差' + diff2 + '个百分点）：建议增加新能源装机，使年发电量提升约' + shortfall2 +
            '万kWh，或减少内部用电负荷，使总用电量降低至' + maxConsumption2 + '万kWh以下'
        })
      }
    }

    if (!isOffgrid && !ratio3Pass) {
      var diff3 = this._round1(Math.max(0, ratio3 - 20))
      var maxFeed = totalGeneration * 0.2
      var excessFeed = this._round1(Math.max(0, gridFeedInWithStorage - maxFeed))
      suggestions.push({
        index: sugIdx++,
        text: '指标三未满足门槛（超出' + diff3 + '个百分点）：建议减少新能源装机规模，或增加内部用电负荷约' +
          excessFeed + '万kWh'
      })
    }

    var industryTypes = (appState.projectInfo && appState.projectInfo.industryTypes) || []
    var priorityParts = []
    if (industryTypes.indexOf('computing') >= 0) priorityParts.push('算力设施')
    if (industryTypes.indexOf('hydrogen') >= 0) priorityParts.push('绿色氢氨醇')

    var suspectWarnings = this._collectSuspectWarnings()

    this.setData({
      finalResults: {
        totalGeneration: this._round1(totalGeneration),
        totalConsumption: this._round1(totalConsumption),
        selfUseWithStorage: this._round1(selfUseWithStorage),
        gridFeedInWithStorage: this._round1(gridFeedInWithStorage),
        ratio1: this._round1(ratio1),
        ratio1Pass: ratio1Pass,
        ratio2: this._round1(ratio2),
        ratio2Pass: ratio2Pass,
        ratio2Threshold: ratio2Threshold,
        ratio3: this._round1(ratio3),
        ratio3Pass: ratio3Pass,
        isOffgrid: isOffgrid,
        overallPass: overallPass,
        suggestions: suggestions
      },
      p10SuspectWarnings: suspectWarnings,
      p10SuspectAllClear: suspectWarnings.length === 0,
      p10ShowPriority: priorityParts.length > 0,
      p10PriorityText: priorityParts.join('、')
    })
  },

  onGenerateReport: function () {
    var appState = this.data.appState || {}
    var projectInfo = appState.projectInfo || {}
    var projectType = appState.projectType || {}
    var fr = this.data.finalResults || {}
    var name = projectInfo.name ? String(projectInfo.name).trim() : ''
    var data = {
      generateTime: Date.now(),
      projectName: name || '未命名项目',
      projectType: projectType.gridType || '',
      province: projectInfo.province || '',
      targetYear: projectType.targetYear || '',
      industryTags: projectInfo.industryTypes || [],
      preCheck: {
        q1: appState.preCheck.q1,
        q2: appState.preCheck.q2,
        q3: appState.preCheck.q3,
        q4: appState.preCheck.q4,
        q5: appState.preCheck.q5,
        q6: appState.preCheck.q6
      },
      suspectCheck: {
        q1: appState.suspectCheck.q1,
        q2: appState.suspectCheck.q2,
        q3: appState.suspectCheck.q3,
        q4: appState.suspectCheck.q4,
        q5: appState.suspectCheck.q5
      },
      userCount: (appState.users || []).length,
      users: (appState.users || []).map(function (u) {
        return {
          name: u.name || '',
          industry: u.industry || '',
          otherIndustry: u.otherIndustry || '',
          annualConsumption: u.annualConsumption || 0,
          consumption2030: u.consumption2030 || 0,
          hasRooftop: u.hasRooftop || false,
          rooftopOwner: u.rooftopOwner || '',
          rooftopStructure: u.rooftopStructure || '',
          rooftopStructureCustom: u.rooftopStructureCustom || '',
          rooftopCapacity: u.rooftopCapacity || 0,
          rooftopHours: u.rooftopHours || 0,
          rooftopGeneration: u.rooftopGeneration || 0
        }
      }),
      energySources: (appState.energySources || []).map(function (s) {
        return {
          type: s.type || '',
          capacity: s.capacity || 0,
          annualHours: s.hours || 0,
          annualGeneration: s.generation || 0,
          projectStatus: s.isExisting || ''
        }
      }),
      hasStorage: (appState.storage && appState.storage.hasStorage) || false,
      storagePower: (appState.storage && appState.storage.power) || 0,
      storageCapacity: (appState.storage && appState.storage.capacity) || 0,
      storageCycles: (appState.storage && appState.storage.cyclesPerDay) || 0,
      storagedays: (appState.storage && appState.storage.operateDays) || 0,
      annualStorageEnergy: (appState.storage && appState.storage.annualStorageEnergy) ||
        (this.data.p7Preview && this.data.p7Preview.annualStorageEnergy) || 0,
      totalConsumption: fr.totalConsumption,
      totalGeneration: fr.totalGeneration,
      selfUse: fr.selfUseWithStorage,
      gap: (this.data.p7Balance && this.data.p7Balance.gap) ||
        (this.data.p7Preview && this.data.p7Preview.gap) || 0,
      gapType: (this.data.p7Balance && this.data.p7Balance.gapType) ||
        (this.data.p7Preview && this.data.p7Preview.gapKind) || '',
      ratio1: fr.ratio1,
      ratio1Pass: fr.ratio1Pass,
      ratio2: fr.ratio2,
      ratio2Pass: fr.ratio2Pass,
      ratio2Threshold: fr.ratio2Threshold,
      ratio3: fr.ratio3,
      ratio3Pass: fr.ratio3Pass,
      isOffgrid: fr.isOffgrid,
      overallPass: fr.overallPass,
      suggestions: fr.suggestions || [],
      suspectWarnings: this.data.p10SuspectWarnings || []
    }
    try {
      wx.setStorageSync('yuanliu_report_latest', data)
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
      return
    }
    wx.switchTab({ url: '/pages/report/index' })
  },

  onRequestAIReport: function () {
    wx.showModal({
      title: '获取AI深度分析报告',
      content: '请添加源流顾问微信，获取服务后即可使用AI深度分析功能。顾问将在工作时间内为您提供专业服务。',
      confirmText: '联系顾问',
      cancelText: '稍后再说',
      confirmColor: '#D6A84F',
      success: function (res) {
        if (!res.confirm) return
        wx.setClipboardData({
          data: '源流绿电顾问微信号：[预留占位WEIXIN_ID]',
          success: function () {
            wx.showToast({ title: '微信号已复制，请添加顾问', icon: 'none' })
          }
        })
      }
    })
  },

  _refreshP9Display: function () {
    var items = this.data.suspectCheckItems || []
    var check = this.data.appState.suspectCheck || {}
    var warnings = []
    var i
    var j
    var userOpts = this.data.userIndustryOptions || []
    var typeLabels = this.data.energyTypeLabels || {}
    var users = this.data.appState.users || []
    var sources = this.data.appState.energySources || []
    var p9UserList = []
    var p9EnergyList = []

    for (i = 0; i < users.length; i++) {
      var u = users[i]
      var indLabel = '—'
      for (j = 0; j < userOpts.length; j++) {
        if (userOpts[j].value === u.industry) {
          indLabel = userOpts[j].label
          break
        }
      }
      p9UserList.push({
        id: u.id,
        name: u.name || '未填写',
        industryLabel: indLabel,
        annualConsumption: u.annualConsumption || '—'
      })
    }

    for (i = 0; i < sources.length; i++) {
      var s = sources[i]
      p9EnergyList.push({
        id: s.id,
        typeLabel: typeLabels[s.type] || s.type || '其他',
        capacity: s.capacity || '—',
        generation: s.generation != null ? s.generation : 0
      })
    }

    warnings = this._collectSuspectWarnings()

    var industryList = this.data.industryList || []
    var types = this.data.appState.projectInfo.industryTypes || []
    var tags = []
    for (i = 0; i < types.length; i++) {
      var found = false
      for (j = 0; j < industryList.length; j++) {
        if (industryList[j].value === types[i]) {
          tags.push(industryList[j].label)
          found = true
          break
        }
      }
      if (!found) tags.push(types[i])
    }

    this.setData({
      p9SuspectWarnings: warnings,
      p9SuspectAllClear: warnings.length === 0,
      p9IndustryTags: tags,
      p9UserList: p9UserList,
      p9EnergyList: p9EnergyList
    })
  },

  _refreshP7: function (storagePatch) {
    var storage = Object.assign({}, this.data.appState.storage || {}, storagePatch || {})
    var preview = this._calcP7Preview(storage)
    storage.annualStorageEnergy = storage.hasStorage === true ? preview.annualStorageEnergy : 0
    this.setData({
      'appState.storage': storage,
      p7Preview: preview
    })
  },

  onSelectHasStorage: function (e) {
    var value = e.currentTarget.dataset.value
    var storage = Object.assign({}, this.data.appState.storage)
    storage.hasStorage = value === 'yes'
    if (!storage.hasStorage) {
      storage.annualStorageEnergy = 0
    }
    this._refreshP7(storage)
  },

  onStorageInput: function (e) {
    var field = e.currentTarget.dataset.field
    if (!field) return
    var patch = {}
    patch[field] = e.detail.value
    var storage = Object.assign({}, this.data.appState.storage, patch)
    this._refreshP7(patch)
    var preview = this._calcP7Preview(storage)
    this.setData({ p7Preview: preview })
  },

  onStorageCyclesChange: function (e) {
    var delta = Number(e.currentTarget.dataset.delta)
    if (isNaN(delta)) return
    var storage = Object.assign({}, this.data.appState.storage)
    var cycles = parseFloat(storage.cyclesPerDay)
    if (isNaN(cycles)) cycles = 1
    cycles = this._round1(cycles + delta)
    cycles = Math.max(0.5, Math.min(2, cycles))
    storage.cyclesPerDay = cycles
    this._refreshP7(storage)
    var preview = this._calcP7Preview(storage)
    this.setData({ p7Preview: preview })
  },

  onStorageOperateDaysChange: function (e) {
    var delta = Number(e.currentTarget.dataset.delta)
    if (isNaN(delta)) return
    var storage = Object.assign({}, this.data.appState.storage)
    var days = parseFloat(storage.operateDays)
    if (isNaN(days)) days = 300
    days = Math.round(days + delta)
    days = Math.max(200, Math.min(365, days))
    storage.operateDays = days
    this._refreshP7(storage)
    var preview = this._calcP7Preview(storage)
    this.setData({ p7Preview: preview })
  },

  onCalcStorage: function () {
    var balance = this.data.p7Balance || {}
    var preview = this.data.p7Preview || {}
    var selfBefore = balance.selfUse || 0
    var totalGen = balance.totalGeneration || 0
    var totalCons = balance.totalConsumption || 0
    var storageExtra = preview.annualStorageEnergy || 0
    var threshold = balance.ratio2Threshold || 35

    var selfAfter = selfBefore + storageExtra
    var afterRatio1 = totalGen > 0 ? this._round1(selfAfter / totalGen * 100) : 0
    var afterRatio2Raw = totalCons > 0 ? (selfAfter / totalCons * 100) : 0
    var afterRatio2 = this._round1(Math.min(afterRatio2Raw, 100))

    this.setData({
      storageCalcResult: {
        show: true,
        beforeRatio1: balance.ratio1 || 0,
        beforeRatio2: balance.ratio2 || 0,
        afterRatio1: afterRatio1,
        afterRatio2: afterRatio2,
        ratio1Pass: afterRatio1 >= 60,
        ratio2Pass: afterRatio2 >= threshold
      }
    })
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
    var prev = this._screenIndex()
    var cur = typeof screen === 'number' ? screen : prev
    cur = Math.max(0, Math.min(10, Math.floor(cur)))
    if (cur === 5) this._ensureP5Users()
    if (cur === 6) this._ensureP6Sources()
    if (cur === 7) this._refreshP7Balance()
    if (cur === 8) this._refreshP7()
    if (cur === 9) {
      var self = this
      this._refreshP7Balance(function () {
        self._refreshP9Display()
      })
    }
    if (cur === 10) {
      var self10 = this
      this._refreshP7({})
      this._refreshP7Balance(function () {
        self10._calcFinalResults()
      })
    }
    var progressPercent = cur === 0 ? 0 : Math.round((cur / 10) * 100)
    var progressText = cur === 0 ? '' : '第' + cur + '步，共10步'
    var screenChanged = cur !== prev
    this.setData({
      currentScreen: cur,
      progressPercent: progressPercent,
      progressText: progressText
    }, function () {
      if (screenChanged) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        })
      }
    })
  }
})
