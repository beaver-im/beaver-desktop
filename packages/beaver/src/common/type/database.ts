/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 圈子本地表行（circles 表 / database:circle 通道返回）
 *
 * 主进程写、宿主渲染读、圈子窗口读，三方必须是同一份定义，因此归契约包。
 */
export interface IDBCircle {
  id?: number
  circleId: string
  name: string
  avatar?: string
  description?: string
  creatorId?: string
  memberCount?: number
  role?: number
  joinType?: number
  version?: number
  createdAt?: number
  updatedAt?: number
}
