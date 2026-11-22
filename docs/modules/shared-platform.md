# 第16章　共享平台与接口契约

最后核验：2026-11-22（Asia/Shanghai）。

## 入口与职责

- [packages/beaver/package.json](../../packages/beaver/package.json)：平台导出与类型检查命令。
- [common/index.ts](../../packages/beaver/src/common/index.ts)、[main/index.ts](../../packages/beaver/src/main/index.ts)、[renderer/index.ts](../../packages/beaver/src/renderer/index.ts)：三个层次的公共入口。
- [main](../../packages/beaver/src/main)：bind、database、datasync、ws、ipc、lifecycle、mcp、store、keyboard 等契约和平台实现边界。
- [宿主 bind.ts](../../src/main/plugin/bind.ts)：注入真实 logger、store、config、database、request、IPC 与快捷键实现。
- [beaver-biz](../../packages/beaver-biz/src/index.ts)：业务复用组件（选择会话/好友、分享等）。
- [beaver-ui](../../packages/beaver-ui/src/index.ts)：基础 UI 组件，不作为域服务或消息数据库容器。

## 依赖方向与接口

能力包依赖平台公开入口，宿主注入平台实现；不要绕过导出深挖宿主内部路径来制造隐式耦合。
renderer 不直接依赖 main 的 Node/Electron 实现；common 不引入某个窗口的运行时副作用。
变更平台接口时核对宿主绑定、所有相关能力消费者、导出声明与构建，而不是只改接口定义。
现存模式见 [ADR 0002](../decisions/0002-host-platform-binding.md)，不要假定它解释了全部历史动机。

## 定位关键词

bindMain、IStore、AjaxFn、getDb、getWsHandler、getRegisteredDataSync、getMcpServers、sendMainNotification。

## 验证方式

pnpm --filter @beaver-im/beaver run tsc；相关平台/组件包 build。
变更公开契约需覆盖宿主 main/renderer 和实际消费包（含外置 link 包的可用性检查）。
只改基础 UI 时检查可访问性、事件/插槽与样式交互；不要用类型通过代替交互验收。
完整分层验证见[矩阵](../workflow.md)。

---
[返回《海狸桌面端工程手册》全书目录](../README.md)
