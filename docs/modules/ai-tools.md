# 第17章　AI 面板、MCP 与本机工具

最后核验：2026-11-22（Asia/Shanghai）。

## 入口与职责

- [宿主 AI 面板](../../src/render/components/business/aiPanel)：pages、store、notification-manager；主窗入口不是独立 AI 窗口的全部实现。
- [render/api/agent.ts](../../src/render/api/agent.ts)、[common/type/ajax/agent.ts](../../src/common/type/ajax/agent.ts)：宿主 Agent API 与类型。
- [main/mcp/index.ts](../../src/main/mcp/index.ts)：McpManager、连接/注册 server、callTool、manifest 与 reportCapabilities。
- [main/mcp/tools](../../src/main/mcp/tools)、[toolRoot.ts](../../src/main/mcp/toolRoot.ts)：内建 MCP 与执行根上下文。
- [main/tools](../../src/main/tools)：fs、shell、git、search、analyze、shared 等本机工具实现。
- [main/api/mcp.ts](../../src/main/api/mcp.ts)：能力上报接口。
- [main/server/index.ts](../../src/main/server/index.ts)：本地 Koa 服务；路由在 [routes](../../src/main/server/routes)，不要将它误认为全部远端 AI 服务。
- 外置 @beaver-im/app-ai 的真实 link 路径见 [package.json](../../package.json) 与[架构](../architecture.md)。

## 边界与风险

getMcpManager 初始化内建与包注册 server，callTool 接受 server/tool/args/root；修改参数时核对服务端 schema、UI 卡片及回传协议。
MessageManager 在 WS 连通且同步后尝试上报能力；别把 UI 按钮出现当成本机工具注册成功。
AI 流式显示、会话记录与工具结果是不同层次，先看[消息指南](messaging-sync-storage.md)并核实当前用户/机器人身份与连接协议。
文件/命令执行必须逐项检查路径约束、允许范围、参数校验、超时、取消、错误回传与日志脱敏；现有接口不代表安全性已经审计。
不要为了验证工具而执行危险命令或访问用户秘密；使用隔离临时目录和明确允许的无害操作。
不在本指南猜测远端模型、Agent 编排或 Connector/Expert 的服务端策略。

## 定位关键词

McpManager、getMcpManager、getMcpServers、callTool、reportCapabilities、runWithToolRoot、chat_message_stream_receive。

## 验证方式

宿主 main/renderer 构建；涉及独立窗再验证 build:ai，相关平台契约检查见[矩阵](../workflow.md)。
行为用例：能力上报失败、未知工具、无效参数、越界路径、执行失败/超时、断线、流式结束/取消、窗口关闭。
这些是风险导向检查项，不宣称本仓已实现全部保护或已有对应自动化测试。

---
[返回《海狸桌面端工程手册》全书目录](../README.md)
