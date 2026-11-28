# 第2章　目录、命名、依赖方向与模块边界

## 2.1 先确定放在哪里

**当前事实**：本项目不是单个 Vue 网站，而是 Electron 桌面宿主 + 共享平台 + 多个能力窗口。
[主进程入口](../../src/main/main.ts)、[平台导出](../../packages/beaver/src/main/index.ts)、[装配清单](../../build/plugin/catalog.ts) 是边界证据。

| 新增内容 | 放置位置 | 不应放在哪里 / 原因 |
| --- | --- | --- |
| 宿主主窗页面、会话入口、布局组合 | src/render/windows/app/page、components、pinia | 不因显示圈子名片就搬进圈子独立窗口包 |
| 主窗可复用业务组件 | src/render/components/business；跨包确有复用再评估 packages/beaver-biz | 不直接混进基础 UI 包，防止 UI 依赖账号/网络 |
| 无业务含义的按钮/对话框等 | 宿主 UI 或 packages/beaver-ui 的相应组件目录 | 不持有消息数据库、连接、账号全局状态 |
| 核心 IM 的业务编排 | src/main/business/<domain> | 不在 .vue 点击回调里做数据库事务或管理长连接 |
| 数据表 / 持久读写 | src/main/database/tables、services；初始化在 init | 不把原始 SQL 散落在页面/IPC 分发器 |
| 宿主 IPC 适配 / preload 桥 | src/main/ipc、src/preload；契约在 src/common/type | 不把 Electron 对象塞进 common 或普通 UI |
| 某能力独立窗口及其本域 main/类型/API | packages/app-<name>/src（外置包依清单 root） | 不把别的模块“沾一点此业务”的代码一起吸进去 |

**统一约束**：先选择已有职责位置；只有确实跨多个使用方的稳定能力才提升到共享包。
不要为一个调用引入通用注册中心、事件总线或无必要架构层；同时一旦发现错位、冗余或多余抽象，直接按依赖方向重构并删除不需要的层，不因改动成本保留错位结构。

## 2.2 能力闭环和依赖方向（统一正文）

- 能力包负责自身独立窗口、本域主进程表/同步/IPC、领域类型与 API；宿主主窗自己的状态和组合留宿主。
- 宿主可以有轻量薄调用/本地 store，不为了消除少量重复反向导入独立窗口实现。
- 主进程使用已有 activate + 注册机制扩展；渲染侧直接组合，不为“宿主完全不点名业务”再建注册框架。
- 能力包调用共享平台公开导出；禁止通过 ../../.. 侵入另一个包 src 内部。
- common 只放可跨层复用的类型/纯逻辑，不导入 Node/Electron/Vue 窗口运行时副作用。

**正例（归属示意，不是新增文件）**：

```text
app-circle：独立圈子窗口 + 本域 activate / 数据库 / 同步 / IPC
宿主：会话列表中的圈子资料、主窗通知路由、聊天名片薄 API
```

**反例**：把主窗 useCircleStore 和名片 API 全搬进 app-circle，再让宿主反向导入包的窗口内部；
或者为一次名片展示搭建渲染插件注册表。这把“同一个业务名”误当成“同一个闭环”。

## 2.3 命名与导入规范

| 对象 | 新代码约束 | 示例（名字示意） |
| --- | --- | --- |
| 业务目录、普通 TS 文件 | 小写开头，多词按相邻领域统一用 kebab-case 或 lowerCamelCase；目录已表达业务时不重复长前缀 | friend/read-cursor.ts，而非 Friend/UserFriendReadCursor.ts |
| Vue 文件 | 小写开头 lowerCamelCase（小驼峰）；**App.vue 是 Vue 默认根组件文件名，固定保留、禁止改成 app.vue**；index.vue 入口可沿用 | messageCard.vue、App.vue、index.vue |
| 类型/类、组件注册名 | PascalCase；请求响应接口按第3章 | MessageCard 是符号名，不要求文件首字母大写 |
| Pinia 导出 | use + 领域名 + Store | useConversationStore |
| 网络 API 方法 | 描述动作并以 Api 结尾 | getChatHistoryApi（仓库已有） |

