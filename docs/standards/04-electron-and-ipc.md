# 第5章　Electron 进程隔离与 IPC 协议安全

IPC 指进程间通信；preload 是界面与 Electron 之间的预加载桥。把调用送到主进程并不自动使它安全。

## 5.1 每一层只做自己的事

| 层 | 应做 | 禁止 / 原因 |
| --- | --- | --- |
| renderer（界面） | 发出有限业务意图、显示结果 | 不直接接管文件系统、数据库、命令执行或原始 ipcRenderer |
| preload（桥） | 将命名方法映射到有限 command、转换参数/结果 | 不向不可信页面暴露任意 event/command 或 Electron event 对象 |
| main IPC handler（入口适配） | 检查调用来源/会话、校验输入、分发业务 | 不相信 renderer 传来的 userId 就是当前用户；不把 UI 参数直接拼 SQL/命令 |
| business / tools（能力实现） | 领域逻辑、权限/路径约束、资源释放 | 不在每个 handler 复制长业务流程 |

证据入口：[preload/electron/index.ts](../../src/preload/electron/index.ts)、[IPC 初始化](../../src/main/ipc/index.ts)、
[render-to-main](../../src/main/ipc/render-to-main)、[契约目录](../../src/common/type/ipc)。

新增 main 对外业务接口的契约、请求/响应与 Api 后缀统一看[第3章3.5](02-types-and-api.md)，
业务子包三层和可选 preload 的归属统一看[第2章2.5](01-boundaries-and-naming.md)。IPC 仍只桥接允许的能力，不暴露整个 main 接口对象。

## 5.2 新协议必须补齐的六件事

1. 在相应 common/type 定义请求、成功/失败含义和 command；网络响应与 IPC 响应不必强行一种格式。
2. preload 暴露明确动作，不暴露“执行任意通道”；同步阻塞 sendSync 不用于网络/文件等慢操作，优先 invoke。
3. main 入口校验调用窗口/来源、登录态、数据格式和资源归属；敏感能力只允许可信窗口。
4. 校验通过后交给业务服务；文件路径需限定允许根目录并处理规范化/符号链接等绕过，不仅判断字符串前缀。
5. 只返回可序列化的必要数据；错误不带令牌、本地敏感路径或内部堆栈。
6. 有订阅就设计退订，有异步就定义超时/取消/失效时行为，消费者同步更新。

**实际链路示例**：[websocket.ts](../../src/preload/electron/websocket.ts) 的 connect 使用 ipcRenderManager.invoke，
传入 IEvent.RenderToMainSyncMsg 和 WebSocketCommand.CONNECT。
事件名带 Sync 不等于调用阻塞；应看真正使用的是 invoke 还是 sendSync，别仅凭名字改协议。

**设计正反例（伪接口，不是本仓新增 API）**：

```text
正确：界面“打开允许的预览文件” → 专用桥方法 → 来源/参数/路径检查 → 预览服务
错误：界面提供任意 command + 任意脚本 → preload 原样透传 → main 直接执行
```

## 5.3 现状不等于全部安全

现有 preload 内部存在通用 invoke/on/off 以支持平台和插件装配；这不是授权页面获得无限桥能力。对过宽、多余或废弃的桥方法应直接收窄或删除，并同步更新调用方，不留万能透传兼容层。
[bridge/index.ts](../../src/preload/bridge/index.ts) 与宿主 preload 的对象范围不同，新增嵌入网页要单独确认信任边界。
本轮没有审计所有 BrowserWindow 的安全配置；新窗口不能弱化隔离来规避代码问题，需评审导航来源、权限和实际暴露面。
上下文隔离等窗口配置、请求来源和主进程校验要同时检查，单靠 TypeScript 不算鉴权。

## 5.4 评审和验证

按[第10章操作步骤](../how-to/02-add-ipc.md)实现；验证正常调用、非法字段、未登录、非授权来源、越界资源、异常和窗口关闭。
main 与 renderer 都有影响时都构建，见[第19章](../workflow.md)。文档校验不会检测权限漏洞。

[下一章：存储与同步](05-storage-and-sync.md) · [返回目录](../README.md)
