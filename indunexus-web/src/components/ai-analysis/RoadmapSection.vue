<template>
  <div class="roadmap-section">
    <h2 class="section-heading">技术拓展路线图</h2>
    <p class="section-sub">探索 AI 识别能力的未来方向，申请内测以优先体验新功能</p>

    <div class="cards-grid">
      <div
        v-for="item in roadmapItems"
        :key="item.id"
        class="roadmap-card"
      >
        <!-- 图标 -->
        <div class="card-icon-wrap">
          <component :is="item.icon" class="card-icon" />
        </div>

        <!-- 内容 -->
        <div class="card-body">
          <div class="card-header">
            <h3 class="card-title">{{ item.title }}</h3>
            <span class="status-tag" :class="`status-${item.status}`">{{ statusLabel(item.status) }}</span>
          </div>
          <p class="card-desc">{{ item.description }}</p>
        </div>

        <!-- 申请内测按钮（buyer 角色） -->
        <div v-if="isBuyer" class="card-footer">
          <button
            class="apply-btn"
            @click="openApply(item)"
          >
            申请内测
          </button>
        </div>
      </div>
    </div>

    <!-- 申请内测弹窗 -->
    <div v-if="applyTarget" class="modal-overlay" role="dialog" aria-modal="true" :aria-label="`申请 ${applyTarget.title} 内测`" @click.self="closeApply">
      <div class="modal">
        <h3 class="modal-title">申请内测 · {{ applyTarget.title }}</h3>
        <p class="modal-desc">请描述您的使用场景，帮助我们更好地了解您的需求</p>
        <textarea
          v-model="applyText"
          class="apply-textarea"
          placeholder="例如：我们需要对仓库中的零件进行批量识别，每天处理约 500 张图片..."
          rows="4"
          aria-label="使用场景描述"
        ></textarea>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeApply">取消</button>
          <button class="btn-primary" :disabled="!applyText.trim()" @click="submitApply">提交申请</button>
        </div>
      </div>
    </div>

    <!-- 提交成功提示 -->
    <div v-if="successMsg" class="success-toast" role="status">
      <svg viewBox="0 0 20 20" fill="currentColor" class="toast-icon">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      {{ successMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue';
import { useAuthStore } from '../../stores/auth';

// ─── Auth ─────────────────────────────────────────────────────────────────────

const authStore = useAuthStore();
const isBuyer = computed(() => authStore.user?.role === 'buyer');

// ─── SVG Icon components ──────────────────────────────────────────────────────

const Icon3D = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9' }),
  ]),
});

const IconMultimodal = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' }),
  ]),
});

const IconBatch = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' }),
  ]),
});

const IconAR = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z' }),
  ]),
});

// ─── Roadmap data ─────────────────────────────────────────────────────────────

type RoadmapStatus = 'online' | 'developing' | 'planned';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  icon: ReturnType<typeof defineComponent>;
}

const roadmapItems: RoadmapItem[] = [
  {
    id: '3d-model',
    title: '3D 模型识别',
    description: '基于点云数据与三维特征提取，支持对复杂曲面零件进行高精度三维识别与尺寸测量，适用于精密加工场景。',
    status: 'planned',
    icon: Icon3D,
  },
  {
    id: 'multimodal',
    title: '多模态图文联合检索',
    description: '结合图像特征与文字描述（如型号、规格文本），通过跨模态向量检索大幅提升低质量图片的识别准确率。',
    status: 'planned',
    icon: IconMultimodal,
  },
  {
    id: 'batch',
    title: '批量图片分析',
    description: '支持一次上传多张图片，系统并行处理并汇总识别报告，适合仓库盘点、来料检验等高吞吐量场景。',
    status: 'planned',
    icon: IconBatch,
  },
  {
    id: 'ar',
    title: 'AR 辅助识别',
    description: '通过移动端摄像头实时扫描零件，叠加 AR 标注层展示识别结果与供应链信息，实现现场即时决策。',
    status: 'planned',
    icon: IconAR,
  },
];

function statusLabel(s: RoadmapStatus): string {
  return { online: '已上线', developing: '开发中', planned: '规划中' }[s];
}

// ─── Apply modal ──────────────────────────────────────────────────────────────

const applyTarget = ref<RoadmapItem | null>(null);
const applyText = ref('');
const successMsg = ref('');

function openApply(item: RoadmapItem) {
  applyTarget.value = item;
  applyText.value = '';
}

function closeApply() {
  applyTarget.value = null;
}

function submitApply() {
  if (!applyText.value.trim()) return;
  closeApply();
  successMsg.value = '申请已提交，我们将在 3 个工作日内与您联系';
  setTimeout(() => { successMsg.value = ''; }, 4000);
}
</script>

<style scoped>
.roadmap-section {
  padding: var(--space-xl, 32px) 0;
}

.section-heading {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  margin: 0 0 var(--space-xs, 4px);
}

.section-sub {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0 0 var(--space-lg, 24px);
}

/* ── Cards grid ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-md, 16px);
}

.roadmap-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: var(--space-lg, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
  transition: box-shadow 200ms ease, transform 200ms ease;
}

.roadmap-card:hover {
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1));
  transform: translateY(-2px);
}

.card-icon-wrap {
  width: 44px;
  height: 44px;
  background: #eff6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-cta, #0369a1);
}

.card-icon {
  width: 24px;
  height: 24px;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm, 8px);
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  margin: 0;
}

.status-tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-online    { background: #d1fae5; color: #065f46; }
.status-developing { background: #fef3c7; color: #92400e; }
.status-planned   { background: #f1f5f9; color: #64748b; }

.card-desc {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.card-footer {
  padding-top: var(--space-sm, 8px);
  border-top: 1px solid #f1f5f9;
}

.apply-btn {
  width: 100%;
  padding: 8px 0;
  background: var(--color-cta, #0369a1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 200ms ease;
}

.apply-btn:hover {
  opacity: 0.9;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md, 16px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: var(--space-xl, 32px);
  box-shadow: var(--shadow-xl, 0 20px 25px rgba(0,0,0,0.15));
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary, #0f172a);
  margin: 0;
}

.modal-desc {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0;
}

.apply-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 200ms ease;
  box-sizing: border-box;
}

.apply-textarea:focus {
  border-color: var(--color-cta, #0369a1);
  outline: none;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.12);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm, 8px);
}

.btn-primary {
  padding: 10px 24px;
  background: var(--color-cta, #0369a1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 200ms ease;
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-secondary {
  padding: 10px 24px;
  background: transparent;
  color: var(--color-primary, #0f172a);
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 200ms ease;
}

.btn-secondary:hover { border-color: var(--color-primary, #0f172a); }

/* ── Toast ── */
.success-toast {
  position: fixed;
  bottom: var(--space-xl, 32px);
  left: 50%;
  transform: translateX(-50%);
  background: #065f46;
  color: white;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 0.9375rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  box-shadow: var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1));
  z-index: 1100;
  animation: slideUp 300ms ease;
}

.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(12px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
