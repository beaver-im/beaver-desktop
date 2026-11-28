/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 平台自有窗口的 IPC 命令表（设置、工作台内嵌视图）。
 *
 * 这些命令的发起方是宿主 preload、受理方是对应的窗口业务，两侧都不能互引，
 * 因此命令字符串在这里唯一定义。业务包只在 handler 里按枚举分派，不自己造命令值。
 */

/** 用户设置（主进程 store 读写） */
export enum SettingsCommand {
  /** 初始化用户设置（登录后拉取云端） */
  SETTINGS_INIT = 'settings:init',
  /** 获取用户设置 */
  SETTINGS_GET = 'settings:get',
  /** 保存用户设置 */
  SETTINGS_UPDATE = 'settings:update',
}

/** 工作台内嵌 WebContentsView */
export enum WorkbenchCommand {
  EMBED_OPEN = 'workbench:embedOpen',
  EMBED_HIDE_ALL = 'workbench:embedHideAll',
  EMBED_SET_BOUNDS = 'workbench:embedSetBounds',
  EMBED_RELOAD = 'workbench:embedReload',
  EMBED_CLOSE = 'workbench:embedClose',
  OPEN_EXTERNAL = 'workbench:openExternal',
}
