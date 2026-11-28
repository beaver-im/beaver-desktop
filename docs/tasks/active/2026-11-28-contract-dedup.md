# 任务：平台契约去重（通知通道 / preload / 命令枚举）

- 状态：已执行（类型与构建验证通过，待人工复核运行时）
- 创建：2026-11-28 17:00（Asia/Shanghai）
- 仓库 / 分支：beaver-desktop / feature-0801
- 关联：[circle-data-relocation](./2026-11-28-circle-data-relocation.md)（同一天的数据层归位）、[ADR 0004](../../decisions/0004-module-tiering.md)

## 起念

「packages 里好多关于数据库的都应该回归主包吧？包括统一的 preload 之类的。」

先纠正一个事实：**数据库本体（SQL、表、service）已经 0 处残留在包里**。`better-sqlite3` 全仓只有
[src/main/database/db.ts](../../src/main/database/db.ts) 一处，`IDatabaseModule` 只有宿主一份，11 个能力包的 `src/main` 里没有任何
`database/`、`tables/`、`BaseService` 痕迹（circle 归位后清零）。

用户扫 packages 时看到的「数据库」，实际是**名字里带 database 的通知通道**（`'database:group'`、`'database:chat'`…），
以及**各包自己抄的 preload 契约**。这两样才是真问题。

## 实证（改动前）

| 重复物 | 副本数 | 位置 |
| --- | --- | --- |
| `NotificationModule` 枚举 | **8** | beaver/common + audio / image / search / updater / video / call / moment |
| `Notification*Command` 枚举 | **15** | 同上七包（moment 一份就抄了 9 个） |
| preload 接口类型 | **4** | moment 的 `preload/{app,storage}.ts`、`mainStore`、`settings` 全是宿主同名文件抄本 |
| preload 实现 | **2** | `app-settings/src/preload`、`app-workbench/src/preload` + catalog `preload` 字段 |
| `declare const electron` | **14** | 每个包都声明成 `any`，preload 强类型只有宿主自己享受 |

抄本的自我辩解写在注释里：「按模块边界允许重复」——这是引用不通之后的选择，不是设计。

## 改了什么

### 1. 通知契约全部收进 `@beaver-im/beaver/common`

`packages/beaver/src/common/type/notification.ts` 现在是唯一一份：`NotificationModule`（12 个通道）、
12 个 `Notification*Command`、`NotificationCommandMap`、`INotificationPayload`、`AppLifecycleStatus`、`DATABASE_CIRCLE_CHANNEL`。

宿主 [src/common/type/preload/notification.ts](../../src/common/type/preload/notification.ts) 改为薄转发
（显式列出 re-export，不做 `export *` 以免带出无关符号），只保留 preload 侧的 `INotificationModule`、
`SystemNotificationOptions`、`TrayUpdateOptions`。

7 个包的 `common/type/preload/notification.ts` 全部删除，引用改 `@beaver-im/beaver/common`：
audio、image、search、updater、video、call 各 1–2 处；moment 通过 `common/index.ts` 聚合了 9 个枚举，一并拆掉。

### 2. 平台 preload 收回宿主

`settings` 与 `workbench` 是**宿主自有窗口**，不是第三方能力包。它们的 preload 之前挂在插件命名空间下，
意味着 catalog 里关掉某个开关会连带关掉平台设置——这是错误的耦合。

- 新增 [src/preload/electron/settings.ts](../../src/preload/electron/settings.ts)、[workbench.ts](../../src/preload/electron/workbench.ts)，
  与 `logger`/`database`/`notification` 同级静态装配进 `electronAPI`
- 新增 [src/common/type/preload/settings.ts](../../src/common/type/preload/settings.ts)（`ISettingsModule`）、
  [workbench.ts](../../src/common/type/preload/workbench.ts)（转发 beaver 的形状）
- `ElectronAPP` 增加 `settings`、`workbench` 两个必选字段
- 删除两个包的 `src/preload/`、`src/common/type/preload/`，`package.json` 去掉 `./preload` 导出
- `catalog.ts` 去掉这两项的 `preload:` 字段

