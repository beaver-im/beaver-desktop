/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IUserSettingsRes } from '../ajax/user'

/**
 * 设置窗口的 preload 面。
 *
 * 设置是宿主自有窗口（不是第三方能力包），preload 由宿主装配；
 * 命令值来自 @beaver-im/beaver/common 的 SettingsCommand。
 */
export interface ISettingsModule {
  get: () => Promise<IUserSettingsRes>
  update: (settings: IUserSettingsRes) => Promise<IUserSettingsRes>
}
