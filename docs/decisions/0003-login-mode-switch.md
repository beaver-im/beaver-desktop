# ADR 0003：登录方式开关与两种登录组件的分工

- 状态：已接受（本轮明确要求并已实施）
- 日期：2026-11-25（Asia/Shanghai）
- 决策者与确认依据：用户在 2026-11-25 对话中逐项确认；以源码现状为证据，不追认历史动机
- 适用范围：桌面端登录窗口（`src/render/windows/login/`）与运行时配置链路
- 替代关系：无

## 背景与约束

登录窗口原本只有一种方式：[App.vue](../../src/render/windows/login/App.vue) 直接渲染 `@beaver-im/js-sdk` 的 `<beaver-login>`，登录在开放平台域完成，桌面端只拿到授权码，再调主服务 `oauth_code_login` 换取 IM Token。这条链路要求同时部署开放平台（open 服务），不适合只部署主服务的自托管场景。

可验证的既有事实：

- 主服务的账号密码登录已经齐备：前端 [auth.ts](../../src/render/api/auth.ts) 有 `emailPasswordLoginApi`，后端 `account_api` 的 `auth_public.api` 有对应公开端点。不需要新增后端接口。
- [views/beaver/login](../../src/render/windows/login/views/beaver/login/index.vue)、[views/beaver/register](../../src/render/windows/login/views/beaver/register/index.vue)、[views/beaver/forgot](../../src/render/windows/login/views/beaver/forgot/index.vue) 三个页面早已写好并由 router 组织，但原 App.vue 没有 `<router-view>`，因此这三个页面从未被实际渲染。
- 根目录 `config.ini` 的运行时读取机制已存在：[config/index.ts](../../src/main/config/index.ts) 的 `loadConfigs()` 已支持 `env`、`tools`、`baseUrl` 覆盖，改配置无需重新打包。
- 配置从主进程到渲染层已有完整透传链：`process.custom` → [bind.ts](../../src/main/plugin/bind.ts) 的 `getCustom()` → [application/base.ts](../../packages/beaver/src/main/application/base.ts) 的 `getPreloadParams()` → `--custom=` 启动参数 → [preload/app.ts](../../src/preload/electron/app.ts) → `electron.app.*`。

约束：开源项目、无历史包袱、不考虑兼容与实现成本；目标是长期可维护，而非最快落地。

## 决策

**一、单一开关，运行时可读。**

在 `config.ini` 增加 `loginMode`：

- 不配置或写任意非 `beaver` 值 → `open`，开放平台 SDK 登录（保持默认行为）
- `loginMode=beaver` → 主服务自有账号登录，不依赖开放平台

不做旧值迁移、不做别名、不做非法值提示；非法值一律回退 `open`。类型上以 `'open' | 'beaver'` 贯穿 [global.d.ts](../../src/main/global.d.ts)、[IHostCustom](../../packages/beaver/src/common/type/config/index.ts)、[IAppModule](../../src/common/type/preload/app.ts) 三处契约。

取值按**身份来源**命名，而非按实现或泛称命名：`open` 表示身份由开放平台签发，`beaver` 表示身份由本服务自有账号签发。不用 `auth` / `server` 是因为 `auth` 是认证的泛称、两种登录都算认证，无法把两者分开；`server` 也不互斥，开放平台登录最终同样换票到主服务。

**二、两种登录方式是两个独立组件，结构对称。**

```
views/
  open/index.vue               开放平台 SDK 登录
  beaver/index.vue             入口：<router-view />
  beaver/login/index.vue       账号密码登录
  beaver/register/index.vue    注册
  beaver/forgot/index.vue      找回密码
```

- 按**登录方式**分组，不按页面中功能平铺。加第三种方式就是再加一个同级目录，不触碰已有方式的内部结构。
- [App.vue](../../src/render/windows/login/App.vue) 退成纯选择器：只按 `loginMode` 在两个组件间二选一，不含任何登录表单、换票、存盘或跳窗逻辑。
- 两个组件彼此不知道对方存在，互不 import。选择逻辑收敛在一处，避免条件判断散落到各页面。

**三、配置走既有 `config.ini` 通道，不引入 dotenv / `.env`。**

`.env` 是构建期注入，改一个开关就要重新打包；`config.ini` 是运行时读取，自托管部署改一行即可。这里需要的是后者。

**四、现成实现直接用，不重写。**

三个账号密码页面保持原实现，只因目录层级变化调整相对引用和 router 路径；SDK 登录逻辑整体搬到 `views/open/index.vue`，行为不变。

## 为什么这样设计

本决策遵循的通用分组原则——入口薄实现厚、按方式分组而非平铺、变体平级私有下沉、先找现成的再新建——已在[第 2 章 2.6 节：目录划分的设计思想](../standards/01-boundaries-and-naming.md)写为全仓唯一正文，此处不重复。本决策特有的一条是：**部署形态差异（是否部署开放平台）属于部署配置，不属于代码分支**，因此用一个运行时键表达，而非在代码里分叉。

## 备选方案与权衡

| 方案 | 结论 | 理由 |
| --- | --- | --- |
| 用 `.env` + dotenv 做开关 | 不采用 | 构建期注入，改配置需重编；与自托管"改一行生效"的诉求相反 |
| 新建独立的 server 登录组件复刻表单 | 不采用 | 已有三个现成页面，重写等于制造第二份需要同步维护的实现 |
| `views` 下平铺五个页面目录 | 不采用 | 归属不清，新增登录方式时目录继续变乱 |
| 在 App.vue 内用 `v-if` 写两套模板 | 不采用 | 入口膨胀、两种登录逻辑互相污染，违背"两个独立组件"目标 |

## 影响与验证

- 受影响调用方同步：router 三条动态 import 改到 `views/beaver/*`；三个页面因层级 +1 调整 `components/`、`config`、`utils/validation` 与图片的相对引用。
- 配置契约在四处同步：主进程默认值与解析、两处类型、`preload` 解析与暴露；漏任一处会导致渲染层读不到开关。
- 验证证据：`npx vue-tsc --noEmit` 通过；`npx vite build --mode renderer` 通过；全仓搜索确认无残留旧路径引用。运行时的真机登录验证仍需补。
- 前置条件：渲染构建依赖共享包产物，先构建 `@beaver-im/beaver` 与各 `app-*` 包，否则报 `dist/main.js` 缺失（既有构建顺序，非本决策引入）。

## 证据与复审触发

证据：[App.vue](../../src/render/windows/login/App.vue)、[router](../../src/render/windows/login/router/index.ts)、[config/index.ts](../../src/main/config/index.ts)、[bind.ts](../../src/main/plugin/bind.ts)、[application/base.ts](../../packages/beaver/src/main/application/base.ts)、[preload/app.ts](../../src/preload/electron/app.ts)、[auth.ts](../../src/render/api/auth.ts)。相关运行状态另见[第12章](../modules/runtime-ipc.md)。

复审触发：新增第三种登录方式；改动配置键名或透传链路；开放平台登录被移除；决定让登录窗口承载账号管理（注册/找回）之外的职责。届时应更新本页与目录结构，不保留旧路径别名。
