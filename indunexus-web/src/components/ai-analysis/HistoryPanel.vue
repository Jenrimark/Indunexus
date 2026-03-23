<template>
  <div class="history-panel">
    <!-- 时间范围筛选 -->
    <div class="filter-bar">
      <button
        v-for="opt in filterOptions"
        :key="opt.value"
        class="filter-btn"
        :class="{ active: activeFilter === opt.value }"
        @click="activeFilter = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredRecords.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="empty-text">暂无分析记录</p>
    </div>

    <!-- 记录列表 + 详情面板 -->
    <div v-else class="content-area">
      <!-- 左侧列表 -->
      <ul class="record-list">
        <li
          v-for="record in filteredRecords"
          :key="record.id"
          class="record-item"
          :class="{ selected: selectedId === record.id }"
          role="button"
          tabindex="0"
          @click="selectRecord(record)"
          @keydown.enter="selectRecord(record)"
          @keydown.space.prevent="selectRecord(record)"
        >
          <img
            :src="record.imageDataUrl"
            :alt="record.imageName"
            class="record-thumb"
          />
          <div class="record-info">
            <span class="record-name">{{ record.recognitionResult.category }} · {{ record.recognitionResult.sub_category }}</span>
            <span class="record-file">{{ record.imageName }}</span>
            <span class="record-time">{{ formatTime(record.analyzedAt) }}</span>
          </div>
          <div class="record-badge-col">
            <span class="confidence-badge" :class="confidenceClass(record.recognitionResult.confidence)">
              {{ (record.recognitionResult.confidence * 100).toFixed(0) }}%
            </span>
            <button
              class="reanalyze-btn"
              title="重新分析"
              @click.stop="emit('reanalyze', record)"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </li>
      </ul>

      <!-- 右侧详情 -->
      <div v-if="selectedRecord" class="detail-panel">
        <h3 class="detail-title">分析详情</h3>

        <!-- 识别结果摘要 -->
        <div class="detail-section">
          <p class="detail-label">零件信息</p>
          <p class="detail-value">{{ selectedRecord.recognitionResult.category }} / {{ selectedRecord.recognitionResult.sub_category }}</p>
          <div class="specs-grid">
            <template v-for="(val, key) in selectedRecord.recognitionResult.specs" :key="key">
              <span class="spec-key">{{ key }}</span>
              <span class="spec-val">{{ val }}</span>
            </template>
          </div>
        </div>

        <!-- 供应链摘要 -->
        <div class="detail-section">
          <p class="detail-label">供应链</p>
          <div class="supply-row">
            <span>库存</span><strong>{{ selectedRecord.supplyChainData.stock }} 件</strong>
          </div>
          <div class="supply-row">
            <span>报价</span>
            <strong>
              {{ selectedRecord.supplyChainData.priceRange.currency }}
              {{ selectedRecord.supplyChainData.priceRange.min }}–{{ selectedRecord.supplyChainData.priceRange.max }}
            </strong>
          </div>
          <div class="supply-row">
            <span>货期</span><strong>{{ selectedRecord.supplyChainData.leadTimeDays }} 工作日</strong>
          </div>
        </div>

        <!-- 决策建议摘要 -->
        <div class="detail-section">
          <p class="detail-label">决策建议</p>
          <span class="wear-tag" :style="{ color: wearColor(selectedRecord.decisionReport.wearLevel), background: wearColor(selectedRecord.decisionReport.wearLevel) + '18' }">
            {{ wearLabel(selectedRecord.decisionReport.wearLevel) }}
          </span>
          <p class="rec-text">{{ recLabel(selectedRecord.decisionReport.recommendation) }}</p>
        </div>
      </div>

      <div v-else class="detail-placeholder">
        <p>点击左侧记录查看详情</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAiAnalysisStore } from '../../stores/aiAnalysis';
import type { AnalysisRecord, WearLevel, Recommendation } from '../../types/aiAnalysis';
import { WEAR_LEVEL_COLORS } from '../../types/aiAnalysis';

const emit = defineEmits<{
  reanalyze: [record: AnalysisRecord];
}>();

