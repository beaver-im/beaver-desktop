# 第8章　错误处理、日志与资源清理

## 8.1 已封装的失败不重复 catch；其他异常边界须区分

**事实**：主进程 [request.ts](../../src/main/utils/request/request.ts) 把网络失败转换成失败 code；
[MCP 管理器](../../src/main/mcp/index.ts) 与 [插件激活](../../src/main/plugin/activate-plugins.ts) 有需要隔离失败的异步流程。
原参考第62行广泛禁止业务 try/catch。已统一返回 code/msg 的请求按原条款不重复 catch；
是否连文件/数据库/SDK 的真实异常边界也一概禁止，原文与现有实现有范围冲突，必须列为待确认，不能由我静默宣布废除。
上述第3项范围冲突在用户裁决前暂不擅自删改对应异常边界；但对已确认多余的包装或错误吞没直接修改并删除冗余处理，不吞错误伪装成功。下表解释异常类别与风险，不宣称原条款已无歧义迁移。

| 场景 | 应怎么做 | 原因 |
| --- | --- | --- |
| 已返回 code/msg 的预期失败 | 判断 code，失败用 msg/领域错误；不读 result | 失败作为返回值，不需要每层再包同样的 catch |
| 可能 reject/throw 的文件/库/SDK | 在能恢复、转译或隔离的边界 catch | 不处理会丢失用户反馈、资源或任务状态 |
| 当前层无法处理 | 继续抛给已定义的上层边界 | 不 catch 后返回空对象伪装成功 |
| 任何需要释放资源的路径 | finally / 生命周期清理 | 成功和失败都必须释放 |

错误至少保留可追踪的操作标识和安全的说明；同一错误不要每一层打印一份完整堆栈。
需要统一或修正网络与 IPC 错误响应语义时，直接改齐协议定义、封装层与所有调用方，不保留旧错误格式兼容分支；禁止未同步调用方就局部修改造成失配。

## 8.2 日志有上下文，但不能有秘密

使用所属层已有 Logger 封装，不把调试 console 留作业务唯一诊断入口。
**写法示例（Logger 用法来自现有主进程；操作名为示意）**：

```ts
import Logger from 'mainModule/utils/logger'
const logger = new Logger('MessageOperation')
logger.info({ text: '操作结束', data: { operationId: 'example', count: 1 } })
// 反例：logger.info({ text: JSON.stringify({ token, fullChatHistory, requestConfig }) })
```

记录操作、关联 ID、状态、必要计数与耗时；禁止新代码把令牌、请求头、完整聊天内容、完整文件内容或未经脱敏配置直接写日志。
现有请求封装有序列化 response/config 的日志分支；这是待按任务评估的存量差异，不代表这些日志已脱敏或本轮完成安全整改。

## 8.3 谁创建谁负责停止，回调必须能精确退订

**可独立理解的写法示例（假设函数不是本仓 API）**：

```ts
function startPolling(poll: () => void): () => void {
  const timer = setInterval(poll, 1000)
  return () => clearInterval(timer)
}
const stop = startPolling(() => { /* 执行一次无异步泄漏的检查 */ })
stop() // 在拥有者销毁/退出时调用，不是说创建后立即停止
```

Vue 的 onUnmounted/onBeforeUnmount 释放本组件订阅；main 的窗口/账号/应用生命周期释放各自资源。
IPC 监听用同一个回调引用退订，不对共享通道乱用 removeAllListeners 抹掉别人的监听。
避免在异步任务已失效后继续写入 UI：快速换会话/退出时要取消或验证结果仍属于当前请求/用户。
**反例**：每次打开窗口 setInterval，却从不保存句柄；catch 后提前 return 导致锁/句柄不释放。

## 8.4 评审检查

- 每个异步错误是否被处理一次，失败是否被伪装成功，取消是否与错误混为一谈？
- 日志是否足够定位而不泄露内容；敏感调用是否有必要的安全审计事件而非原始数据？
- 关窗、退出、断线、中途失败后是否释放监听/句柄/计时器，重开是否重复？

[接下来：第9章新增页面](../how-to/01-add-page-or-feature.md) · [返回目录](../README.md)
