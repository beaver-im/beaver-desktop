# ADR 0004：模块分级与平台契约边界

- 状态：提议（未裁决；文内规范不得当作已生效约束执行）
- 日期：2026-11-26（Asia/Shanghai）
- 决策者与确认依据：待确认。方案由架构评审提出，依据为当前源码与清单；无会议或历史决策可追认
- 适用范围：宿主 `src`、平台包 `packages/beaver`、仓内能力包 `packages/app-*`、外置包 `app-ai` / `app-online`
- 替代关系：无。细化 [0001](0001-capability-boundaries.md)、[0002](0002-host-platform-binding.md)，不改写二者
- 配套执行：[整改任务卡](../tasks/active/2026-11-26-module-tiering-remediation.md)

## 背景与约束

问题不是目录层级深，而是**不同身份的模块被当成同一种"包"设计**，导致一个改动横跨多处、影响面无法预判。用户原话："我原本希望有个包是黑盒，但有些模块还是自己平台的，不是所有模块都免费。"

### 可验证事实

- [catalog.ts](../../build/plugin/catalog.ts) 同时用 `enabled`、`optional`、`root`、`preload`、`renderer` 五个开关描述能力，`ai` / `online` 带 `optional: true` 与仓外 `root`，其余为仓内必装包。
- ~~app-circle/activate.ts 一个 `activate` 注册了 5 类扩展点，是完整闭环黑盒~~ —— **该反例已于 2026-11-28 消除**：圈子数据归位宿主、`activate.ts` 删除，见 [circle-data-relocation](../tasks/active/2026-11-28-circle-data-relocation.md)。现在注册最多的是 [app-settings/activate.ts](../../packages/app-settings/src/main/activate.ts)（IPC + 登录钩子两类）。
- [app-call/activate.ts](../../packages/app-call/src/main/activate.ts) 的 `activate` 为空并明确注释"通话信令路由在宿主 message-manager/receivers/call"，但 [宿主 call receiver](../../src/main/message-manager/receivers/call/index.ts) 直接向 `app` / `call` / `call-incoming` 三个窗口发通知——**挂包的壳、干平台的事**。
- [beaver/main/index.ts](../../packages/beaver/src/main/index.ts) 出口聚合了 10 个 registry 与 7 类 common 类型；[beaver/common/type/ajax](../../packages/beaver/src/common/type/ajax/) 只有通用壳类型（`IAjaxResponse` 等），宿主 [src/common/type/ajax](../../src/common/type/ajax/) 有 19 个业务类型文件——类型事实源已切开，但此切分未成文。
- [plugin/index.ts](../../packages/beaver/src/common/type/plugin/index.ts) 定义 `activate(ctx)` 为插件唯一入口；现有 registry 多为只增不减的全局数组，无反注册。

### 不可违反的边界

沿用 [第2章](../standards/01-boundaries-and-naming.md) 与 [第7章](../standards/06-plugin-lifecycle.md)：先按进程分层再按业务分组；能力包自包含本域闭环；宿主不 import 能力包源码；common 不反向依赖 main/renderer；开源无历史包袱，不留兼容层。

## 决策

### 1. 模块分为三级，身份由清单字段决定，不由目录名推断

| 级别 | 名称 | 判定条件 | 现状实例 | 宿主可否 import 其源码 | 可否缺省 |
| --- | --- | --- | --- | --- | --- |
| T1 | 核心平台模块 | 业务正确性依赖它、非独立窗口、无独立 manifest | 宿主 `src/main/business/*` 的 chat / friend / group / user / notification | 本就是宿主代码 | 否 |
| T2 | 一等能力包 | 仓内 `packages/app-*`，`enabled: true` 且非 `optional` | circle / moment / doc / call / settings / search 等 | **禁止** | 否 |
| T3 | 可选外置模块 | `optional: true` 且有仓外 `root` | ai / online（外置仓） | **禁止** | 是 |

判定顺序固定：先看 catalog 条目（身份的机器可读事实源）→ 再看是否是独立窗口 → 最后才是业务名。**同名业务可以分属不同级**：AI 的独立窗口是 T3，主窗 AI 面板是 T1 宿主组合，二者不因都叫"AI"而合并。

### 2. `packages/beaver` 是门面，内部按变更影响半径定性为三层

| 层 | 目录 | 性质 | 改动代价 |
| --- | --- | --- | --- |
| 契约层 | `src/common/type/*` | 类型契约，全仓可见 | 一改全仓编译，须复审所有消费者 |
| 机制层 | `src/main/*/registry`、`lifecycle` | 注册与分发机制 | 须通知所有相关包作者 |
| 工具层 | `src/main/renderer` 的 request / logger / config / store | 无状态工具，可迭代 | 局部，影响最小 |

