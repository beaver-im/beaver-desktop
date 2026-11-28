/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 工作台内嵌视图的主进程侧类型与通道，形状与 preload 共用一份定义
 * （@beaver-im/beaver/common），包内不重复声明。
 */
export type { IWorkbenchEmbedBounds, IWorkbenchEmbedStatePayload } from '@beaver-im/beaver/common'

export { WORKBENCH_EMBED_STATE_CHANNEL } from '@beaver-im/beaver/common'
