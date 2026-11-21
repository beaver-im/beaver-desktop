<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

<!--
  会话类型标识（圈子 / 数字伙伴 / 机器人）。
  chatType 来自服务端 ChatConversationMeta.Type，组件只做「类型 → 展示」映射。
  新增类型：common/utils/conversation/chatType.ts 加枚举 + 下方 CHAT_TYPE_BADGES 加一条配置。
-->
<template>
  <span
    v-if="badge"
    class="chat-type-badge"
    :style="{ color: badge.color, backgroundColor: badge.background }"
  >{{ badge.text }}</span>
</template>

<script lang="ts">
import { ChatType } from 'commonModule/utils/conversation/chatType'
import { computed, defineComponent } from 'vue'

interface IChatTypeBadgeConfig {
  text: string
  color: string
  background: string
}

// 会话类型 → 展示配置。没有配置的类型（普通私聊、群聊）不显示标识。
const CHAT_TYPE_BADGES: Record<number, IChatTypeBadgeConfig> = {
  [ChatType.CIRCLE]: { text: '圈子', color: '#16A34A', background: '#E8F8EF' },
  [ChatType.DIGITAL]: { text: '数字伙伴', color: '#7C3AED', background: '#F3E4FF' },
  [ChatType.BOT]: { text: '机器人', color: '#2563EB', background: '#E8F0FF' },
}

export default defineComponent({
  name: 'ChatTypeBadge',
  props: {
    chatType: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const badge = computed(() => CHAT_TYPE_BADGES[props.chatType] || null)
    return { badge }
  },
})
</script>

<style lang="less" scoped>
.chat-type-badge {
  flex-shrink: 0;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
}
</style>
