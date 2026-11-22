# 第11章　新增一个能力窗口或插件

假设需求：“增加独立业务窗口”。先证明独立闭环有价值，不把每个面板都升级成插件。

## 11.1 决定归属，列出边界

按[第2章](../standards/01-boundaries-and-naming.md)划分：窗口本身/本域 main/类型/API 归能力包；主窗入口、名片和组合状态仍在宿主。
不要用“同一业务名称”把两边全部合并，也不为隔离主窗名字新建渲染注册框架。

## 11.2 参照真实包，而不是凭空发明接口

1. 看目标相近的包 package.json 和公开导出，例如 [app-circle](../../packages/app-circle/package.json)。不要机械复制它全部社交业务。
2. 业务能力子包必须按[第2章2.5](../standards/01-boundaries-and-naming.md)保留 main / common / 渲染三层；本仓能力包渲染目录用 renderer。preload 按桥接需要可选，不以暂未用到为由取消三层。
   main 有对外业务能力时，按[第3章3.5](../standards/02-types-and-api.md)先写 common 契约/Req/Res 与 Api 方法，再写 main 实现与公开导出；renderer 不导入 main 实现。
3. 参考 [manifest.ts](../../packages/app-circle/src/main/manifest.ts)、[activate.ts](../../packages/app-circle/src/main/activate.ts) 的真实签名；
   注册本域表/同步/IPC/WS 放 activate 内，顶层不启动副作用。
4. 窗口暴露符合实际 application/extraApplications 契约；先读当前平台接口，不假设存在自动 deactivate。
5. 在 [catalog.ts](../../build/plugin/catalog.ts) 配置 id/package/enabled，按需 optional/root/preload/renderer。
6. 核对 [discovery.ts](../../build/plugin/discovery.ts) 发现、package exports、preload 工厂与虚拟模块是否匹配；不用手工另写重复装配列表。
7. 本地能力 HTML 开发路由按 [vite.apps.ts](../../vite.apps.ts) 的实际方式接入；外置包依自己的入口/产物约定，不强行套本地路径。
8. 设计窗口关闭、换号、失败中途的释放与重复激活行为；新增生命周期能力需独立说明契约影响。

```text
推荐的职责图（目录设计示意，具体包以现有契约为准）
app-<domain>/src/
  common/    本域公开类型与协议
  main/      manifest / activate / 本域窗口与主进程服务
  renderer/  独立窗口 UI 与局部状态（与 main/common 一起为业务包基线）
  preload/   可选的本域桥/工厂；不另造 preoload 目录
```

## 11.3 验证装配和失败，不只看窗口出现

- 目标包 build；涉及公共契约时跑共享平台与消费者检查，随后宿主 main/renderer。
- enabled=false、optional 缺包、必需包配置错误、manifest 不匹配：明确构建期与运行期分别处理什么。
- 正常开/关/重开；初始化中途失败；退出换号；重复订阅/定时器；本域同步和通知是否只有一次。
- 外置 AI/online 先确认同级仓和依赖，不能拿另一个同名目录代替。
- 新边界/接口写入对应[模块指南](../modules/capability-packages.md)，重要取舍进[ADR](../decisions/README.md)。

**反例**：只新建目录和窗口，然后靠 import 顶层注册一切；或者包缺失时复制一份同名源码绕过错误。
[返回全书目录](../README.md)
