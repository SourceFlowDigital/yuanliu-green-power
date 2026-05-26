var headerLayout = require('../../utils/headerLayout.js')

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 88,
    headerHeight: 0,
    formData: {
      projectName: '',
      projectType: '',
      energyType: '',
      userType: '',
      targetYear: 'pre2030'
    }
  },

  onLoad: function () {
    this.setData(headerLayout.measureHeader())
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

  onNext: function () {
    var form = this.data.formData
    if (!form.projectType) {
      wx.showToast({ title: '请选择项目类型', icon: 'none' })
      return
    }
    if (!form.energyType) {
      wx.showToast({ title: '请选择新能源类型', icon: 'none' })
      return
    }
    if (!form.userType) {
      wx.showToast({ title: '请选择用户类型', icon: 'none' })
      return
    }
    wx.showToast({ title: 'Step2开发中', icon: 'none' })
  }
})
