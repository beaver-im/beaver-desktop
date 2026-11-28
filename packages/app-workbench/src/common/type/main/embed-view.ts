/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 内嵌视图的几何与状态类型由宿主 preload 契约定义（@beaver-im/beaver/common），
 * 包内只做路径转发，不再自己声明一份。
 */
export type {
  EmbedViewLoadState,
  IEmbedViewBounds,
  IWorkbenchEmbedStatePayload,
} from '@beaver-im/beaver/common'
