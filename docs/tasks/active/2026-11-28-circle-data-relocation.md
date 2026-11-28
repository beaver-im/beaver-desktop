# 任务：圈子数据归位宿主（circle 去能力包化）

- 状态：已执行（代码改完、类型检查与三端构建通过；未提交）
- 创建 / 最后更新：2026-11-28
- 仓库、分支：beaver-desktop / feature-0801
- 取代：[2026-11-28-t2-render-boundary.md](./2026-11-28-t2-render-boundary.md)（该卡的判据已作废）

## 裁决

**数据是共享的，UI 是独占的。共享的东西必须放共同祖先。**

- 本地 SQLite 是**一个库、一套 schema**。schema 不能有两个主人。
- 一个数据被 ≥2 处消费（主窗会话列表 / 圈子窗口 / 通知管理器 / 名片），就不能住在其中一个消费者的包里。
- 因此：**圈子数据全部归位宿主 `src/main`；`packages/app-circle` 只保留窗口 UI 与窗口创建。**

这条裁决与其他包无关：`packages/app-*` 里**只有 circle 有 `database/` 目录**，其余 12 个本来就是纯 UI 分仓。

## 裁决前的事实

### 1. 13 个包，只有 1 个持有数据层

```
app-circle: database 目录=3  tables 目录=1   ← 唯一
其余 12 个:  database 目录=0  tables 目录=0
```

### 2. 拆包的代价是「引用 + 复制」，不是解耦

拆出去的后果不是没人引用，而是引用变得难看：

| 位置 | 内容 |
| --- | --- |
| `src/common/type/preload/notification.ts:26` | 宿主全局通知类型 `import type { NotificationCircleCommand } from '@beaver-im/app-circle/common'` |
| `src/render/api/circle-card.ts` | 注释：「故意与 @beaver-im/app-circle 重复一份：名片是聊天业务，不跨包复用圈子模块」 |
| `packages/app-moment/src/common/type/preload/notification.ts` | 整个 `NotificationModule` 枚举复制一份，注释：「自包含副本，去除了对 app-circle 的耦合」 |
| `src/render/windows/app/page/message/message.vue` | 同时 import 圈子的数据接口类型与 UI 组件 |

`NotificationModule` 一度存在三份（宿主 / circle / moment），靠人肉保持一致。

### 3. 为一个特例养了一整套协议

为了让 circle 的域留在包外，平台侧需要：`virtual:beaver-plugin-preloads`、`catalog.preload` 字段、`registerWsHandler`、`registerDatabaseIpcHandler`、`registerDataSync`、`registerTableInit`、`registerConversationDisplayProvider`。
其中 **4 个注册函数的唯一消费者就是 app-circle**（`registerWsHandler`、`registerConversationDisplayProvider` 在归位后已无消费者；`registerDataSync` / `registerDatabaseIpcHandler` / `registerTableInit` 仍被仓库外商业包 `beaver-desktop-ai` 使用，保留）。

## 搬迁映射

### 归位到 `src/main`（13 个文件）

| 原位置（`packages/app-circle/src/main/`） | 新位置 |
| --- | --- |
| `api/circle.ts` | `src/main/api/circle.ts` |
| `business/circle/circle.ts` | `src/main/business/circle/circle.ts` |
| `database/tables/circle/{circles,sync-status}.ts` | `src/main/database/tables/circle/` |
| `database/init/circle/{index,circles,sync-status}.ts` | `src/main/database/init/circle/` |
| `database/services/circle/{circle,sync-status}.ts` | `src/main/database/services/circle/` |
| `datasync/circle/{index,circle}.ts` | `src/main/datasync/circle/` |
| `message-manager/receivers/circle/{index,circle}.ts` | `src/main/message-manager/receivers/circle/` |
| `ipc/render-to-main/database/circle/index.ts` | `src/main/ipc/render-to-main/database/circle/index.ts` |
| `conversation/display-provider.ts` | 删除，逻辑内联进 `src/main/business/chat/conversation.ts` |

