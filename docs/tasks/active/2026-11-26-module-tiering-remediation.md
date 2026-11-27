# 任务：模块分级与平台契约整改

- 状态：阻塞（Phase 0 已完成；P1/P2 有 3 项归属裁决未定，裁决前不得改码）
- 创建 / 最后更新：2026-11-26 21:15（Asia/Shanghai）
- 负责人 / 接手者：待确认
- 仓库、分支、基线 commit：beaver-desktop / feature-0801 / 62a44a8
- 决策依据：[ADR 0004](../../decisions/0004-module-tiering.md)（状态：提议，须项目负责人确认后生效）

## 目标、非目标与验收

- 目标：让"改动影响范围"可预判——每个模块身份明确、宿主与能力包边界单向、契约层变更代价可见、注册机制有生命周期。
- 非目标：不压平 render 的深层 UI 目录（用户已确认层级深但定位快，是良性复杂度）；不为一致性做批量重命名；不在本任务裁决前重构业务代码。
- 可观察的验收条件：
  - catalog 每条记录的身份与 ADR 三级定义一致，无"包壳 + 平台心"错位；
  - 每个 registry 有配对 `unregister`，`activate` 与 `deactivate` 对称；
  - beaver 出口无宿主私有业务类型；
  - `node scripts/check-knowledge.mjs` 通过，`git diff --check` 无输出；
  - 各阶段按[第19章](../../workflow.md)选真实命令验证，不凭编译通过宣称一致性正确。

## 工作区基线

创建时 `git status --short` 为空，无暂存/未暂存/未跟踪内容；分支 feature-0801，HEAD 62a44a8。本任务只写 docs 下 ADR 与任务卡，不触碰源码。若接手时基线已变，先停下核对差异，不覆盖他人改动。

## 已核实入口与发现

- [catalog.ts](../../../build/plugin/catalog.ts)：身份机器事实源，`optional` / `root` / `preload` 字段并存。
- [beaver/main/index.ts](../../../packages/beaver/src/main/index.ts)：出口聚合 10 个 registry + 7 类 common 类型。
- [beaver/common/type/plugin/index.ts](../../../packages/beaver/src/common/type/plugin/index.ts)：`activate(ctx)` 为插件唯一入口；无 `deactivate` 约定。
- [app-circle/activate.ts](../../../packages/app-circle/src/main/activate.ts)：T2 完整闭环样板，注册 5 类扩展点。
- [app-call/activate.ts](../../../packages/app-call/src/main/activate.ts) + [宿主 call receiver](../../../src/main/message-manager/receivers/call/index.ts)：身份错位实证。
- [aiPanel](../../../src/render/components/business/aiPanel/index.vue)：宿主 T1 面板，与外置 AI 窗口同业务名。
- 已剥离：`src/common/type/ajax` 19 个宿主私有类型 vs `beaver/common/type/ajax` 仅通用壳——类型最小化已有事实基础。

## 已完成与当前改动

- P0 护栏：创建 [ADR 0004](../../decisions/0004-module-tiering.md)，定三级身份、beaver 三层定性与三条硬规则；更新 decisions 索引；创建本任务卡。
- 未改动任何源码、清单、配置。

## 验证记录

| 工作目录 | 完整命令 / 手工步骤 | 时间 | 结果 / exit | 未运行原因或缺口 |
| --- | --- | --- | --- | --- |
| beaver-desktop | `node scripts/check-knowledge.mjs` | 2026-11-26 | 通过 / exit 0；37 文件 451 链接 | 仅校验结构链接，非业务/编译验证 |
| beaver-desktop | `git diff --check` | 2026-11-26 | 通过 / exit 0，无输出 | 未跟踪新文件不在 diff 范围内 |

## 分阶段整改路线

### P0 护栏（已完成）

立 ADR、定规则、建任务卡。**新代码一律按三级身份落位**，存量不动。交付物见"已完成"。

### P1 身份归位（阻塞：待裁决 call 归属）

- call 二选一：(a) 升 T2——把宿主 `message-manager/receivers/call` 信令迁入 `packages/app-call`，改 `registerWsHandler` 自注册，删宿主 receiver；(b) 降 T1——删 `app-call` 包壳与 catalog 条目，窗口逻辑收回宿主。
- aiPanel：确认宿主侧只留薄入口与名片，厚逻辑（store / domain / api）不与其外置窗口各写一份。
- workbench：因独立 preload，确认单列 T3 还是维持 T2，写入 catalog 注释。
- 验收：三条结论回写 ADR"未解决问题"并改状态为已裁决；不擅自选 (a)/(b)。

### P2 契约层收口（可独立做，无业务归属争议）

- registry 补配对 `unregister`：`datasync` / `database/table-init` / `ipc` / `bridge` / `keyboard` / `lifecycle` / `conversation/display` / `ws` / `mcp` / `bind`。
- 契约层类型审计：确认 beaver 出口无 `IChatHistory` 一类宿主私有类型；新增类型一律先答"哪个 T2/T3 必须认识它"。
- 验收：`pnpm --filter @beaver-im/beaver tsc`；实测 `activate` 后反注册生效，无残留订阅。

### P3 机制层与工具层分离标注（低风险）

- 在 beaver 的 `main/index.ts` 出口按契约/机制/工具三层加注释分区；不改导出符号名，避免破坏性变更。
- 验收：出口分区与 ADR 三层定性一致；消费者 import 路径不变。

### P4 render 横向分散治理（用户已认可的方向，谨慎做）

- 只收拢**横切**的 store 与通知消费：把域内 store、`notification-manager` handler 收进对应 `features/<域>/`；UI 深层结构（left/right/detail/components）原样保留。
- aiPanel 如裁决留宿主，迁入 `windows/app/features/ai-assistant/`。
- 验收：新增一个业务域可在一个目录内完成页面/组件/状态/通知；既有页面定位路径不变或仅换父目录。

### P5 全量回归与文档同步（收尾）

- 按[第19章](../../workflow.md)选 `build:renderer` / `build:main`；会话、通知、窗口、退订换号手工回归。
- 同步 `docs/directory.md`、[第1章](../../architecture.md)、[第15章](../../modules/capability-packages.md)、[第16章](../../modules/shared-platform.md) 中被改动的路径与身份描述。
- 验收：`check-knowledge` 通过；文档与源码互认；无废弃路径残留。

## 决策、风险和阻塞

- 阻塞 1：call 升 T2 还是降 T1——决定 P1 能否动手，需项目负责人裁决。
- 阻塞 2：aiPanel 宿主侧厚度——决定 P1/P4 是否迁移，需裁决。
- 阻塞 3：workbench 身份——影响 catalog 注释，需裁决。
- 风险：registry 补 `unregister` 若只加函数不接 `deactivate`，等于无生命周期；P4 若顺手压平 UI 目录会违背用户已确认的"层级深但定位快"。
- 本任务卡是执行清单，不改变 ADR 的"提议"状态；裁决前不得据此改码。

## 下一步

项目负责人就 call / aiPanel / workbench 三项给出归属结论 → 回写 ADR 并改状态为已接受 → 从 P1 开始按顺序执行，每阶段单独验证与提交。停止条件：任一裁决未出，停在 P0。

## 交付与归档

未提交。完成后按[第21章](../../tasks/README.md)移入 `completed/YYYY/`，写明真实 commit / PR；没有就明确"未提交"。
