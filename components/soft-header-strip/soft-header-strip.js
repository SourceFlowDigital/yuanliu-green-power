const identityCore = require('../../utils/identityCore.js')

Component({
  observers: {
    /** Behavior 式观察：alive 切换时同步占位高度，避免宿主再算一遍 */
    alive: function (v) {
      var rpx =
        v === true ? Number(this.data.stripTotalRpx) || 0 : 0
      this.triggerEvent('stripreserve', { reserveRpx: rpx })
    },
  },
  data: {
    /** 占位总高度：壳层固定；「稍后」只隐藏内层文案，占位不变 */
    stripTotalRpx: 132,
    alive: false,
    showChrome: false,
  },
  pageLifetimes: {
    show: function () {
      this.refresh()
    },
  },
  lifetimes: {
    attached: function () {
      this.refresh()
    },
  },
  methods: {
    refresh: function () {
      var app = getApp()
      if (!app) return

      var want = !!identityCore.shouldShowSoftGuideStrip(app)
      if (!want) {
        if (this.data.alive) {
          this.setData({ alive: false, showChrome: false })
        }
        return
      }

      var chrome = !this.data.alive ? true : !!this.data.showChrome
      this.setData({
        alive: true,
        showChrome: chrome,
      })
    },

    onRejectSoft: function () {
      identityCore.markSoftHeaderRejectedAndDestroy()
      this.setData({ alive: false, showChrome: false })
      this.triggerEvent('stripreject')
    },

    /** 占位不变，仅隐藏引导文案（像素级占位） */
    onLaterSoft: function () {
      this.setData({ showChrome: false })
    },

    onExpandSoft: function () {
      this.setData({ showChrome: true })
    },

    onPhoneAuth: function (e) {
      var msg = e.detail && e.detail.errMsg ? String(e.detail.errMsg) : ''
      if (msg.indexOf('getPhoneNumber:ok') !== 0) return
      identityCore.triggerActiveEnrichAfterAuth('phone')
      this.refresh()
    },

    noop: function () {},
  },
})
