# 任务：实时同步协议统一（一种消息、一个路由、一条通道）

- 状态：待裁决（诊断已完成；本卡不改码）
- 创建 / 最后更新：2026-11-28 17:05（Asia/Shanghai）
- 负责人 / 接手者：待确认
- 涉及仓库：beaver-server（message / ws / push）、beaver-server-{social,call,open,backend}、beaver-desktop
- 决策依据：本卡提出；与 [0004](../../decisions/0004-module-tiering.md) 的"注册可撤销 / 类型最小化"同向，不冲突

## 目标、非目标与验收

- 目标：把实时同步收敛成**唯一一种 ws 消息（表变更）**，客户端只按表名路由，不再按业务 command 路由；新增一张表只需"服务端推一次 + 插件声明一次"，宿主 0 改动。
- 非目标：不改消息收发本身；不做新旧协议并行兼容（按项目约定，零兼容层）。
- 可观察的验收条件：
  - 客户端 `src/main/message-manager/` 内不再出现 `CHAT_MESSAGE / CIRCLE_OPERATION / GROUP_OPERATION / FRIEND_OPERATION / EMOJI / USER_PROFILE / CALL / NOTIFICATION` 字面量；
  - 服务端 `wsTypeConst.go` 与 `mqWsConst.go` 的各仓副本不再需要同步；
  - 建圈后 3 秒内主窗会话列表出现该圈子（不再依赖某条业务推送恰好送达）。

## 现象（2026-11-28 16:19 实测日志）

创建圈子成功，日志显示：

```
social /circle/v1/create         → code 0，circleId=638350b1
ws CIRCLE_OPERATION circle_receive → main-circle sync → upsert 16 条 → 广播 database:circle
render-circle updateCirclesByIds → database:circle → circle:getCircleList → 成功 count=16
```

**但会话列表没有该圈子。** 关键否定证据：整段日志里 **没有任何 `CHAT_MESSAGE` 的 ws 消息**。

## 诊断：三层分裂

### 事实 1：后端建圈确实会建会话

`beaver-server-social/app/social/social_api/internal/logic/circle/createcirclelogic.go:100-156` 在 goroutine 里做三件事：

```go
server.InitializeConversation(ctx, nil, &{ConversationID: "circle_"+circleID, Type: 3, UserIDs: []string{userID}})
server.SendNotificationMessage(...)   // 往会话发"创建了圈子"
RocketMQ.SendMessage(TopicRealtimeSync, {command: CIRCLE_OPERATION, body: {tables: [{table: "circles"}]}})
```

注意第三件事只推了 **circles 表**，没推 conversations 表。

### 事实 2：会话表的推送走另一条通道、另一种字段名

`beaver-server/app/message/message_rpc/internal/logic/conversation/initializeconversationlogic.go:213-253`：

```go
payload := {
  "command": CHAT_MESSAGE,
  "type":    ChatConversationMessageReceive,
  "body":    {"tableUpdates": [ conversations, user_conversations ]},
}
pushcli.SendRealtimeApi(ctx, "chat", payload)   // ← channel "chat"
```

- `topicForChannel("chat")` → `TopicRealtimeChat`（`beaver-server/app/push/push_api/internal/logic/realtime/topic.go:33-44`）
- 而建圈那条用 `TopicRealtimeSync`

同一个"表变更"语义，被拆成两个 topic、两个 command、两种 body 字段（`tables` vs `tableUpdates`）。

### 事实 3：两条 topic 的消费语义不一致

`beaver-server/app/ws/ws_api/internal/logic/mqconsumerlogic.go:119-138`：

```go
if sub.topic == TopicRealtimeChat {
    RegisterOrderlyConsumer(...)          // 集群/顺序消费
} else {
    RegisterConsumer(..., true, ...)      // 广播消费
}
```

同文件注释自己写着：「广播模式让每个 WS 实例都收到，才能推给本机连接」。**chat 这一条偏偏用了顺序消费**——多实例部署时，消息只会被分到其中一个实例，而那台上没有该用户连接，`SendMsgToUser` 静默失败；单实例虽然能收到，但这个不一致本身就是隐患。

### 事实 4：失败全部被吞

- social 的三个 S2S 调用在 `go func()` 里，失败只 `logger.Error`，前端拿不到任何信号；
- `pushcli.SendRealtimeApi` 失败同样只记日志；
- 客户端各 receiver 对未知表 `default: break`，静默丢弃。

结果：**后端"建了会话"，客户端"什么都不知道"，中间任何一环断掉都表现为"界面不动"。** 本次就是这一环。

### 事实 5：ws 相关代码在客户端也是双轨

[src/main/message-manager/index.ts](../../../src/main/message-manager/index.ts) 的 `processMessage`：

```ts
const registered = getWsHandler(wsMessage.command)   // 轨道 A：插件自注册（CIRCLE_OPERATION）
if (registered) { void registered(...); return }

switch (wsMessage.command) {                         // 轨道 B：宿主硬编码 8 个 command
  case 'CHAT_MESSAGE': ...
  case 'FRIEND_OPERATION': ...
  ...
}
```

