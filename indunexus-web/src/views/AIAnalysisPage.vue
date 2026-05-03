<template>
  <div class="ai-analysis-page">
    <Navbar @open-a-i-modal="showAIModal = true" />
    <AIRecognitionModal
      :is-open="showAIModal"
      @close="showAIModal = false"
    />
    <!-- 顶部标签页 -->
    <div class="page-header">
      <div class="page-title-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="page-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        <h1 class="page-title">AI 智能分析</h1>
      </div>
      <div class="tab-bar" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          role="tab"
          :aria-selected="activeTab === tab.id"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 分析视图 -->
    <div v-show="activeTab === 'analysis'" class="analysis-view">
      <!-- 超时提示 -->
      <div v-if="store.isTimedOut" class="alert alert-warning" role="alert">
        <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>识别超时（超过 30 秒），请检查网络后重试</span>
        <button class="alert-action" @click="retryAnalysis">重新识别</button>
      </div>

      <!-- 离线模式提示 -->
      <div v-if="store.isOfflineMode" class="alert alert-offline" role="alert">
        <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>服务暂时不可用，当前展示离线模式结果</span>
        <span class="offline-badge">离线模式</span>
      </div>

      <!-- 主内容区 -->
      <div class="main-grid">
        <!-- 左侧：上传 + 工作流 -->
        <div class="left-col">
          <ImageUploader
            :is-analyzing="store.isAnalyzing"
            :external-preview="currentImageUrl"
            @preprocessed="onPreprocessed"
          />

          <!-- 进度指示器（分析中） -->
          <div v-if="store.isAnalyzing" class="progress-card">
            <div class="progress-header">
              <span class="progress-label">{{ currentStageName }}</span>
              <span class="progress-pct">{{ progressPct }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
            </div>
            <div class="stage-list">
              <div
                v-for="stage in stages"
                :key="stage.name"
                class="stage-item"
                :class="{
                  'stage-done': progressPct >= stage.end,
                  'stage-active': progressPct >= stage.start && progressPct < stage.end,
                }"
              >
                <span class="stage-dot"></span>
                <span class="stage-name">{{ stage.name }}</span>
                <span class="stage-range">{{ stage.start }}–{{ stage.end }}%</span>
              </div>
            </div>
          </div>

          <WorkflowTimeline
            v-if="store.workflowNodes.some(n => n.status !== 'pending')"
            :workflow-nodes="store.workflowNodes"
          />
        </div>

        <!-- 右侧：结果面板（两列网格） -->
        <div class="right-col">
          <template v-if="store.analysisResult">
            <div class="results-grid">
              <!-- 结果左列：识别结果 -->
              <div class="results-left">
                <RecognitionResult
                  :result="store.analysisResult.recognitionResult"
                />
              </div>
              <!-- 结果右列：供应链 + 知识图谱 + 决策报告 -->
              <div class="results-right">
                <SupplyChainPanel :data="store.analysisResult.supplyChainData" />
                <KnowledgeGraphPanel :data="store.analysisResult.knowledgeGraphData" />
                <DecisionReport
                  :report="store.analysisResult.decisionReport"
                  @supplier-click="onSupplierClick"
                />
              </div>
            </div>
          </template>

          <!-- 空状态占位 -->
          <div v-else-if="!store.isAnalyzing" class="results-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="placeholder-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <p class="placeholder-text">上传零件图片，开始 AI 智能分析</p>
          </div>

          <!-- 分析中骨架屏 -->
          <div v-else class="skeleton-stack">
            <div class="skeleton-card" v-for="i in 4" :key="i"></div>
          </div>
        </div>
      </div>

      <!-- 底部路线图 -->
      <RoadmapSection />
    </div>

    <!-- 历史记录视图 -->
    <div v-show="activeTab === 'history'" class="history-view">
      <HistoryPanel @reanalyze="onReanalyze" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAiAnalysisStore } from '../stores/aiAnalysis';
import Navbar from '../components/Navbar.vue';
import AIRecognitionModal from '../components/AIRecognitionModal.vue';
import ImageUploader from '../components/ai-analysis/ImageUploader.vue';
import WorkflowTimeline from '../components/ai-analysis/WorkflowTimeline.vue';
import RecognitionResult from '../components/ai-analysis/RecognitionResult.vue';
import SupplyChainPanel from '../components/ai-analysis/SupplyChainPanel.vue';
import KnowledgeGraphPanel from '../components/ai-analysis/KnowledgeGraphPanel.vue';
import DecisionReport from '../components/ai-analysis/DecisionReport.vue';
import HistoryPanel from '../components/ai-analysis/HistoryPanel.vue';
import RoadmapSection from '../components/ai-analysis/RoadmapSection.vue';
import type { PreprocessResult } from '../composables/useImagePreprocessor';
import type { AnalysisRecord } from '../types/aiAnalysis';

const store = useAiAnalysisStore();
const router = useRouter();
const showAIModal = ref(false);
const currentImageUrl = ref('');

