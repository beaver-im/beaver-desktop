# Beaver Desktop：给人和 AI 的薄入口

主手册：[海狸桌面端工程手册与全书目录](docs/README.md)。
工具不能自动加载本文件时由调用者显式提供；它不是永久记忆，也不要求每次读整本手册。

## 按任务阅读

| 当前工作 | 阅读入口 |
| --- | --- |
| 初次接手 / 跨模块理解 | [第1章架构](docs/architecture.md) |
| 新目录、命名、拆包和依赖 | [第2章](docs/standards/01-boundaries-and-naming.md) |
| TS / 请求响应 / 未知数据 | [第3章](docs/standards/02-types-and-api.md) |
| Vue / Pinia / 样式资源 | [第4章](docs/standards/03-vue-and-state.md) |
| Electron / IPC / 文件权限 | [第5章](docs/standards/04-electron-and-ipc.md) |
| 表、迁移、ACK、同步和重连 | [第6章](docs/standards/05-storage-and-sync.md) |
| 插件激活与装配 | [第7章](docs/standards/06-plugin-lifecycle.md) |
| 错误、日志与资源释放 | [第8章](docs/standards/07-errors-and-resources.md) |
| 新页面 / 新 IPC / 新插件 | [第三篇实战](docs/how-to/README.md) |
| 找到具体源码 / 符号 | [第四篇模块速查](docs/modules/README.md) |
| 验证、评审和完成标准 | [第19章](docs/workflow.md) |
| 决策 / 多会话交接 | [第20章](docs/decisions/README.md)、[第21章](docs/tasks/README.md) |

## 最高工程原则（开源项目，无历史包袱）

- 本项目为开源项目，不作商业托管运营，**没有历史包袱**：**不考虑任何兼容代码**、**不考虑实现成本**，**哪里有问题就改哪里，不需要的直接去掉**。
- 契约、目录、接口与数据模型可直接做破坏性调整；改动时**同步更新所有受影响的调用方、消费者与初始化/读写代码**，删除废弃路径，不留仅为旧版存在的兼容层、双轨分支或适配兜底。
- 仍须保持必要工程纪律：不因“无历史包袱”省略测试与验证、正确错误处理或安全校验；他人未提交改动、外部配置及真实本地数据的破坏操作仍须授权，不把“开源不运营”推断为无敏感数据。

## 必须保持的执行边界

- 先明确目标与验收，查看 git status、暂存和未暂存差异；不得覆盖他人工作或擅自重置/暂存。
- 普通任务按章节与符号定点检索，改前核实局部源码；跨模块任务可扩大范围并说明原因。
- 源码/清单是实现事实源；第二篇是全仓统一规范（当前尚有未整改存量，遇到即改、不留兼容层）；任务卡不是架构事实。
- 宿主组合留宿主，能力包保持本域闭环；不发明无必要的框架，详见第2章唯一正文。
- renderer 不直接接管数据库/文件/命令；IPC 边界需运行时校验与权限判断，详见第5章。
- 表与游标/通知同步变更一起验证；不能凭类型或 UI 通过宣称一致性正确。
- 外置 AI/online 的真实路径以 package.json 与 build/plugin/catalog.ts 为准，不猜同名目录。
- 不默认把 build/ 当产物忽略：build/plugin、build/installer 包含真实源码/脚本。
- 检索默认排除 .git、依赖、dist、dist-electron、release、output、日志与缓存，必要时定点读产物。
- 不读取/记录 .env、令牌、真实聊天与隐私数据；发布、迁移、危险动作另需授权。
- 文档代码块标示例的不是现成 API；未知动机、未运行检查、存量差异如实记录。

## 工作闭环

定位 → 按需读取 → 实现 → 验证 → 更新相关知识 → 交接。
接口、职责、入口或命令改变时，同次更新相应章节；重要决策进 ADR，临时进度进任务卡。
待用户裁决的 3 项范围冲突与当前存量情况见[附录](docs/standards/reference-and-existing-code.md)；文档任务不擅自改业务，明确问题在代码任务中直接改到位。

## 验证与交付

- 文档检查：`node scripts/check-knowledge.mjs`；空白检查：`git diff --check`。
- 未跟踪新文件另查空白/冲突标记；文档检查不等于业务合规、安全审计或测试。
- 代码检查按[真实命令矩阵](docs/workflow.md)选：build:main、build:renderer、目标包/平台检查。
- 根 lint 含 --fix，会改文件；根无 test 脚本，不能编造测试结果。
- 最终说明改了什么、实际目录/命令/结果、没验证什么、剩余风险；未运行不能标通过。
- 不默认提交、推送、发布或安装依赖；以本任务授权为准。
