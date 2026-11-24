/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import chatSvg from 'renderModule/assets/images/leftBar/chat.svg'
import chatActive from 'renderModule/assets/images/leftBar/chat-active.svg'
import friendSvg from 'renderModule/assets/images/leftBar/friend.svg'
import friendActive from 'renderModule/assets/images/leftBar/friend-active.svg'
import momentSvg from 'renderModule/assets/images/leftBar/moment.svg'
import momentActive from 'renderModule/assets/images/leftBar/moment-active.svg'
import circleSvg from 'renderModule/assets/images/leftBar/circle.svg'
import circleActive from 'renderModule/assets/images/leftBar/circle-active.svg'
import workbenchSvg from 'renderModule/assets/images/leftBar/workbench.svg'
import workbenchActive from 'renderModule/assets/images/leftBar/workbench-active.svg'
import onlineSvg from 'renderModule/assets/images/leftBar/online.svg'
import onlineActive from 'renderModule/assets/images/leftBar/online-active.svg'
import assistantSvg from 'renderModule/assets/images/leftBar/assistant.svg'
import assistantActive from 'renderModule/assets/images/leftBar/assistant-active.svg'
import logoutIcon from 'renderModule/assets/images/leftBar/settings/logout.svg'
import profileIcon from 'renderModule/assets/images/leftBar/settings/profile.svg'
import settingsIcon from 'renderModule/assets/images/leftBar/settings/settings.svg'
import aboutIcon from 'renderModule/assets/images/leftBar/settings/about.svg'

export interface ISidebarNavItem {
  id: string
  title: string
  defaultIcon: string
  activeIcon: string
  router?: string
  badgeCategories?: string[]
  badgeCategory?: string
}

/** IM 核心：聊天、好友 */
export const coreNavList: ISidebarNavItem[] = [
  {
    id: 'message',
    title: '聊天',
    defaultIcon: chatSvg,
    activeIcon: chatActive,
    router: '/message',
  },
  {
    id: 'friend',
    title: '好友',
    router: '/friend',
    defaultIcon: friendSvg,
    activeIcon: friendActive,
    badgeCategories: ['social', 'group'],
  },
]

/** 应用扩展：独立窗口能力 */
export const appNavList: ISidebarNavItem[] = [
  {
    id: 'circle',
    title: '圈子',
    defaultIcon: circleSvg,
    activeIcon: circleActive,
  },
  {
    id: 'workbench',
    title: '工作台',
    defaultIcon: workbenchSvg,
    activeIcon: workbenchActive,
  },
  {
    id: 'online',
    title: '在线文档',
    defaultIcon: onlineSvg,
    activeIcon: onlineActive,
  },
  {
    id: 'moment',
    title: '朋友圈',
    defaultIcon: momentSvg,
    activeIcon: momentActive,
    badgeCategories: ['moment'],
  },
  {
    id: 'ai',
    title: 'AI',
    defaultIcon: assistantSvg,
    activeIcon: assistantActive,
  },
]

export const userInfoMenuList = [
  {
    key: 'profile',
    label: '个人资料',
    icon: profileIcon,
  },
  {
    key: 'settings',
    label: '设置',
    icon: settingsIcon,
  },
  {
    key: 'about',
    label: '开源致谢',
    icon: aboutIcon,
  },
  {
    key: 'logout',
    label: '退出',
    icon: logoutIcon,
  },
]
