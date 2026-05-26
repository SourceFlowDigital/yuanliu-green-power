var TAB_LIST_BASE = [
  {
    url: '/pages/green-direct/index',
    text: '自测',
    unicode: '',
  },
  {
    url: '/pages/about/index',
    text: '关于',
    unicode: '',
  },
]

var TAB_BAR_PAGE_URLS = TAB_LIST_BASE.map(function (it) {
  return it.url
})

function cloneTabListForData() {
  return TAB_LIST_BASE.map(function (item) {
    return {
      url: item.url,
      text: item.text,
      unicode: item.unicode,
    }
  })
}

module.exports = {
  TAB_LIST_BASE: TAB_LIST_BASE,
  TAB_BAR_PAGE_URLS: TAB_BAR_PAGE_URLS,
  cloneTabListForData: cloneTabListForData,
}
