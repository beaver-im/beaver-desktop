<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  连接器中心。对齐 WorkBuddy 原样：连接器是独立一层，不挂在专家卡片上；
  用户在此做 OAuth 授权，授权后其 MCP 工具并入 agent 能力，任务需要时
  由 agent 侧动态推荐（不在此处手选）。
-->
<template>
  <div v-if="visible" class="picker-mask" @click.self="emit('close')">
    <div class="picker-panel">
      <header class="picker-head">
        <div class="picker-title">
          <h3>连接器</h3>
          <span>授权后，AI 可在需要时使用这些外部服务</span>
        </div>
        <button class="icon-btn" type="button" title="关闭" @click="emit('close')">×</button>
      </header>

      <div class="conn-list">
        <div v-for="c in connectors" :key="c.connectorId" class="conn-card">
          <div class="conn-ident">
            <strong>{{ c.name }}</strong>
            <p>{{ c.description }}</p>
            <div class="scope-row">
              <span v-for="s in (c.scopes || []).slice(0, 4)" :key="s" class="scope">{{ s }}</span>
            </div>
          </div>
          <button
            type="button"
            class="conn-btn"
            :class="{ granted: c.granted }"
            :disabled="busy === c.connectorId"
            @click="onToggle(c)"
          >
            {{ c.granted ? '已授权 · 撤销' : (busy === c.connectorId ? '跳转中…' : '连接') }}
          </button>
        </div>

        <div v-if="!connectors.length" class="empty">暂无可用连接器</div>
      </div>

      <p class="hint">授权在浏览器完成；撤销后 AI 将不再拥有该服务的工具权限。</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import type { IConnectorItem } from 'commonModule/type/ajax/agent'
import { connectorRevokeApi, connectorStartOAuthApi, listConnectorsApi } from 'renderModule/api/agent'

export default defineComponent({
  name: 'ConnectorPicker',
  props: { visible: { type: Boolean, default: false } },
  emits: ['close'],
  setup(props, { emit }) {
    const connectors = ref<IConnectorItem[]>([])
    const busy = ref('')

    const load = async () => {
      try {
        const res = await listConnectorsApi()
        if (res.code === 0 && res.result)
          connectors.value = res.result.connectors || []
      } catch {
        connectors.value = []
      }
    }
    watch(() => props.visible, (v) => { if (v) load() }, { immediate: true })

    const onToggle = async (c: IConnectorItem) => {
      if (busy.value)
        return
      if (c.granted) {
        busy.value = c.connectorId
        try {
          const res = await connectorRevokeApi({ connectorId: c.connectorId })
          if (res.code === 0) c.granted = false
        } finally {
          busy.value = ''
        }
        return
      }
      busy.value = c.connectorId
      try {
        const res = await connectorStartOAuthApi({ connectorId: c.connectorId })
        if (res.code === 0 && res.result && res.result.authorizeUrl) {
          window.open(res.result.authorizeUrl, '_blank', 'noopener,noreferrer')
        }
      } finally {
        busy.value = ''
      }
    }

    return { connectors, busy, onToggle, emit }
  },
})
</script>

<style lang="less" scoped>
.picker-mask {
  position: fixed; inset: 0; z-index: 120;
  background: rgba(0, 0, 0, 0.35);
  display: flex; align-items: center; justify-content: center;
}
.picker-panel {
  width: 560px; max-width: 92vw; max-height: 82vh;
  background: #fff; border-radius: 14px;
  display: flex; flex-direction: column; overflow: hidden;
}
.picker-head {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px 12px;
}
.picker-title h3 { margin: 0 0 3px; font-size: 16px; font-weight: 600; color: #2D3436; }
.picker-title span { font-size: 12px; color: #8A9196; }
.icon-btn { border: 0; background: none; font-size: 22px; color: #8A9196; cursor: pointer; line-height: 1; }
.conn-list { flex: 1; overflow-y: auto; padding: 4px 22px 12px; }
.conn-card {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border: 1px solid #ECEEF0; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px;
}
.conn-ident { flex: 1; min-width: 0; }
.conn-ident strong { font-size: 14px; color: #2D3436; }
.conn-ident p { font-size: 12px; color: #636B70; margin: 4px 0; }
.scope-row { display: flex; gap: 5px; flex-wrap: wrap; }
.scope { font-size: 11px; color: #185FA5; background: #E6F1FB; border-radius: 7px; padding: 1px 6px; }
.conn-btn {
  flex-shrink: 0; border: 1px solid #FF9A66; background: #FFF1EA; color: #D85A30;
  border-radius: 8px; padding: 6px 14px; font-size: 12px; cursor: pointer;
  &:disabled { opacity: 0.6; cursor: default; }
  &.granted { border-color: #9FE1CB; background: #E1F5EE; color: #0F6E56; }
}
.hint { flex-shrink: 0; margin: 0; padding: 10px 22px 16px; font-size: 11px; color: #8A9196; border-top: 1px solid #F1F2F3; }
.empty { text-align: center; color: #8A9196; padding: 40px 0; font-size: 13px; }
</style>
