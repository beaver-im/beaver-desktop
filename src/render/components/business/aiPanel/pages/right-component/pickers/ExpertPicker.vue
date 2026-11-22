<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  专家中心卡片墙。对齐 WorkBuddy 专家中心：分类筛选 + 卡片
  （头像 / 职业 / 展示描述 / 3 标签 / 3 快捷提示词）。数据来源后端
  list_experts（官方预设 + 本人自建），不在前端硬编码任何专家内容。

  遵循 WorkBuddy 原样：专家卡片不列连接器；连接器由独立入口管理，
  任务需要时由 agent 侧动态推荐。
-->
<template>
  <div v-if="visible" class="picker-mask" @click.self="emit('close')">
    <div class="picker-panel">
      <header class="picker-head">
        <div class="picker-title">
          <h3>专家中心</h3>
          <span>选一位专家为你服务</span>
        </div>
        <button class="icon-btn" type="button" title="关闭" @click="emit('close')">×</button>
      </header>

      <div class="category-bar">
        <button
          v-for="c in categories"
          :key="c.id"
          type="button"
          class="chip"
          :class="{ active: activeCategory === c.id }"
          @click="activeCategory = c.id"
        >
          {{ c.label }}
        </button>
      </div>

      <div class="card-grid">
        <button
          v-for="e in filteredExperts"
          :key="e.agentId"
          type="button"
          class="expert-card"
          :class="{ selected: e.agentId === selectedId }"
          @click="onSelect(e)"
        >
          <div class="card-top">
            <span class="avatar">
              <img v-if="e.avatar" :src="e.avatar" :alt="display(e.nameI18n, e.name)">
              <span v-else class="avatar-fallback">{{ initial(e) }}</span>
            </span>
            <span class="card-ident">
              <strong>{{ display(e.nameI18n, e.name) }}</strong>
              <small>{{ display(e.profession, '') }}</small>
            </span>
            <span v-if="e.expertType === 'team'" class="team-badge">团队</span>
          </div>

          <p class="card-desc">{{ display(e.descriptionI18n, e.description) }}</p>

          <div class="tag-row">
            <span v-for="(t, i) in (e.tags || []).slice(0, 3)" :key="i" class="tag">{{ display(t, '') }}</span>
          </div>

          <div v-if="(e.quickPrompts || []).length" class="quick-row">
            <span
              v-for="(q, i) in e.quickPrompts.slice(0, 3)"
              :key="i"
              class="quick"
              @click.stop="onPickPrompt(e, q)"
            >{{ display(q, '') }}</span>
          </div>
        </button>

        <div v-if="!filteredExperts.length" class="empty">该分类暂无专家</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import type { IExpertI18nText, IExpertItem } from 'commonModule/type/ajax/agent'
import { listExpertsApi } from 'renderModule/api/agent'

export default defineComponent({
  name: 'ExpertPicker',
  props: {
    visible: { type: Boolean, default: false },
    selectedId: { type: String, default: '' },
  },
  emits: ['close', 'select', 'pick-prompt'],
  setup(props, { emit }) {
    const experts = ref<IExpertItem[]>([])
    const activeCategory = ref('all')

    const categories = computed(() => {
      const ids = new Set(experts.value.map(e => e.categoryId).filter(Boolean))
      const list = [{ id: 'all', label: '全部' }]
      for (const id of Array.from(ids).sort()) {
        list.push({ id, label: id.replace(/^\d+-/, '').replace(/-/g, ' ') })
      }
      return list
    })

    const filteredExperts = computed(() => {
      if (activeCategory.value === 'all')
        return experts.value
      return experts.value.filter(e => e.categoryId === activeCategory.value)
    })

    const load = async () => {
      try {
        const res = await listExpertsApi()
        if (res.code === 0 && res.result)
          experts.value = res.result.agents || []
      } catch {
        experts.value = []
      }
    }
    watch(() => props.visible, (v) => { if (v) load() }, { immediate: true })

    const display = (i18n: Partial<IExpertI18nText> | undefined, fallback: string): string => {
      return (i18n && i18n.zh) || fallback || ''
    }
    const initial = (e: IExpertItem): string => (display(e.nameI18n, e.name) || '?').slice(0, 1)
    const onSelect = (e: IExpertItem) => emit('select', e)
    const onPickPrompt = (e: IExpertItem, q: IExpertI18nText) => {
      emit('pick-prompt', { expert: e, prompt: display(q, '') })
      emit('close')
    }

    return { experts, categories, activeCategory, filteredExperts, display, initial, onSelect, onPickPrompt, emit }
  },
})
</script>

<style lang="less" scoped>
.picker-mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker-panel {
  width: 760px;
  max-width: 92vw;
  max-height: 82vh;
  background: #fff;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.picker-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 12px;
}
.picker-title h3 { margin: 0 0 3px; font-size: 16px; font-weight: 600; color: #2D3436; }
.picker-title span { font-size: 12px; color: #8A9196; }
.icon-btn { border: 0; background: none; font-size: 22px; color: #8A9196; cursor: pointer; line-height: 1; }
.category-bar {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: 4px 22px 14px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid #E4E7E9;
  background: #fff;
  color: #636B70;
  border-radius: 14px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  &.active { background: #FFF1EA; border-color: #FF9A66; color: #D85A30; }
}
.card-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 22px 22px;
}
.expert-card {
  text-align: left;
  border: 1px solid #ECEEF0;
  border-radius: 10px;
  padding: 14px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover { border-color: #FFB98A; }
  &.selected { border-color: #FF8A50; box-shadow: 0 0 0 2px rgba(255, 138, 80, 0.15); }
}
.card-top { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 9px; overflow: hidden;
  background: #FFF1EA; display: flex; align-items: center; justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; }
}
.avatar-fallback { font-size: 16px; color: #D85A30; font-weight: 600; }
.card-ident { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.card-ident strong { font-size: 14px; color: #2D3436; }
.card-ident small { font-size: 12px; color: #8A9196; margin-top: 2px; }
.team-badge { font-size: 11px; color: #534AB7; background: #EEEDFE; border-radius: 8px; padding: 2px 7px; }
.card-desc { font-size: 12px; line-height: 1.6; color: #636B70; margin: 10px 0; min-height: 38px; }
.tag-row { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { font-size: 11px; color: #0F6E56; background: #E1F5EE; border-radius: 8px; padding: 2px 7px; }
.quick-row { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
.quick {
  font-size: 12px; color: #D85A30; cursor: pointer;
  &:hover { text-decoration: underline; }
}
.empty { grid-column: 1 / -1; text-align: center; color: #8A9196; padding: 40px 0; font-size: 13px; }
</style>
