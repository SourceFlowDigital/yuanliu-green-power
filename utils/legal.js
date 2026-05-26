/**
 * 合规：同意门禁、撤回与再授权（产品免费开放，无访客/完整区分）
 */

var KEYS = require('./storageKeys.js')

const LEGAL_BUNDLE_VERSION = '1.0.1'

function needsLegalGate() {
  try {
    return wx.getStorageSync(KEYS.HAS_AGREED) !== '1'
  } catch (e) {
    return true
  }
}

/** 未完成同意门禁时跳转欢迎页；用于 Tab 根页 onShow 兜底 */
function relaunchToConsentIfNeeded() {
  if (!needsLegalGate()) return false
  wx.reLaunch({ url: '/pages/consent/consent' })
  return true
}

function isVisitorMode() {
  return false
}

function hydrateApp(app) {
  if (!app.globalData) app.globalData = {}
  app.globalData.isVisitorMode = false
}

function markAgreed() {
  try {
    wx.setStorageSync(KEYS.HAS_AGREED, '1')
    wx.setStorageSync(KEYS.LEGAL_BUNDLE_VERSION, LEGAL_BUNDLE_VERSION)
    wx.removeStorageSync(KEYS.VISITOR)
  } catch (e) {}
}

/** @deprecated 请使用 markAgreed */
function finishLegalGate() {
  markAgreed()
}

function syncVisitorToApp() {
  const app = getApp()
  hydrateApp(app)
}

function clearLocalConsentFlags() {
  try {
    wx.removeStorageSync(KEYS.HAS_AGREED)
    wx.removeStorageSync(KEYS.LEGAL_BUNDLE_VERSION)
    wx.removeStorageSync(KEYS.VISITOR)
    wx.removeStorageSync(KEYS.SUBSCRIBE_PURPOSE_OK)
    wx.removeStorageSync(KEYS.SUBSCRIBE_PURPOSE_DISMISS)
    wx.removeStorageSync(KEYS.SUBSCRIBE_PREFS)
  } catch (e) {}
}

function hasSubscribePurposeConsent() {
  try {
    return wx.getStorageSync(KEYS.SUBSCRIBE_PURPOSE_OK) === '1'
  } catch (e) {
    return false
  }
}

function setSubscribePurposeConsent(ok) {
  try {
    if (ok) wx.setStorageSync(KEYS.SUBSCRIBE_PURPOSE_OK, '1')
    else wx.removeStorageSync(KEYS.SUBSCRIBE_PURPOSE_OK)
  } catch (e) {}
}

module.exports = {
  LEGAL_BUNDLE_VERSION,
  needsLegalGate,
  relaunchToConsentIfNeeded,
  isVisitorMode,
  hydrateApp,
  markAgreed,
  finishLegalGate,
  syncVisitorToApp,
  clearLocalConsentFlags,
  hasSubscribePurposeConsent,
  setSubscribePurposeConsent,
}
