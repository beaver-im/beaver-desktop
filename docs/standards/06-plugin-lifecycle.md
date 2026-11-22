# 第7章　插件装配、激活与生命周期

这里的插件指本工程的能力包装配，不自动等同于安全隔离的第三方插件市场。

## 7.1 先分构建期和运行期

**事实**：[catalog.ts](../../build/plugin/catalog.ts) 声明 enabled / optional / root / preload / renderer；
[discovery.ts](../../build/plugin/discovery.ts) 生成虚拟模块；
[activate-plugins.ts](../../src/main/plugin/activate-plugins.ts) 加载、核对 manifest.id、激活与登记窗口。

- enabled=false 是构建期开关，不是启动后隐藏一个按钮。
- optional 允许包缺失；必需包缺失不能指望运行时 try/catch 挽救构建。
- root 指外置仓；preload 给命名空间；renderer 显式声明主窗 UI 注入，不把所有插件 UI 都打入主窗。
- 窗口由 application / extraApplications 注册；不在另一处另写一套窗口清单。

## 7.2 副作用放 activate，不放 import 顶层

**真实摘录（节选）**：[圈子 activate.ts](../../packages/app-circle/src/main/activate.ts) 在 activate 内注册：

```ts
registerDataSync(circleDatasync)
registerWsHandler('CIRCLE_OPERATION', content => circleMessageRouter.processCircleMessage(content))
registerTableInit(initCircleTables)
```

上述调用是 activate 函数体节选，不能复制到文件顶层直接运行。
**新代码约束**：顶层只定义类型、常量、函数与安全构造；连接网络、注册监听、建表、启动定时器等放明确生命周期。
反例：import 一个包就注册相同 WS handler，重载后出现重复处理。原因是 import 顺序和资源归属变得不可控。

## 7.3 初始化、释放与失败

- 遵守宿主先 bindMain 再 activate、消息/IPC 后初始化的现有顺序，修改顺序先分析消费者。
- 一项订阅/计时器/窗口对应一个明确拥有者；开始前说明何时结束，结束要释放或复用，不能每次开窗永久累加。
- 当前生命周期/注册协议缺少退订句柄或清理能力时，直接修改平台注册协议补齐能力并同步所有插件包与宿主实现，不需要保留无退订能力的旧接口兼容层；未改源码前不编造现成 deactivate API。
- 单包激活失败隔离只说明宿主能记录错误继续；不证明半途注册的资源都自动回滚。失败中途的清理必须评审。
- 新窗口走真实装配与导出链，不靠目录存在或 package.json 列了依赖就断言已启用。

资源清理写法见[第8章](07-errors-and-resources.md)；新包操作顺序见[第11章](../how-to/03-add-capability.md)。

## 7.4 评审检查

开/关/再开是否重复注册；同一用户重连是否重复订阅；optional 缺包是否可预期；中途失败是否残留资源。
构建宿主/目标包和涉及的平台消费者；外置包缺环境要报缺口，不复制别的同名仓充数。

[下一章：错误与资源](07-errors-and-resources.md) · [返回目录](../README.md)
