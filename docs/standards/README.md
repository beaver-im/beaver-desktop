# 第二篇　编码规范

本篇是全仓开发、重构与代码评审的统一规范正文。遵循“开源不运营、无历史包袱、不留兼容代码、不计实现成本、有问题直接改、不需要的去掉”原则，先看[第2章](01-boundaries-and-naming.md)，再按变更面选择章节，不要求每个任务读全部。

- 第2章：[目录与命名、依赖方向、职责边界](01-boundaries-and-naming.md)
- 第3章：[类型与接口](02-types-and-api.md)
- 第4章：[组件与状态](03-vue-and-state.md)
- 第5章：[进程隔离与 IPC](04-electron-and-ipc.md)
- 第6章：[存储与同步](05-storage-and-sync.md)
- 第7章：[插件生命周期](06-plugin-lifecycle.md)
- 第8章：[错误、日志、清理](07-errors-and-resources.md)
- 附录：[参考取舍与存量差异](reference-and-existing-code.md)

每条规则都给出放置位置、原因、正反例或操作步骤；存量不符合规范处遇到即可直接重构到位并同步调用方（仅当前文档建设任务未改动业务源码，不宣称存量已全部达标）。
[返回全书目录](../README.md)