const store = useAiAnalysisStore();

// ─── Filter ───────────────────────────────────────────────────────────────────

const filterOptions = [
  { label: '今天', value: 'today' as const },
  { label: '近7天', value: '7days' as const },
  { label: '近30天', value: '30days' as const },
];

const activeFilter = ref<'today' | '7days' | '30days'>('7days');

const filteredRecords = computed(() => store.filterRecordsByRange(activeFilter.value));

// ─── Selection ────────────────────────────────────────────────────────────────

const selectedId = ref<string | null>(null);
const selectedRecord = computed(() =>
  filteredRecords.value.find((r) => r.id === selectedId.value) ?? null
);

function selectRecord(record: AnalysisRecord) {
  selectedId.value = record.id;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function confidenceClass(c: number): string {
  if (c >= 0.85) return 'conf-high';
  if (c >= 0.70) return 'conf-mid';
  return 'conf-low';
}

const WEAR_LABELS: Record<WearLevel, string> = {
  normal: '正常', light: '轻度磨损', moderate: '中度磨损', severe: '严重磨损',
};
const REC_LABELS: Record<Recommendation, string> = {
  continue: '继续使用', plan_repair: '计划维修', immediate_repair: '立即维修', replace: '立即更换',
};

function wearColor(level: WearLevel): string { return WEAR_LEVEL_COLORS[level]; }
function wearLabel(level: WearLevel): string { return WEAR_LABELS[level]; }
function recLabel(rec: Recommendation): string { return REC_LABELS[rec]; }
</script>

<style scoped>
.history-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  height: 100%;
}

/* ── Filter bar ── */
.filter-bar {
  display: flex;
  gap: var(--space-sm, 8px);
}

.filter-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 200ms ease;
}

.filter-btn:hover {
  border-color: var(--color-cta, #0369a1);
  color: var(--color-cta, #0369a1);
}

.filter-btn.active {
  background: var(--color-cta, #0369a1);
  border-color: var(--color-cta, #0369a1);
  color: white;
}

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md, 16px);
  padding: var(--space-2xl, 48px) 0;
  color: #94a3b8;
}

.empty-icon {
  width: 48px;
  height: 48px;
}

.empty-text {
  font-size: 0.9375rem;
  margin: 0;
}

/* ── Content area ── */
.content-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md, 16px);
  flex: 1;
  min-height: 0;
}

/* ── Record list ── */
.record-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
  overflow-y: auto;
}

.record-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  padding: var(--space-sm, 8px) var(--space-md, 16px);
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 200ms ease, background 200ms ease;
}

.record-item:hover {
  border-color: var(--color-cta, #0369a1);
  background: #f0f9ff;
}

.record-item.selected {
  border-color: var(--color-cta, #0369a1);
  background: #eff6ff;
}

.record-item:focus-visible {
  outline: 2px solid var(--color-cta, #0369a1);
  outline-offset: 2px;
}

.record-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  background: #f1f5f9;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.record-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-file {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.record-badge-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.confidence-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.conf-high { background: #d1fae5; color: #065f46; }
.conf-mid  { background: #fef3c7; color: #92400e; }
.conf-low  { background: #fee2e2; color: #991b1b; }

.reanalyze-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px;
  cursor: pointer;
  color: #64748b;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
}

.reanalyze-btn:hover {
  border-color: var(--color-cta, #0369a1);
  color: var(--color-cta, #0369a1);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* ── Detail panel ── */
.detail-panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: var(--space-lg, 24px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

.detail-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  margin: 0;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 4px);
  padding-bottom: var(--space-md, 16px);
  border-bottom: 1px solid #f1f5f9;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.detail-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
  margin: 0;
}

.specs-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  margin-top: 4px;
}

.spec-key {
  font-size: 0.8125rem;
  color: #64748b;
  text-transform: capitalize;
}

.spec-val {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-primary, #0f172a);
}

.supply-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #475569;
}

.supply-row strong {
  color: var(--color-primary, #0f172a);
}

.wear-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  width: fit-content;
}

.rec-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
  margin: 4px 0 0;
}

.detail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
