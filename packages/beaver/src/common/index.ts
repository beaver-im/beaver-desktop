/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/beaver — common 层（插件契约类型 + 运行时 config）
 *
 *   .          — 本模块（common）
 *   ./main     — 主进程门面
 *   ./renderer — 渲染进程门面
 */

// ── 插件契约类型 ──
export type * from './type/app/application'
export type * from './type/plugin'
export type * from './type/mainStore'
export type * from './type/ajax'
export type * from './type/ajax/common'
export type * from './type/ajax/circle'
export type * from './type/database'
export type * from './type/config'
export type * from './type/logger'

// ── 跨进程共享的通道 / 命令常量（值与类型都对宿主与能力包可见） ──
export * from './type/notification'
export * from './type/ipc'
export * from './type/preload'

// ── 运行时 config 值（运行时从 process.custom / electron.app 读取环境） ──
export * from './config'
