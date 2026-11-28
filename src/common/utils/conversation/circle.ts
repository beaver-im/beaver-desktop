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

/** 圈子会话 id 前缀：circle_{circleId} */
const CIRCLE_PREFIX = 'circle'

/** 从会话 id 取圈子 id；非圈子会话返回 null。支持 circleId 内含下划线。 */
export function parseCircleId(conversationId: string): string | null {
  const parts = conversationId.split('_')
  if (parts.length >= 2 && parts[0] === CIRCLE_PREFIX)
    return parts.slice(1).join('_')
  return null
}

/** 圈子 id → 会话 id */
export function toCircleConversationId(circleId: string): string {
  return `${CIRCLE_PREFIX}_${circleId}`
}
