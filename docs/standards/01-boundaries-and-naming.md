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
不能因为“目前先做一个窗口”就取消 main/common，把所有逻辑和类型挤到 .vue。preload 是按需的第四层，拼写统一为 preload。
用户说的 render 是渲染进程这一层；本仓宿主实目录是 src/render，现有能力包实目录是 src/renderer。
新能力包沿现有 src/renderer；独立仓沿自己的唯一约定，不同时新建 render 和 renderer 两份。

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
    preload/                   可选：确需自己的桥方法/插件工厂时才增加
```

**适用范围不是随意豁免**：上表对业务能力子包/独立业务子仓是硬要求。
[app-circle](../../packages/app-circle/src)、[app-call](../../packages/app-call/src)、[app-doc](../../packages/app-doc/src)
现有 main/common/renderer 是实物参考。存量其他业务包尚未逐个整改（本轮文档任务未移动源码）；在后续开发或重构中遇到不符合三层分区的业务包，直接按此结构拆分调整并删除旧路径，不需要保留兼容转接。
[beaver-ui](../../packages/beaver-ui/src) 这类纯UI包、没有进程能力的纯工具库不是独立业务运行时，不伪造空 main/preload；
但一旦开始拥有窗口、数据库、连接或跨进程业务，应重新归类，不能靠“工具包”名字规避三层结构。
共享平台 [beaver](../../packages/beaver/src) 本身也已有 common/main/renderer，继续保持层次。

依赖方向：main 实现依赖本包 common 的契约；renderer/preload 使用 common 类型和允许的桥/公开入口，
不得让 common 反向 import main/renderer，不得让 renderer 导入 main 实现。主进程接口写法见[第3章](02-types-and-api.md)。
preload 可选不等于安全可选：复用宿主桥就不另建文件；新增桥仍必须遵守[第5章](04-electron-and-ipc.md)。

[下一章：类型与接口](02-types-and-api.md) · [返回目录](../README.md)
