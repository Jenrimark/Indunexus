<template>
  <div class="knowledge-graph-panel">
    <!-- 分类路径（面包屑） -->
    <div class="panel-section">
      <h3 class="section-title">分类路径</h3>
      <nav class="breadcrumb" aria-label="分类路径">
        <span
          v-for="(item, index) in data.classificationPath"
          :key="index"
          class="breadcrumb-item-wrapper"
        >
          <span
            class="breadcrumb-item"
            :class="{ 'breadcrumb-item--active': index === data.classificationPath.length - 1 }"
          >{{ item }}</span>
          <span
            v-if="index < data.classificationPath.length - 1"
            class="breadcrumb-separator"
            aria-hidden="true"
          >&gt;</span>
        </span>
      </nav>
    </div>

    <!-- 关联零件列表 -->
    <div class="panel-section">
      <h3 class="section-title">关联零件</h3>
      <ul v-if="data.relatedParts.length > 0" class="parts-list">
        <li
          v-for="part in data.relatedParts.slice(0, 3)"
          :key="part.partId"
          class="part-item"
        >
          <span class="part-name">{{ part.partName }}</span>
          <span class="part-number">{{ part.partNumber }}</span>
        </li>
      </ul>
      <p v-else class="empty-hint">暂无关联零件</p>
    </div>

    <!-- 可替代零件列表 -->
    <div class="panel-section">
      <h3 class="section-title">可替代零件</h3>
      <ul v-if="data.alternatives.length > 0" class="parts-list">
        <li
          v-for="alt in data.alternatives.slice(0, 3)"
          :key="alt.partId"
          class="part-item"
        >
          <div class="part-main">
            <span class="part-name">{{ alt.partName }}</span>
            <span class="part-number">{{ alt.partNumber }}</span>
          </div>
          <span class="part-reason">{{ alt.reason }}</span>
        </li>
      </ul>
      <p v-else class="empty-hint">暂无可替代零件</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KnowledgeGraphData } from '../../types/aiAnalysis';

interface Props {
  data: KnowledgeGraphData;
}

defineProps<Props>();
</script>

<style scoped>
.knowledge-graph-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

/* ── 区域 ── */
.panel-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-lg, 24px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-md, 16px) 0;
}

/* ── 面包屑 ── */
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.breadcrumb-item-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-item {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.breadcrumb-item--active {
  color: var(--color-cta, #0369a1);
  font-weight: 700;
}

.breadcrumb-separator {
  font-size: 0.75rem;
  color: #94a3b8;
  user-select: none;
}

/* ── 零件列表 ── */
.parts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.part-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-sm, 8px) var(--space-md, 16px);
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md, 8px);
  transition: border-color 200ms ease;
}

.part-item:hover {
  border-color: #94a3b8;
}

.part-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.part-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
}

.part-number {
  font-size: 0.75rem;
  color: #64748b;
  font-family: var(--font-heading, monospace);
}

.part-reason {
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.4;
}

/* ── 空状态 ── */
.empty-hint {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
  text-align: center;
  padding: var(--space-sm, 8px) 0;
}
</style>
