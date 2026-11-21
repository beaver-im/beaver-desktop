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
 * 会话类型（chatType）
 *
 * 唯一真相源是服务端 ChatConversationMeta.Type，随会话元数据同步到本地后原样使用。
 * 不从 conversationId 前缀推断——前缀只用于定位 ID 里的实体段。
 * 新增类型：这里加枚举 + 服务端 chattypeconst 加常量。
 */
export enum ChatType {
  PRIVATE = 1, // 普通私聊（好友之间）
  GROUP = 2, // 群聊
  CIRCLE = 3, // 圈子
  DIGITAL = 4, // 数字伙伴（与 Agent 的两人会话）
  BOT = 5, // 机器人（与 Bot 的两人会话）
}

/**
 * @description: 是否为两人会话形态（普通私聊 / 数字伙伴 / 机器人）
 */
export function isP2PChatType(chatType?: number): boolean {
  return chatType === ChatType.PRIVATE || chatType === ChatType.DIGITAL || chatType === ChatType.BOT
}

/**
 * @description: 是否为群聊形态（群聊 / 圈子，成员在多人之间共享）
 */
export function isGroupChatType(chatType?: number): boolean {
  return chatType === ChatType.GROUP || chatType === ChatType.CIRCLE
}
