# 第18章　开发、构建与发布边界

最后核验：2026-11-22（Asia/Shanghai）。

## 事实源

[package.json](../../package.json)、[pnpm-workspace.yaml](../../pnpm-workspace.yaml)、[turbo.json](../../turbo.json)、
[vite.config.ts](../../vite.config.ts)、[vite.apps.ts](../../vite.apps.ts)、[tsconfig.json](../../tsconfig.json)。
pnpm 版本以 packageManager 为准，不从旧 README 的示例猜测。每个能力包自己的 package.json 定义输出/脚本。

## 构建依赖

- workspace 为根和 packages/*；build:packages 的 turbo filter 针对 @beaver-im/beaver 与 @beaver-im/app-*，不要误称构建了所有共享包/外置包。
- 外置 AI/online 经 link 引用，由 build:ai/build:online 在同级目录运行 npm build；缺仓或缺依赖时明确报告。
- [build/plugin/catalog.ts](../../build/plugin/catalog.ts) 是能力装配清单；[discovery.ts](../../build/plugin/discovery.ts) 生成 virtual:beaver-plugin-mains / preloads / renderer。
- enabled 是构建期开关；optional 允许缺包，root 指向外仓；preload 声明命名空间，renderer 显式控制主窗 UI 注入。运行时隔离不等于可跳过构建期缺包错误。
- build/plugin 是真实构建源码，build/installer 也有真实安装脚本，不能把整个 build/ 当产物忽略。
- htmlInputs 只包含宿主 app/login；开发态 PACKAGE_HTML 为本地能力窗口重定向到源码页。外置 AI 走自己的 dist。
- build:renderer 实际是 vue-tsc --noEmit 然后 Vite renderer；build:main 单独构建主进程。
- package:win/package:mac 顺序构建外置包、能力包、renderer、main，再 electron-builder，带 --publish never。
- 即使命令不自动发布，签名、打包、安装和任何上传仍应有任务依据，不能在普通文档任务顺手运行。
- package-install 指向 build/installer/index.bat；执行前确认文件和使用场景，不把脚本名存在当作目标文件保证存在。

## 定位关键词

createAliases、htmlInputs、packageHtmlDev、externalOf、pluginLoaders、dev:desktop、build:renderer、package:win。

## 验证与发布清单

具体命令/副作用见[验证矩阵](../workflow.md)。配置变化需检查别名、静态资源、preload/main 导出、开发与打包路径差异。
发布另核对 VERSION 与各清单版本、产物架构、原生依赖、图标/协议、更新源、签名、安装/卸载和升级保留数据。
根 package.json 的发布目标存在占位内容时不能当成有效生产配置；本次知识建设不修发布行为。
本页不承诺已验证 Windows/macOS/Linux 全平台，也不把 README 声明的平台支持等同于本轮验收。

---
[返回《海狸桌面端工程手册》全书目录](../README.md)
