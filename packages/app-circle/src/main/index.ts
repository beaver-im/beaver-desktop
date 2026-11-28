/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/app-circle 主进程出口（application + manifest）
 *
 * 圈子数据（circles 表 / datasync / WS / 数据库 IPC）在宿主 src/main，本包不注册任何数据能力。
 */

export { default as application } from './application/circle'
export { default as circleApplication } from './application/circle'
export { circleManifest as manifest, circleManifest } from './manifest'
