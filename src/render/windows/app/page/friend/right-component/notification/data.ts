/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

/**
 * 通知页的展示规则。
 *
 * 页面数据只来自通知收件箱（notification_inboxes）与事件表（notification_events），
 * 不再读好友验证表 / 群申请表 —— 那两张表是同一条业务流的两份投影，
 * 按来源分段展示会让"同一件事"在不同入口出现不同口径。
 *
 * 这里只做两件事：事件类型 → 文案，事件类型 → 可执行动作。
 * 新增事件类型时只改这个文件，页面与展示组件都不用动。
 */

import type { INotificationEventItem } from 'commonModule/type/ajax/notification'
import type { NotificationActionKind } from 'commonModule/type/view/notification'

/** 本页只展示社交类申请；朋友圈互动走左侧「朋友圈」入口，不在这里出现 */
export const NOTIFICATION_CATEGORIES = ['social', 'group']

/** 单页条数，滚到底部继续加载 */
export const NOTIFICATION_PAGE_SIZE = 20

/** 距底部多少像素开始加载下一页 */
export const SCROLL_LOAD_THRESHOLD = 50

/** 事件 payload（后端投递时写入的自由结构，各事件类型字段不同） */
export interface INotificationPayload {
  /** 申请附言 */
  message?: string
  /** 好友验证记录ID */
  verifyId?: string
  /** 入群申请记录ID */
  requestId?: number
  /** 群ID */
  groupId?: string
  /** 申请人 */
  userId?: string
  /** 处理结果 */
  status?: number
}

export interface IEventPresentation {
  /** 主文案 */
  title: string
  /** 待处理动作，为空表示只读 */
  action?: NotificationActionKind
  /** 动作参数：好友=verifyId，群=入群申请ID */
  actionRef?: string
}

export function parsePayload(raw?: string): INotificationPayload {
  if (!raw) {
    return {}
  }
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as INotificationPayload : {}
  }
  catch {
    return {}
  }
}

/**
 * 事件类型 → 文案与动作。
 * 未登记的类型统一给中性文案，保证列表永远能渲染，不会因为新事件白屏。
 */
export function presentEvent(event: INotificationEventItem, payload: INotificationPayload): IEventPresentation {
  switch (event.eventType) {
    case 'friend_request':
      return {
        title: '请求加你为好友',
        action: 'friend-verify',
        actionRef: event.targetId || payload.verifyId,
      }
    case 'friend_request_accept':
      return { title: '通过了你的好友申请' }
    case 'friend_request_reject':
      return { title: '拒绝了你的好友申请' }
    case 'group_join_request':
      return {
        title: '申请加入你管理的群聊',
        action: 'group-join',
        actionRef: payload.requestId != null ? String(payload.requestId) : '',
      }
    case 'group_left':
      return { title: '退出了群聊' }
    default:
      return { title: '你有一条新通知' }
  }
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

/** 列表时间：当天只显示时分，跨天显示月日 */
export function formatEventTime(timestamp: number): string {
  if (!timestamp) {
    return ''
  }
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()

  if (isToday) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
