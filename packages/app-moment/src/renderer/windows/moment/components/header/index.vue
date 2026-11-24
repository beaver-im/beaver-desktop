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

<template>
  <div class="moment-header">
    <div class="header-content">
      <div class="header-left">
        <button class="header-btn message-btn" @click="handleOpenMessages">
          <img width="16" height="16" src="../../../../assets/image/moment/notification.svg" alt="通知">
          <span v-if="notificationStore.unreadCount > 0" class="message-badge">
            {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
          </span>
        </button>
        <!-- 刷新按钮 -->
        <button class="header-btn refresh-btn" @click="handleRefresh">
          <img :src="refreshIcon" alt="刷新" class="header-icon" :class="{ refreshing: isRefreshing }">
        </button>
      </div>

      <!-- 窗口控制按钮 -->
      <div class="window-controls">
        <button class="header-btn minimize-btn" @click="handleMinimize">
          <img width="10" height="1" src="../../../../assets/image/moment/window-minimize.svg" alt="最小化">
        </button>
        <button class="header-btn close-btn" @click="handleClose">
          <img width="10" height="10" src="../../../../assets/image/moment/window-close.svg" alt="关闭">
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import refreshIcon from '../../../../assets/image/moment/refresh.svg'
import { useMomentNotificationStore } from '../../store/notification/notification'

export default defineComponent({
  name: 'MomentHeader',
  setup() {
    const isRefreshing = ref(false)
    const notificationStore = useMomentNotificationStore()

    onMounted(() => {
      notificationStore.refreshUnreadCount()
    })

    const handleOpenMessages = () => {
      notificationStore.openMessagesPanel()
    }

    const handleRefresh = () => {
      // 触发全局刷新事件
      window.dispatchEvent(new CustomEvent('moment-refresh'))
    }

    const handleMinimize = () => {
      electron?.window.minimize()
    }

    const handleClose = () => {
      electron?.window.closeWindow('moment', { hideOnly: true })
    }

    return {
      isRefreshing,
      notificationStore,
      handleOpenMessages,
      handleRefresh,
      handleMinimize,
      handleClose,
      refreshIcon,
    }
  },
})
</script>

<style lang="less" scoped>
.moment-header {
  height: 40px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
  -webkit-app-region: drag;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-btn {
  position: relative;
  color: #636E72;
}

.message-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #FF4757;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  font-weight: 600;
}

.header-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  -webkit-app-region: no-drag;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #F9FAFB;
  }

  &.refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.minimize-btn:hover {
    background-color: #F0F2F5;
  }

  &  .close-btn:hover {
    background-color: #FFE6E6;
    transform: none;
  }

  .header-icon {
    width: 16px;
    height: 16px;
    opacity: 0.7;
    transition: all 0.2s ease;

    &.refreshing {
      animation: spin 1s linear infinite;
    }
  }

  &:hover .header-icon {
    opacity: 1;
  }
}
.window-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
