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
  <transition name="message-fade" appear>
    <div
      v-if="visible"
      class="message" :class="[
        `message--${type}`,
        { 'message--center': center },
      ]"
      :style="{ zIndex }"
    >
      <div class="message__icon">
        <img v-if="type === 'success'" src="../../../assets/images/ui/message-success.svg" alt="成功">
        <img v-else-if="type === 'info'" src="../../../assets/images/ui/message-info.svg" alt="提示">
        <img v-else-if="type === 'warning'" src="../../../assets/images/ui/message-warning.svg" alt="警告">
        <img v-else-if="type === 'error'" src="../../../assets/images/ui/message-error.svg" alt="错误">
      </div>
      <div class="message__content">
        <p v-if="!dangerouslyUseHTMLString" class="message__text">
          {{ message }}
        </p>
        <p v-else class="message__text" v-html="message" />
      </div>
      <div v-if="showClose" class="message__close" @click="close">
        <img src="../../../assets/images/ui/message-close.svg" alt="关闭">
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, onMounted, ref } from 'vue'

export type MessageType = 'success' | 'warning' | 'info' | 'error'

export default defineComponent({
  name: 'Message',
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String as PropType<MessageType>,
      default: 'info',
    },
    duration: {
      type: Number,
      default: 3000,
    },
    showClose: {
      type: Boolean,
      default: false,
    },
    center: {
      type: Boolean,
      default: false,
    },
    dangerouslyUseHTMLString: {
      type: Boolean,
      default: false,
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
    onClose: {
      type: Function,
      default: null,
    },
  },
  emits: ['destroy'],
  setup(props, { emit }) {
    const visible = ref(false)
    let timer: NodeJS.Timeout | null = null

    const startTimer = () => {
      if (props.duration > 0) {
        timer = setTimeout(() => {
          close()
        }, props.duration)
      }
    }

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    const close = () => {
      visible.value = false
      clearTimer()
      props.onClose?.()
      // 延迟销毁，等待动画完成
      setTimeout(() => {
        emit('destroy')
      }, 300)
    }

    const handleMouseEnter = () => {
      clearTimer()
    }

    const handleMouseLeave = () => {
      startTimer()
    }

    onMounted(() => {
      visible.value = true
      startTimer()
    })

    return {
      visible,
      close,
      handleMouseEnter,
      handleMouseLeave,
    }
  },
})
</script>

<style lang="less" scoped>
.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  min-width: 380px;
  padding: 15px 20px;
  border-radius: 6px;
  background-color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #EBEEF5;
  overflow: hidden;
  cursor: pointer;

  &--center {
    justify-content: center;
  }

  &--success {
    background-color: #F1F8E9;
    border-color: #4CAF50;

    .message__icon {
      color: #4CAF50;
    }

    .message__text {
      color: #2E7D32;
    }
  }

  &--warning {
    background-color: #FFF8E1;
    border-color: #FFC107;

    .message__icon {
      color: #FF8F00;
    }

    .message__text {
      color: #E65100;
    }
  }

  &--info {
    background-color: #E3F2FD;
    border-color: #2196F3;

    .message__icon {
      color: #2196F3;
    }

    .message__text {
      color: #1565C0;
    }
  }

  &--error {
    background-color: #FFEBEE;
    border-color: #FF5252;

    .message__icon {
      color: #FF5252;
    }

    .message__text {
      color: #C62828;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    margin-right: 10px;
    font-size: 16px;

    img {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
  }

  &__content {
    flex: 1;

    .message__text {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: #636E72;
    }
  }

  &__close {
    margin-left: 15px;
    cursor: pointer;
    color: #B2BEC3;
    font-size: 16px;

    &:hover {
      color: #636E72;
    }

    img {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
  }
}

.message-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
}

.message-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}
</style>
