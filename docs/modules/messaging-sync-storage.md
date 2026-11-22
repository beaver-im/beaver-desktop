# 第13章　消息、连接、数据同步和本地存储

最后核验：2026-11-22（Asia/Shanghai）。

## 职责与入口

- [ws-manager/index.ts](../../src/main/ws-manager/index.ts)：核心 IM 连接、发送、重连。
- [message-manager/index.ts](../../src/main/message-manager/index.ts)：WS 回调、同步队列、命令分发及 ACK。
- [receivers](../../src/main/message-manager/receivers)：chat/friend/group/notification/user/emoji/call 接收路由。
- [business/chat/message.ts](../../src/main/business/chat/message.ts)：sendMessage、超时、本地发送状态、历史与范围补齐。
- [business](../../src/main/business)：用户、好友/验证、群、通知、表情及会话业务边界。
- [datasync/manager.ts](../../src/main/datasync/manager.ts)：autoSync；[datasync](../../src/main/datasync)：各域版本检查和同步。
- [database/db.ts](../../src/main/database/db.ts)、[database/init](../../src/main/database/init)、[database/tables](../../src/main/database/tables)、[database/services](../../src/main/database/services)：实例、初始化、表与持久服务。
- [api/datasync.ts](../../src/main/api/datasync.ts)、[common/type/ws](../../src/common/type/ws)、[common/type/database](../../src/common/type/database)：远端同步与消息/数据库契约。

## 关键链路与依赖

发送从 MessageBusiness.sendMessage 追到本地记录、WsManager.sendMessage、ACK/超时和 UI 通知。
接收由 MessageManager 路由，扩展命令可通过平台 getWsHandler 注册；不要仅在 switch 添加半条链路。
连接成功调用 autoSync；普通帧同步期间入队，chat_message_stream_receive 是不入队的特殊分支。
同步项除宿主各域外还包含 getRegisteredDataSync 返回的扩展项。
表结构变化必须同步更新初始化、service、同步转换、字段默认值与 UI 读取，不需要写兼容旧表结构的历史过渡层，废弃列/表直接删；“无历史包袱”不等于可以忽略写入一致性或未经授权直接删用户真实本地库。

## 定位关键词

sendMessage、handleAck、handleMessageTimeout、processMessage、isStreamFrame、autoSync、checkAndSync、syncMessagesByVersionRange、getDb。

## 验证方式

main 构建；协议/共享类型变化补 renderer/共享平台检查，按[矩阵](../workflow.md)执行。
行为矩阵：发送成功/失败/超时/重复 ACK；断线重连；同步期间到消息；重复与乱序；流式帧不中断显示；用户切换不串库。
涉及存储时在隔离测试数据上验证空库/已有库、幂等回放和异常恢复，不能未经授权动真实聊天数据库。
根清单没有 test 脚本，不能宣称上面的场景已有自动覆盖。

---
[返回《海狸桌面端工程手册》全书目录](../README.md)
