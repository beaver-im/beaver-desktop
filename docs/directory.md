# 工程目录

[返回全书目录](README.md)

找文件、判断能否改、确认副作用从这里进。**源码、清单和构建配置是事实源**；本页只做定位，不代替第 2～8 章的规范。
事实按 2026-11-23 当前工作区核对；新增/删除目录或脚本时同任务改本页与 [checks 清单](knowledge-checks.json)。

## 顶层

| 路径 | 作用 | 备注 |
|---|---|---|
| `src/` | 宿主三进程源码 + 跨进程共享层 | 主目录，见下 |
| `packages/` | pnpm workspace 能力包与共享包 | `packages/*`，由 `pnpm-workspace.yaml` 声明 |
| `build/` | 构建期源码与安装器 | **不是纯产物**：`plugin/`、`installer/` 是真实源码 |
| `docs/` | 本工程手册 | 本页是参考页，不计入章序号 |
| `scripts/` | 校验脚本 | 只有 `check-knowledge.mjs` |
| `resource/` | 打包图标 | `logo.png`、`app.ico` |
| `static/` | README 截图 | 文档资源，非运行时代码 |
| `app.html` / `login.html` | 两个渲染窗口入口 | 由 `vite.apps.ts` 登记 |
| `config.json` | 当前为 `{}` | 不作为配置事实源 |
| `package.json` / `pnpm-lock.yaml` / `turbo.json` | 脚本、锁文件、任务编排 | 命令与依赖事实源 |
| `vite.config.ts` / `vite.apps.ts` / `tsconfig*.json` | 构建、别名、HTML 输入、类型配置 | 入口改动看这里 |
| `VERSION` / `version.txt` | 版本号 / 安装器构建号 | 发布前核对三者一致 |

产物与缓存：`dist/`、`dist-electron/`、`release/`、`output/`、`BEAVER_CACHE/`、`.turbo/`、`node_modules/` 均已忽略；
`BEAVER_CACHE/logs/` 是运行时日志真实落点，不是源码。

## src 四层

```text
src/
  main/       主进程：窗口、系统能力、IM 业务、本地库、连接
  preload/    窄接口桥接：electron（宿主）/ bridge（内嵌页）
  render/     渲染进程：UI、Pinia、通知消费
  common/     跨进程类型与工具，不等于所有能力包的公共实现
```

| 路径 | 作用 |
|---|---|
| `src/main/main.ts` | 主进程入口；bind 平台实现、激活插件、初始化 MCP/MessageManager/IPC、启动本地服务 |
| `src/main/application/` | 窗口与托盘；`login.ts`、`app.ts`、`tray/` |
| `src/main/ipc/` | IPC 服务端；`render-to-main/` 分发、`main-to-render/` 反向通知 |
| `src/main/api/` | 主进程 HTTP 封装：chat/datasync/emoji/friened/group/mcp/notification/oauth/track/user |
| `src/main/business/` + `src/main/datasync/` | 各域业务与同步，成对出现（chat/emoji/friend/group/notification/user） |
| `src/main/database/` | SQLite/Drizzle：`tables/` 表、`services/` 持久服务、`init/` 初始化、`db.ts` 实例 |
| `src/main/ws-manager/` · `message-manager/` | 长连接、心跳重连；消息命令分发、ACK 与接收器 |
| `src/main/plugin/` | 宿主绑定 `bind.ts`、激活 `activate-plugins.ts` |
| `src/main/mcp/` · `tools/` | MCP 与本机工具 |
| `src/main/server/` | 本地 Koa 服务（`127.0.0.1:38794`），供第三方网页检测登录态 |
| `src/main/store/` · `cache/` · `config/` | electron-store、缓存路径映射、环境/config.ini 读取 |
| `src/preload/electron/index.ts` | `contextBridge.exposeInMainWorld('electron', …)`，宿主窗口 API |
| `src/preload/bridge/index.ts` | 暴露 `beaverBridge`，供内嵌页 JSBridge |
| `src/preload/utils/` | `bridgeInvoke.ts`、`ipcRender.ts` 调用封装 |
| `src/render/windows/app/` · `login/` | 两个窗口的 `main.ts`、router、pinia、page |
| `src/render/api/` | 渲染侧 HTTP 封装（多数由平台包 re-export） |
| `src/render/components/` · `core/` · `utils/` | 组件、消息/媒体核心、工具 |
| `src/common/type/ipc/` | IPC channel 与 command 常量：`event.ts`、`command.ts`、`database.ts`、`websocket.ts` |

路径别名见 `vite.apps.ts` / `tsconfig.app.json`：`commonModule/*`、`mainModule/*`、`renderModule/*`、`preloadModule/*`。

## packages 能力包

`packages/beaver`、`beaver-biz`、`beaver-ui` 是共享平台/业务/基础 UI；`packages/app-*` 是独立窗口能力包，
当前 12 个：`about / audio / call / circle / doc / image / moment / search / settings / updater / video / workbench`。
每个包自带主进程/渲染/公共导出；窗口 HTML 由 `vite.apps.ts` 登记。

外置能力包**不在本仓**：`app-ai`、`app-online` 以 `link:` 指向 `../beaver-desktop-package/`，
真实路径以 `package.json` 与 `build/plugin/catalog.ts` 为准，不猜同名目录。
外置包手册：[app-ai](../../beaver-desktop-package/beaver-desktop-ai/docs/README.md)、[app-online](../../beaver-desktop-package/beaver-desktop-online/docs/README.md)。
包边界与装配顺序见[第 2 章](standards/01-boundaries-and-naming.md)、[第 7 章](standards/06-plugin-lifecycle.md)。

## build 与 scripts

| 路径 | 作用 | 危险度 |
|---|---|---|
| `build/plugin/catalog.ts` · `discovery.ts` | 构建期能力清单发现，运行时激活的输入 | 低（构建期源码） |
| `build/installer/index.bat` | 安装器：递增构建号、生成 version、调 NSIS 打包 | 中（回写版本、产出 exe） |
| `build/nsis/` · `build/shell/` | NSIS 工具与脚本 | 中 |
| `build/scripts/` | 构建辅助 | 中 |
| `scripts/check-knowledge.mjs` | 文档链接/路径/脚本/章节顺序校验 | 无（只读） |

`package:win` / `package:mac` 会跑完整构建链，非普通任务默认验收；命令矩阵见[第 19 章](workflow.md)。

## docs 地图

| 路径 | 内容 |
|---|---|
| `README.md` | 全书入口：结构说明 + 全书目录 |
| `directory.md`（本页）· `glossary.md` | 参考页：工程目录、术语（不计章序号） |
| `architecture.md` | 第 1 章：系统全貌 |
| `standards/` · `how-to/` · `modules/` | 第 2～8 / 9～11 / 12～18 章 |
| `workflow.md` | 第 19 章：验证与验收 |
| `decisions/` · `tasks/` | 第 20 / 21 章：ADR、任务交接 |
| `knowledge-checks.json` | 校验登记 |

## 速查

| 我要…… | 先去 |
|---|---|
| 找某个符号/文件在哪 | 本页 + [模块导航](modules/README.md) |
| 判断新代码放宿主还是包 | [第 2 章](standards/01-boundaries-and-naming.md) |
| 加 IPC / 页面 / 能力包 | [第 10](how-to/02-add-ipc.md) / [9](how-to/01-add-page-or-feature.md) / [11](how-to/03-add-capability.md) 章 |
| 确认改动怎么验证 | [第 19 章](workflow.md) |
