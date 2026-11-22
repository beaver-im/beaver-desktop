# 第四篇　模块参考与定位索引

最后核验：2026-11-22（Asia/Shanghai）。从任务类型选一两页，不必全部加载。

| 问题 / 变更 | 指南 | 首选关键词 |
| --- | --- | --- |
| 启动、登录、多窗口、IPC | [运行时](runtime-ipc.md) | Main、activatePlugins、bridgeInvoke |
| 消息发送失败、ACK、漏消息、补齐、本地库 | [消息/同步/存储](messaging-sync-storage.md) | sendMessage、handleAck、autoSync |
| 主窗口聊天、好友、群、表情、通知 | [渲染 IM](renderer-im.md) | notificationManager、conversation、pinia |
| 通话、圈子、动态、文档、预览、设置、更新 | [能力包](capability-packages.md) | manifest、activate、createBrowserWindow |
| 平台 API、共享组件、依赖边界 | [共享平台](shared-platform.md) | bindMain、getWsHandler、getRegisteredDataSync |
| AI 面板、独立 AI 窗、MCP、工具执行 | [AI/工具](ai-tools.md) | getMcpManager、callTool、reportCapabilities |
| 本地开发、构建、外置包、安装包 | [构建](build-release.md) | htmlInputs、pluginLoaders、build:packages |

方法：文件名/符号精确检索 → 定点读取 → 追到必要调用方与契约 → 验证。
可用工具自带检索；系统有 rg 时使用 rg，没有时可用 PowerShell Select-String。
不要把 node_modules、dist、release、日志、缓存的重复文本当成源代码实现。
接口跨度超过一页时回看[架构](../architecture.md)，并在交接中记录实际追到的文件。

---
[返回《海狸桌面端工程手册》全书目录](../README.md)
