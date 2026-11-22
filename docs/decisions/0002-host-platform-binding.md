# ADR 0002：宿主注入平台与能力运行时注册

- 状态：现状记录（从代码整理，不声称新决策已审批）
- 核验：2026-11-22（Asia/Shanghai）
- 历史决策日期、决策者、备选方案：未知

## 证据与现状

[bind.ts](../../src/main/plugin/bind.ts) 使用 bindMain 注入 logger、store、config、database、request、IPC 等宿主实现。
[main.ts](../../src/main/main.ts) 先绑定平台，随后在启动流程激活插件并初始化消息/IPC。
[catalog.ts](../../build/plugin/catalog.ts) 与 [discovery.ts](../../build/plugin/discovery.ts) 先构建虚拟装配模块，处理 enabled/optional/root 等配置。
[activate-plugins.ts](../../src/main/plugin/activate-plugins.ts) 依据生成的装配清单加载，检查 manifest.id，激活并收集窗口；运行时错误在单包边界记录并隔离，不代替构建期配置校验。
[MessageManager](../../src/main/message-manager/index.ts) 优先查 getWsHandler，
[DataSyncManager](../../src/main/datasync/manager.ts) 消费 getRegisteredDataSync，说明核心管道允许能力扩展而非写死全部业务。

## 影响

改变平台接口时直接同步更新宿主注入和全部消费者并删除旧签名，不保留旧接口兼容层，也不能只改类型而不改消费方。
新增能力须进入实际装配与导出链，目录存在不代表已启用。
单包激活失败隔离是现有实现，不保证任意初始化副作用都能自动回滚。

## 验证与复审

按[共享平台指南](../modules/shared-platform.md)检查类型/构建和真实消费者。
修改启动顺序、包激活、注册协议、错误隔离时重审本记录；未知历史取舍保持未知。
