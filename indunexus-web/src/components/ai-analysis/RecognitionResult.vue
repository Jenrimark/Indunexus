<template>
  <div class="recognition-result">
    <!-- 低置信度降级横幅 -->
    <div v-if="result.confidence < 0.60" class="degraded-banner" role="alert">
      <svg viewBox="0 0 20 20" fill="currentColor" class="banner-icon">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <div class="banner-content">
        <span class="banner-text">识别置信度较低，建议人工复核</span>
        <button
          v-if="!reviewTicket"
          class="btn-review cursor-pointer"
          @click="applyManualReview"
        >
          申请人工审核
        </button>
        <div v-else class="ticket-success">
          <svg viewBox="0 0 20 20" fill="currentColor" class="ticket-icon">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>工单已提交：{{ reviewTicket }}</span>
        </div>
      </div>
    </div>

    <!-- 主识别结果卡片 -->
    <div class="result-card">
      <div class="card-header">
        <div class="part-name-group">
          <h2 class="part-name">{{ result.category }}</h2>
          <div class="category-tags">
            <span class="tag tag-category">{{ result.category }}</span>
            <span class="tag tag-sub">{{ result.sub_category }}</span>
          </div>
        </div>
        <div class="confidence-group">
          <div class="confidence-label-row">
            <span class="confidence-value">{{ (result.confidence * 100).toFixed(1) }}%</span>
            <span class="confidence-badge" :style="{ background: confidenceDisplay.hex + '20', color: confidenceDisplay.hex }">
              {{ confidenceDisplay.label }}
            </span>
          </div>
          <div class="confidence-bar-track">
            <div
              class="confidence-bar-fill"
              :style="{ width: (result.confidence * 100) + '%', background: confidenceDisplay.hex }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 规格参数表格 -->
      <div class="specs-section">
        <h3 class="specs-title">规格参数</h3>
        <table class="specs-table">
          <tbody>
            <tr v-for="(value, key) in filteredSpecs" :key="key" class="specs-row">
              <td class="specs-key">{{ formatSpecKey(key) }}</td>
              <td class="specs-val">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 候选结果列表 -->
    <div v-if="result.alternatives.length > 0" class="alternatives-section">
      <h3 class="section-title">候选结果</h3>
      <ul class="alternatives-list">
        <li
          v-for="alt in result.alternatives.slice(0, 5)"
          :key="alt.part_id"
          class="alt-item"
        >
          <div class="alt-main">
            <div class="alt-info">
              <span class="alt-name">{{ alt.part_name }}</span>
              <span class="alt-number">{{ alt.part_number }}</span>
            </div>
            <div class="alt-confidence">
              <span class="alt-conf-value" :style="{ color: getConfidenceDisplay(alt.confidence).hex }">
                {{ (alt.confidence * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
          <div class="alt-features">
            <span
              v-for="feature in alt.matched_features"
              :key="feature"
              class="feature-tag"
            >{{ feature }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- 反馈入口（折叠面板） -->
    <div class="feedback-section">
      <button
        class="feedback-toggle cursor-pointer"
        :aria-expanded="feedbackOpen"
        @click="feedbackOpen = !feedbackOpen"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="feedback-icon">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span>结果有误？提交反馈</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          class="chevron-icon"
          :class="{ 'chevron-open': feedbackOpen }"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <div v-if="feedbackOpen" class="feedback-panel">
        <div v-if="!feedbackSubmitted">
          <!-- 错误类型选择 -->
          <div class="form-group">
            <label class="form-label">错误类型</label>
            <div class="radio-group">
              <label
                v-for="opt in errorTypeOptions"
                :key="opt.value"
                class="radio-label cursor-pointer"
              >
                <input
                  v-model="feedbackType"
                  type="radio"
                  :value="opt.value"
                  class="radio-input"
                />
                <span class="radio-text">{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <!-- 文字说明 -->
          <div class="form-group">
            <label class="form-label" for="feedback-desc">说明（可选）</label>
            <textarea
              id="feedback-desc"
              v-model="feedbackDesc"
              class="feedback-textarea"
              rows="3"
              placeholder="请描述具体问题..."
            ></textarea>
          </div>

          <button
            class="btn-submit cursor-pointer"
            :disabled="!feedbackType"
            @click="submitFeedback"
          >
            提交反馈
          </button>
        </div>

        <!-- 提交成功提示 -->
        <div v-else class="feedback-success">
          <svg viewBox="0 0 20 20" fill="currentColor" class="success-icon">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>感谢反馈，将用于模型优化</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FullRecognitionResult } from '../../types/aiAnalysis';

// ─── 置信度纯函数 ─────────────────────────────────────────────────────────────

function getConfidenceDisplay(confidence: number): {
  color: string;
  label: string;
  hex: string;
} {
  if (confidence >= 0.85) {
    return { color: 'green', label: '高置信度', hex: '#10b981' };
  }
  if (confidence >= 0.70) {
    return { color: 'orange', label: '中等置信度', hex: '#f59e0b' };
  }
  return { color: 'red', label: '低置信度', hex: '#ef4444' };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  result: FullRecognitionResult;
}

const props = defineProps<Props>();

// ─── 置信度显示 ───────────────────────────────────────────────────────────────

const confidenceDisplay = computed(() => getConfidenceDisplay(props.result.confidence));

// ─── 规格参数过滤（去掉 undefined 值） ────────────────────────────────────────

const filteredSpecs = computed(() => {
  const entries = Object.entries(props.result.specs).filter(
    ([, v]) => v !== undefined && v !== ''
  );
  return Object.fromEntries(entries) as Record<string, string>;
});

const SPEC_KEY_MAP: Record<string, string> = {
  modulus: '模数',
  material: '材质',
  dimensions: '尺寸',
  teeth: '齿数',
  hardness: '硬度',
  helix_angle: '螺旋角',
  inner_diameter: '内径',
  outer_diameter: '外径',
  width: '宽度',
  load_rating: '额定载荷',
  contact_angle: '接触角',
  pitch: '节距',
  roller_diameter: '滚子直径',
  tensile_strength: '抗拉强度',
  standard: '标准',
  length: '长度',
  thread: '螺纹规格',
  surface: '表面处理',
  lip_type: '唇口类型',
};

function formatSpecKey(key: string): string {
  return SPEC_KEY_MAP[key] ?? key;
}

// ─── 人工审核工单 ─────────────────────────────────────────────────────────────

const reviewTicket = ref('');

function applyManualReview() {
  reviewTicket.value = `WO-${Date.now().toString(36).toUpperCase()}`;
}

// ─── 反馈面板 ─────────────────────────────────────────────────────────────────

const feedbackOpen = ref(false);
const feedbackSubmitted = ref(false);
const feedbackType = ref('');
const feedbackDesc = ref('');

const errorTypeOptions = [
  { value: 'category_error', label: '零件分类错误' },
  { value: 'spec_error', label: '规格参数错误' },
  { value: 'total_error', label: '完全识别错误' },
];

function submitFeedback() {
  if (!feedbackType.value) return;
  feedbackSubmitted.value = true;
}
</script>

<style scoped>
.recognition-result {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

/* ── 降级横幅 ── */
.degraded-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm, 8px);
  padding: var(--space-md, 16px);
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md, 8px);
  color: #92400e;
}

.banner-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #d97706;
}

.banner-content {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm, 8px);
}

