<template>
  <div class="supply-chain-panel">
    <!-- 库存卡片 -->
    <div class="info-card">
      <div class="card-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="card-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="12.01" />
        </svg>
      </div>
      <div class="card-body">
        <span class="card-label">实时库存</span>
        <span class="card-value" :class="stockColorClass">
          {{ data.stock }} 件
        </span>
        <span class="card-status" :class="stockColorClass">
          {{ stockStatusText }}
        </span>
      </div>
    </div>

    <!-- 报价区间卡片 -->
    <div class="info-card">
      <div class="card-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="card-icon">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      </div>
      <div class="card-body">
        <span class="card-label">参考报价区间</span>
        <span class="card-value card-value--price">
          {{ data.priceRange.currency }}{{ data.priceRange.min }} - {{ data.priceRange.currency }}{{ data.priceRange.max }}
        </span>
      </div>
    </div>

    <!-- 货期卡片 -->
    <div class="info-card">
      <div class="card-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="card-icon">
          <circle cx="12" cy="12" r="10" />
          <polyline stroke-linecap="round" stroke-linejoin="round" points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div class="card-body">
        <span class="card-label">货期</span>
        <span class="card-value">{{ data.leadTimeDays }} 个工作日</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SupplyChainData } from '../../types/aiAnalysis';

interface Props {
  data: SupplyChainData;
}

const props = defineProps<Props>();

const stockColorClass = computed(() =>
  props.data.stock > 100 ? 'stock-sufficient' : 'stock-tight'
);

const stockStatusText = computed(() =>
  props.data.stock > 100 ? '库存充足' : '库存紧张'
);
</script>

<style scoped>
.supply-chain-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md, 16px);
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm, 8px);
  padding: var(--space-md, 16px);
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  transition: border-color 200ms ease;
}

.info-card:hover {
  border-color: #94a3b8;
}

.card-icon-wrap {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: var(--radius-md, 8px);
}

.card-icon {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.card-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.card-value {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  line-height: 1.2;
  word-break: break-all;
}

.card-value--price {
  font-family: var(--font-heading, monospace);
  font-size: 0.9375rem;
}

.card-status {
  font-size: 0.75rem;
  font-weight: 600;
}

/* 库存状态颜色 */
.stock-sufficient {
  color: #059669;
}

.stock-tight {
  color: #d97706;
}

/* 响应式：小屏单列 */
@media (max-width: 640px) {
  .supply-chain-panel {
    grid-template-columns: 1fr;
  }
}
</style>
