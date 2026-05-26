Page({
  data: {
    payload: {}
  },

  onLoad: function (options) {
    var payload = {}
    if (options && options.data) {
      try {
        payload = JSON.parse(decodeURIComponent(options.data))
      } catch (e) {
        payload = {}
      }
    }
    this.setData({ payload: payload })
  }
})
