# 第1章　系统全貌：宿主、平台和能力包

最后核验：2026-11-22（Asia/Shanghai）。本页是导航和现状，不推断未验证的后端实现。

## 层次与依赖

```text
主窗口/登录窗口 renderer ── preload/IPC ── 宿主 main
       │                                      │
       ├─ HTTP API 封装                        ├─ WS / MessageManager
       └─ Pinia / 通知消费                     ├─ business / DataSync / SQLite
                                              └─ bindMain + activatePlugins
                                                        │
                              @beaver-im/beaver 契约 ← 能力包 main / 独立窗口
```

- 启动：[main.ts](../src/main/main.ts)；宿主绑定 [bind.ts](../src/main/plugin/bind.ts)，能力装配 [activate-plugins.ts](../src/main/plugin/activate-plugins.ts)。
- 启动文件先 bind 平台实现；beforeAppReady 中激活插件、初始化 MCP、MessageManager 与 IPC。修改顺序应读完整函数，不仅看 import 顺序。
- 能力名单先由 [catalog.ts](../build/plugin/catalog.ts) 与 [discovery.ts](../build/plugin/discovery.ts) 构建期生成，再交给运行时 activate；enabled=false/optional 缺失与运行时激活报错是不同阶段。
- `src/main`：窗口、登录、系统能力、核心 IM 业务/本地存储/连接；`src/preload`：窄接口桥接；`src/render`：UI 与主窗组合。
- `src/common`：宿主跨进程类型/工具，不等于所有能力包的公共实现。
- [packages/beaver](../packages/beaver/package.json)：平台 common/main/renderer 分层导出与运行时绑定。
- [packages/beaver-biz](../packages/beaver-biz/package.json)：复用业务组件；[packages/beaver-ui](../packages/beaver-ui/package.json)：基础 UI。
- `packages/app-*`：能力窗口闭环，主窗中对该能力的入口/名片/薄 API 不因此都搬进包。

## 核心数据流

### 登录与启动

从 [登录窗口](../src/render/windows/login/main.ts)、[登录应用](../src/main/application/login.ts)、[auth IPC](../src/main/ipc/render-to-main/auth) 追踪。
账号会话、用户库和连接的切换顺序需要一起验证；不要把 UI 跳转当登录完成。

### 发送、接收和本地读取

[MessageBusiness](../src/main/business/chat/message.ts) 处理本地发送状态并调用 [WsManager](../src/main/ws-manager/index.ts)。
[MessageManager](../src/main/message-manager/index.ts) 分发命令、ACK 和能力包注册处理器；具体接收器维护本域数据和通知。
SQLite/Drizzle 实例从 [db.ts](../src/main/database/db.ts) 进入，具体表、service、business 分层追踪。
窗口通过 IPC/通知和本地业务读取呈现结果，另有 HTTP API 封装；不能假设所有请求均走 WS 或所有 UI 都直读数据库。

### 重连与一致性

连接成功触发 [DataSyncManager.autoSync](../src/main/datasync/manager.ts)。同步期间普通 WS 消息暂存；流式帧走例外分支不入同步队列。
完成后消费消息队列，并尝试上报本机 MCP 能力。同步域包含用户、会话消息、好友、群、表情、通知与包注册的同步项。
修改一致性时必须同时查看版本/游标、幂等写入、通知和失败恢复；细节看[消息指南](modules/messaging-sync-storage.md)。

### AI 和扩展

主窗 AI 面板在宿主，独立 AI 窗口在外置能力包；MCP/本机工具由 main 管理。
个人助手与机器人身份边界需按当前消息/Agent 协议核实；设计说明不能代替已有测试证明。

## 跨仓依赖（只说明集成边界）

事实来自 [package.json](../package.json)、[pnpm-workspace.yaml](../pnpm-workspace.yaml)、[vite.apps.ts](../vite.apps.ts)。

| 对端 | 本仓关系 | 修改时需要确认 |
| --- | --- | --- |
| ../beaver-desktop-package/beaver-desktop-ai | link 依赖 @beaver-im/app-ai；build:ai 构建 | 独立 main/preload/renderer 导出、通知与宿主面板契约同步（不留旧接口兼容层） |
| ../beaver-desktop-package/beaver-desktop-online | link 依赖 @beaver-im/app-online；build:online 构建 | 独立文档应用契约及包内测试 |
| beaver-server 及各拆分服务 | HTTP/WS 远端，非本工作区编译依赖 | 类型、错误码、鉴权、流式帧和序列语义 |
| beaver-sdk | 本仓依赖 @beaver-im/js-sdk 发布包 | OAuth 回调和实际安装版本，不假设总连同级源码 |
| beaver-flutter | 独立客户端，共享服务端协议 | 协议变更时同步对齐各端实现与同步行为，不保留旧协议兼容层 |

发现层次混杂、冗余结构或废弃接口时按第2章直接整改并删除旧路径，不加兼容适配壳；同级仓库可能缺失，克隆本仓不保证能完整构建外置功能，不擅自复制同名目录代替。
远端 AI/社交/通话/在线文档的内部实现不属于本页已核验范围。

## 工程入口与已知限制

- Vite 别名及宿主 HTML：[vite.apps.ts](../vite.apps.ts)；环境/构建模式：[vite.config.ts](../vite.config.ts)。
- workspace 只声明根与 packages/*，turbo 构建依赖与输出看 [turbo.json](../turbo.json)。
- 根 package.json 与 VERSION 曾不一致；发布时核对，不在架构页固化版本号。
- 当前没有根 test 脚本；自动化覆盖不能从依赖名或构建成功推出。
- 详见[验证矩阵](workflow.md)与[模块导航](modules/README.md)。

---
[返回《海狸桌面端工程手册》全书目录](README.md)
