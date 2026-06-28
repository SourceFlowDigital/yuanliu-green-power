# 源流直连 · 总控台
> AI进入项目后必读

最后更新：2026-06-28

## 项目基本信息
源流直连当前为源流绿电直连自测工具，面向新能源项目开发、EPC 和用电企业能源管理场景，提供浏览器端绿电直连可行性自测、合规测算和报告打印能力。

## 当前状态
运行中、维护中。项目为单文件 SPA，GitHub Pages 部署，当前仓库 `main` 分支记录到 `4a8698a`。

## 与yuanliu-hub关系
未发现已接管记录。后续如接入 `yuanliu-hub`，重点是静态入口、统一导航、品牌路径和托管方式。

## 关键配置
- 应用入口：`index.html`
- 图表依赖：Chart.js 3.9.1 CDN
- 静态资源：`logo.png`
- 部署：GitHub Pages
- 在线地址：`https://minshu-liu.github.io/yuanliu-green-power/`
- 数据库：无
- 后端：无

## 阻塞与待决事项
- 微信内置浏览器实测尚需执行。
- 屋顶重构后需端到端验算，与旧版同参数结果差异需确认。
- 是否将 Sourceflower 正式路径 `sourceflower.com/yuanliu-green-power` 接入需 Sam 决策。
- 是否为 Chart.js 做离线 fallback 需 Sam 决策。

## 读取顺序
1. 本文件（INDEX.md）
2. NEXT-SESSION.md
3. CLAUDE.md（完整技术上下文）
