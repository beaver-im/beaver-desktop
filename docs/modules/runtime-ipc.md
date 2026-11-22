# 第12章　启动、登录、窗口与进程通信

最后核验：2026-11-22（Asia/Shanghai）。

## 职责与真实入口

- [src/main/main.ts](../../src/main/main.ts)：应用主入口、单实例、生命周期、服务初始化。
- [application/app.ts](../../src/main/application/app.ts)、[application/login.ts](../../src/main/application/login.ts)：主窗和登录窗。
- [application/tray](../../src/main/application/tray)：托盘与系统入口。
- [ipc/index.ts](../../src/main/ipc/index.ts)：主进程 IPC 初始化；[render-to-main](../../src/main/ipc/render-to-main)、[main-to-render](../../src/main/ipc/main-to-render)：双向通信。
- [preload/electron](../../src/preload/electron)、[preload/bridge](../../src/preload/bridge)：Electron API 与业务桥。
- [common/type/ipc](../../src/common/type/ipc)、[common/type/preload](../../src/common/type/preload)：参数/响应/通知契约。
- [main/store](../../src/main/store)、[main/cache](../../src/main/cache)：进程状态与缓存管理；不要把它们和持久用户消息库混为一谈。

## 依赖与接口核对

renderer 调用桥 → preload → IPC handler → business / 系统能力 → 通知或返回值。
新增调用时核对通道名、参数校验、调用身份、窗口目标、错误处理和生命周期释放；不要直接把整个 Node/Electron 对象透给 UI。
宿主平台绑定和能力包激活先于消息/IPC 初始化，见[共享平台](shared-platform.md)。
登录/退出改动同时追账号状态、窗口切换、本地用户库与 WS；不能只测试成功路径。

## 定位关键词

Main.init、beforeAppReady、bindBeaverMain、activatePlugins、ipcManager.init、contextBridge、bridgeInvoke、sendMainNotification。

## 验证方式

按[矩阵](../workflow.md)做 main 构建，涉及桥时同时做 renderer 构建/类型检查。
需要运行时验证：启动/退出、第二实例、登录失败/退出换号、窗口销毁后的监听释放、非法 IPC 参数。
这些手工项是验收要求，不代表本轮已经运行或已有自动测试。

---
[返回《海狸桌面端工程手册》全书目录](../README.md)