// 消费从 modal 传来的待分析图片
onMounted(() => {
  if (store.pendingAnalysis) {
    const { imageDataUrl, fileName, preprocessInfo } = store.pendingAnalysis;
    currentImageUrl.value = imageDataUrl;
    store.pendingAnalysis = null;
    store.startAnalysis(imageDataUrl, fileName, preprocessInfo);
  }
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const tabs = [
  { id: 'analysis', label: '分析视图' },
  { id: 'history',  label: '历史记录' },
] as const;

type TabId = typeof tabs[number]['id'];
const activeTab = ref<TabId>('analysis');

// ─── Progress stages ──────────────────────────────────────────────────────────

const stages = [
  { name: '图像预处理', start: 0,  end: 20  },
  { name: '目标检测',   start: 20, end: 50  },
  { name: '特征提取',   start: 50, end: 75  },
  { name: '向量匹配',   start: 75, end: 90  },
  { name: '结果生成',   start: 90, end: 100 },
];

// Map workflow node index → progress percentage
const NODE_PROGRESS: Record<number, number> = {
  0: 5,   // receive
  1: 18,  // preprocess
  2: 35,  // detect
  3: 55,  // extract
  4: 80,  // match
  5: 85,  // knowledge
  6: 90,  // supply_chain
  7: 95,  // decision
  8: 100, // output
};

const progressPct = computed(() => {
  if (!store.isAnalyzing) return store.analysisResult ? 100 : 0;
  return NODE_PROGRESS[store.currentNodeIndex] ?? 0;
});

const currentStageName = computed(() => {
  const pct = progressPct.value;
  return stages.find((s) => pct >= s.start && pct < s.end)?.name ?? '结果生成';
});

// ─── Handlers ─────────────────────────────────────────────────────────────────

function onPreprocessed(result: PreprocessResult) {
  const preprocessInfo: AnalysisRecord['preprocessInfo'] = {
    originalSize: result.originalSize,
    processedSize: result.processedSize,
    brightnessScore: result.brightnessScore,
    fileSize: result.fileSize,
  };
  store.startAnalysis(result.processedDataUrl, result.fileName, preprocessInfo);
}

function retryAnalysis() {
  store.resetAnalysis();
}

function onSupplierClick(name: string) {
  router.push({ path: '/marketplace', query: { supplier: name } });
}

function onReanalyze(record: AnalysisRecord) {
  activeTab.value = 'analysis';
  store.startAnalysis(record.imageDataUrl, record.imageName, record.preprocessInfo);
}
</script>

<style scoped>
.ai-analysis-page {
  width: 100%;
  margin: 0 auto;
  padding: var(--space-lg, 24px) var(--space-xl, 32px);
  padding-top: calc(var(--header-height, 64px) + var(--space-lg, 24px));
  min-height: 100vh;
  background: var(--color-background, #f8fafc);
  font-family: 'Plus Jakarta Sans', sans-serif;
  box-sizing: border-box;
}

/* ── Page header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md, 16px);
  margin-bottom: var(--space-xl, 32px);
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
}

.page-icon {
  width: 28px;
  height: 28px;
  color: var(--color-cta, #0369a1);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  margin: 0;
}

/* ── Tabs ── */
.tab-bar {
  display: flex;
  gap: 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 4px;
}

.tab-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 7px;
  background: transparent;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 200ms ease;
}

.tab-btn:hover {
  color: var(--color-primary, #0f172a);
}

.tab-btn.active {
  background: var(--color-cta, #0369a1);
  color: white;
  font-weight: 600;
}

/* ── Alerts ── */
.alert {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  padding: 12px var(--space-md, 16px);
  border-radius: 10px;
  margin-bottom: var(--space-md, 16px);
  font-size: 0.9375rem;
}

.alert-warning {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
}

.alert-offline {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.alert-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.alert span { flex: 1; }

.alert-action {
  padding: 6px 16px;
  background: #92400e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 200ms ease;
  flex-shrink: 0;
}

.alert-action:hover { opacity: 0.85; }

.offline-badge {
  padding: 2px 10px;
  background: #991b1b;
  color: white;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── Main grid ── */
.main-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: var(--space-lg, 24px);
  align-items: start;
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Left col ── */
.left-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  position: sticky;
  top: calc(var(--header-height, 64px) + 24px);
}

/* ── Progress card ── */
.progress-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: var(--space-lg, 24px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm, 8px);
}

.progress-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
}

.progress-pct {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-cta, #0369a1);
}

.progress-track {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: var(--space-md, 16px);
}

.progress-fill {
  height: 100%;
  background: var(--color-cta, #0369a1);
  border-radius: 999px;
  transition: width 400ms ease;
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stage-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  font-size: 0.8125rem;
  color: #94a3b8;
}

.stage-item.stage-done { color: #10b981; }
.stage-item.stage-active { color: var(--color-cta, #0369a1); font-weight: 600; }

.stage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.stage-name { flex: 1; }

.stage-range {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* ── Right col ── */
.right-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  min-width: 0;
}

/* ── Results two-column grid ── */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md, 16px);
  align-items: start;
}

.results-left,
.results-right {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  min-width: 0;
}

@media (max-width: 1280px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Placeholder ── */
.results-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md, 16px);
  padding: var(--space-3xl, 64px) var(--space-xl, 32px);
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  color: #94a3b8;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  opacity: 0.4;
}

.placeholder-text {
  font-size: 1rem;
  margin: 0;
}

/* ── Skeleton ── */
.skeleton-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

.skeleton-card {
  height: 120px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

.skeleton-card:nth-child(2) { height: 80px; }
.skeleton-card:nth-child(3) { height: 100px; }
.skeleton-card:nth-child(4) { height: 160px; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── History view ── */
.history-view {
  min-height: 400px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .ai-analysis-page {
    padding: var(--space-md, 16px);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
