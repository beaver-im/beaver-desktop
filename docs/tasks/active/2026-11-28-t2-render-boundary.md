# 任务：T2 能力的 render 边界与「改动点数量」验收

- 状态：**判据已作废（2026-11-28 17:xx 裁决）** —— 本卡建立在「circle 属于 T2 能力包」的前提上，该前提已推翻：circle 数据已归位到宿主（见 [2026-11-28-circle-data-relocation.md](./2026-11-28-circle-data-relocation.md)）。circle 现在是宿主的第 7 个数据域，与 group/chat 平级，不再是 T2。
- 创建 / 最后更新：2026-11-28 16:30 → 17:xx
- 负责人 / 接手者：待确认
- 仓库、分支、基线 commit：beaver-desktop / feature-0801 / 未记录（工作区有本次未提交改动，见"工作区基线"）
- 决策依据：[ADR 0004](../../decisions/0004-module-tiering.md)（状态：提议，未裁决）；本卡不新增身份定义，只补验收指标

> **作废说明**
>
> 1. 下文「事实 2」把 `src/common/type/preload/database.ts` 新增 `IDbCircle` + `database.circle` 判为违规——**该结论反了**。数据归位后，`database.circle` 与 `database.group` 同性质，是宿主自有数据域，不是插件契约。
> 2. 「可观察的验收条件」第 1 条（`src/preload` 零业务名）不再成立，也不再需要：宿主 preload 本来就按域分方法。
> 3. 保留有效的部分：宿主不 import 能力包**实现**（UI 组件除外）、类型不重复定义两份、不留「插件未启用」兜底。
> 4. 本卡余下内容仅作历史记录，不要再按它改码。

## 目标、非目标与验收

- 目标：让"一个 T2/T3 业务的字段变更，宿主源码改动数为 0"成为可机器检查的验收条件；并修掉本次为让圈子会话刷新而引入的宿主反向依赖。
- 非目标：不压平 render 的 UI 目录层级（[ADR 0004](../../decisions/0004-module-tiering.md) 已确认层级深不是问题）；不重排 T1 业务（chat / friend / group / user / notification）在宿主的分层；不为一致性做批量重命名。
- 可观察的验收条件（**已被上面的作废说明取代**）：
  - ~~`grep -ri 'circle\|moment\|app-' src/preload` 无输出~~
  - T2 业务的字段变更不需要修改 `src/render`、`src/preload`、`src/common/type` 下任何文件；
  - `node scripts/check-knowledge.mjs` 通过；`build:main` / `build:renderer` 通过。

## 工作区基线

本次事件前分支 `feature-0801`，工作区存在上一轮未提交改动（circle 数据刷新链路修复）：
`src/common/type/preload/database.ts`、`src/preload/electron/database.ts`、
`src/render/windows/app/pinia/circle/circle.ts`、
`packages/app-circle/src/renderer/windows/circle/page/circle/index.vue`。
其中前两个是本卡要回滚的违规点；后两个方向正确，保留。

## 已核实入口与发现

### 事实 1：宿主已有插件 preload 装配机制，本次未使用

[src/preload/electron/index.ts](../../../src/preload/electron/index.ts) 已有：

```ts
import { pluginPreloadFactories } from 'virtual:beaver-plugin-preloads'
const pluginApis = Object.fromEntries(
  Object.entries(pluginPreloadFactories).map(([namespace, factory]) => [namespace, factory(ipc)]),
)
```

[catalog.ts](../../../build/plugin/catalog.ts) 的 `preload` 字段即命名空间名，"声明后插件的 `./preload` 入口被装配到 `electron.<preload>`，入口必须实现 `IPluginPreloadFactory`，唯一导出 `createPreloadModule`"。
现有消费者：`app-settings/src/preload/settings.ts`、`app-workbench/src/preload/workbench.ts`、`app-ai`（ns=`agent`）。

**结论**：`electron.database.circle` 这个域不需要、也不应该由宿主声明。

### 事实 2：本次改动造成两处违规

| 违规 | 证据 | 违反的既有规则 |
| --- | --- | --- |
| 宿主反向依赖能力包实现 | `src/preload/electron/database.ts:29` `import { CIRCLE_DATABASE_IPC, DataCircleCommand } from '@beaver-im/app-circle/common/type/ipc/database'` | [ADR 0004](../../decisions/0004-module-tiering.md)「宿主不 import 能力包源码」 |
| 宿主为 T2 业务新增专用契约 | `src/common/type/preload/database.ts` 新增 `IDbCircle` + `database.circle` | 同上「类型最小化：新增类型进 beaver 前必须回答哪个 T2/T3 包必须认识它」——此处连 beaver 都没进，直接进了宿主私有类型 |

另外 `pinia/circle/circle.ts` 的 `result?.list || []` 属于对"插件未激活"的兜底，不符合「开源无历史包袱，不留兼容层」。正确形态是插件未启用即抛错（宿主已有 `requirePluginApi`）。

### 事实 3：主进程侧早已是通用合并，渲染层却退回三分支

