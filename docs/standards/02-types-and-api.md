# 第3章　TypeScript 类型、接口请求与数据契约

## 3.1 类型必须跟着边界走

**事实**：[tsconfig.app.json](../../tsconfig.app.json) 开启 strict；请求类型在 [common/type/ajax](../../src/common/type/ajax)，
聊天 API 的真实样例在 [render/api/chat.ts](../../src/render/api/chat.ts)。

**新代码约束**：请求/响应接口沿用 I + 领域动作 + Req/Res；UI props、数据库实体和网络响应分别建模，不把后端整个对象直接当组件可写状态。
类型放所属领域的既有 type 目录，不为跨层方便把所有类型塞进一个巨型 common.ts；跨包契约放所属包公开 common 导出。
普通纯函数优先具体参数与返回类型，导出的边界函数明确返回值。不要用 as 强断言掩盖不一致。

**写法示例（新契约设计示意，不代表已有端点）**：

```ts
interface ILoadCardReq { conversationId: string }
interface ILoadCardRes { title: string; unreadCount: number }
// 请求对象、响应对象各司其职，不把一个 Record<string, any> 传遍整条链。
```

## 3.2 不一刀切禁 any，但不让未知数据无界扩散

- 网络、IPC、JSON、插件等外部输入先当 unknown，运行时校验后收窄；TypeScript 类型在运行时不存在。
- 第三方类型缺失可局部 any，但注释解释来源和边界；对外导出要恢复明确契约，不把 any 一路传到业务层。
- 禁止用 as unknown as 让不兼容契约“看起来能编译”；确需适配时隔离在适配函数并写输入/输出测试。

**可独立理解的校验示例（不是仓库现有 API）**：

```ts
function hasConversationId(value: unknown): value is { conversationId: string } {
  return typeof value === 'object' && value !== null
    && 'conversationId' in value
    && typeof value.conversationId === 'string'
    && value.conversationId.trim().length > 0
}
// 反例：const data = value as any; data.conversationId.trim()
```

上例只校验格式，不证明该用户有权访问此会话；权限验证还要在可信服务层进行。

## 3.3 API 只负责协议适配，不接管页面和业务状态

**真实摘录（省略注释，来自 chat.ts）**：

