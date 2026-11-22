# 第9章　新增页面或普通业务功能

假设需求：“主窗增加一个会话资料面板”。这是操作示例，不表示仓库已有名为此需求的待办。

## 9.1 先确认是主窗页面，还是独立能力窗口

只是主窗显示会话信息：留在宿主，不为此新建 app-* 插件。
需要独立 BrowserWindow 且有完整本域能力：转[第11章](03-add-capability.md)。归属依据见[第2章](../standards/01-boundaries-and-naming.md)。

## 9.2 沿目录逐步添加

| 步骤 | 实际位置 / 要做什么 | 评审要问什么 |
| --- | --- | --- |
| 1 读相邻实现 | src/render/windows/app/page 相应领域 | 是否已有同类组件/入口，能否复用而不耦合别的窗口？ |
| 2 加视图 | 相应页面或 src/render/components/business | 展示组件是否只接数据/发事件，组件是否采用统一结构？ |
| 3 接入口 | app/router 或相应父组件/侧栏 | 是新路由还是局部面板？不要两种都加一套重复导航 |
| 4 放状态 | 局部 ref，确需共享才放 app/pinia 对应域 | 谁是数据事实源？切会话和退出是否清空/失效？ |
| 5 接数据 | 已有 render/api 与 common/type/ajax | 有真实服务端接口吗？没有就标阻塞，不能虚构 URL |
| 6 需要本机能力 | 通过现有桥；新增协议转第10章 | 页面有没有越层导入数据库、fs 或原始 Electron？ |
| 7 样式资源 | 本 .vue 局部 Less + 领域 SVG | 全局样式是否意外影响别处？图标是否有语义标签？ |

真实定位入口：[app/page](../../src/render/windows/app/page)、[app/router](../../src/render/windows/app/router)、
[app/pinia](../../src/render/windows/app/pinia)、[render/api](../../src/render/api)。

## 9.3 验收与交付

1. 对实际改动文件运行不带 --fix 的 ESLint；运行根 build:renderer，涉及 main 再补对应检查。
2. 手工验证：正常数据、空内容、加载、失败、快速切换会话、退出后返回；实际跑了哪些写清。
3. 若增加长期入口/类型/依赖，更新对应[模块参考](../modules/README.md)；复杂未完成任务留[交接卡](../tasks/TEMPLATE.md)。
4. 交付按[第19章](../workflow.md)列改动/命令/结果/缺口，不只贴截图说完成。

**反例**：在 .vue 内写请求 URL、直接 SQL 落库和任意 IPC 调用，把所有状态放一个 useAppStore，再称“功能已统一”。
[返回全书目录](../README.md)
