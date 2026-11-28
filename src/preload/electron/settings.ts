/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IUserSettingsRes } from 'commonModule/type/ajax/user'
import type { ISettingsModule } from 'commonModule/type/preload/settings'
import { SettingsCommand } from '@beaver-im/beaver/common'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

/**
 * 设置窗口的 preload 面。设置是宿主自有窗口，能力由宿主直供，
 * 不挂插件命名空间——否则 catalog 关掉某项就会连带关掉平台设置。
 */
export const settingsModule: ISettingsModule = {
  get: () => ipcRenderManager.invoke<IUserSettingsRes>(
    IEvent.RenderToMainSyncMsg,
    SettingsCommand.SETTINGS_GET,
    {},
  ),
  update: (settings: IUserSettingsRes) => ipcRenderManager.invoke<IUserSettingsRes>(
    IEvent.RenderToMainSyncMsg,
    SettingsCommand.SETTINGS_UPDATE,
    { settings },
  ),
}