[src/main/business/chat/conversation.ts](../../../src/main/business/chat/conversation.ts) 列表与单条都调用了
`resolveConversationDisplays()`（`packages/beaver/src/main/conversation/display-registry.ts`，**已随归位删除**），
由 `app-circle` 的 `display-provider.ts`（**已删除**）提供
`conversationId → { avatar, nickName }`。**主进程返回的会话数据已经带插件提供的展示信息。**

但 [pinia/conversation/conversation.ts](../../../src/render/windows/app/pinia/conversation/conversation.ts) 的
`getConversations` / `getConversationInfo` 又按 `chatType` 写了三段 if：

```
p2p     → contactStore
GROUP   → groupStore
CIRCLE  → circleStore          ← 这一段就是"写个内容都得改"的病灶
```

### 事实 4：宿主 render 层仍在按业务实体扩张

| 目录 | 项数 | 内容 |
| --- | --- | --- |
| `src/render/windows/app/pinia/` | 14 | user / contact / friend / group / conversation / message / emoji / notification / circle / call-list / active-call / update / view / app |
| `src/render/windows/app/notification-manager/` | 10 | app / call / chat / circle / emoji / friend / group / mcp / notification / user |
| `src/main/business/` | 6 | base / chat / emoji / friend / group / notification / user |

其中 user / friend / group / chat / notification 是 T1（合法）；**circle 是 T2，出现在这三张表里即为身份错位**。
`src/` 中提到 circle 的文件共 36 个，多数是 `ChatType.CIRCLE` 枚举判断（合法），实体资料链路集中在
`pinia/circle/`、`notification-manager/circle/`、`page/message/message.vue`（后者直接 `import ... from '@beaver-im/app-circle/renderer'`）。

## 判断：问题不是「拆得细」，是「按什么切」+「没有验收指标」

1. **切分对象错了**。宿主按 IM 业务实体（user/friend/group/circle/emoji）纵向切，插件按能力包横向切。两套坐标系叠加，circle 就同时属于"宿主的第 9 个业务"和"packages 的第 1 个包"，两边各写一份，谁都不是唯一事实源。
2. **ADR 0004 定了身份，没定预算**。它说清了 T1/T2/T3 是什么，但没给"一次改动允许动几处"。没有数字约束，规则就拦不住新违规——本次 preload 手写 circle 域就是在规则已写下的情况下发生的。
3. **"重"是可量化的**。circle 改一个字段（比如 `name` → `title`），当前要动：

| # | 位置 | 为什么必须动 |
| --- | --- | --- |
| 1 | `packages/app-circle` 主进程 sync / 表 / provider | 真相源 |
| 2 | `packages/app-circle` renderer | 展示 |
| 3 | 宿主 `src/preload/electron/database.ts` | 手写的 circle 域要改字段 |
| 4 | 宿主 `src/common/type/preload/database.ts` | `IDbCircle` 要改 |
| 5 | 宿主 `src/render/.../pinia/circle/circle.ts` | 映射字段 |
| 6 | 宿主 `src/render/.../pinia/conversation/conversation.ts` | `circleInfo.name` → `.title` |

目标应为 **1 + 2 两处**（都在包内），宿主 0 处。

## 方案：一条指标 + 三个已存在机制

### 指标（建议写进 ADR 0004 第 3 条硬规则）

> **T2/T3 业务的字段或行为变更，宿主 `src/` 改动数必须为 0。**
> 若必须改宿主，说明该能力被错放在 T1，或平台缺一个通用扩展点——先补扩展点，再改业务。

这条可机器验证：改完跑 `git diff --stat -- src/` 应为空。

### 机制 1：preload 命名空间（替代宿主手写业务域）

- `packages/app-circle` 新增 `src/preload/circle.ts`，导出 `createPreloadModule(ipc): ICircleModule`，
  方法内部用插件自己的 `CIRCLE_DATABASE_IPC` 常量。
- [catalog.ts](../../../build/plugin/catalog.ts) 的 circle 条目加 `preload: 'circle'`。
- 宿主删除：`src/preload/electron/database.ts` 的 `circle` 域与两处 import；`src/common/type/preload/database.ts` 的 `IDbCircle` 与 `circle`。
- 渲染层调用方改用 `requirePluginApi<ICircleModule>('circle')`（[pluginApi.ts](../../../src/render/utils/pluginApi.ts)），插件未启用即抛错，不做空列表兜底。
- 该机制已在 settings / workbench / ai 三个包上验证过，无新代码。

### 机制 2：展示注册表下发，替代 render 层按 chatType 分支

主进程已有 `resolveConversationDisplays`，缺的是把它变成渲染层可消费的通道：

- 平台新增一个通用查询（放在 beaver 的 display-registry 旁，不新造业务通道）：
  `conversation:resolveDisplay`，入参 `IConversationRef[]`，出参 `Map<conversationId, {avatar, nickName, notice?}>`。
- 渲染层 `conversationStore` 增 `applyDisplay(conversationId, display)`，只写 `avatar/nickName/notice` 三个平台字段。
- 插件资料变更时（本次是 `database:circle` 的 `circleUpdate`），在主进程侧重新 resolve 受影响的会话并**广播 display 变更**；渲染层统一 `applyDisplay`。
- 结果：`getConversations` 只剩"格式化时间"，p2p / GROUP / CIRCLE 三段分支消失；`pinia/circle/` 整个删除。

