<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

<template>
  <div class="audio-player">
    <div v-if="audioUrl" class="player-container">
      <div class="player-header">
        <div class="audio-icon">
          <img width="64" height="64" src="../../../assets/image/audio/audio-logo.svg" alt="音频图标">
        </div>
        <div v-if="audioTitle" class="audio-title">
          {{ audioTitle }}
        </div>
        <div v-else class="audio-title">
          音频文件
        </div>
      </div>

      <div class="player-controls">
        <audio
          ref="audioRef"
          :src="audioUrl"
          class="player-audio"
          @loadedmetadata="handleLoadedMetadata"
          @timeupdate="handleTimeUpdate"
          @ended="handleEnded"
          @error="handleAudioError"
        />

        <div class="progress-container">
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
          <div class="progress-bar" @click="handleProgressClick">
            <div class="progress-bg">
              <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
              <div class="progress-dot" :style="{ left: `${progressPercent}%` }" />
            </div>
          </div>
        </div>

        <div class="control-buttons">
          <button class="control-btn" @click="togglePlay">
            <img v-if="isPlaying" width="24" height="24" src="../../../assets/image/audio/pause.svg" alt="暂停">
            <img v-else width="24" height="24" src="../../../assets/image/audio/play.svg" alt="播放">
          </button>
          <button class="control-btn" @click="seekBackward">
            <img width="24" height="24" src="../../../assets/image/audio/seek-backward.svg" alt="后退">
          </button>
          <button class="control-btn" @click="seekForward">
            <img width="24" height="24" src="../../../assets/image/audio/seek-forward.svg" alt="前进">
          </button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>未找到音频</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { Logger } from '@beaver-im/beaver/renderer'

const logger = new Logger('AudioPlayerView')

export default defineComponent({
  name: 'AudioPlayer',
  props: {
    audioUrl: {
      type: String,
      default: '',
    },
    audioTitle: {
      type: String,
      default: '',
    },
  },
  setup() {
    const audioRef = ref<HTMLAudioElement | null>(null)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)
    const progressPercent = ref(0)
    const isDragging = ref(false)

    const handleLoadedMetadata = () => {
      if (audioRef.value) {
        duration.value = audioRef.value.duration
      }
    }

    const handleTimeUpdate = () => {
      if (audioRef.value && !isDragging.value) {
        currentTime.value = audioRef.value.currentTime
        if (duration.value > 0) {
          progressPercent.value = (currentTime.value / duration.value) * 100
        }
      }
    }

    const handleEnded = () => {
      isPlaying.value = false
      currentTime.value = 0
      progressPercent.value = 0
    }

    const handleAudioError = (e: Event) => {
      logger.error({ text: '音频加载失败', data: { error: e } })
    }

    const togglePlay = () => {
      if (!audioRef.value)
        return

      if (isPlaying.value) {
        audioRef.value.pause()
        isPlaying.value = false
      }
      else {
        audioRef.value.play()
        isPlaying.value = true
      }
    }

    const seekBackward = () => {
      if (audioRef.value) {
        audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
      }
    }

    const seekForward = () => {
      if (audioRef.value) {
        audioRef.value.currentTime = Math.min(
          duration.value,
          audioRef.value.currentTime + 10,
        )
      }
    }

    const handleProgressClick = (e: MouseEvent) => {
      if (!audioRef.value || !duration.value)
        return

      const progressBar = e.currentTarget as HTMLElement
      const rect = progressBar.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percent = clickX / rect.width
      const newTime = percent * duration.value

      audioRef.value.currentTime = newTime
      currentTime.value = newTime
      progressPercent.value = percent * 100
    }

    const formatTime = (seconds: number): string => {
      if (Number.isNaN(seconds) || !Number.isFinite(seconds))
        return '00:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // 键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        electron?.window.closeWindow('audio', { hideOnly: true })
      }
      else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seekBackward()
      }
      else if (e.key === 'ArrowRight') {
        e.preventDefault()
        seekForward()
      }
    }

    watch(() => isPlaying.value, (playing) => {
      if (audioRef.value) {
        if (playing) {
          audioRef.value.play().catch((err: any) => logger.error({ text: '音频播放失败', data: { error: err } }))
        }
        else {
          audioRef.value.pause()
        }
      }
    })

    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
      if (audioRef.value) {
        audioRef.value.pause()
      }
    })

    return {
      audioRef,
      isPlaying,
      currentTime,
      duration,
      progressPercent,
      handleLoadedMetadata,
      handleTimeUpdate,
      handleEnded,
      handleAudioError,
      togglePlay,
      seekBackward,
      seekForward,
      handleProgressClick,
      formatTime,
    }
  },
})
</script>

<style lang="less" scoped>
.audio-player {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.player-container {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.player-header {
  text-align: center;
  margin-bottom: 32px;
}

.audio-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.audio-title {
  font-size: 16px;
  font-weight: 500;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #636E72;
}

.progress-bar {
  cursor: pointer;
  padding: 8px 0;
}

.progress-bg {
  position: relative;
  height: 4px;
  background: #EBEEF5;
  border-radius: 2px;
  overflow: visible;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #FF7D45;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #FF7D45;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.1s linear;
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 8px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #F9FAFB;
  color: #FF7D45;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #FFE6D9;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  img {
    width: 24px;
    height: 24px;
  }
}

.player-audio {
  display: none;
}

.empty-state {
  text-align: center;
  color: #636E72;
  font-size: 14px;
}
</style>
