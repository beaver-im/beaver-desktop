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
  通知页：好友申请 / 群申请 合并为一个入口，内部按来源分段。
  两段各自复用原有列表组件，本页只负责标题与滚动容器。
-->
<template>
  <div class="notification-container">
    <div class="notification-header">
      通知
    </div>

    <div class="notification-scroll">
      <div class="notification-section">
        <div class="section-title">
          好友申请
        </div>
        <FriendNotificationSection />
      </div>

      <div class="notification-section">
        <div class="section-title">
          群申请
        </div>
        <GroupNotificationSection />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FriendNotificationSection from './friend.vue'
import GroupNotificationSection from './group.vue'

export default defineComponent({
  name: 'NotificationContent',
  components: {
    FriendNotificationSection,
    GroupNotificationSection,
  },
})
</script>

<style lang="less" scoped>
.notification-container {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  min-height: 0;
}

.notification-header {
  flex-shrink: 0;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 500;
  color: #2D3436;
  border-bottom: 1px solid #EBEEF5;
}

.notification-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 24px 24px;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.12);
    border-radius: 3px;
  }
}

.notification-section {
  padding-top: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #B2BEC3;
  margin: 12px 0 4px;
}
</style>
