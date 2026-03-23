<template>
  <div class="decision-report">
    <!-- 磨损程度评级卡片 -->
    <div class="report-card">
      <h3 class="section-title">磨损评级</h3>
      <div class="wear-level-display">
        <div
          class="wear-badge"
          :style="{
            background: wearColor + '18',
            borderColor: wearColor + '50',
            color: wearColor,
          }"
        >
          <span class="wear-dot" :style="{ background: wearColor }"></span>
          <span class="wear-label">{{ wearLabel }}</span>
        </div>
        <div class="wear-bar-track">
          <div
            class="wear-bar-fill"
            :style="{ width: wearBarWidth, background: wearColor }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 处置建议卡片 -->
    <div class="report-card">
      <h3 class="section-title">处置建议</h3>
      <div
        class="recommendation-display"
        :style="{
          background: wearColor + '10',
          borderColor: wearColor + '40',
        }"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="rec-icon" :style="{ color: wearColor }">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span class="rec-text">{{ recommendationLabel }}</span>
      </div>
    </div>

    <!-- 推荐供应商列表 -->
    <div class="report-card">
      <h3 class="section-title">推荐供应商</h3>
      <div v-if="report.suppliers.length === 0" class="empty-suppliers">
        暂无推荐供应商
      </div>
      <ul v-else class="supplier-list">
        <li
          v-for="supplier in report.suppliers.slice(0, 3)"
          :key="supplier.name"
          class="supplier-item cursor-pointer"
          role="button"
          tabindex="0"
          @click="emit('supplierClick', supplier.name)"
          @keydown.enter="emit('supplierClick', supplier.name)"
          @keydown.space.prevent="emit('supplierClick', supplier.name)"
        >
          <div class="supplier-main">
            <span class="supplier-name">{{ supplier.name }}</span>
            <div class="supplier-stars" :aria-label="`评分 ${supplier.rating} 星`">
              <svg
                v-for="i in 5"
                :key="i"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="star-icon"
                :class="i <= supplier.rating ? 'star-filled' : 'star-empty'"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div class="supplier-meta">
            <span class="supplier-price">¥{{ supplier.price.toLocaleString() }}</span>
            <span class="supplier-lead">{{ supplier.leadTimeDays }} 天</span>
          </div>
          <svg viewBox="0 0 20 20" fill="currentColor" class="supplier-arrow">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DecisionReport, WearLevel } from '../../types/aiAnalysis';
import { WEAR_LEVEL_COLORS } from '../../types/aiAnalysis';

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  report: DecisionReport;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  supplierClick: [name: string];
}>();

// ─── 磨损等级映射 ─────────────────────────────────────────────────────────────

const WEAR_LEVEL_LABELS: Record<WearLevel, string> = {
  normal: '正常',
  light: '轻度磨损',
  moderate: '中度磨损',
  severe: '严重磨损',
};

const WEAR_BAR_WIDTHS: Record<WearLevel, string> = {
  normal: '20%',
  light: '45%',
  moderate: '70%',
  severe: '100%',
};

// ─── 处置建议映射 ─────────────────────────────────────────────────────────────

const RECOMMENDATION_LABELS: Record<string, string> = {
  continue: '继续使用',
  plan_repair: '计划维修',
  immediate_repair: '立即维修',
  replace: '立即更换',
};

// ─── 计算属性 ─────────────────────────────────────────────────────────────────

const wearColor = computed(() => WEAR_LEVEL_COLORS[props.report.wearLevel]);
const wearLabel = computed(() => WEAR_LEVEL_LABELS[props.report.wearLevel]);
const wearBarWidth = computed(() => WEAR_BAR_WIDTHS[props.report.wearLevel]);
const recommendationLabel = computed(
  () => RECOMMENDATION_LABELS[props.report.recommendation] ?? props.report.recommendation
);
</script>

<style scoped>
.decision-report {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

/* ── 通用卡片 ── */
.report-card {
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

/* ── 磨损评级 ── */
.wear-level-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.wear-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid;
  font-size: 0.9375rem;
  font-weight: 700;
  width: fit-content;
}

.wear-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.wear-label {
  line-height: 1;
}

.wear-bar-track {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.wear-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 600ms ease;
}

/* ── 处置建议 ── */
.recommendation-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  padding: var(--space-md, 16px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid;
}

.rec-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.rec-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
}

/* ── 供应商列表 ── */
.empty-suppliers {
  font-size: 0.875rem;
  color: #94a3b8;
  text-align: center;
  padding: var(--space-md, 16px) 0;
}

.supplier-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.supplier-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  padding: var(--space-sm, 8px) var(--space-md, 16px);
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md, 8px);
  transition: border-color 200ms ease, background 200ms ease;
}

.supplier-item:hover {
  border-color: var(--color-cta, #0369a1);
  background: #eff6ff;
}

.supplier-item:focus-visible {
  outline: 2px solid var(--color-cta, #0369a1);
  outline-offset: 2px;
}

.supplier-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.supplier-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.supplier-stars {
  display: flex;
  gap: 2px;
}

.star-icon {
  width: 14px;
  height: 14px;
}

.star-filled {
  color: #f59e0b;
}

.star-empty {
  color: #e2e8f0;
}

.supplier-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.supplier-price {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
}

.supplier-lead {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
}

.supplier-arrow {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  flex-shrink: 0;
  transition: color 200ms ease;
}

.supplier-item:hover .supplier-arrow {
  color: var(--color-cta, #0369a1);
}
</style>
