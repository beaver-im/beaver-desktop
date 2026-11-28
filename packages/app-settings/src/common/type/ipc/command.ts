/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 设置命令由 @beaver-im/beaver/common 唯一定义：宿主 preload 发起、本包 handler 受理，
 * 两侧不能互引，因此不在这里另写一份枚举。
 */
export { SettingsCommand } from '@beaver-im/beaver/common'
