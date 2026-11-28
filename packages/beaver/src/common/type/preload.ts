/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 平台窗口专属的 preload 契约（工作台内嵌视图）。
 *
 * 工作台窗口由宿主创建、宿主 preload 装配，业务包只消费这个接口做视图管理，
 * 因此形状定义在契约包，不做包内副本。
 */

/** 内嵌视图在窗口中的矩形 */
export interface IEmbedViewBounds {
  x: number
  y: number
  width: number
  height: number
}

/** 内嵌视图加载状态 */
export type EmbedViewLoadState = 'loading' | 'loaded' | 'failed'

export type IWorkbenchEmbedBounds = IEmbedViewBounds

export interface IWorkbenchEmbedStatePayload {
  tabId: string
  state: EmbedViewLoadState
}

/** 内嵌视图状态变化事件通道（主进程 → 工作台窗口） */
export const WORKBENCH_EMBED_STATE_CHANNEL = 'workbench-embed-state'

export interface IWorkbenchModule {
  openEmbed: (data: { tabId: string, url: string, bounds: IWorkbenchEmbedBounds }) => Promise<void>
  hideAllEmbeds: () => Promise<void>
  setEmbedBounds: (data: { tabId: string, bounds: IWorkbenchEmbedBounds }) => Promise<void>
  reloadEmbed: (data: { tabId: string }) => Promise<void>
  closeEmbed: (data: { tabId: string }) => Promise<void>
  openExternal: (data: { url: string }) => Promise<void>
  onEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => void
  offEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => void
}