.banner-text {
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
  min-width: 160px;
}

.btn-review {
  padding: 6px 14px;
  background: #d97706;
  color: white;
  border-radius: var(--radius-sm, 6px);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: opacity 200ms ease;
  flex-shrink: 0;
}

.btn-review:hover {
  opacity: 0.88;
}

.ticket-success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #059669;
}

.ticket-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── 主结果卡片 ── */
.result-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-lg, 24px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md, 16px);
  margin-bottom: var(--space-lg, 24px);
  flex-wrap: wrap;
}

.part-name-group {
  flex: 1;
  min-width: 0;
}

.part-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  margin: 0 0 var(--space-sm, 8px) 0;
  line-height: 1.3;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs, 4px);
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-category {
  background: #eff6ff;
  color: #1d4ed8;
}

.tag-sub {
  background: #f0fdf4;
  color: #15803d;
}

.confidence-group {
  flex-shrink: 0;
  min-width: 160px;
  text-align: right;
}

.confidence-label-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-sm, 8px);
  margin-bottom: var(--space-xs, 4px);
}

.confidence-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  line-height: 1;
}

.confidence-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.confidence-bar-track {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.confidence-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 600ms ease;
}

/* ── 规格参数 ── */
.specs-section {
  border-top: 1px solid #f1f5f9;
  padding-top: var(--space-md, 16px);
}

.specs-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-sm, 8px) 0;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-row:not(:last-child) td {
  border-bottom: 1px solid #f1f5f9;
}

.specs-key,
.specs-val {
  padding: 7px 0;
  font-size: 0.875rem;
}

.specs-key {
  color: #64748b;
  width: 40%;
  font-weight: 500;
}

.specs-val {
  color: var(--color-text, #020617);
  font-weight: 600;
  font-family: var(--font-heading, monospace);
}

/* ── 候选结果 ── */
.alternatives-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-lg, 24px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-md, 16px) 0;
}

.alternatives-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.alt-item {
  padding: var(--space-sm, 8px) var(--space-md, 16px);
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md, 8px);
  transition: border-color 200ms ease;
}

.alt-item:hover {
  border-color: #94a3b8;
}

.alt-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm, 8px);
  margin-bottom: 6px;
}

.alt-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.alt-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alt-number {
  font-size: 0.75rem;
  color: #64748b;
  font-family: var(--font-heading, monospace);
}

.alt-conf-value {
  font-size: 0.9375rem;
  font-weight: 700;
  flex-shrink: 0;
}

.alt-features {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 500;
}

/* ── 反馈面板 ── */
.feedback-section {
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  background: white;
}

.feedback-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  width: 100%;
  padding: var(--space-md, 16px);
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-secondary, #334155);
  transition: background 200ms ease;
}

.feedback-toggle:hover {
  background: #f8fafc;
}

.feedback-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
  flex-shrink: 0;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  margin-left: auto;
  transition: transform 200ms ease;
}

.chevron-open {
  transform: rotate(180deg);
}

.feedback-panel {
  padding: var(--space-md, 16px);
  border-top: 1px solid #f1f5f9;
}

.form-group {
  margin-bottom: var(--space-md, 16px);
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
  margin-bottom: var(--space-sm, 8px);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  font-size: 0.875rem;
  color: var(--color-text, #020617);
}

.radio-input {
  accent-color: var(--color-cta, #0369a1);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.radio-text {
  font-weight: 500;
}

.feedback-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  color: var(--color-text, #020617);
  resize: vertical;
  transition: border-color 200ms ease;
  box-sizing: border-box;
  font-family: inherit;
}

.feedback-textarea:focus {
  outline: none;
  border-color: var(--color-cta, #0369a1);
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.feedback-textarea::placeholder {
  color: #94a3b8;
}

.btn-submit {
  padding: 10px 24px;
  background: var(--color-cta, #0369a1);
  color: white;
  border-radius: var(--radius-md, 8px);
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 200ms ease;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.feedback-success {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  padding: var(--space-sm, 8px) 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #059669;
}

.success-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
