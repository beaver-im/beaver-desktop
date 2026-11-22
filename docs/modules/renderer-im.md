# 第14章　主窗口与核心即时通讯界面

最后核验：2026-11-22（Asia/Shanghai）。

## 职责与入口

- [app/main.ts](../../src/render/windows/app/main.ts)、[app/App.vue](../../src/render/windows/app/App.vue)：Vue/Pinia/路由和通知入口。
- [app/router](../../src/render/windows/app/router)、[app/page](../../src/render/windows/app/page)：主窗导航与业务页面。
- [app/pinia](../../src/render/windows/app/pinia)：conversation、message、contact、friend、group、notification、emoji、user、circle、通话等组合状态。
- [app/notification-manager](../../src/render/windows/app/notification-manager)：main 通知消费。
- [render/api](../../src/render/api)：HTTP 业务 API；[render/utils/request](../../src/render/utils/request)：请求封装。
- [render/core/message](../../src/render/core/message)、[render/core/media](../../src/render/core/media)：消息/媒体渲染相关能力。
- [render/components/business](../../src/render/components/business)、[render/components/ui](../../src/render/components/ui)：宿主业务组件和 UI。
- [login/main.ts](../../src/render/windows/login/main.ts)：登录渲染入口。

## 依赖与接口

UI 调用平台桥/IPC 或 API 封装，Pinia 消费数据与通知；展示层状态不是持久消息事实源。
好友/群/用户/表情/通知从页面追到对应 API、store 和 main business/datasync，不为改一个视图扫描全部域。
圈子、文档等能力在主窗的侧栏入口、名片或薄封装可留宿主，不强制反向 import 独立窗口包。
聊天多媒体需一起核对本地文件路径、远端 URL、上传状态、预览窗口与异常提示，不能只验证组件能显示样例。
AI 面板单列于[AI 指南](ai-tools.md)；通话与独立预览窗口见[能力包](capability-packages.md)。

## 定位关键词

notificationManager、createPinia、conversation、message、sendMainNotification、ChatToolbar、ChatEditor、sidebar。

## 验证方式

对改动文件做不带 --fix 的 ESLint；根 build:renderer 包含 vue-tsc 与构建。
验收关注：会话切换、未读状态、空/加载/错误态、通知重复订阅、退出换号、图片/语音/视频异常。
纯样式改动不需全后端构建，但要记录实际 UI 验证及未验证的系统平台差异。

---
[返回《海狸桌面端工程手册》全书目录](../README.md)
