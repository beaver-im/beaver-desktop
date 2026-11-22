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

/** 通知行上可执行的动作类型 */
export type NotificationActionKind = 'friend-verify' | 'group-join'

/**
 * 通知列表的一行。
 * 由「收件箱状态（已读/时间）」+「事件详情（谁、什么类型、参数）」拼成，
 * 展示组件只认这个结构，不关心背后是哪个业务域。
 */
export interface INotificationItem {
  /** 事件ID，列表 key */
  id: string
  /** 事件类型，如 friend_request / group_join_request */
  eventType: string
  /** 事件分类：social / group / moment */
  category: string
  /** 触发方昵称，系统类事件为空 */
  name: string
  /** 触发方头像 */
  avatar?: string
  /** 主文案 */
  title: string
  /** 副文案（申请附言等） */
  desc: string
  /** 展示用时间 */
  time: string
  /** 待处理动作，为空表示只能查看 */
  action?: NotificationActionKind
  /** 动作参数：好友=verifyId，群=入群申请ID */
  actionRef?: string
  /** 关联群ID，用于点击跳转会话 */
  groupId?: string
}
