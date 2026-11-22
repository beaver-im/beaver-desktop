# ADR 0001：能力闭环与宿主组合边界

- 状态：现有约束记录，非本轮新发明的架构
- 核验：2026-11-22（Asia/Shanghai）
- 历史决策日期、决策者及完整备选讨论：未知

## 来源与规范正文

本约束原已存在于仓库 .cursor/rules/module-boundary.mdc；本轮整理成工具无关的公共规范。
唯一规则正文及正反例见[第2章](../standards/01-boundaries-and-naming.md)。
[编辑器规则](../../.cursor/rules/module-boundary.mdc) 现在是指向正文的薄适配，避免多份细则漂移。
本页仅保存来源和历史状态，不重复写一套边界要求。

## 代码证据与复审

[activate-plugins.ts](../../src/main/plugin/activate-plugins.ts) 与 [DataSyncManager](../../src/main/datasync/manager.ts)
展示主进程能力注册的现有实现；不代表每个现有文件都已通过边界审计。
新增跨包接口、改变主窗与能力包职责时复审，并按[第19章](../workflow.md)验证实际消费者。
未知历史取舍不补写故事；正式替代时记录后继 ADR。