定位语（评审时先判"我动的是哪一层"）：**beaver 只回答"能力包如何接入宿主"，不回答"业务是什么"。**

### 3. 三条硬规则

1. **单向出口**：能力包只从 `@beaver-im/beaver/{common,main,renderer}` 公开导出取值，禁止跨包深导入（延续第2章）。
2. **注册可撤销**：机制层每个 registry 提供与 `registerXxx` 配对的 `unregisterXxx`，使 `deactivate` 与测试隔离成为可能；现有只增数组视为未整改差异。
3. **类型最小化**：新增类型进 beaver 前必须回答"哪个 T2/T3 包必须认识它"；答不出就留在宿主 `src/common`。宿主私有业务类型（如 `IChatHistory`）不得进入 beaver。

### 4. 身份错位的两处整改方向（具体归属待裁决）

- **call**：`activate` 为空、信令在宿主，不满足 T2 闭环。**二选一**：(a) 升为完整 T2——把 `message-manager/receivers/call` 迁入包内，改用 `registerWsHandler` 自注册；(b) 降为 T1——删除 `app-call` 包壳，窗口逻辑收回宿主。不得维持现状的"包壳 + 平台心"。
- **aiPanel**：主窗宿主面板（T1）与外置 AI 窗口（T3）是同一业务的两个身份。确认宿主侧只保留薄入口与名片，厚逻辑不得在两处各写一份。

## 备选方案与权衡

- **全部做成黑盒 T2 包**：被否。核心 IM 业务（消息收发、同步、连接）若外移，宿主正确性依赖包，与"宿主不 import 包源码"冲突，且违反业务事实。
- **全部收回宿主 T1**：被否。AI / online 在独立仓、可缺省，是 T3 的客观事实；强行内移会破坏 `optional` 与独立发布语义。
- **按身份分级（本方案）**：保留现有物理布局，只把已存在的事实定名并配套规则。代价是需要一次目录与类型的定性整改；收益是改动影响面可预判。历史决策动机未知，不补写故事。

## 影响与验证

- **依赖方向**：T1 可依赖 beaver；T2/T3 只依赖 beaver 公开导出，彼此禁止深导入；beaver 不依赖任何 T1/T2/T3。
- **受影响调用方**：改 registry 需同步所有 `activate.ts` 注册点；改 common 类型需同步宿主与全部包的类型引用；call 归属调整需同步 `catalog.ts`、`activate-plugins.ts`、窗口通知目标。
- **废旧清理**：采用 (b) 时删 `packages/app-call` 全部源码与 catalog 条目；采用 (a) 时删宿主 call receiver。不留转发壳。
- **验证**：文档检查 `node scripts/check-knowledge.mjs`；契约层改动加 `pnpm --filter @beaver-im/beaver tsc`；渲染与主进程改动按[第19章](../workflow.md)选 `build:renderer` / `build:main`。分级本身不改变运行时行为，须以现有会话、通知、窗口流程回归确认，不能只凭编译通过宣称正确。

## 证据与复审触发

- 证据：[catalog.ts](../../build/plugin/catalog.ts)、[beaver/main/index.ts](../../packages/beaver/src/main/index.ts)、[beaver/common/type/ajax](../../packages/beaver/src/common/type/ajax/)、[app-settings/activate.ts](../../packages/app-settings/src/main/activate.ts)、[app-call/activate.ts](../../packages/app-call/src/main/activate.ts)、[宿主 call receiver](../../src/main/message-manager/receivers/call/index.ts)、[plugin 契约](../../packages/beaver/src/common/type/plugin/index.ts)。
- 复审触发：新增第 4 类身份；catalog 出现 `optional` 与 `root` 之外的新组合；某 T2 包开始被宿主源码 import；beaver 出口新增业务类型；registry 需要反注册却仍不提供。
- ~~workbench 是否因独立 preload 单列 T3~~ —— 2026-11-28 起 workbench / settings 的 preload 已收回宿主（平台窗口能力由宿主装配），
  “独立 preload”不再是 T3 的判据，workbench 归 T2。见 [circle-data-relocation](../tasks/active/2026-11-28-circle-data-relocation.md) 同批改动。
- 未解决问题：call 的 (a)/(b) 归属、aiPanel 宿主侧厚度——两项待项目负责人裁决，裁决前不擅自改码。
