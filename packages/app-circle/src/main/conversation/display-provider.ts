/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IConversationDisplayProvider, IConversationRef } from '@beaver-im/beaver/main'
import dbServiceCircle from '../database/services/circle/circle'

// 圈子会话类型（与宿主 ChatType.CIRCLE 一致；插件包不依赖宿主 common 类型）
const CIRCLE_CHAT_TYPE = 3

function parseCircleId(conversationId: string): string | null {
  const parts = conversationId.split('_')
  if (parts.length >= 2 && parts[0] === 'circle')
    return parts.slice(1).join('_')
  return null
}

function isCircleConversation(conv: IConversationRef): boolean {
  // 会话类型以会话数据为准，不从会话ID前缀推断
  return conv.type === CIRCLE_CHAT_TYPE
}

/** 圈子会话展示：conversationId → avatar / nickName */
export const circleConversationDisplayProvider: IConversationDisplayProvider = {
  async resolve(conversations) {
    const result = new Map<string, { avatar: string, nickName: string }>()
    const circleIds: string[] = []
    const convToCircle = new Map<string, string>()

    for (const conv of conversations) {
      if (!isCircleConversation(conv))
        continue
      const circleId = parseCircleId(conv.conversationId)
      if (!circleId)
        continue
      circleIds.push(circleId)
      convToCircle.set(conv.conversationId, circleId)
    }

    if (!circleIds.length)
      return result

    const circles = await dbServiceCircle.getCirclesByIds(circleIds)
    const byId = new Map(circles.map(c => [c.circleId, c]))

    for (const [conversationId, circleId] of convToCircle) {
      const circle = byId.get(circleId)
      result.set(conversationId, {
        avatar: circle?.avatar || '',
        nickName: circle?.name || '圈子',
      })
    }
    return result
  },
}