**整改结果**：原 ChatEditor.vue 等大写开头业务组件已改为 lowerCamelCase（如 auditPanel.vue、chatMenus.vue），业务目录采用 kebab-case（如 chat-actions、chat-reply），并同步全部引用。**App.vue 不参与重命名**：它是 Vue 默认根组件文件名，所有窗口入口固定为 `App.vue`；index.vue 入口同样保留。
ESLint 当前没有替你强制以上全部命名；按“哪里有问题改哪里、不留兼容代码”原则，存量已按此处理，后续新增同样直接规范重命名并同步修改全部引用，不需要保留旧文件名别名或兼容导出。

导入遵循 [vite.apps.ts](../../vite.apps.ts) 与 [tsconfig.app.json](../../tsconfig.app.json)：

```ts
// 写法示例：类型真实存在；同域短相对导入也允许
import type { IChatHistoryReq } from 'commonModule/type/ajax/chat'
import { MessageStatus } from 'commonModule/type/ajax/chat'
// 反例：import ... from '@/...'（此项目没有这一套别名）
// 反例：跨包 import ... from '../../../other-package/src/internal'
```

宿主跨层用 commonModule/mainModule/renderModule/preloadModule；同域短相对路径允许；跨包用 @beaver-im/* 公开导出。
原参考第38行与第65～72行互相矛盾；目前按后段及真实配置，不新增 @/，同域短相对路径保留。
这只是冲突确认前的工作口径，不冒称原文已无歧义；选项见[逐条迁移附录](reference-and-existing-code.md)。

## 2.4 评审检查

- 新文件能解释“为什么放在这一层”？是否把主窗组合误搬进独立包？
- 是否出现 common → main/renderer 的运行时反向依赖、跨包源码深导入或只服务一个调用方的框架？
- 新文件命名/别名符合本章，旧例外是否被明确保留而非宣称全部合规？

## 2.5 业务子包 / 独立子仓必须保留三层分区

**来源区别**：用户本轮明确补充“子仓库也需要分为主进程、渲染进程、common这3部分，有的可能有preoload”；
已读取的76行 Lingma 文件没有这一段，不能冒充从该文件逐字复制。下面是这条补充要求的统一正文。

带运行时业务能力的 app-* 子包及独立业务子仓，必须有 main、渲染层、common 三个职责分区；
不能因为“目前先做一个窗口”就取消 main/common，把所有逻辑和类型挤到 .vue。
preload **不属于能力包**：`window.electron` 的桥由宿主 [src/preload](../../src/preload) 统一装配（包括设置、工作台这类宿主自有窗口），
能力包不新建 preload 目录、不在 catalog 里声明 preload 命名空间。见下方 preload 归属段。

用户说的 render 是渲染进程这一层；本仓宿主实目录是 src/render，现有能力包实目录是 src/renderer。
新能力包沿现有 src/renderer；独立仓沿自己的唯一约定，不同时新建 render 和 renderer 两份。

**唯一例外：数据归宿主的包没有 common 层。** 本地 SQLite 是宿主唯一一个库、一套 schema。某个业务的数据表被两处以上消费
（主窗会话列表、自己的窗口、通知管理器、聊天名片）时，表定义 / datasync / WS 接收 / 数据库 IPC 必须全部在宿主 `src/main`，
能力包只留 `main`（窗口创建）与 `renderer`（界面）；它需要的类型从 `@beaver-im/beaver/common` 取，不新造本包 common。
[app-circle](../../packages/app-circle/src) 即此形态：不持表、不注册 WS/IPC/preload，只提供圈子窗口。
不得以“能力包要自包含”为由把共享数据的表搬回包里——那会让同一个库的 schema 有两个主人，消费者要么反向 import、要么抄一份类型。

**preload 归属：桥是平台的，不是业务的。** 渲染进程能拿到什么能力，只应由宿主决定：

- 平台能力（`database` / `notification` / `storage` / `settings` / `workbench` / `fs` …）一律在 [src/preload/electron](../../src/preload/electron) 静态装配，
  接口类型在 [src/common/type/preload](../../src/common/type/preload)；
- 命令与通道值（`SettingsCommand`、`WorkbenchCommand`、`NotificationModule`、`WORKBENCH_EMBED_STATE_CHANNEL` …）只在
  `@beaver-im/beaver/common` 定义一份，宿主 preload 与包内 handler 同时引用，不各自抄写字符串；
- 能力包不声明 `catalog.preload`、不写 `createPreloadModule`。把平台 API 挂在插件命名空间下意味着
  “catalog 里关掉某项就连带关掉平台能力”，这是错误的耦合；
- 唯一例外是**仓库外商业包**：宿主无法静态 import 它，只能由它导出 preload 工厂，构建期按 `catalog.root` 注入。
  这是 `virtual:beaver-plugin-preloads` 存在的唯一理由，目前消费者只有 `agent`。

```text
app-<domain>/                  业务子包/独立业务仓结构示例，非本轮创建的源码
  src/
    common/                    跨 main/渲染/preload 的类型、协议、无副作用纯逻辑
      type/api/                Req/Res 与对外能力接口
      index.ts                 实际需要对外的契约导出
    main/                      主进程实现、对外 Api、数据库/同步/窗口生命周期
      api/                     本域业务对外调用/协议适配，不能只有隐式实现
      index.ts                 主进程公开导出
    renderer/                  本域界面与本窗口状态（宿主对应 src/render）
```

能力包没有 preload 层。宿主侧的桥只有一个 `contextBridge.exposeInMainWorld('electron', …)`，
命名空间由 [src/preload/electron/index.ts](../../src/preload/electron/index.ts) 静态装配。

**适用范围不是随意豁免**：上表对业务能力子包/独立业务子仓是硬要求。
[app-call](../../packages/app-call/src)、[app-doc](../../packages/app-doc/src)
现有 main/common/renderer 是实物参考；[app-circle](../../packages/app-circle/src) 是“数据归宿主”的参照（无 common）。存量其他业务包尚未逐个整改（本轮文档任务未移动源码）；在后续开发或重构中遇到不符合三层分区的业务包，直接按此结构拆分调整并删除旧路径，不需要保留兼容转接。
[beaver-ui](../../packages/beaver-ui/src) 这类纯UI包、没有进程能力的纯工具库不是独立业务运行时，不伪造空 main/preload；
但一旦开始拥有窗口、数据库、连接或跨进程业务，应重新归类，不能靠“工具包”名字规避三层结构。
共享平台 [beaver](../../packages/beaver/src) 本身也已有 common/main/renderer，继续保持层次。

依赖方向：main 实现依赖本包 common 的契约；renderer/preload 使用 common 类型和允许的桥/公开入口，
不得让 common 反向 import main/renderer，不得让 renderer 导入 main 实现。主进程接口写法见[第3章](02-types-and-api.md)。
preload 可选不等于安全可选：复用宿主桥就不另建文件；新增桥仍必须遵守[第5章](04-electron-and-ipc.md)。

## 2.6 目录划分的设计思想：放哪、怎么分组

前一节表格回答“某类内容放哪一层”，本节回答更常遇到的判断：**一个新的东西该独立成组，还是并入现有组？组里面又该怎么分？** 这些原则从现有目录结构提炼，不新增目录、不发明抽象；判断时可只走这一节。

### 2.6.1 先按运行时职责分层，再按业务归属分组

先问“这段东西在哪个进程跑、被谁调用”，再问“它属于哪个业务”。前者是硬边界：[src](../../src) 的 `main / preload / render / common` 四层，能力包同样有 `main / renderer / common`（preload 按需）。例如数据库事务属于 `main/business` + `database`，不是页面点击回调；只有类型才进 `common`。[app-settings](../../packages/app-settings/src) 与 [app-call](../../packages/app-call/src) 的实际三层分区可作参照。

### 2.6.2 以“可独立交付的完整体”为分组单位

一个能力包、一个窗口、一种登录方式都是完整体，应自包含它私有的 UI、状态、API 和路由，而不是把同类部件按类型摊到上级。证据：[app-call](../../packages/app-call/src/renderer/windows) 一个包内平铺 `call/` 与 `call-incoming/` 两个窗口；登录窗口把开放平台登录与主服务登录各自成组（`views/open/`、`views/beaver/`）。

### 2.6.3 变体平级，私有部件下沉

同一种东西的多个实现放在同一层平级；某种实现私有的子部件收进它自己的子目录，不摊到父层。登录窗口里 `open/` 与 `beaver/` 平级，而账号密码的 `login/`、`register/`、`forgot/` 三个路由页面收在 `beaver/` 下——不是五个目录一起平铺在 `views/`。能力包的多个窗口同理：窗口平铺在 `windows/`，窗口各自的组件与状态留在窗口目录内。

### 2.6.4 父层平铺到“一眼能看出归属”为止

父目录里平铺的项若让人说不清彼此关系，就再抽一层分组。判据：能否用一句话说清这些平铺项的关系？能，就保持平铺；说不清，就分组。此前 `views/` 下平铺 `open / beaver / login / register / forgot` 五个目录时，`login/register/forgot` 到底属于谁并不直观，收成 `open/` 与 `beaver/` 两个、三个账号页进 `beaver/` 后归属自明。分组是为了让人读懂结构，不是为了增加层级；为分组而分组同样违反本节。

### 2.6.5 入口薄、实现厚

入口组件（窗口的 `App.vue`、实现目录的 `index.vue`）只做装配、选择或路由承接，不装具体业务实现。[登录 App.vue](../../src/render/windows/login/App.vue) 只按 `loginMode` 二选一，[beaver/index.vue](../../src/render/windows/login/views/beaver/index.vue) 只放 `<router-view />`，具体逻辑分别在 `open/index.vue` 和 `beaver/` 的三个页面里。这样换一种实现不动入口，改一种实现不碰另一种。

### 2.6.6 目录结构就是系统地图

好的目录结构应当能直接回答两个问题：系统有几种实现、每种实现由哪些部件组成。新增内容时依次判断：它是现有实现的**新部件**（进该实现子目录），还是现有东西的**另一个变体**（在同级加一个目录），还是一个**全新的职责**（另起一个顶层分组）。按这个顺序问，通常无需讨论就能定位。

### 2.6.7 先找现成的，再决定是否新建

动目录或建文件之前，先搜一遍有没有现成实现。有就复用，只调整位置和引用，不重写一份。曾一度新建 `serverLogin.vue` 复刻已有的 `views/login`，属于重复实现，已删除。**“重复造一份”比“位置不理想”更贵**：位置可以改，重复实现要长期同步维护。

### 2.6.8 调整分组时同步清理，不留兼容层

改目录必须同改所有引用——路由的 import、相对路径、资源路径——并删除旧路径，不留别名或转发壳。本次三个页面移入 `server/` 后，router 的三条动态 import、页面里的 `components/`、`config`、`utils/validation` 与图片相对路径一并更新，全仓搜不到残留旧路径。只搬文件不清理引用，等于制造两套入口。

### 2.6.9 落地自检

- 这段东西在哪个进程跑？先分层，再分组。
- 它是某实现的部件、某东西的变体，还是新职责？按 2.6.6 的顺序判断。
- 同级平铺的项能一句话说清关系吗？说不清就分组，但别为分组而分组。
- 每种实现私有的东西都收进自己目录了吗？有没有摊在父层？
- 入口是不是只做选择/装配？具体逻辑有没有漏在入口里？
- 有没有现成的可以复用？没有才新建。
- 改完路径，router / import / 资源引用是否全部同步、旧路径是否删除？

[下一章：类型与接口](02-types-and-api.md) · [返回目录](../README.md)
