/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/app-circle 圈子能力包
 *
 *   main      — 圈子窗口 application（唯一职责）
 *   renderer  — 圈子窗口 UI（circle-entry）
 *
 * 圈子数据属于宿主：circles 表、datasync、CIRCLE_OPERATION 消息、database:circle 通道
 * 全部在 src/main；本包不再持有表，也不再注册 WS / IPC / preload。
 * 窗口需要的类型从 @beaver-im/beaver/common 取。
 */
export {}
