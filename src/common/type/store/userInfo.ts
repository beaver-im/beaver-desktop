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

// 用户基本信息（前端状态存储）
export interface IUserInfo {
  userId: string
  nickName: string
  avatar: string
  abstract: string
  phone?: string
  email?: string
  gender: number
  version: number
  /**
   * 账号类型 1普通用户 2机器人 3数字伙伴（见 common/utils/user/userType）
   *
   * 好友页靠它把「人」和「机器人」分到不同 tab，所以必须从本地 users 表一路带上来。
   * 允许为空：为空表示联系人缓存里还没有这个人，调用方应回退到好友记录自带的类型，
   * 不要在这里给默认值，否则会把已知的机器人覆盖成人。
   */
  userType?: number
}