### 3. 命令枚举上移

`SettingsCommand`、`WorkbenchCommand` 的发起方是宿主 preload、受理方是包内 handler，两侧不能互引，
只能放契约包。新增 `packages/beaver/src/common/type/ipc.ts`；包内 `common/type/ipc/command.ts` 改为转发。

`WORKBENCH_EMBED_STATE_CHANNEL`、`IEmbedViewBounds`、`EmbedViewLoadState`、`IWorkbenchEmbedStatePayload`
连同 `IWorkbenchModule` 一起进 `packages/beaver/src/common/type/preload.ts`，包内
`common/type/main/{embed-view,web-contents-view/workbench}.ts` 改为转发。

### 4. moment 的四份宿主抄本

`preload/notification.ts`(334 行)、`preload/app.ts`(78 行)、`preload/storage.ts`(51 行)、`mainStore/index.ts`(70 行)、
`settings/index.ts` 全部删除。`store/user/user.ts` 里的 `IStoreDataMap` 是 import 了从未使用，`IStorageModule` 只用于
`electron.storage as IStorageModule` 断言——`electron` 本来就是 `any`，断言无意义，一并去掉。

### 5. 顺带修的工程问题

`tsconfig.app.json` 的 `paths` 缺 `./` 前缀且无 `baseUrl`，导致 `npx vue-tsc -p tsconfig.app.json` 直接报 TS5090；
而仓库脚本 `build:renderer` 用的是 `vue-tsc --noEmit`（读根 tsconfig，`files: []` + `references`），**实际什么都没检查**。
补上 `./` 前缀后类型检查才真正跑起来——跑出 988 行既有错误（`res.result` 可能 undefined、`@beaver-im/beaver-ui/message`
解析不到、`@packageCommon/...` 之类），全部为存量问题，本轮只修了其中与改动相关的一条
（`app-settings/activate.ts` 的 hook 返回值类型）。

## 结果

| 指标 | 前 | 后 |
| --- | --- | --- |
| `export enum NotificationModule` 定义处 | 8 | **1**（beaver/common） |
| 包内 `preload/` 目录 | 2 实现 + 4 类型抄本 | **0** |
| `catalog.preload` 声明 | 3（agent/workbench/settings） | **1**（agent，仓库外商业包） |
| `packages/app-settings`、`app-workbench` exports | 含 `./preload` | 无 |

## 验收

```bash
grep -rn 'export enum NotificationModule' src packages --include='*.ts' | grep -v dist   # 1 行
find packages -type d -name preload -not -path '*/node_modules/*'                        # 无输出
grep -n 'preload:' build/plugin/catalog.ts                                               # 仅 agent
```

- 宿主 `vite build --mode main` / `--mode renderer`：通过
- beaver `vite build --mode common` + `tsc -p tsconfig.build.json`：通过
- 10 个受影响包 `vite build --mode renderer`：通过
- `node scripts/check-knowledge.mjs`：无 FAIL

## 遗留（未在本轮处理）

1. **`declare const electron: any` 仍是 14 份。** 要变强类型需要把 `ElectronAPP` 及 15 个 `I*Module`（1396 行 + `ajax/db/cache`
   依赖）整体上移 beaver/common，范围远大于本轮。目前包内 electron 调用零类型约束。
2. **`src/common/type/ajax/moment.ts`、`src/render/api/moment.ts` 反向依赖 `@beaver-im/app-moment`**，注释写着
   「宿主兼容层」。方向与本次整改相反，应把 moment 的 ajax 类型收进 beaver 或宿主自留。
3. **既有 988 行类型错误**：`build:renderer` 的 `vue-tsc --noEmit` 实际空转，等于全仓没有类型门禁。建议改成
   `vue-tsc -p tsconfig.app.json --noEmit` 并分批清理存量。
4. IPC handler 仍留在 `app-settings` / `app-workbench` 包内（经 `registerIpcHandler` 注册）。这是合法扩展点
   （仓库外商业包也在用），但两个包是宿主自带窗口，handler 是否也收回宿主需另行判断——本轮只收 preload。
