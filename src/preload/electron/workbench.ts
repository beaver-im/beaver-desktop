/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type {
  IWorkbenchEmbedBounds,
  IWorkbenchEmbedStatePayload,
  IWorkbenchModule,
} from 'commonModule/type/preload/workbench'
import { WorkbenchCommand, WORKBENCH_EMBED_STATE_CHANNEL } from '@beaver-im/beaver/common'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

/**
 * 工作台内嵌视图的 preload 面。工作台是宿主自有窗口，
 * 内嵌视图的状态流由主进程直接推给本窗口，不经插件命名空间。
 */
export const workbenchModule: IWorkbenchModule = {
  openEmbed: (data: { tabId: string, url: string, bounds: IWorkbenchEmbedBounds }) =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_OPEN, data),
  hideAllEmbeds: () =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_HIDE_ALL, {}),
  setEmbedBounds: (data: { tabId: string, bounds: IWorkbenchEmbedBounds }) =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_SET_BOUNDS, data),
  reloadEmbed: (data: { tabId: string }) =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_RELOAD, data),
  closeEmbed: (data: { tabId: string }) =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_CLOSE, data),
  openExternal: (data: { url: string }) =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.OPEN_EXTERNAL, data),
  onEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) =>
    ipcRenderManager.on(WORKBENCH_EMBED_STATE_CHANNEL, callback),
  offEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) =>
    ipcRenderManager.removeListener(WORKBENCH_EMBED_STATE_CHANNEL, callback),
}
