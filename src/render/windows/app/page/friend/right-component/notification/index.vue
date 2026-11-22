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
  通知页。

  数据只来自通知收件箱（notification_inboxes + notification_events），
  不再分别读好友验证表 / 群申请表，因此也不再按来源分段：
  好友申请、入群申请都是同一个通知流里的一行，由事件类型决定文案与是否可执行「同意 / 拒绝」。
  朋友圈互动属于左侧「朋友圈」入口，不拉 moment 分类。
-->
<template>
  <div class="notification-container">
    <div class="notification-header">
      通知
    </div>

    <div class="notification-scroll" @scroll="handleScroll">
      <NotificationItem
        v-for="row in notifications"
        :key="row.id"
        :item="row"
        @click="handleItemClick"
        @approve="handleAction($event, 'approve')"
        @reject="handleAction($event, 'reject')"
      />

      <div v-if="!notifications.length" class="empty-state">
        <div class="empty-text">
          暂无通知
        </div>
      </div>
      <div v-else-if="!hasMore" class="list-tip">
        没有更多了
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { INotificationEventItem, INotificationInboxItem } from 'commonModule/type/ajax/notification'
import type { INotificationItem } from 'commonModule/type/view/notification'
import { Message } from '@beaver-im/beaver-ui'
import { valiFrienddAPi } from 'renderModule/api/friend'
import { handleGroupJoinRequestApi } from 'renderModule/api/group'
import Logger from 'renderModule/utils/logger'
import { useRouterHelper } from 'renderModule/utils/router/index'
import { useContactStore } from 'renderModule/windows/app/pinia/contact/contact'
import { useNotificationStore } from 'renderModule/windows/app/pinia/notification/notification'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { defineComponent, onMounted, ref } from 'vue'
import {
  formatEventTime,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PAGE_SIZE,
  parsePayload,
  presentEvent,
  SCROLL_LOAD_THRESHOLD,
} from './data'
import NotificationItem from './item.vue'

const logger = new Logger('NotificationContent')