注意：`contactStore` / `groupStore` 属于 T1，保留合法，但同样应改为由 display 通道写入，而不是 getter 里分支——否则 T1 内部仍是六处改动。

### 机制 3：业务 store 出宿主（仅 T2）

`pinia/circle`、`notification-manager/circle` 删除；`page/message/message.vue` 对
`@beaver-im/app-circle/renderer` 的直接 import 改为 `virtual:beaver-plugin-renderer` 的注册式获取
（`renderer: true` 已在 catalog 声明，说明该机制已就绪）。

## 分阶段路线

| 阶段 | 内容 | 是否需裁决 | 风险 |
| --- | --- | --- | --- |
| **P0（已执行）** | 回滚 preload 违规：app-circle 加 `./preload`、catalog 声明、宿主删除 circle 域与反向 import、调用方改 `requirePluginApi` | 否（修本次引入的违规） | 低，仅影响圈子资料读取；preload 改动需重启 electron |
| P1 | 机制 2：`conversation:resolveDisplay` + `applyDisplay`，删 `pinia/circle` 与 conversation getter 三分支 | 是（新增平台通道） | 中，涉及会话列表主链路，须回归列表/单条/置顶/未读 |
| P2 | 机制 3：`notification-manager/circle` 与 message.vue 的插件组件获取方式 | 是（改主窗组合） | 中，涉及消息页卡片渲染 |

P1/P2 未裁决前不改码，与 [2026-11-26 整改任务卡](2026-11-26-module-tiering-remediation.md) 的"裁决前不得改码"保持一致。

### P0 实际改动（2026-11-28 16:35）

| 文件 | 改动 |
| --- | --- |
| `packages/app-circle/src/common/type/preload/circle.ts` | 新增：`IDbCircle`（从宿主迁回）与 `ICircleModule` |
| `packages/app-circle/src/preload/circle.ts` | 新增：`createPreloadModule(ipc)`，内部用插件自己的 `CIRCLE_DATABASE_IPC` |
| `packages/app-circle/package.json` | exports 增 `./preload` |
| `build/plugin/catalog.ts` | circle 条目增 `preload: 'circle'` |
| `src/preload/electron/database.ts` | 删 `circle` 域与 `@beaver-im/app-circle/...` 反向 import |
| `src/common/type/preload/database.ts` | 删 `IDbCircle` 与 `database.circle` |
| `src/render/windows/app/pinia/circle/circle.ts` | 改用 `requirePluginApi<ICircleApi>('circle')`，删 `result?.list \|\| []` 兜底 |

## 验证记录

| 工作目录 | 完整命令 / 手工步骤 | 时间 | 结果 / exit | 未运行原因或缺口 |
| --- | --- | --- | --- | --- |
| beaver-desktop | `grep -ri 'circle' src/preload src/common/type/preload` | 2026-11-28 16:20 | 修复前有命中；P0 后 `src/preload` 与 `database.ts` 已无命中 | 剩余命中在 `notification.ts`（P2） |
| beaver-desktop | `npx vite build --mode main` | 2026-11-28 16:36 | 通过；产物 `dist-electron/preload/index.mjs` 含 `circle:` 命名空间与 `getCircleList` | —— |
| beaver-desktop | `npx vue-tsc --noEmit` | 2026-11-28 16:38 | 通过 / exit 0 | —— |
| beaver-desktop | `npx vite build --mode renderer` | 2026-11-28 16:39 | 通过 | —— |
| beaver-desktop | `node scripts/check-knowledge.mjs` | 2026-11-28 16:41 | 通过；38 文件 464 链接 | 仅结构链接，非语义 |
| beaver-desktop | 运行时回归（圈子改名后主窗会话列表刷新） | —— | 未运行 | preload 改动需重启 electron，本次未启动客户端 |

## 决策、风险和阻塞

- 待裁决 1：是否采纳"宿主改动数为 0"作为 ADR 0004 的验收指标。
- 待裁决 2：`conversation:resolveDisplay` 放在 beaver 的 display-registry 旁，还是作为独立通用 IPC——取决于是否认为"会话展示"是平台概念（本卡主张是）。
- 待裁决 3（沿用 2026-11-26 卡）：call 的 (a)/(b) 归属、aiPanel 厚度、workbench 是否单列 T3。
- 风险：P1 会让 `contactStore`/`groupStore` 的实时性从"getter 兜底"改为"写入时同步"；若某处依赖 getter 兜底拿到最新值，需逐个确认调用方。

## 下一步

1. 负责人确认指标与 P1/P2 取舍。
2. 确认后先做 `conversation:resolveDisplay` 的契约（beaver 侧类型 + 主进程 handler + 渲染层 store 动作），再接插件变更广播。

## 交付与归档

P0 改动未提交。P1/P2 无改动。归档待 P1 完成后并入 [0004](../../decisions/0004-module-tiering.md) 的执行记录。