两条轨道并存，且 `receivers/` 下 7 个目录各自再 switch 一次表名（`tables` / `tableUpdates` 两种读法）。

### 事实 6：常量在 5 个仓重复

```
md5(wsTypeConst.go) = a72b23a2  ×  beaver-server / -social / -call / -open / -backend
md5(mqWsConst.go)               ×  同上 5 仓
```

同一个枚举改一处不同步其余四处，就会得到"某类消息永远不到"的这类 bug。

## 判断

不是"拆得太细"，是**实时同步从来没有一个统一协议**。command 名单、body 字段、topic、消费模式、类型常量，五项都按域各写一份。所有乱象都从这一个缺口长出来。

## 方案：一种消息、一个路由、一条通道

### 协议

```jsonc
{
  "command": "TABLE_UPDATE",
  "content": {
    "type": "table_update",
    "body": {
      "changes": [
        { "table": "conversations",      "key": { "conversationId": "circle_xxx" },                          "version": 1 },
        { "table": "user_conversations", "key": { "userId": "100000", "conversationId": "circle_xxx" },       "version": 1 },
        { "table": "circles",            "key": { "circleId": "xxx" },                                       "version": 1 }
      ]
    }
  }
}
```

只有一种 command，只有一种 body 形状。没有业务语义。

### 服务端

- 一套出站函数，替代 `SendRealtimeApi(channel, payload)` 与各域手拼 payload：

```go
push.TableChanged(ctx, userIDs, []TableChange{
    {Table: "conversations", Key: map[string]string{"conversationId": id}, Version: 1},
})
```

- 统一 topic：只保留 `TopicRealtimeSync` + **广播消费**；删除 `TopicRealtimeChat` / `TopicRealtimeBot` 的分流（bot 是另一个协议面，不受影响）。
- 删除：`wsTypeConst.go`、`mqWsConst.go` 的 5 份副本（合并为 1 份共享），以及 `CHAT_MESSAGE / *_OPERATION` 等 8 个 command 常量。
- 建圈不再需要手写推送：`InitializeConversation` 写库后内部发一次 `TableChanged(conversations, user_conversations)`，social 只需要发 `TableChanged(circles)`。

### 客户端

一个 router，按表名找同步器：

```ts
for (const change of body.changes) {
  const sync = getTableSync(change.table)     // 注册表
  if (!sync) continue                          // 本客户端不关心这张表，静默是正确的
  await sync(change.key, change.version)
}
```

- 删除 `processMessage` 里的 switch 与 `getWsHandler`；
- 删除 `receivers/{chat,emoji,friend,group,notification,user,call}` 7 个目录，其内部表判断并入各自 `datasync`；
- `registerWsHandler` 从平台契约移除，只留 `registerTableSync({ tables, sync })`。

插件侧（app-circle）：

```ts
registerTableSync({
  tables: ['circles'],
  sync: (key, version) => circleBusiness.handleTableUpdates(key.circleId, version),
})
```

宿主 `src/` 零业务名。

## 改动点对比

| 动作 | 现在 | 统一后 |
| --- | --- | --- |
| 新增一张表 | 服务端 payload + 新 command + wsTypeConst + 客户端 receiver 目录 + switch 分支 + 插件 registerWsHandler（**6+ 处，跨 2 仓**） | 服务端 `TableChanged` 一次 + 插件 `registerTableSync` 一次（**2 处，各自仓内**） |
| 改表字段 | 服务端类型 + 客户端 3 处映射 | 服务端类型 + 插件内 1 处 |

## 验收标准

1. `grep -riE "CHAT_MESSAGE|CIRCLE_OPERATION|GROUP_OPERATION|FRIEND_OPERATION|USER_PROFILE" beaver-desktop/src/main` 无输出；
2. `ls beaver-desktop/src/main/message-manager/receivers` 为空（目录删除）；
3. `wsTypeConst.go` 全仓仅 1 份；
4. 实测：建圈 → 3 秒内主窗出现该会话；改名 → 会话名同步变；退圈 → 会话消失；
5. 断网 30 秒重连 → `autoSync` 补齐期间全部变更（不依赖 ws 不丢）。

## 风险与顺序

- 顺序消费改广播会增加每个 WS 实例的消费量，需确认连接数上限（广播模式下每实例都要处理全量消息，只做"查本地连接、无连接即返回"的短路，成本可控）。
- 建议顺序：① 服务端统一出站函数与 topic（保留旧 command 同时双发一次，仅用于验证期）→ ② 客户端切到 `TableUpdateRouter` → ③ 删除旧 command 与 5 份常量 → ④ 删 `registerWsHandler`。
  （若坚持零兼容，①②③可合一次提交，代价是无法灰度。）
- 本次「会话列表不出现」在协议统一前若要单独定位：查服务端 `conversations` 表是否有 `circle_638350b1-...`。有 → 问题在推送（`TopicRealtimeChat` 消费/`SendRealtimeApi`）；没有 → 问题在 social→chat 的 S2S 调用。**不要在前端加"再拉一次"的兜底**，那只会掩盖下一处同类断裂。

## 交付与归档

本次仅诊断与方案，未改任何代码。实测与提交待裁决后进行。
