/**
 * 通用工具 · iOS 宿主识别
 * 以 wx.getSystemInfoSync().platform 为准；异常时降级为非 iOS。
 */
function isIOS() {
  try {
    var info = wx.getSystemInfoSync() || {}
    var p = (info.platform || '').toLowerCase()
    return p === 'ios'
  } catch (e) {
    return false
  }
}

module.exports = {
  isIOS,
}
