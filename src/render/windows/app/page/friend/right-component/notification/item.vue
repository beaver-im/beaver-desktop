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

<!-- 通知行：纯展示。是否显示「同意/拒绝」由 item.action 决定，不含任何业务判断。 -->
<template>
  <div class="notification-item" @click="handleClick">
    <div class="item-left">
      <div class="avatar">
        <BeaverImage :file-name="item.avatar || ''" />
      </div>
      <div class="item-info">
        <div class="item-name-row">
          <span class="item-name">{{ item.name || '通知' }}</span>
          <span class="item-title">{{ item.title }}</span>
        </div>
        <div v-if="item.desc" class="item-desc">
          {{ item.desc }}
        </div>
      </div>
    </div>
    <div class="item-right">
      <div class="item-time">
        {{ item.time }}
      </div>
      <div v-if="item.action" class="item-actions">
        <BeaverButton
          type="success"
          size="mini"
          @click.stop="handleAction('approve')"
        >
          同意
        </BeaverButton>
        <BeaverButton
          type="danger"
          size="mini"
          @click.stop="handleAction('reject')"
        >
          拒绝
        </BeaverButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { INotificationItem } from 'commonModule/type/view/notification'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotificationItem',
  components: {
    BeaverButton,
    BeaverImage,
  },
  props: {
    item: {
      type: Object as () => INotificationItem,
      required: true,
    },
  },
  emits: ['click', 'approve', 'reject'],
  setup(props, { emit }) {
    const handleClick = () => {
      emit('click', props.item)
    }

    const handleAction = (action: 'approve' | 'reject') => {
      emit(action, props.item)
    }

    return {
      handleClick,
      handleAction,
    }
  },
})
</script>

<style lang="less" scoped>
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F9FAFB;
  }

  &:last-child {
    border-bottom: none;
  }
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #636E72;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-title {
  flex-shrink: 0;
  font-size: 12px;
  color: #B2BEC3;
  white-space: nowrap;
}

.item-desc {
  font-size: 12px;
  color: #636E72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 100px;
}

.item-time {
  font-size: 11px;
  color: #B2BEC3;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  gap: 8px;
}
</style>
