# 术语

[返回全书目录](README.md)

本表只收**跨章高频且易混淆**的名词，同一术语只在这里定义一次；各章用链接指回。
源码、清单与构建配置是事实源，表格与代码冲突时以源码为准并同任务修正（2026-11-23 核对）。
不确定的历史动机写"未知"，不补故事。

## 进程与桥

| 术语 | 定义 | 易混淆点 |
|---|---|---|
| 宿主 / 三进程 | 本仓主体：`src/main`（主进程，系统能力与 IM 业务）、`src/preload`（桥）、`src/render`（UI）。入口 `main.ts`、`app.html`、`login.html` | 宿主 ≠ 全部功能；能力包有自己的 main/preload/renderer |
| preload 桥 | `contextBridge.exposeInMainWorld` 暴露的窄接口：`window.electron`（宿主窗口，`preload/electron/index.ts`）、`window.beaverBridge`（内嵌页，`preload/bridge/index.ts`） | 渲染进程不直接拿 Node/数据库权限；桥上 API 不是"所有主进程能力" |
| IPC 两层 | 顶层通道只有 2 个：`IEvent.RenderToMain`、`IEvent.RenderToMainSyncMsg`（`src/common/type/ipc/event.ts`）；其下按 `command` 二级分发 | command 常量集中在 `common/type/ipc/command.ts`、`database.ts`；不要新增第三个顶层通道 |
| commandGroups | 主进程集中路由表（`src/main/ipc/render-to-main/index.ts`），按 enum 组把 command 交给 handler | 能力包自注册的数据库/通用 handler 先于该表命中（`getDatabaseIpcHandler` / `getIpcHandler`），不必写进宿主 enum |
| 反向通知 | 主进程 → 渲染：`NotificationModule` 定义 module 通道，`webContents.send(module, {command, data})`（`src/main/ipc/main-to-render/`） | 与"渲染 → 主"的请求/响应是两条独立路径，不要混为一套 |
| 内嵌页 / WebContentsView | 工作台等能力包用 `WebContentsView` + bridge preload 承载第三方/独立窗口页面 | 与宿主 BrowserWindow 不同；内嵌页走 `beaverBridge`，不是 `window.electron` |

## 能力包与平台

| 术语 | 定义 | 易混淆点 |
|---|---|---|
| 能力包 / `app-*` | `packages/app-*` 十二个独立窗口包（circle/moment/call/settings/search/workbench/doc/audio/image/video/updater/about），自带契约与闭环 | 宿主主窗里的入口/名片/薄 API 不因此搬进包；见 ADR 0001 |
| 平台包 `@beaver-im/beaver` | 共享运行时与契约，`common/`、`main/`、`renderer/` 分层导出（`packages/beaver/src/`） | 不把所有能力包的公共实现都塞进 `src/common`（宿主共享层） |
| `@beaver-im/beaver-biz` / `beaver-ui` | 复用业务组件 / 基础 UI | `build:packages` 的 filter 只覆盖 beaver 与 app-*，不自动构建这两包 |
| 宿主绑定 / `bindMain` | `src/main/plugin/bind.ts` 先把平台实现绑进宿主，再 `activatePlugins()` 装配能力 | bind 与 activate 是不同阶段；`catalog.ts`/`discovery.ts` 的构建期清单不等于运行时已激活 |
| 外置包 `app-ai` / `app-online` | 以 `link:` 指向 `../beaver-desktop-package/`，由 `build:ai` / `build:online` 构建 | 不在本仓；克隆本仓不保证外置功能可构建，不复制同名目录代替 |

## 消息、同步与存储

| 术语 | 定义 | 易混淆点 |
|---|---|---|
| MessageBusiness / MessageManager | 前者维护本地发送状态并发消息（`business/chat/message.ts`）；后者分发 WS 命令、ACK 与能力包注册处理器（`message-manager/`） | 发送与接收是两条路径，不都在一处 |
| WsManager | 长连接、PING/PONG/ACK、30s 心跳、指数退避重连（`src/main/ws-manager/`） | 与 HTTP API 封装并存；不能假设所有请求走 WS |
| DataSyncManager / `autoSync` | 连接成功后按域增量同步（用户/会话消息/好友/群/表情/通知 + 包注册项），同步期间普通消息暂存（`src/main/datasync/manager.ts`） | 流式帧有例外分支，不入同步队列；UI 跳转不等于同步完成 |
| 用户库 | 按 userId 分文件的 SQLite 库（`database/db.ts` 以 `[userId]` 占位路径打开，WAL + NORMAL） | electron-store 的 `config` 是键值配置，不是聊天库；退出换号必须切库 |
| 本地服务 | 主进程 Koa 监听 `127.0.0.1:38794`，供第三方网页检测登录态（`src/main/server/`，`main.ts` 启动） | 不是 beaver-server，也不是所有业务的 HTTP 入口 |
| baseUrl | 网关 origin（协议+域名+端口），定义在 `packages/beaver/src/common/config/index.ts`；`BASE_URL` 可覆盖 | 不含任何路径段；team 段（如 `/beaver/api/...`）由调用方自带 |

## 配置与验证

| 术语 | 定义 | 易混淆点 |
|---|---|---|
| `process.custom` | 主进程运行时参数（`ENV`/`TOOLS`/`DEVICE_ID`/`VERSION`/`PLATFORM`，见 `src/main/config/index.ts`） | 渲染侧读 `window.electron.app.*`；两侧取值路径不同 |
| 命令事实源 | 根 `package.json` 的 scripts；校验清单 `docs/knowledge-checks.json` | `lint` 带 `--fix` 会改文件；根无 `test` 脚本，不能编造测试结果 |
| 文档检查 | `node scripts/check-knowledge.mjs` + `git diff --check` | 只查链接/路径/脚本/章节顺序与空白，不是编译、业务测试或安全审计 |
| 无历史包袱 | 开源不运营：不留兼容层、不考虑兼容成本、有问题直接改到位并同步全部调用方（见根 `AGENTS.md`） | 不等于可以跳过验证或安全校验；对真实用户数据与外置配置仍需授权 |

新术语先在对应主章节写清语义，再回填本表；不要在这里复制整段规则。
