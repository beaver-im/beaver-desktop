/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/app-moment/common — 朋友圈领域契约（仅本能力包）
 *
 * 对外只走本入口。平台类型（通知通道、preload 模块、store 键表）一律用 @beaver-im/beaver/common，
 * 本包不再复制宿主契约。
 */
export * from './type/ajax/moment'
export * from './type/ajax/notification'
export * from './type/ajax/user'
export * from './type/store/userInfo'
