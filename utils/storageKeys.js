/**
 * 本地 Storage key 集中定义（勿随意改名，避免丢失登录态与用户数据）
 *
 * 命名与业务约定对齐；身份类 key 保持与 identityCore 历史一致。
 */
module.exports = {
  OPENID: 'rj_identity_openid',
  AUTH_GRANT: 'rj_identity_auth_grant_v1',
  SOFT_REJECTED: 'rj_soft_header_strip_rejected',
  SECURE_UID: '__secure_uid',
  LAST_RECOVER: 'rj_identity_last_recover_ms',

  LEGAL_BUNDLE_VERSION: 'rj_legal_bundle_v',
  HAS_AGREED: 'rj_has_agreed',
  VISITOR: 'rj_visitor',

  SEARCH_HISTORY: 'rj_search_history',
  LEGACY_SEARCH_HISTORY: 'search_history',
  USER_PREFERENCES: 'user_preferences',

  FAV_KEY: 'rj_detail_policy_favs',
  REMIND_KEY: 'rj_detail_policy_reminds',

  SUBSCRIBE_PURPOSE_OK: 'rj_subscribe_purpose_ok',
  SUBSCRIBE_PURPOSE_DISMISS: 'rj_subscribe_purpose_dismiss',
  SUBSCRIBE_PREFS: 'rj_subscribe_prefs',
}
