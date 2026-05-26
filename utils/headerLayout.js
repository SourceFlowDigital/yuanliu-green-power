/**
 * 与政策页一致的自定义顶栏高度（状态栏 + 导航内容区）
 */
function measureHeader() {
  const sys = wx.getSystemInfoSync()
  const sb = sys.statusBarHeight || 20
  const winW = sys.windowWidth || 375
  let nav = 44
  try {
    const m = wx.getMenuButtonBoundingClientRect()
    if (m && typeof m.top === 'number' && typeof m.height === 'number') {
      nav = Math.max(0, m.top - sb) * 2 + m.height
    }
  } catch (e) {}
  const logoPxApprox = Math.ceil((156 / 750) * winW)
  const vPadPx = Math.ceil((104 / 750) * winW)
  nav = Math.ceil(Math.max(nav, logoPxApprox + vPadPx + 10))
  return {
    statusBarHeight: sb,
    navBarHeight: nav,
    headerHeight: sb + nav
  }
}

module.exports = {
  measureHeader
}