```ts
export const getChatHistoryApi = (data: IChatHistoryReq) => {
  return ajax<IChatHistoryRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/beaver/api/message/chat/v1/get_chat_history`,
  })
}
```

请求参数、协议地址和泛型放 API 层；会话合并、重试决策放对应业务服务；提示/加载态放 UI/状态层。
禁止在 API 文件里导入页面组件、弹成功对话框或悄悄改 Pinia，以免一次请求附带不可见副作用。
使用命名导入按需取 Api，不用 import * as xxxApi 把整个领域暴露给单个页面。

**响应事实与限制**：主进程 [request.ts](../../src/main/utils/request/request.ts) 使用 code/msg/result 包装，网络异常会转为失败 code；
其失败分支未必有 result。渲染的 [ajax.ts](../../src/render/utils/request/ajax.ts) 已转发共享平台实现，不能假定两个进程永远同语义。
先核对当前使用的封装，再判断 code；失败时不能直接读取 result，也不另造与当前服务端实际协议不一致的响应形状；协议调整时同步改齐前后端，不留旧形状兼容。
异常分类与 catch 的位置见[第8章](07-errors-and-resources.md)。

## 3.4 评审检查

- Req/Res、UI 类型、持久化类型是否清晰？接口变化是否同时检查请求方和消费者？
- unknown 是否校验；any 是否局限在明确边界；失败分支是否访问了不存在的 result？
- 运行受影响的类型/构建检查，命令见[第19章](../workflow.md)；不能把类型过关当协议正确。

## 3.5 main 对外能力必须有显式接口，不仅是 HTTP

原参考第59～61行：“接口类型以 I 开头，以 Req 或 Res 结尾”“接口方法名必须包含 Api 后缀”
“严禁使用 import * as xxxApi”。用户本轮又点名 main 有接口要写接口；不能只给 render 的 HTTP 方法加后缀。

**统一要求**：main 暴露给宿主/其他模块/桥接调用的业务能力，先在本域 common/type 的相应领域定义请求/响应与可调用方法契约，
再在 main 实现并导出；不是依赖调用方从一个 class 或 any 对象里猜有哪些方法。
main 内部私有 helper 不要求为每个函数/类再造接口；activate、manifest、createBrowserWindow 等平台生命周期/装配成员属于框架协议而非对外业务 Api，按各自职责命名，不机械套用 Api 后缀。是否“对外”看调用边界，不只看有没有 HTTP URL。

| 对象 | 命名 / 放置 / 导出 |
| --- | --- |
| 调用请求与响应数据 | I<Action>Req / I<Action>Res，放所属 common/type/api 或既有 type/ajax/ipc 领域 |
| main 对外业务能力接口 | 示例 I<Name>MainApi，声明可调用方法；它是能力接口，不是 Req/Res 数据对象 |
| 对外业务方法/函数 | lowerCamelCase 且以精确大小写 Api 结束，例如 getSummaryApi；不用 API 或 api 代替 |
| main 实现 | 放本域 main/api 或实际业务服务的门面，import type 依赖 common 契约；公开出口由 main/index.ts/package exports 声明 |
| 跨层调用 | renderer 只拿 common 类型与经 preload 允许的方法，不导入 main 的实现；包外通过公开导出，不深挖 src |

common 的公开 index 导出需要共享的契约；main 的 index 导出实现/工厂。不要把有 Electron 副作用的实现从 common 重新导出。
已有不符合规范的业务方法名或内部接口，在代码任务中可直接按本规范重命名或调整契约并同步修改所有调用方、preload 桥与导出，不需要保留旧命名别名或双入口兼容。

**完整设计示例（新增业务能力的假设代码，不是仓库已有 API，不要求本轮落源码）**：

```ts
// 假设 src/common/type/api/summary.ts
export interface IGetSummaryReq { conversationId: string }
export interface IGetSummaryRes { title: string }
export interface IApiResponse<T> { code: number; msg: string; result: T | null }
export interface ISummaryMainApi {
  getSummaryApi(req: IGetSummaryReq): Promise<IApiResponse<IGetSummaryRes>>
}
// common/index.ts 从本域真实路径以 export type 导出以上契约。
```

```ts
// 假设 src/main/api/summary.ts；readSummary 是显式注入的内部服务，不是假造现有库方法。
import type { IGetSummaryRes, ISummaryMainApi } from '../../common/type/api/summary'
export function createSummaryMainApi(
  readSummary: (conversationId: string) => Promise<IGetSummaryRes>,
): ISummaryMainApi {
  return {
    async getSummaryApi(req) {
      return { code: 0, msg: '', result: await readSummary(req.conversationId) }
    },
  }
}
// main/index.ts 公开导出工厂；renderer 不 import 本实现。
```

示例只表达类型与依赖方向，未实现权限校验和异常转换；真实未知输入须在可信入口运行时校验，
readSummary 可能抛错时须明确负责处理的边界，不能据这个片段宣称已处理所有失败。
code/msg/result 为当前包装约定；对返回 boolean/void 等不一致的存量 IPC 协议，若统一为结构化契约须同步修改所有调用方与 handler，不留旧返回值兼容分支。

**真实对照**：[圈子 main/api/circle.ts](../../packages/app-circle/src/main/api/circle.ts) 已有 circleSyncApi、datasyncGetSyncCircleInfoApi，
请求/响应类型来自同包 [common/type/ajax/circle.ts](../../packages/app-circle/src/common/type/ajax/circle.ts)。
[MainRuntime](../../packages/beaver/src/main/bind/index.ts)、[IMainPluginModule](../../packages/beaver/src/common/type/plugin/index.ts)
也说明主进程存在非 HTTP 的显式契约；它们的存量命名不是本轮已统一到新业务 API 后缀的证明。

评审时检查：是否缺接口、Req/Res 与能力接口是否区分、精确 Api 后缀、契约/实现导出是否分层、调用方是否绕过桥。

[下一章：组件与状态](03-vue-and-state.md) · [返回目录](../README.md)
