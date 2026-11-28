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
 * 通知契约（通道表、全部命令枚举、通道→命令映射、payload 形状）唯一定义在
 * @beaver-im/beaver/common，宿主与能力包共用同一份，任何一侧都不再复制枚举。
 * 本文件只保留 preload 侧的模块接口本身。
 */
import type { TrayMenuItem } from './app'
import type {
  INotificationPayload,
  NotificationCommandMap,
  NotificationModule as NotificationChannel,
} from '@beaver-im/beaver/common'

export type {
  AppLifecycleStatus,
  INotificationPayload,
  NotificationCommandMap,
} from '@beaver-im/beaver/common'

export {
  DATABASE_CIRCLE_CHANNEL,
  NotificationAppLifecycleCommand,
  NotificationCallCommand,
  NotificationChatCommand,
  NotificationCircleCommand,
  NotificationEmojiCommand,
  NotificationFriendCommand,
  NotificationGroupCommand,
  NotificationMcpConfirmCommand,
  NotificationMediaViewerCommand,
  NotificationModule,
  NotificationNotificationCommand,
  NotificationSearchToVerifyCommand,
  NotificationUserCommand,
} from '@beaver-im/beaver/common'

export interface SystemNotificationOptions {
  /**
   * @description: 通知标题
   */
  title: string
  /**
   * @description: 通知内容
   */
  body: string
  /**
   * @description: 通知图标
   */
  icon?: string
  /**
   * @description: 是否静默通知
   */
  silent?: boolean
}

export interface TrayUpdateOptions {
  /**
   * @description: 托盘菜单项列表，用于更新或添加消息项
   */
  menuItems?: TrayMenuItem[]
}

export interface INotificationModule {
  on<M extends NotificationChannel>(module: M, callback: (params: INotificationPayload<M>) => void): void
  off<M extends NotificationChannel>(module: M, callback: (params: INotificationPayload<M>) => void): void
  send<M extends NotificationChannel>(
    targetName: string,
    module: M,
    command: NotificationCommandMap[M],
    payload?: any
  ): void
  /**
   * 显示系统通知
   */
  showSystemNotification(options: SystemNotificationOptions): void
  /**
   * 更新托盘菜单项列表
   * @param options 托盘更新选项，可以添加或更新消息项
   */
  updateTray(options: TrayUpdateOptions): void
  /**
   * 删除托盘菜单项
   * @param id 要删除的消息项 ID
   */
  deleteTrayItem(id: string): void
}
