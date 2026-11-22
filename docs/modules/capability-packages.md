# 第15章　通话、社交、文档与其他能力包

最后核验：2026-11-22（Asia/Shanghai）。

## 分组导航

下列 package.json 是确认包身份、导出与检查命令的事实入口；进入对应 src 再定位 activate/manifest/main/renderer，不假设所有包结构完全相同。

| 能力 | 入口 |
| --- | --- |
| 音视频通话、来电窗口 | [app-call](../../packages/app-call/package.json) |
| 圈子 / 社交动态 | [app-circle](../../packages/app-circle/package.json)、[app-moment](../../packages/app-moment/package.json) |
| 文档窗口（不等于外置 online 包） | [app-doc](../../packages/app-doc/package.json) |
| 音频、图片、视频预览 | [app-audio](../../packages/app-audio/package.json)、[app-image](../../packages/app-image/package.json)、[app-video](../../packages/app-video/package.json) |
| 搜索 / 验证窗口 | [app-search](../../packages/app-search/package.json) |
| 设置 / 更新 / 关于 | [app-settings](../../packages/app-settings/package.json)、[app-updater](../../packages/app-updater/package.json)、[app-about](../../packages/app-about/package.json) |
| 工作台 | [app-workbench](../../packages/app-workbench/package.json) |

## 装配与依赖

[activate-plugins.ts](../../src/main/plugin/activate-plugins.ts) 依 pluginLoaders 加载、核对 manifest.id、激活并收集 application/extraApplications；单包激活失败记录并隔离。
[catalog.ts](../../build/plugin/catalog.ts) 定义 enabled/optional/root/preload/renderer，[discovery.ts](../../build/plugin/discovery.ts) 构建期生成虚拟模块；不能把目录存在视为已经启用。
[平台契约](../../packages/beaver/src/main/index.ts) 连接宿主与能力包；[vite.apps.ts](../../vite.apps.ts) 处理宿主 HTML 和开发窗口路由。
主进程可注册本域表/同步/WS/IPC/MCP；渲染窗口使用平台接口。主窗组合侧的 store/API 不为“统一”而搬入能力包。
外置 @beaver-im/app-ai 与 @beaver-im/app-online 不在 packages/* 内，见[架构](../architecture.md)；不要把 app-doc 当作 online 全部实现。

## 定位关键词与典型改动

manifest、activate、pluginLoaders、createBrowserWindow、extraApplications、getPluginApplication。
新增能力时核对包导出、清单/装配、主进程注册、preload、窗口 HTML 路由、构建/资源以及关闭清理。
通话查 LiveKit 和信令调用方；社交查本域 API/同步/通知；预览查文件协议/媒体资源；更新查下载与安装权限。
边界约束见 [ADR 0001](../decisions/0001-capability-boundaries.md)。

## 验证方式

先在目标包目录核对 package.json 的 build 脚本，再执行相应 pnpm --filter <真实包名> run build。
跨宿主桥或平台导出再验证共享平台、宿主 main 和 renderer；需要时按[矩阵](../workflow.md)核对外置包。
行为检查：开/关/重开、传参、登录状态改变、注册解除、激活失败隔离、资源路径、不同平台窗口行为。
构建不是上述运行时行为的自动证明。

---
[返回《海狸桌面端工程手册》全书目录](../README.md)
