var headerLayout = require('../../utils/headerLayout.js')

function parseStep1Data(options) {
  if (!options || !options.data) return {}
  try {
    return JSON.parse(decodeURIComponent(options.data))
  } catch (e) {
    return {}
  }
}

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    step1Data: {},
    formData: {
      installedCapacity: '',
      annualHours: '',
      efficiency: '80',
      annualLoad: '',
      loadType: '',
      hasStorage: 'no',
      storageCapacity: '',
      storageDuration: ''
    }
  },

  onLoad: function (options) {
    var layout = headerLayout.measureHeader()
    this.setData({
      statusBarHeight: layout.statusBarHeight,
      navBarHeight: layout.navBarHeight,
      headerHeight: layout.headerHeight,
      step1Data: parseStep1Data(options)
    })
  },

  onInput: function (e) {
    var field = e.currentTarget.dataset.field
    var value = e.detail && e.detail.value ? e.detail.value : ''
    var patch = {}
    patch['formData.' + field] = value
    this.setData(patch)
  },

  onSelect: function (e) {
    var field = e.currentTarget.dataset.field
    var value = e.currentTarget.dataset.value
    var patch = {}
    patch['formData.' + field] = value
    this.setData(patch)
  },

  onPrev: function () {
    wx.navigateBack({ delta: 1 })
  },

  onNext: function () {
    var form = this.data.formData
    if (!form.installedCapacity) {
      wx.showToast({ title: '请输入装机容量', icon: 'none' })
      return
    }
    if (!form.annualLoad) {
      wx.showToast({ title: '请输入年总用电量', icon: 'none' })
      return
    }
    var payload = {
      step1: this.data.step1Data,
      step2: form
    }
    wx.navigateTo({
      url: '/pages/green-direct/step3?data=' + encodeURIComponent(JSON.stringify(payload))
    })
  }
})