### 并入宿主既有文件（不再有自己的一份）

| 原位置 | 处理 |
| --- | --- |
| 圈子的 `NotificationModule` / `NotificationCircleCommand` | `NotificationModule` 整体上移到 `packages/beaver/src/common/type/notification.ts`，宿主 re-export；`DATABASE_CIRCLE_CHANNEL` 由枚举派生，字符串只出现一次 |
| 圈子 `DataCircleCommand` / `DatabaseCommand.CIRCLE` | 并进 `src/common/type/ipc/{database,command}.ts` |
| 圈子 `IDBCircle` | 上移到 `packages/beaver/src/common/type/database.ts`，宿主 `src/common/type/database/db/circle.ts` 转发 |
| 圈子 ajax 类型（40 个 `ICircle*`） | 上移到 `packages/beaver/src/common/type/ajax/circle.ts`，宿主 `src/common/type/ajax/circle.ts` 转发 |
| 圈子 datasync 版本摘要类型 | 并进 `src/common/type/ajax/datasync.ts` |
| `preload/circle.ts` + `common/type/preload/circle.ts` | 删除；改走 `electron.database.circle` |
| `main/activate.ts` | 删除；`IMainPluginModule.activate` 改为可选，纯 UI 包不再写空函数 |

### 留在包内（39 个文件，原 63）

`renderer/**`（UI + store + assets）、`main/application/circle.ts`（窗口创建）、`main/manifest.ts`、`main/index.ts`、`index.ts`。

`package.json` 的 `exports` 删掉 `./preload`、`./common`、`./common/*`；`catalog.ts` 删掉 `preload: 'circle'`。

## 顺带解决

- `src/main/message-manager/index.ts` 删掉 `getWsHandler` 查表分支，`CIRCLE_OPERATION` 与其它命令一起进同一个 `switch`——ws 从两套派发回到一套。
- `src/main/business/chat/conversation.ts` 删掉 `resolveConversationDisplays` 调用，圈子的头像昵称直接从 `dbServiceCircle` 读；`beaver` 的 `conversation/display-registry.ts` 随之删除（已无消费者）。
- 新增 `src/common/utils/conversation/circle.ts`（`parseCircleId` / `toCircleConversationId`），主进程与渲染共用一份；`message.vue` 不再从插件包取函数。
- `src/render/windows/app/pinia/circle/circle.ts` 由 `requirePluginApi('circle')` 改为 `electron.database.circle.getCircleList()`，删掉「插件未启用就返回空数组」的兜底。

## 验收结果

| 指标 | 结果 |
| --- | --- |
| `vue-tsc --noEmit` | 0 错误 |
| `vite build --mode main`（宿主） | 通过 |
| `vite build --mode renderer`（宿主） | 通过 |
| `app-circle` main / renderer 构建 | 通过（main 从 ~9kB 降至 1.36kB，4 个模块） |
| 宿主 import 插件实现 | 仅剩 `message.vue` 的 3 个 UI 组件（UI 引 UI，合法） |
| `grep -rn 'app-circle' src/common` | 无 |

## 遗留（本次未做，与本次裁决无关）

1. `src/common/type/ajax/{doc,moment}.ts`、`src/render/api/{doc,moment}.ts` 仍是「宿主转发到插件包」的兼容层，与 circle 原来同型。按同一判据，doc/moment 的数据也应在宿主或迁到 `beaver/common`。
2. `packages/app-moment/src/common/type/preload/notification.ts` 的 `NotificationModule` 副本现在可以直接删——整表已在 `beaver/common`。
3. `packages/app-settings`、`packages/app-workbench` 的 preload 是平台能力（设置、内嵌视图），挂在插件命名空间下仍不合分层；两者都不是插件。
4. `database` 的 6+1 个域、31 个子命令、60+ 个 preload 方法仍是「每域一个 handler + 一个 switch」，尚未收敛成通用 `database:read`。