export default defineComponent({
  name: 'NotificationContent',
  components: {
    NotificationItem,
  },
  setup() {
    const contactStore = useContactStore()
    const notificationStore = useNotificationStore()
    const messageViewStore = useMessageViewStore()
    const routerHelper = useRouterHelper()

    const notifications = ref<INotificationItem[]>([])
    // 仅用于滚动加载防重入，不参与视图渲染
    let fetching = false
    const hasMore = ref(true)
    const offset = ref(0)

    /**
     * 收件箱一行 + 事件详情 → 列表一行。
     * 事件尚未同步到本地时返回 null，该行本轮跳过；下次进页面会随事件补上。
     */
    const toItem = (inbox: INotificationInboxItem, event?: INotificationEventItem): INotificationItem | null => {
      if (!event) {
        return null
      }

      const payload = parsePayload(event.payload)
      const presentation = presentEvent(event, payload)
      const contact = event.fromUserId ? contactStore.getContact(event.fromUserId) : null

      return {
        id: inbox.eventId,
        eventType: inbox.eventType,
        category: inbox.category,
        name: contact?.nickName || '',
        avatar: contact?.avatar || '',
        title: presentation.title,
        desc: payload.message || '',
        time: formatEventTime((inbox.createdAt || 0) * 1000),
        action: presentation.action,
        actionRef: presentation.actionRef,
        groupId: event.targetType === 'group' ? (event.targetId || '') : (payload.groupId || ''),
      }
    }

    const loadPage = async () => {
      if (fetching || !hasMore.value) {
        return
      }
      fetching = true

      try {
        const res = await electron.database.notification.getInboxByCategories({
          categories: NOTIFICATION_CATEGORIES,
          limit: NOTIFICATION_PAGE_SIZE,
          offset: offset.value,
        })
        const inboxes = res?.inboxes || []

        // 游标按原始条数推进：被过滤掉的撤回/过期通知同样占位，避免重复拉取
        offset.value += inboxes.length
        hasMore.value = inboxes.length >= NOTIFICATION_PAGE_SIZE

        const visible = inboxes.filter(inbox => inbox.status === 1 && !inbox.isDeleted)
        if (!visible.length) {
          return
        }

        const eventRes = await electron.database.notification.getEventsByIds({
          eventIds: visible.map(inbox => inbox.eventId),
        })
        const eventMap = new Map((eventRes?.events || []).map(event => [event.eventId, event]))

        // 申请人往往还不是好友，联系人缓存里没有他；先按 userId 批量补齐再组装，
        // 否则列表会出现一行只有文案、没有昵称头像的空壳。
        const unknownUserIds = [...new Set(
          (eventRes?.events || [])
            .map(event => event.fromUserId)
            .filter((userId): userId is string => !!userId && !contactStore.getContact(userId).userId),
        )]
        if (unknownUserIds.length) {
          await contactStore.updateContactsByIds(unknownUserIds)
        }

        const items = visible
          .map(inbox => toItem(inbox, eventMap.get(inbox.eventId)))
          .filter((item): item is INotificationItem => item !== null)

        notifications.value.push(...items)
      }
      catch (error) {
        logger.error({ text: '加载通知列表失败', data: { error: (error as Error)?.message } })
      }
      finally {
        fetching = false
      }
    }

    const handleScroll = (evt: Event) => {
      const el = evt.target as HTMLElement
      if (!el || fetching || !hasMore.value) {
        return
      }
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_LOAD_THRESHOLD) {
        void loadPage()
      }
    }

    /**
     * 按通知携带的动作类型分派到对应的业务接口。
     * 页面本身不持有业务 store，处理完只收敛本地这一行。
     */
    const handleAction = async (item: INotificationItem, action: 'approve' | 'reject') => {
      if (!item.action) {
        return
      }
      const status = action === 'approve' ? 1 : 2

      try {
        if (item.action === 'friend-verify') {
          const res = await valiFrienddAPi({ verifyId: item.actionRef || '', status })
          // ajax 对业务错误码（code!==0）不抛异常，必须显式判断
          if (res?.code !== 0) {
            logger.error({ text: '处理好友申请被拒绝', data: { verifyId: item.actionRef, code: res?.code, msg: res?.msg } })
            Message.error(res?.msg || '操作失败，请重试')
            return
          }
        }
        else {
          const requestId = Number.parseInt(item.actionRef || '', 10)
          if (Number.isNaN(requestId)) {
            logger.error({ text: '入群申请缺少有效 requestId', data: { actionRef: item.actionRef } })
            Message.error('该申请已失效，请刷新后重试')
            return
          }
          const res = await handleGroupJoinRequestApi({ requestId, status })
          if (res?.code !== 0) {
            logger.error({ text: '处理入群申请被拒绝', data: { requestId, code: res?.code, msg: res?.msg } })
            Message.error(res?.msg || '操作失败，请重试')
            return
          }
        }

        // 本地立即收敛：按钮消失，避免重复提交
        item.action = undefined
        item.actionRef = undefined
        item.title = action === 'approve' ? '你已同意该申请' : '你已拒绝该申请'

        await notificationStore.markReadByEvent(item.id, item.category)
        Message.success(action === 'approve' ? '已同意' : '已拒绝')
      }
      catch (error) {
        logger.error({ text: '处理通知动作失败', data: { eventType: item.eventType, action, error } })
        Message.error('操作失败，请重试')
      }
    }

    const handleItemClick = (item: INotificationItem) => {
      if (!item.groupId) {
        return
      }
      messageViewStore.setCurrentChat(`group_${item.groupId}`)
      routerHelper.push('/message')
    }

    onMounted(() => {
      void loadPage()
    })

    return {
      notifications,
      hasMore,
      handleScroll,
      handleAction,
      handleItemClick,
    }
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #B2BEC3;
}

.empty-text {
  font-size: 14px;
}

.list-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  font-size: 12px;
  color: #B2BEC3;
}
</style>
