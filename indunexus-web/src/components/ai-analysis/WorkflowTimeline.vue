<template>
  <div class="workflow-timeline">
    <!-- 垂直时间线 -->
    <div class="timeline">
      <div
        v-for="(node, index) in workflowNodes"
        :key="node.id"
        class="timeline-item"
      >
        <!-- 连接线（第一个节点上方不显示） -->
        <div v-if="index > 0" class="connector" :class="getConnectorClass(index)" />

        <!-- 节点行 -->
        <div class="node-row">
          <!-- 圆圈图标 -->
          <div class="node-dot" :class="getDotClass(node.status)">
            <!-- completed: 勾选图标 -->
            <svg
              v-if="node.status === 'completed'"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="dot-icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- active: 脉冲内圆 -->
            <span v-else-if="node.status === 'active'" class="dot-pulse" />
          </div>

          <!-- 节点名称 -->
          <span class="node-name" :class="getNameClass(node.status)">
            {{ node.name }}
          </span>

          <!-- 耗时（仅 completed 显示） -->
          <span v-if="node.status === 'completed' && node.durationMs !== undefined" class="node-duration">
            {{ node.durationMs }}ms
          </span>
        </div>
      </div>
    </div>

    <!-- 数据结构流转区域 -->
    <div class="data-flow">
      <div class="data-flow__header">
        <span class="data-flow__title">数据结构流转</span>
      </div>

      <!-- 节点选择 Tab -->
      <div class="data-flow__tabs" role="tablist">
        <button
          v-for="node in workflowNodes"
          :key="node.id"
          class="tab-btn cursor-pointer"
          :class="{ 'tab-btn--active': selectedNodeId === node.id }"
          role="tab"
          :aria-selected="selectedNodeId === node.id"
          @click="selectedNodeId = node.id"
        >
          {{ node.name }}
        </button>
      </div>

      <!-- JSON 代码块 -->
      <div class="data-flow__code" role="tabpanel">
        <pre class="code-block"><code>{{ selectedJson }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { WorkflowNode } from '../../types/aiAnalysis';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  workflowNodes: WorkflowNode[];
}

const props = defineProps<Props>();

// ─── Static JSON mock data per node ──────────────────────────────────────────

const NODE_JSON: Record<string, object> = {
  receive: {
    file: 'gear_photo.jpg',
    size: 2048576,
    format: 'image/jpeg',
  },
  preprocess: {
    originalSize: { w: 3024, h: 4032 },
    processedSize: { w: 1536, h: 2048 },
    brightnessScore: 72,
  },
  detect: {
    boundingBox: { x: 120, y: 80, w: 800, h: 900 },
    objectClass: 'mechanical_part',
    score: 0.94,
  },
  extract: {
    featureVector: [0.23, 0.87, 0.12, '...256维'],
    keypoints: 128,
    descriptor: 'SIFT+CNN',
  },
  match: {
    topMatch: 'GEAR-001',
    similarity: 0.92,
    candidateCount: 5,
  },
  knowledge: {
    classificationPath: ['机械零件', '传动零件', '齿轮'],
    relatedParts: 3,
    alternatives: 2,
  },
  supply_chain: {
    partId: 'GEAR-001',
    stock: 1240,
    priceRange: { min: 45, max: 88, currency: 'CNY' },
  },
  decision: {
    wearLevel: 'normal',
    recommendation: 'continue',
    supplierCount: 3,
  },
  output: {
    confidence: 0.92,
    category: '传动零件',
    sub_category: '标准直齿轮',
    processingTimeMs: 2847,
  },
};

// ─── Selected node state ──────────────────────────────────────────────────────

const selectedNodeId = ref<string>(props.workflowNodes[0]?.id ?? 'receive');

const selectedJson = computed(() => {
  const data = NODE_JSON[selectedNodeId.value] ?? {};
  return JSON.stringify(data, null, 2);
});

// ─── Style helpers ────────────────────────────────────────────────────────────

function getDotClass(status: WorkflowNode['status']): string {
  if (status === 'completed') return 'node-dot--completed';
  if (status === 'active') return 'node-dot--active';
  return 'node-dot--pending';
}

function getNameClass(status: WorkflowNode['status']): string {
  if (status === 'completed') return 'node-name--completed';
  if (status === 'active') return 'node-name--active';
  return 'node-name--pending';
}

function getConnectorClass(index: number): string {
  // Connector above node[index] is green if node[index-1] is completed
  const prev = props.workflowNodes[index - 1];
  return prev?.status === 'completed' ? 'connector--completed' : 'connector--pending';
}
</script>

<style scoped>
/* ── Layout ── */
.workflow-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl, 32px);
}

/* ── Timeline ── */
.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Connector line between nodes */
.connector {
  width: 2px;
  height: 20px;
  margin-left: 11px; /* center under 24px dot */
  border-radius: 1px;
  transition: background-color 300ms ease;
}

.connector--completed {
  background: #10b981;
}

.connector--pending {
  background: #cbd5e1;
}

/* Node row */
.node-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
}

/* Dot */
.node-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 300ms ease, border-color 300ms ease;
}

.node-dot--pending {
  background: #f1f5f9;
  border: 2px solid #cbd5e1;
}

.node-dot--active {
  background: #eff6ff;
  border: 2px solid #3b82f6;
  position: relative;
}

.node-dot--completed {
  background: #10b981;
  border: 2px solid #10b981;
  color: white;
}

/* Pulse animation for active node */
.dot-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}

@media (prefers-reduced-motion: reduce) {
  .dot-pulse {
    animation: none;
  }
}

.dot-icon {
  width: 14px;
  height: 14px;
}

/* Node name */
.node-name {
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 300ms ease;
}

.node-name--pending {
  color: #94a3b8;
}

.node-name--active {
  color: #3b82f6;
  font-weight: 600;
}

.node-name--completed {
  color: #10b981;
  font-weight: 600;
}

/* Duration badge */
.node-duration {
  margin-left: auto;
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

/* ── Data Flow Section ── */
.data-flow {
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
}

.data-flow__header {
  padding: var(--space-sm, 8px) var(--space-md, 16px);
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.data-flow__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-secondary, #334155);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tabs */
.data-flow__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: var(--space-sm, 8px) var(--space-md, 16px);
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tab-btn {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: 1px solid transparent;
  transition: all 200ms ease;
}

.tab-btn:hover {
  background: #e2e8f0;
  color: var(--color-primary, #0f172a);
}

.tab-btn--active {
  background: var(--color-cta, #0369a1);
  color: white;
  border-color: var(--color-cta, #0369a1);
}

.tab-btn--active:hover {
  background: var(--color-cta, #0369a1);
  opacity: 0.9;
  color: white;
}

/* Code block */
.data-flow__code {
  padding: var(--space-md, 16px);
  background: #0f172a;
}

.code-block {
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #e2e8f0;
  white-space: pre;
  overflow-x: auto;
}
</style>
