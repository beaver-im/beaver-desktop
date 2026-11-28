/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 工作台内嵌视图的 preload 面。
 *
 * 形状与事件通道定义在 @beaver-im/beaver/common（宿主 preload 与工作台窗口共用一份），
 * 这里只做宿主内部路径转发。
 */
export type {
  EmbedViewLoadState,
  IEmbedViewBounds,
  IWorkbenchEmbedBounds,
  IWorkbenchEmbedStatePayload,
  IWorkbenchModule,
} from '@beaver-im/beaver/common'

export { WORKBENCH_EMBED_STATE_CHANNEL } from '@beaver-im/beaver/common'
