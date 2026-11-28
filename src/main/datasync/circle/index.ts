/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import Logger from 'mainModule/utils/logger'
import circleSync from './circle'

const logger = new Logger('circle-datasync')

export const circleDatasync = new class CircleDatasync {
  async checkAndSync() {
    logger.info({ text: 'checkAndSync 开始' })
    await circleSync.checkAndSync()
  }
}()
