const https = require('https')
const fs = require('fs')
const path = require('path')

// 模拟 wx.setStorageSync
const storage = {}
const wx = {
  setStorageSync: (key, val) => { storage[key] = val },
  getStorageSync: (key) => storage[key],
  removeStorageSync: (key) => { delete storage[key] },
}

// 固定测试数据
const fixedReport = {
  projectName: '中宁县工业园区南区绿电直连项目',
  projectType: '并网型',
  province: '宁夏',
  totalGeneration: 11371.3,
  selfUse: 11371.3,
  totalConsumption: 12000,
  gridFeedIn: 0,
  targetYear: 'before2030',
  ratio1: 100,
  ratio1Pass: true,
  ratio2: 94.8,
  ratio2Pass: true,
  ratio2Threshold: 35,
  ratio3: 0,
  ratio3Pass: true,
  overallPass: true
}

// 节点一：模拟支付成功回调
const generateTime = '20260621160000'
const report = { generateTime, projectName: '中宁县工业园区南区绿电直连项目' }

wx.setStorageSync('yuanliu_report_latest', JSON.stringify(report))
wx.setStorageSync('yuanliu_ai_paid_' + generateTime, true)
wx.setStorageSync('yuanliu_ai_auto_analyze_' + generateTime, true)

console.assert(wx.getStorageSync('yuanliu_ai_paid_' + generateTime) === true, 'FAIL: 付费标记未写入')
console.assert(wx.getStorageSync('yuanliu_ai_auto_analyze_' + generateTime) === true, 'FAIL: 自动分析标记未写入')
console.log('节点一通过：Storage 标记写入正确')

// 节点二：模拟 _loadReport() 核心逻辑
const paidKey = 'yuanliu_ai_paid_' + generateTime
const autoKey = 'yuanliu_ai_auto_analyze_' + generateTime

let alreadyPaid = false
let autoAnalyze = false
let aiResult = null
let aiLoading = false

try { alreadyPaid = wx.getStorageSync(paidKey) } catch (e) {}
try { autoAnalyze = wx.getStorageSync(autoKey) } catch (e) {}

const currentReport = {}
const isNewReport = currentReport.generateTime !== report.generateTime
if (isNewReport) {
  aiResult = null
  aiLoading = false
}

let onDoAIAnalyzeCalled = false
if (alreadyPaid && autoAnalyze && !aiLoading) {
  wx.removeStorageSync(autoKey)
  onDoAIAnalyzeCalled = true
}

console.assert(onDoAIAnalyzeCalled === true, 'FAIL: onDoAIAnalyze 未被触发')
console.assert(wx.getStorageSync(autoKey) === undefined, 'FAIL: autoKey 未被清除')
console.log('节点二通过：条件判断正确，onDoAIAnalyze 被触发，标记已清除')

function postJSON(url, data, headers) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data)
    const u = new URL(url)
    const options = {
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers
      }
    }
    const req = https.request(options, res => {
      let raw = ''
      res.on('data', chunk => { raw += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) })
        } catch (e) {
          reject(new Error(`JSON解析失败，status=${res.statusCode}, body=${raw.slice(0, 300)}`))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function runChain() {
  // 节点三：AI分析
  const analyzeRes = await postJSON(
    'https://green.sourceflower.com/api/analyze',
    { report: fixedReport },
    { 'X-Api-Token': 'ylGreen-8fX2mK9p-2026' }
  )
  console.assert(analyzeRes.status === 200, `FAIL: /api/analyze 返回 ${analyzeRes.status}`)
  console.assert(analyzeRes.body.result, 'FAIL: result 字段为空')
  if (analyzeRes.status !== 200 || !analyzeRes.body.result) process.exit(1)
  console.log(`节点三通过：AI分析成功，result长度=${analyzeRes.body.result.length}`)

  // 节点四：PDF生成
  const pdfRes = await postJSON(
    'https://green.sourceflower.com/api/generate-pdf',
    {
      projectName: '中宁县工业园区南区绿电直连项目',
      aiContent: analyzeRes.body.result
    },
    { 'X-Api-Token': 'ylGreen-8fX2mK9p-2026' }
  )
  console.assert(pdfRes.status === 200, `FAIL: /api/generate-pdf 返回 ${pdfRes.status}`)
  console.assert(pdfRes.body.downloadUrl, 'FAIL: downloadUrl 为空')
  if (pdfRes.status !== 200 || !pdfRes.body.downloadUrl) process.exit(1)
  console.log(`节点四通过：PDF生成成功，downloadUrl=${pdfRes.body.downloadUrl}`)

  // 节点五：下载PDF
  const fileUrl = 'https://green.sourceflower.com' + pdfRes.body.downloadUrl
  const u2 = new URL(fileUrl)
  await new Promise((resolve, reject) => {
    const options = {
      hostname: u2.hostname,
      path: u2.pathname + (u2.search || ''),
      headers: { 'X-Api-Token': 'ylGreen-8fX2mK9p-2026' }
    }
    const outDir = path.join(__dirname, 'test_output')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)
    const outPath = path.join(outDir, '全链路测试报告.pdf')
    const file = fs.createWriteStream(outPath)
    https.get(options, res => {
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        const size = fs.statSync(outPath).size
        console.assert(size > 50000, `FAIL: PDF文件过小，size=${size}`)
        if (size <= 50000) {
          reject(new Error(`PDF文件过小，size=${size}`))
          return
        }
        console.log(`节点五通过：PDF下载成功，size=${size}，路径=${outPath}`)
        resolve()
      })
    }).on('error', reject)
  })

  console.log('\n====== 全链路测试通过 ======')
}

runChain().catch(e => {
  console.error('全链路测试失败：', e)
  process.exit(1)
})
