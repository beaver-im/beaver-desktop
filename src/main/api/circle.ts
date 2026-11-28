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

import type { ICircleSyncReq, ICircleSyncRes } from 'commonModule/type/ajax/circle'
import type { IGetSyncCircleInfoReq, IGetSyncCircleInfoRes } from 'commonModule/type/ajax/datasync'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'
import type { IAjaxResponse } from 'commonModule/type/ajax/common'
export const circleSyncApi = (data: ICircleSyncReq): Promise<IAjaxResponse<ICircleSyncRes>> => {
  return ajax<IAjaxResponse<ICircleSyncRes>>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/beaver-social/api/social/circle/v1/sync`,
  })
}

/** datasync：拉取圈子版本摘要 */
export const datasyncGetSyncCircleInfoApi = (data: IGetSyncCircleInfoReq) => {
  return ajax<IGetSyncCircleInfoRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/beaver/api/datasync/sync/v1/get_sync_circle_info`,
  })
}
