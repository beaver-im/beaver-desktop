# 第4章　Vue 组件、Pinia 状态、样式和资源

## 4.1 新组件的默认写法

**事实**：[主窗 App.vue](../../src/render/windows/app/App.vue) 和 [AI 面板](../../src/render/components/business/aiPanel/pages/aiPanel.vue)
采用 defineComponent；[ESLint](../../eslint.config.js) 关闭了 Vue block-order，现有工具并未强制统一块顺序。

**统一约束**：统一 template → script lang=ts → style；组件统一用 export default defineComponent，可在 setup 中组合状态。
不混用 script setup 与 defineComponent 两套写法；旧组件仍混用时在相关任务中直接统一改写并删掉多余写法（仅本次文档任务未改动源码）。

```vue
<!-- 写法示例：纯展示组件，不代表仓库已有该文件 -->
<template>
  <span class="message-label">{{ label }}</span>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'MessageLabel',
  props: { label: { type: String, required: true } },
})
</script>
<style lang="less" scoped>
.message-label { white-space: nowrap; }
</style>
```

组件负责渲染、交互和向外发语义事件；禁止在普通组件导入 better-sqlite3、fs、IPC 原始对象或另建核心 WS。
复杂消息发送/落库放 main/business，页面只发出意图并呈现结果；异步加载的取消/过期响应处理在相应组合逻辑中负责。

## 4.2 状态放哪

| 状态 | 放置 | 原因 |
| --- | --- | --- |
| 单个弹层开关、输入草稿的局部编辑态 | 组件 ref / reactive | 不把短命状态塞成全局依赖 |
| 多组件共享的会话选择/展示数据 | 主窗相应 Pinia 领域 store | 单一维护入口，组件不各存一份冲突副本 |
| 消息持久记录、版本游标 | 主进程 business + database | Pinia 不是持久化事实源 |
| 独立窗口的本域状态 | 该能力包 renderer | 不把窗口内部状态搬成宿主全局 |

**真实模式**：[conversation.ts](../../src/render/windows/app/pinia/conversation/conversation.ts) 导出 useConversationStore，采用 state/getters/actions 对象结构。
新 store 沿用该结构与唯一领域 ID；getter 纯计算，不发请求；action 承担状态编排但不越层直写数据库。
不要在组件之间直接修改另一个组件的内部 ref，跨组件用 props/事件或领域 store。

**新 store 模板（示例，example 必须换成真实领域；不是已有 store）**：

```ts
import { defineStore } from 'pinia'
export const useExampleStore = defineStore('useExampleStore', {
  state: () => ({}),
  getters: {},
  actions: {},
})
```

## 4.3 样式和图标

- 按原参考：使用 Less 并按组件/元素关系嵌套；新组件样式必须放本 .vue 的 style lang=less scoped，禁止另抽 .less 文件。
- [render/assets/style](../../src/render/assets/style) 有存量全局样式，这是事实，不是我替原规则批准的新例外。
  是否允许新建全局/共享 .less 属范围冲突，待确认前不擅自扩张；已有文件不在本轮迁移。
- 功能图标使用 SVG 文件和 img 引用，不在业务模板粘贴大段内联 svg，不用文本表情冒充交互图标。
- 原参考指定宿主 SVG 为 src/render/assets/images/[module]/[name].svg；宿主 SVG 按此归档，子包资源保留本域归属，散落或废弃旧资源直接归位或删除并同步更新引用，不留旧路径副本。
- 按原参考，SVG 素材由 AI 生成/编写；此前我将此条降为非要求不妥，现明确保留。改变素材来源约定需另行确认。
- 图标需可理解的替代文本/按钮标签；纯装饰图标不抢占阅读。资源来源和版权清楚，不假设所有 SVG 都安全。

**反例**：按钮里写一个电话表情当唯一含义、全局 style 修改所有 button、把本地数据库写入塞进模板事件表达式。

## 4.4 评审检查

检查 props/事件边界、单一状态源、空/加载/失败态、快速切换时旧请求覆盖新状态、销毁时清理监听。
按[第19章](../workflow.md)运行 renderer 检查，再手工核对实际交互；没有任意文件行数阈值，按职责拆分。

[下一章：进程与 IPC](04-electron-and-ipc.md) · [返回目录](../README.md)
