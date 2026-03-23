<template>
  <div class="recognition-result">
    <!-- 低置信度降级横幅 -->
    <div v-if="result.confidence < 0.60" class="degraded-banner" role="alert">
      <svg viewBox="0 0 20 20" fill="currentColor" class="banner-icon">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <div class="banner-content">
        <span class="banner-text">识别置信度较低，建议人工复核</span>
        <button v-if="!reviewTicket" class="btn-review cursor-pointer" @click="applyManualReview">申请人工审核</button>
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
      <!-- 卡片头部：零件名 + 置信度 -->
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
            <div class="confidence-bar-fill" :style="{ width: (result.confidence * 100) + '%', background: confidenceDisplay.hex }"></div>
          </div>
        </div>
      </div>

      <!-- 用途说明 -->
      <div v-if="result.usage_description" class="usage-section">
        <p class="usage-text">{{ result.usage_description }}</p>
      </div>

      <!-- 两列布局：规格参数 + 选型建议 -->
      <div class="two-col">
        <!-- 规格参数表（含参数说明） -->
        <div class="specs-section">
          <h3 class="section-label">规格参数</h3>
          <table class="specs-table">
            <thead>
              <tr>
                <th class="th-key">参数</th>
                <th class="th-val">数值</th>
                <th v-if="hasParamNotes" class="th-note">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(value, key) in filteredSpecs" :key="key" class="specs-row">
                <td class="specs-key">{{ formatSpecKey(key) }}</td>
                <td class="specs-val">{{ value }}</td>
                <td v-if="hasParamNotes" class="specs-note">{{ result.param_notes?.[key] ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 选型建议 -->
        <div v-if="result.selection_tips?.length" class="tips-section">
          <h3 class="section-label">选型建议</h3>
          <ul class="tips-list">
            <li v-for="(tip, i) in result.selection_tips" :key="i" class="tip-item">
              <span class="tip-index">{{ i + 1 }}</span>
              <span class="tip-text">{{ tip }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 标准对照表（可折叠） -->
      <div v-if="result.standards?.length" class="standards-section">
        <button class="standards-toggle cursor-pointer" :aria-expanded="standardsOpen" @click="standardsOpen = !standardsOpen">
          <svg viewBox="0 0 20 20" fill="currentColor" class="toggle-icon">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          <span>国内外标准对照</span>
          <span v-if="result.confidence < 0.85" class="standards-hint">仅供参考</span>
          <svg viewBox="0 0 20 20" fill="currentColor" class="chevron-icon" :class="{ 'chevron-open': standardsOpen }">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <div v-if="standardsOpen" class="standards-table-wrap">
          <table class="standards-table">
            <thead>
              <tr>
                <th>标准类型</th>
                <th>标准编号</th>
                <th>标准名称</th>
                <th>适用地区</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="std in result.standards" :key="std.code">
                <td>{{ std.type }}</td>
                <td class="std-code">{{ std.code }}</td>
                <td>{{ std.name }}</td>
                <td>{{ std.region }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 候选结果列表（两列） -->
    <div v-if="result.alternatives.length > 0" class="alternatives-section">
      <h3 class="section-title">候选结果</h3>
      <ul class="alternatives-grid">
        <li v-for="alt in result.alternatives.slice(0, 6)" :key="alt.part_id" class="alt-item">
          <div class="alt-main">
            <div class="alt-info">
              <span class="alt-name">{{ alt.part_name }}</span>
              <span class="alt-number">{{ alt.part_number }}</span>
            </div>
            <span class="alt-conf-value" :style="{ color: getConfidenceDisplay(alt.confidence).hex }">
              {{ (alt.confidence * 100).toFixed(1) }}%
            </span>
          </div>
          <div class="alt-features">
            <span v-for="feature in alt.matched_features" :key="feature" class="feature-tag">{{ feature }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- 反馈入口（折叠面板） -->
    <div class="feedback-section">
      <button class="feedback-toggle cursor-pointer" :aria-expanded="feedbackOpen" @click="feedbackOpen = !feedbackOpen">
        <svg viewBox="0 0 20 20" fill="currentColor" class="feedback-icon">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span>结果有误？提交反馈</span>
        <svg viewBox="0 0 20 20" fill="currentColor" class="chevron-icon" :class="{ 'chevron-open': feedbackOpen }">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      <div v-if="feedbackOpen" class="feedback-panel">
        <div v-if="!feedbackSubmitted">
          <div class="form-group">
            <label class="form-label">错误类型</label>
            <div class="radio-group">
              <label v-for="opt in errorTypeOptions" :key="opt.value" class="radio-label cursor-pointer">
                <input v-model="feedbackType" type="radio" :value="opt.value" class="radio-input" />
                <span class="radio-text">{{ opt.label }}</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="feedback-desc">说明（可选）</label>
            <textarea id="feedback-desc" v-model="feedbackDesc" class="feedback-textarea" rows="2" placeholder="请描述具体问题..."></textarea>
          </div>
          <button class="btn-submit cursor-pointer" :disabled="!feedbackType" @click="submitFeedback">提交反馈</button>
        </div>
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

function getConfidenceDisplay(confidence: number): { color: string; label: string; hex: string } {
  if (confidence >= 0.85) return { color: 'green', label: '高置信度', hex: '#10b981' };
  if (confidence >= 0.70) return { color: 'orange', label: '中等置信度', hex: '#f59e0b' };
  return { color: 'red', label: '低置信度', hex: '#ef4444' };
}

interface Props { result: FullRecognitionResult }
const props = defineProps<Props>();

const confidenceDisplay = computed(() => getConfidenceDisplay(props.result.confidence));

const filteredSpecs = computed(() => {
  const entries = Object.entries(props.result.specs).filter(([, v]) => v !== undefined && v !== '');
  return Object.fromEntries(entries) as Record<string, string>;
});

const hasParamNotes = computed(() =>
  props.result.param_notes && Object.keys(props.result.param_notes).length > 0
);

// 高置信度时默认展开标准对照表
const standardsOpen = ref(props.result.confidence >= 0.85);

const SPEC_KEY_MAP: Record<string, string> = {
  modulus: '模数', material: '材质', dimensions: '尺寸', teeth: '齿数',
  hardness: '硬度', helix_angle: '螺旋角', inner_diameter: '内径',
  outer_diameter: '外径', width: '宽度', load_rating: '额定载荷',
  contact_angle: '接触角', pitch: '节距', roller_diameter: '滚子直径',
  tensile_strength: '抗拉强度', standard: '标准', length: '长度',
  thread: '螺纹规格', surface: '表面处理', lip_type: '唇口类型',
};

function formatSpecKey(key: string): string {
  return SPEC_KEY_MAP[key] ?? key;
}

const reviewTicket = ref('');
function applyManualReview() {
  reviewTicket.value = `WO-${Date.now().toString(36).toUpperCase()}`;
}

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
  gap: 12px;
}

/* ── 降级横幅 ── */
.degraded-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
}
.banner-icon { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; color: #d97706; }
.banner-content { flex: 1; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.banner-text { font-size: 0.8125rem; font-weight: 500; flex: 1; min-width: 140px; }
.btn-review { padding: 4px 12px; background: #d97706; color: white; border-radius: 6px; font-size: 0.75rem; font-weight: 600; transition: opacity 200ms; flex-shrink: 0; }
.btn-review:hover { opacity: 0.88; }
.ticket-success { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 600; color: #059669; }
.ticket-icon { width: 14px; height: 14px; flex-shrink: 0; }

/* ── 主结果卡片 ── */
.result-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.part-name-group { flex: 1; min-width: 0; }
.part-name { font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3; }
.category-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.6875rem; font-weight: 600; }
.tag-category { background: #eff6ff; color: #1d4ed8; }
.tag-sub { background: #f0fdf4; color: #15803d; }

.confidence-group { flex-shrink: 0; min-width: 150px; text-align: right; }
.confidence-label-row { display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-bottom: 4px; }
.confidence-value { font-size: 1.375rem; font-weight: 700; color: #0f172a; line-height: 1; }
.confidence-badge { padding: 2px 8px; border-radius: 999px; font-size: 0.6875rem; font-weight: 600; }
.confidence-bar-track { height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.confidence-bar-fill { height: 100%; border-radius: 999px; transition: width 600ms ease; }

/* ── 用途说明 ── */
.usage-section {
  padding: 8px 12px;
  background: #f8fafc;
  border-left: 3px solid #3b82f6;
  border-radius: 0 6px 6px 0;
}
.usage-text { font-size: 0.8125rem; color: #334155; line-height: 1.6; margin: 0; }

/* ── 两列布局 ── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 640px) {
  .two-col { grid-template-columns: 1fr; }
}

/* ── 规格参数 ── */
.section-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px 0;
}
.specs-table { width: 100%; border-collapse: collapse; }
.specs-table th {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #94a3b8;
  text-align: left;
  padding: 0 0 4px 0;
  border-bottom: 1px solid #f1f5f9;
}
.th-key { width: 22%; }
.th-val { width: 20%; }
.th-note { width: 58%; }
.specs-row:not(:last-child) td { border-bottom: 1px solid #f8fafc; }
.specs-key, .specs-val, .specs-note { padding: 5px 0; font-size: 0.8125rem; vertical-align: top; }
.specs-key { color: #64748b; font-weight: 500; padding-right: 8px; }
.specs-val { color: #0f172a; font-weight: 600; font-family: monospace; padding-right: 8px; white-space: nowrap; }
.specs-note { color: #475569; font-size: 0.75rem; line-height: 1.5; }

/* ── 选型建议 ── */
.tips-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.tip-item { display: flex; gap: 8px; align-items: flex-start; }
.tip-index {
  flex-shrink: 0;
  width: 18px; height: 18px;
  background: #0369a1;
  color: white;
  border-radius: 50%;
  font-size: 0.6875rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-top: 1px;
}
.tip-text { font-size: 0.8125rem; color: #334155; line-height: 1.55; }

/* ── 标准对照表 ── */
.standards-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
}
.standards-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
  padding: 4px 0;
  transition: color 200ms;
}
.standards-toggle:hover { color: #0f172a; }
.toggle-icon { width: 16px; height: 16px; color: #64748b; flex-shrink: 0; }
.standards-hint {
  margin-left: 4px;
  padding: 1px 7px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
}
.chevron-icon { width: 14px; height: 14px; color: #94a3b8; margin-left: auto; transition: transform 200ms ease; }
.chevron-open { transform: rotate(180deg); }

.standards-table-wrap { margin-top: 8px; overflow-x: auto; }
.standards-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.standards-table th {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #94a3b8;
  text-align: left;
  padding: 4px 10px 4px 0;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.standards-table td {
  padding: 5px 10px 5px 0;
  color: #334155;
  border-bottom: 1px solid #f8fafc;
  vertical-align: top;
}
.standards-table tr:last-child td { border-bottom: none; }
.std-code { font-family: monospace; font-weight: 600; color: #0f172a; white-space: nowrap; }

/* ── 候选结果 ── */
.alternatives-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.section-title { font-size: 0.6875rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px 0; }
.alternatives-grid {
  list-style: none; margin: 0; padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
@media (max-width: 480px) {
  .alternatives-grid { grid-template-columns: 1fr; }
}
.alt-item { padding: 7px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; transition: border-color 200ms; }
.alt-item:hover { border-color: #94a3b8; }
.alt-main { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.alt-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.alt-name { font-size: 0.8125rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alt-number { font-size: 0.6875rem; color: #64748b; font-family: monospace; }
.alt-conf-value { font-size: 0.8125rem; font-weight: 700; flex-shrink: 0; }
.alt-features { display: flex; flex-wrap: wrap; gap: 3px; }
.feature-tag { display: inline-block; padding: 1px 7px; background: #eff6ff; color: #1d4ed8; border-radius: 999px; font-size: 0.6875rem; font-weight: 500; }

/* ── 反馈面板 ── */
.feedback-section { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white; }
.feedback-toggle { display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; background: transparent; border: none; text-align: left; font-size: 0.8125rem; font-weight: 600; color: #334155; transition: background 200ms; }
.feedback-toggle:hover { background: #f8fafc; }
.feedback-icon { width: 16px; height: 16px; color: #64748b; flex-shrink: 0; }
.feedback-panel { padding: 12px 16px; border-top: 1px solid #f1f5f9; }
.form-group { margin-bottom: 12px; }
.form-label { display: block; font-size: 0.8125rem; font-weight: 600; color: #0f172a; margin-bottom: 6px; }
.radio-group { display: flex; flex-direction: column; gap: 6px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: #020617; }
.radio-input { accent-color: #0369a1; width: 14px; height: 14px; flex-shrink: 0; }
.radio-text { font-weight: 500; }
.feedback-textarea { width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.8125rem; color: #020617; resize: vertical; transition: border-color 200ms; box-sizing: border-box; font-family: inherit; }
.feedback-textarea:focus { outline: none; border-color: #0369a1; box-shadow: 0 0 0 3px rgba(3,105,161,0.1); }
.feedback-textarea::placeholder { color: #94a3b8; }
.btn-submit { padding: 8px 20px; background: #0369a1; color: white; border-radius: 8px; font-size: 0.875rem; font-weight: 600; transition: all 200ms; }
.btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }
.feedback-success { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 0.875rem; font-weight: 600; color: #059669; }
.success-icon { width: 18px; height: 18px; flex-shrink: 0; }
</style>
