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

import { ChatType } from 'commonModule/utils/conversation/chatType'

/**
 * 账号类型（user_type）
 *
 * 唯一真相源是服务端 users.user_type（见 usertypeconst）。
 * 「好友」tab 只放人，非人类账号（机器人 / 数字伙伴）统一归入「机器人」tab。
 */
export enum UserType {
  NORMAL = 1, // 普通用户（人）
  BOT = 2, // 机器人（开放平台创建，工号前缀 B）
  DIGITAL = 3, // 数字伙伴（Agent，工号前缀 A）
}

/**
 * @description: 是否是人类账号（取不到类型时按人处理，避免把老数据藏起来）
 */
export function isHumanUser(userType?: number): boolean {
  return (userType ?? UserType.NORMAL) === UserType.NORMAL
}

/**
 * @description: 是否是非人类账号（机器人 / 数字伙伴）
 *   注意 BOT 只是其中一个子类，这里判断的是「不是人」，不要和 UserType.BOT 混用
 */
export function isNonHumanUser(userType?: number): boolean {
  return !isHumanUser(userType)
}

/**
 * @description: 账号类型 → 两人会话的 chatType，用于复用会话类型标签
 *   人 → 普通私聊，数字伙伴 → 4，机器人 → 5
 */
export function chatTypeOfUserType(userType?: number): number {
  switch (userType) {
    case UserType.DIGITAL:
      return ChatType.DIGITAL
    case UserType.BOT:
      return ChatType.BOT
    default:
      return ChatType.PRIVATE
  }
}
