<template>
  <div
    ref="shellRef"
    class="kg-shell"
    :class="{
      'is-fullscreen': isFullscreen,
      'kg-dual-right': rightDrawerOpen && propsDrawerOpen,
      'kg-triple-right': leftDrawerOpen && rightDrawerOpen && propsDrawerOpen,
      'kg-nav-detail-dual': leftDrawerOpen && rightDrawerOpen && !propsDrawerOpen,
      'kg-nav-props-dual': leftDrawerOpen && propsDrawerOpen && !rightDrawerOpen,
    }"
  >
    <!-- 主体：工业结构图谱（全宽占用剩余空间） -->
    <div class="kg-main">
      <!-- 浮在画布之上，格式与侧栏 panel-title（圆点 + 文案）一致 -->
      <div class="kg-heading" role="heading" aria-level="2">
        <span class="kg-heading-dot" aria-hidden="true"></span>
        <span class="kg-heading-text">零件·供应商 知识图谱</span>
      </div>
      <nav class="kg-actions" aria-label="图谱操作">
        <button
          type="button"
          class="kg-action-btn kg-action-btn--fs"
          :aria-pressed="isFullscreen"
          :title="isFullscreen ? '退出全屏 (Esc)' : '全屏查看'"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '还原' : '全屏' }}
        </button>
        <button
          ref="btnNavRef"
          type="button"
          class="kg-action-btn"
          :class="{ 'is-active': leftDrawerOpen }"
          :aria-pressed="leftDrawerOpen"
          :aria-expanded="leftDrawerOpen"
          aria-controls="kg-drawer-nav"
          title="结构导航"
          @click="toggleNavDrawer"
        >
          导航
        </button>
        <button
          ref="btnDetailRef"
          type="button"
          class="kg-action-btn"
          :class="{ 'is-active': rightDrawerOpen }"
          :aria-pressed="rightDrawerOpen"
          :aria-expanded="rightDrawerOpen"
          aria-controls="kg-drawer-detail"
          title="节点详情"
          @click="toggleDetailDrawer"
        >
          详情
        </button>
        <button
          type="button"
          class="kg-action-btn kg-action-btn--risk"
          :class="{ 'is-on': riskMode }"
          :aria-pressed="riskMode"
          title="风险模式"
          @click="toggleRiskMode"
        >
          风险
        </button>
        <button
          ref="btnPropsRef"
          type="button"
          class="kg-action-btn"
          :class="{ 'is-active': propsDrawerOpen }"
          :aria-pressed="propsDrawerOpen"
          :aria-expanded="propsDrawerOpen"
          aria-controls="kg-drawer-props"
          title="图谱属性"
          @click="togglePropsDrawer"
        >
          属性
        </button>
      </nav>
      <div v-if="layoutPending" class="kg-loading">力导向初始化…</div>
      <div ref="containerRef" class="kg-container" />
      <div
        v-if="hoverTip"
        class="kg-tooltip"
        :style="{ left: hoverTip.x + 'px', top: hoverTip.y + 'px' }"
      >
        <div class="kg-tooltip-title">{{ hoverTip.label }}</div>
        <div class="kg-tooltip-row"><span>类型</span><span>{{ hoverTip.entityLabel }}</span></div>
        <template v-if="hoverTip.entityType === 'Part'">
          <div class="kg-tooltip-row"><span>状态</span><span>{{ statusLabel(hoverTip.status) }}</span></div>
          <div v-if="hoverTip.features.length" class="kg-tooltip-features">
            <span class="kg-feat-label">特征</span>
            <span>{{ hoverTip.features.slice(0, 4).join(' · ') }}</span>
          </div>
        </template>
        <template v-else-if="hoverTip.entityType === 'Supplier'">
          <div v-if="hoverTip.tier != null" class="kg-tooltip-row"><span>Tier</span><span>{{ hoverTip.tier }}</span></div>
        </template>
        <template v-else-if="hoverTip.entityType === 'InspectionLot'">
          <div v-if="hoverTip.lotNo" class="kg-tooltip-row"><span>批次</span><span>{{ hoverTip.lotNo }}</span></div>
          <div v-if="hoverTip.lineCode" class="kg-tooltip-row"><span>产线</span><span>{{ hoverTip.lineCode }}</span></div>
          <div v-if="hoverTip.qcStatus" class="kg-tooltip-row"><span>质检</span><span>{{ hoverTip.qcStatus }}</span></div>
        </template>
        <template v-else-if="hoverTip.entityType === 'VisualCluster'">
          <div v-if="hoverTip.clusterCode" class="kg-tooltip-row"><span>簇编码</span><span>{{ hoverTip.clusterCode }}</span></div>
          <div v-if="hoverTip.embeddingFamily" class="kg-tooltip-features">
            <span class="kg-feat-label">嵌入</span>
            <span>{{ hoverTip.embeddingFamily }}</span>
          </div>
        </template>
      </div>

    <!-- 右侧拉：结构导航（与详情、属性同一侧栏样式，展开沿停在按钮列左侧） -->
    <aside
      id="kg-drawer-nav"
      ref="navDrawerRef"
      class="kg-drawer kg-drawer--right kg-drawer--nav"
      :class="{ 'is-open': leftDrawerOpen }"
      :aria-hidden="!leftDrawerOpen"
      :style="{ transformOrigin: navTransformOrigin }"
    >
      <div class="kg-drawer-head">
        <div>
          <span class="kg-drawer-title">结构导航</span>
        </div>
        <button
          type="button"
          class="kg-drawer-close"
          title="收起"
          aria-label="收起结构导航"
          @click="closeNavDrawer"
        >
          ›
        </button>
      </div>
      <ElTree
        ref="treeRef"
        class="kg-el-tree"
        :data="treeData"
        node-key="id"
        default-expand-all
        highlight-current
        :current-node-key="treeHighlightKey ?? undefined"
        :props="{ label: 'label', children: 'children' }"
        @node-click="onTreeNodeClick"
      />
    </aside>

    <!-- 右侧拉：节点详情（Pinia） -->
    <aside
      id="kg-drawer-detail"
      ref="detailDrawerRef"
      class="kg-drawer kg-drawer--right kg-drawer--detail"
      :class="{ 'is-open': rightDrawerOpen }"
      :aria-hidden="!rightDrawerOpen"
      :style="{ transformOrigin: detailTransformOrigin }"
    >
      <div class="kg-drawer-head">
        <div>
          <span class="kg-drawer-title">节点详情</span>
        </div>
        <button
          type="button"
          class="kg-drawer-close"
          title="收起"
          aria-label="收起节点详情"
          @click="closeDetailDrawer"
        >
          ›
        </button>
      </div>
      <div class="kg-drawer-body">
        <div v-if="!detailPayload" class="kg-detail-empty">点击图谱或左侧导航选中节点；零件展示特征与缩略图，其余类型展示追溯字段。</div>
        <template v-else-if="detailPayload.entityType === 'Part'">
          <div class="kg-detail-card">
            <div class="kg-detail-badge" :class="'st-' + detailPayload.status">{{ statusLabel(detailPayload.status) }}</div>
            <div class="kg-detail-name">{{ detailPayload.label }}</div>
            <div class="kg-detail-id">ID {{ detailPayload.id }}</div>
            <div v-if="detailPayload.imgUrl" class="kg-detail-thumb-wrap">
              <img :src="detailPayload.imgUrl" alt="" class="kg-detail-thumb" />
            </div>
            <div class="kg-detail-section">零件特征</div>
            <ul class="kg-detail-features">
              <li v-for="(f, i) in detailPayload.features" :key="i">{{ f }}</li>
            </ul>
            <p v-if="!detailPayload.features?.length" class="kg-detail-muted">暂无结构化特征</p>
          </div>
        </template>
        <template v-else-if="detailPayload.entityType === 'Supplier'">
          <div class="kg-detail-card">
            <div class="kg-detail-name">{{ detailPayload.label }}</div>
            <div class="kg-detail-id">供应商 · {{ detailPayload.id }}</div>
            <ul class="kg-detail-features kg-detail-meta">
              <li v-if="detailPayload.tier != null">Tier {{ detailPayload.tier }}</li>
              <li v-if="detailPayload.region">地区 {{ detailPayload.region }}</li>
              <li v-if="detailPayload.supplierCode">编码 {{ detailPayload.supplierCode }}</li>
            </ul>
            <p class="kg-detail-muted">供应关系边携带供货层级（tier），用于跨级穿透。</p>
          </div>
        </template>
        <template v-else-if="detailPayload.entityType === 'InspectionLot'">
          <div class="kg-detail-card">
            <div class="kg-detail-name">{{ detailPayload.label }}</div>
            <div class="kg-detail-id">质检批次 · {{ detailPayload.id }}</div>
            <ul class="kg-detail-features kg-detail-meta">
              <li>批次号 {{ detailPayload.lotNo }}</li>
              <li>产线 {{ detailPayload.lineCode }}</li>
              <li>下线 {{ detailPayload.producedAt }}</li>
              <li>班次 {{ detailPayload.shift }}</li>
              <li>状态 {{ detailPayload.qcStatus }}</li>
              <li v-if="detailPayload.defectHint">缺陷线索 {{ detailPayload.defectHint }}</li>
            </ul>
          </div>
        </template>
        <template v-else-if="detailPayload.entityType === 'VisualCluster'">
          <div class="kg-detail-card">
            <div class="kg-detail-name">{{ detailPayload.label }}</div>
            <div class="kg-detail-id">视觉异常簇 · {{ detailPayload.id }}</div>
            <ul class="kg-detail-features kg-detail-meta">
              <li>簇编码 {{ detailPayload.clusterCode }}</li>
              <li>嵌入族 {{ detailPayload.embeddingFamily }}</li>
              <li>相似度阈值 {{ detailPayload.similarityThreshold }}</li>
              <li>训练日期 {{ detailPayload.trainedAt }}</li>
            </ul>
            <p class="kg-detail-muted">与质检批次经 MATCHES（向量相似）对齐后可向上穿透供应商。</p>
          </div>
        </template>
      </div>
    </aside>

    <!-- 右侧拉：图谱属性（与详情同级，可整体收起 / 仅收起内容条） -->
    <aside
      id="kg-drawer-props"
      ref="propsDrawerRef"
      class="kg-drawer kg-drawer--right kg-drawer--props"
      :class="{
        'is-open': propsDrawerOpen,
        'kg-props-full': propsDrawerOpen && !rightDrawerOpen && !leftDrawerOpen,
      }"
      aria-label="图谱属性"
      :aria-hidden="!propsDrawerOpen"
      :style="{ transformOrigin: propsTransformOrigin }"
      @pointerdown.stop
    >
      <div class="kg-drawer-head">
        <div>
          <span class="kg-drawer-title">图谱属性</span>
        </div>
        <div class="kg-props-head-actions">
          <button
            type="button"
            class="kg-drawer-close"
            title="收起侧栏"
            aria-label="收起图谱属性"
            @click="closePropsDrawer"
          >
            ›
          </button>
        </div>
      </div>
      <div class="kg-drawer-body kg-props-body" @pointerdown.stop>
        <div class="kg-console-section">
          <label class="kg-console-row">
            <span class="kg-console-label">文本透明度</span>
            <span class="kg-console-val">{{ graphTuning.labelOpacity.toFixed(2) }}</span>
            <input v-model.number="graphTuning.labelOpacity" type="range" min="0" max="1" step="0.05" />
          </label>
          <label class="kg-console-row">
            <span class="kg-console-label">节点大小</span>
            <span class="kg-console-val">{{ graphTuning.nodeSizeScale.toFixed(2) }}</span>
            <input v-model.number="graphTuning.nodeSizeScale" type="range" min="0.55" max="2" step="0.05" />
          </label>
          <label class="kg-console-row">
            <span class="kg-console-label">连线粗细</span>
            <span class="kg-console-val">{{ graphTuning.linkWidthScale.toFixed(2) }}</span>
            <input v-model.number="graphTuning.linkWidthScale" type="range" min="0.5" max="3" step="0.05" />
          </label>
        </div>
        <button type="button" class="kg-console-play" @click="playGraphLayoutAnimation">播放动画</button>
        <div class="kg-console-force-block">
          <div class="kg-console-section">
            <label class="kg-console-row">
              <span class="kg-console-label">图谱向心力</span>
              <span class="kg-console-val">{{ graphTuning.centerStrength.toFixed(2) }}</span>
              <input v-model.number="graphTuning.centerStrength" type="range" min="0" max="1" step="0.02" />
            </label>
            <label class="kg-console-row">
              <span class="kg-console-label">节点排斥力</span>
              <span class="kg-console-val">{{ graphTuning.repulsionScale.toFixed(2) }}</span>
              <input v-model.number="graphTuning.repulsionScale" type="range" min="0.35" max="2" step="0.05" />
            </label>
            <label class="kg-console-row">
              <span class="kg-console-label">连线吸引力</span>
              <span class="kg-console-val">{{ graphTuning.linkStrengthScale.toFixed(2) }}</span>
              <input v-model.number="graphTuning.linkStrengthScale" type="range" min="0.25" max="1.5" step="0.05" />
            </label>
            <label class="kg-console-row">
              <span class="kg-console-label">连线长度</span>
              <span class="kg-console-val">{{ Math.round(graphTuning.linkDistanceBase) }}px</span>
              <input v-model.number="graphTuning.linkDistanceBase" type="range" min="36" max="140" step="2" />
            </label>
          </div>
        </div>
        <button type="button" class="kg-console-play" title="恢复默认参数" @click="resetGraphTuning">默认</button>
      </div>
    </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch, computed, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import {
  DEFAULT_KG_D3_TUNING,
  mountKgD3ForceCanvas,
  type KgD3Api,
  type KgD3GraphTuning,
} from './kgD3ForceCanvas';
import { ElTree } from 'element-plus';
import 'element-plus/es/components/tree/style/css';
import { useAiAnalysisStore } from '../../stores/aiAnalysis';
import type {
  DashboardGraphInspectionLotNodePayload,
  DashboardGraphPartNodePayload,
  DashboardGraphSupplierNodePayload,
  DashboardGraphVisualClusterNodePayload,
  DashboardPartStatus,
} from '../../types/aiAnalysis';
import cellKgMockRaw from '../../mock/supplyChainKnowledgeGraphMock.json';

/** `VITE_KG_SCENARIO=bom` 时使用旧版 BOM 渐进展开演示；默认加载电芯追溯 Mock */
const USE_CELL_TRACE_SCENARIO = import.meta.env.VITE_KG_SCENARIO !== 'bom';

/** el-tree 数据（与全量目录同源） */
interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export type GraphEntityType = 'Part' | 'Supplier' | 'InspectionLot' | 'VisualCluster';

interface DashboardCatalogBundle {
  rootId: string;
  nodesById: Map<string, GraphNodeModel>;
  treeChildren: Map<string, string[]>;
  allEdges: GraphEdgeModel[];
  treeData: TreeNode[];
}

export interface GraphNodeModel {
  id: string;
  label: string;
  entityType: GraphEntityType;
  /** Canvas 节点绘制类型（与 kgD3ForceCanvas 一致） */
  type: string;
  /** 图谱语义：root 为核心总成（初始唯一渲染节点） */
  kgType?: 'root' | 'part' | 'supplier' | 'visualCluster' | 'inspectionLot';
  imgUrl?: string;
  features?: string[];
  status?: DashboardPartStatus;
  size?: number;
  x?: number;
  y?: number;
  style?: Record<string, unknown>;
  tier?: number;
  region?: string;
  supplierCode?: string;
  lotNo?: string;
  lineCode?: string;
  producedAt?: string;
  shift?: string;
  qcStatus?: string;
  defectHint?: string;
  clusterCode?: string;
  embeddingFamily?: string;
  similarityThreshold?: number;
  trainedAt?: string;
  partNumber?: string;
  material?: string;
  cellBatchRef?: string;
}

export interface GraphEdgeModel {
  id: string;
  source: string;
  target: string;
  relType?: 'SUPPLIES' | 'MANUFACTURED_ON' | 'MATCHES';
  tier?: number;
  score?: number;
  style?: Record<string, unknown>;
}

function edgeStyleForRelType(relType: string | undefined): Record<string, unknown> {
  switch (relType) {
    case 'MATCHES':
      return { stroke: 'rgba(251, 113, 133, 0.88)', lineWidth: 2, lineDash: [6, 4] };
    case 'MANUFACTURED_ON':
      return { stroke: 'rgba(56, 189, 248, 0.78)', lineWidth: 1.65 };
    case 'SUPPLIES':
      return { stroke: 'rgba(129, 140, 248, 0.62)', lineWidth: 1.15 };
    default:
      return { stroke: 'rgba(148, 163, 184, 0.35)', lineWidth: 1 };
  }
}

function statusLabel(s: DashboardPartStatus | undefined): string {
  switch (s) {
    case 'in_stock':
      return '充足';
    case 'low_stock':
      return '偏低';
    case 'out_of_stock':
      return '缺货';
    default:
      return '待确认';
  }
}

function entityTypeLabel(t: GraphEntityType): string {
  switch (t) {
    case 'Part':
      return '零件';
    case 'Supplier':
      return '供应商';
    case 'InspectionLot':
      return '质检批次';
    case 'VisualCluster':
      return '视觉异常簇';
    default:
      return '';
  }
}

function buildAdjacency(edges: GraphEdgeModel[]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!m.has(a)) m.set(a, new Set());
    if (!m.has(b)) m.set(b, new Set());
    m.get(a)!.add(b);
    m.get(b)!.add(a);
  };
  for (const e of edges) {
    add(e.source, e.target);
  }
  return m;
}

/** 构建工业图谱全量目录（默认仅 root 进入画布） */
function buildIndustrialCatalog(): DashboardCatalogBundle {
  const nodesById = new Map<string, GraphNodeModel>();
  const treeChildren = new Map<string, string[]>();
  const allEdges: GraphEdgeModel[] = [];
  let eid = 0;

  const ROOT_ID = 'KG-ROOT';

  nodesById.set(ROOT_ID, {
    id: ROOT_ID,
    label: '智链 · 核心动力总成总成',
    entityType: 'Part',
    kgType: 'root',
    type: 'dashboard-root',
    size: 68,
    imgUrl: 'https://picsum.photos/seed/indu-root/96/96',
    features: ['柔性总成', '国六排放链', '批次级追溯'],
    status: 'in_stock',
  });

  type ChildSpec =
    | { kind: 'part'; id: string; label: string; status: DashboardPartStatus; feats: string[]; seed: string }
    | { kind: 'supplier'; id: string; label: string };

  const modules: { id: string; label: string; children: ChildSpec[] }[] = [
    {
      id: 'MOD-BRK',
      label: '制动与稳定性模组',
      children: [
        {
          kind: 'part',
          id: 'P-BRK-1',
          label: '制动钳总成',
          status: 'low_stock',
          feats: ['镀锌工艺', 'NVH 优化'],
          seed: 'brk1',
        },
        {
          kind: 'part',
          id: 'P-BRK-2',
          label: '制动盘',
          status: 'in_stock',
          feats: ['通风打孔', '轻量化'],
          seed: 'brk2',
        },
        { kind: 'supplier', id: 'S-BRK-A', label: '华东制动科技' },
      ],
    },
    {
      id: 'MOD-DRV',
      label: '传动系统模组',
      children: [
        {
          kind: 'part',
          id: 'P-DRV-1',
          label: '减速器壳体',
          status: 'out_of_stock',
          feats: ['铝合金低压铸造', '密封面精铣'],
          seed: 'drv1',
        },
        {
          kind: 'part',
          id: 'P-DRV-2',
          label: '差速器齿轮',
          status: 'pending',
          feats: ['渗碳淬火', '齿形修形'],
          seed: 'drv2',
        },
        { kind: 'supplier', id: 'S-DRV-B', label: '精工传动集团' },
      ],
    },
    {
      id: 'MOD-EL',
      label: '电气与热管理模组',
      children: [
        {
          kind: 'part',
          id: 'P-EL-1',
          label: '电机控制器壳体',
          status: 'in_stock',
          feats: ['压铸一体化', '导热涂层'],
          seed: 'el1',
        },
        {
          kind: 'part',
          id: 'P-EL-2',
          label: '冷却水泵叶轮',
          status: 'low_stock',
          feats: ['PPS 工程塑料', '动平衡'],
          seed: 'el2',
        },
        { kind: 'supplier', id: 'S-EL-C', label: '蓝海电气部件' },
      ],
    },
  ];

  const rootChildren: string[] = [];

  for (const mod of modules) {
    rootChildren.push(mod.id);
    nodesById.set(mod.id, {
      id: mod.id,
      label: mod.label,
      entityType: 'Part',
      kgType: 'part',
      type: 'dashboard-part',
      size: 54,
      imgUrl: `https://picsum.photos/seed/${mod.id}/96/96`,
      features: ['一级子总成', '可替换模组'],
      status: 'in_stock',
    });
    allEdges.push({ id: `e-${eid++}`, source: ROOT_ID, target: mod.id });

    const mc: string[] = [];
    for (const ch of mod.children) {
      mc.push(ch.id);
      if (ch.kind === 'part') {
        nodesById.set(ch.id, {
          id: ch.id,
          label: ch.label,
          entityType: 'Part',
          kgType: 'part',
          type: 'dashboard-part',
          size: 52,
          imgUrl: `https://picsum.photos/seed/${ch.seed}/96/96`,
          features: ch.feats,
          status: ch.status,
        });
      } else {
        nodesById.set(ch.id, {
          id: ch.id,
          label: ch.label,
          entityType: 'Supplier',
          kgType: 'supplier',
          type: 'dashboard-supplier',
          size: 36,
        });
      }
      allEdges.push({ id: `e-${eid++}`, source: mod.id, target: ch.id });
    }
    treeChildren.set(mod.id, mc);
  }

  treeChildren.set(ROOT_ID, rootChildren);

  // 跨模组弱关联：模拟工艺耦合（两端均加载后才可见）
  allEdges.push({ id: `e-${eid++}`, source: 'P-BRK-1', target: 'P-DRV-1' });

  function toTree(id: string): TreeNode {
    const n = nodesById.get(id)!;
    const ch = treeChildren.get(id);
    return {
      id,
      label: n.label,
      children: ch?.map(toTree),
    };
  }

  return {
    rootId: ROOT_ID,
    nodesById,
    treeChildren,
    allEdges,
    treeData: [toTree(ROOT_ID)],
  };
}

/** 电芯外壳划伤穿透场景：全量子图 Mock（VisualCluster / InspectionLot / Part / Supplier） */
function buildCellScenarioCatalog(): DashboardCatalogBundle {
  const meta = cellKgMockRaw.meta as { anchorClusterId: string };
  const rawNodes = cellKgMockRaw.nodes as unknown as GraphNodeModel[];
  const rawEdges = cellKgMockRaw.edges as Array<Record<string, unknown>>;

  const nodesById = new Map<string, GraphNodeModel>();
  for (const n of rawNodes) {
    nodesById.set(n.id, { ...n });
  }

  const allEdges: GraphEdgeModel[] = rawEdges.map((re) => ({
    id: String(re.id),
    source: String(re.source),
    target: String(re.target),
    relType: re.relType as GraphEdgeModel['relType'],
    tier: typeof re.tier === 'number' ? re.tier : undefined,
    score: typeof re.score === 'number' ? re.score : undefined,
    style: edgeStyleForRelType(re.relType != null ? String(re.relType) : undefined),
  }));

  const adj = buildAdjacency(allEdges);
  const anchorId = meta.anchorClusterId;
  const parent = new Map<string, string | null>();
  parent.set(anchorId, null);
  const q: string[] = [anchorId];
  while (q.length) {
    const u = q.shift()!;
    for (const v of adj.get(u) || []) {
      if (!parent.has(v)) {
        parent.set(v, u);
        q.push(v);
      }
    }
  }
  const childrenMap = new Map<string, string[]>();
  for (const [child, par] of parent) {
    if (par != null) {
      if (!childrenMap.has(par)) childrenMap.set(par, []);
      childrenMap.get(par)!.push(child);
    }
  }
  function toTree(id: string): TreeNode {
    const n = nodesById.get(id)!;
    return {
      id,
      label: n.label,
      children: (childrenMap.get(id) || []).map(toTree),
    };
  }
  const treeChildren = new Map<string, string[]>();
  for (const id of nodesById.keys()) {
    treeChildren.set(id, childrenMap.get(id) ?? []);
  }

  return {
    rootId: anchorId,
    nodesById,
    treeChildren,
    allEdges,
    treeData: [toTree(anchorId)],
  };
}

function rebuildGraphModels(
  loadedIds: Set<string>,
  nodesById: Map<string, GraphNodeModel>,
  allEdges: GraphEdgeModel[],
): { nodes: GraphNodeModel[]; edges: GraphEdgeModel[] } {
  const nodes: GraphNodeModel[] = [];
  for (const id of loadedIds) {
    const m = nodesById.get(id);
    if (m) nodes.push({ ...m });
  }
  const edges = allEdges.filter((e) => loadedIds.has(e.source) && loadedIds.has(e.target));
  return { nodes, edges };
}

/** 风险路径：自根到异常零件的最短路径并集（status !== in_stock 视为异常） */
function computeRiskKeepSet(
  rootId: string,
  edges: GraphEdgeModel[],
  loadedIds: Set<string>,
): Set<string> {
  const abnormal = new Set<string>();
  for (const id of loadedIds) {
    const n = catalogRef.value?.nodesById.get(id);
    if (n?.entityType === 'Part' && n.status && n.status !== 'in_stock') {
      abnormal.add(id);
    }
  }
  if (abnormal.size === 0) return new Set(loadedIds);

  const adj = buildAdjacency(edges.filter((e) => loadedIds.has(e.source) && loadedIds.has(e.target)));
  const keep = new Set<string>([rootId]);

  function pathFromRoot(target: string): string[] | null {
    const parent = new Map<string, string | null>();
    parent.set(rootId, null);
    const q: string[] = [rootId];
    while (q.length) {
      const u = q.shift()!;
      if (u === target) {
        const path: string[] = [];
        let cur: string | null = u;
        while (cur) {
          path.unshift(cur);
          cur = parent.get(cur) ?? null;
        }
        return path;
      }
      for (const v of adj.get(u) || []) {
        if (!loadedIds.has(v)) continue;
        if (!parent.has(v)) {
          parent.set(v, u);
          q.push(v);
        }
      }
    }
    return null;
  }

  for (const t of abnormal) {
    const p = pathFromRoot(t);
    if (p) p.forEach((id) => keep.add(id));
    else keep.add(t);
  }
  return keep;
}

function pushPayloadFromModel(m: GraphNodeModel): void {
  switch (m.entityType) {
    case 'Part': {
      const p: DashboardGraphPartNodePayload = {
        entityType: 'Part',
        id: m.id,
        label: m.label,
        imgUrl: m.imgUrl ?? '',
        features: m.features ?? [],
        status: m.status ?? 'pending',
      };
      aiStore.setDashboardGraphSelectedNode(p);
      break;
    }
    case 'Supplier': {
      const s: DashboardGraphSupplierNodePayload = {
        entityType: 'Supplier',
        id: m.id,
        label: m.label,
        tier: m.tier,
        region: m.region,
        supplierCode: m.supplierCode,
      };
      aiStore.setDashboardGraphSelectedNode(s);
      break;
    }
    case 'InspectionLot': {
      const p: DashboardGraphInspectionLotNodePayload = {
        entityType: 'InspectionLot',
        id: m.id,
        label: m.label,
        lotNo: m.lotNo ?? '',
        lineCode: m.lineCode ?? '',
        producedAt: m.producedAt ?? '',
        shift: m.shift ?? '',
        qcStatus: m.qcStatus ?? '',
        defectHint: m.defectHint,
      };
      aiStore.setDashboardGraphSelectedNode(p);
      break;
    }
    case 'VisualCluster': {
      const p: DashboardGraphVisualClusterNodePayload = {
        entityType: 'VisualCluster',
        id: m.id,
        label: m.label,
        clusterCode: m.clusterCode ?? '',
        embeddingFamily: m.embeddingFamily ?? '',
        similarityThreshold: m.similarityThreshold ?? 0,
        trainedAt: m.trainedAt ?? '',
      };
      aiStore.setDashboardGraphSelectedNode(p);
      break;
    }
    default:
      break;
  }
}

const shellRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const isFullscreen = ref(false);
const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const d3ApiRef = shallowRef<KgD3Api | null>(null);
const layoutPending = ref(true);
const graphDataRef = ref<{ nodes: GraphNodeModel[]; edges: GraphEdgeModel[] }>({ nodes: [], edges: [] });
const selectedId = ref<string | null>(null);
const treeHighlightKey = ref<string | null>(null);
const riskMode = ref(false);

const graphTuning = ref<KgD3GraphTuning>({ ...DEFAULT_KG_D3_TUNING });

watch(
  graphTuning,
  () => {
    d3ApiRef.value?.applyTuning();
  },
  { deep: true },
);

function resetGraphTuning(): void {
  Object.assign(graphTuning.value, DEFAULT_KG_D3_TUNING);
}

function playGraphLayoutAnimation(): void {
  d3ApiRef.value?.playLayoutAnimation();
}

const catalogRef = ref<DashboardCatalogBundle | null>(null);
const loadedNodeIdsRef = ref<Set<string>>(new Set());

const hoverTip = ref<{
  x: number;
  y: number;
  label: string;
  entityType: GraphEntityType;
  entityLabel: string;
  status?: DashboardPartStatus;
  features: string[];
  tier?: number;
  lotNo?: string;
  lineCode?: string;
  clusterCode?: string;
  qcStatus?: string;
  embeddingFamily?: string;
} | null>(null);

const aiStore = useAiAnalysisStore();
const { dashboardGraphSelectedNode } = storeToRefs(aiStore);

const detailPayload = computed(() => dashboardGraphSelectedNode.value);

/** 侧拉：默认全部收起，只有点击对应按钮才展开 */
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const propsDrawerOpen = ref(false);
const btnNavRef = ref<HTMLButtonElement | null>(null);
const btnDetailRef = ref<HTMLButtonElement | null>(null);
const btnPropsRef = ref<HTMLButtonElement | null>(null);
const navDrawerRef = ref<HTMLElement | null>(null);
const detailDrawerRef = ref<HTMLElement | null>(null);
const propsDrawerRef = ref<HTMLElement | null>(null);

/** 自按钮中心的「Dock」缩放锚点（右侧边 % + 垂直 %） */
const navTransformOrigin = ref('100% 50%');
const detailTransformOrigin = ref('100% 50%');
const propsTransformOrigin = ref('100% 50%');

function computeDrawerAnchor(btn: HTMLElement, drawerEl: HTMLElement): string {
  const br = btn.getBoundingClientRect();
  const dr = drawerEl.getBoundingClientRect();
  if (dr.height < 4) return '100% 50%';
  const midY = br.top + br.height / 2;
  let pct = ((midY - dr.top) / dr.height) * 100;
  pct = Math.min(99, Math.max(1, pct));
  return `100% ${pct}%`;
}

function toggleNavDrawer(ev: MouseEvent): void {
  const opening = !leftDrawerOpen.value;
  if (opening) {
    propsDrawerOpen.value = false;
    leftDrawerOpen.value = true;
    const btn = (ev.currentTarget as HTMLElement) ?? btnNavRef.value;
    nextTick(() => {
      const d = navDrawerRef.value;
      if (btn && d) navTransformOrigin.value = computeDrawerAnchor(btn, d);
    });
  } else {
    leftDrawerOpen.value = false;
  }
}

function closeNavDrawer(): void {
  leftDrawerOpen.value = false;
}

function toggleDetailDrawer(ev: MouseEvent): void {
  const opening = !rightDrawerOpen.value;
  if (opening) {
    propsDrawerOpen.value = false;
    rightDrawerOpen.value = true;
    const btn = (ev.currentTarget as HTMLElement) ?? btnDetailRef.value;
    nextTick(() => {
      const d = detailDrawerRef.value;
      if (btn && d) detailTransformOrigin.value = computeDrawerAnchor(btn, d);
    });
  } else {
    rightDrawerOpen.value = false;
  }
}

function closeDetailDrawer(): void {
  rightDrawerOpen.value = false;
}

function togglePropsDrawer(ev: MouseEvent): void {
  const opening = !propsDrawerOpen.value;
  if (opening) {
    leftDrawerOpen.value = false;
    rightDrawerOpen.value = false;
    propsDrawerOpen.value = true;
    const btn = (ev.currentTarget as HTMLElement) ?? btnPropsRef.value;
    nextTick(() => {
      const d = propsDrawerRef.value;
      if (btn && d) propsTransformOrigin.value = computeDrawerAnchor(btn, d);
    });
  } else {
    propsDrawerOpen.value = false;
  }
}

function closePropsDrawer(): void {
  propsDrawerOpen.value = false;
}

function highlightNeighborhood(nodeId: string | null, edges: GraphEdgeModel[]): void {
  d3ApiRef.value?.setHighlightCenter(nodeId, edges as never);
}

function syncD3RiskOverlay(): void {
  const d3 = d3ApiRef.value;
  if (!d3) return;
  if (!riskMode.value) {
    d3.setRiskMode(false, null);
    return;
  }
  const cat = catalogRef.value;
  const rootId = cat?.rootId;
  if (!cat || !rootId) {
    d3.setRiskMode(false, null);
    return;
  }
  const { nodes, edges } = graphDataRef.value;
  const loaded = new Set(nodes.map((n) => n.id));
  const abnormalExists = [...loaded].some((id) => {
    const m = cat.nodesById.get(id);
    return m?.entityType === 'Part' && m.status && m.status !== 'in_stock';
  });
  if (!abnormalExists) {
    d3.setRiskMode(false, null);
    return;
  }
  const keep = computeRiskKeepSet(rootId, edges, loaded);
  d3.setRiskMode(true, {
    rootId,
    keepIds: keep,
    nodesById: cat.nodesById as never,
  });
}

/** 渐进展开后若处于风险模式，按新可见节点重算 D3 风险叠加 */
function refreshRiskOverlay(): void {
  syncD3RiskOverlay();
}

function syncFullscreenState(): void {
  const shell = shellRef.value;
  const fs =
    document.fullscreenElement ??
    (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ??
    null;
  isFullscreen.value = !!(shell && fs === shell);
}

async function toggleFullscreen(): Promise<void> {
  const shell = shellRef.value;
  if (!shell) return;
  const fs =
    document.fullscreenElement ??
    (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ??
    null;
  try {
    if (fs === shell) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else await (document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen?.();
    } else {
      if (shell.requestFullscreen) await shell.requestFullscreen();
      else await (shell as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.();
    }
  } catch {
    /* 浏览器拒绝全屏时静默失败 */
  }
}

function toggleRiskMode(): void {
  const cat = catalogRef.value;
  const rootId = cat?.rootId;
  if (!cat || !rootId) return;

  riskMode.value = !riskMode.value;

  if (!riskMode.value) {
    syncD3RiskOverlay();
    return;
  }

  const { nodes } = graphDataRef.value;
  const loaded = new Set(nodes.map((n) => n.id));
  const abnormalExists = [...loaded].some((id) => {
    const m = cat.nodesById.get(id);
    return m?.entityType === 'Part' && m.status && m.status !== 'in_stock';
  });

  if (!abnormalExists) {
    riskMode.value = false;
    syncD3RiskOverlay();
    return;
  }

  syncD3RiskOverlay();
}

function expandNextLayer(hubId: string): void {
  const cat = catalogRef.value;
  if (!cat) return;
  const next = cat.treeChildren.get(hubId);
  if (!next?.length) return;

  const loaded = loadedNodeIdsRef.value;
  let added = false;
  for (const cid of next) {
    if (!loaded.has(cid)) {
      loaded.add(cid);
      added = true;
    }
  }
  if (!added) return;

  const built = rebuildGraphModels(loaded, cat.nodesById, cat.allEdges);
  graphDataRef.value = built;

  d3ApiRef.value?.setData(built.nodes as never[], built.edges as never[]);
  d3ApiRef.value?.refreshForces();
  d3ApiRef.value?.focusOnNode(hubId);

  refreshRiskOverlay();
}

function onTreeNodeClick(data: TreeNode): void {
  treeHighlightKey.value = data.id;
  const mCat = catalogRef.value?.nodesById.get(data.id);
  if (!mCat) return;
  selectedId.value = data.id;
  pushPayloadFromModel(mCat);
  highlightNeighborhood(data.id, graphDataRef.value.edges);
  d3ApiRef.value?.refreshForces();
  d3ApiRef.value?.focusOnNode(data.id);
}

function teardownGraphEngine(): void {
  if (postLayoutFitTimer != null) {
    clearTimeout(postLayoutFitTimer);
    postLayoutFitTimer = null;
  }
  d3ApiRef.value?.destroy();
  d3ApiRef.value = null;
  if (containerRef.value) {
    containerRef.value.innerHTML = '';
  }
}

function mountD3Engine(w: number, h: number): void {
  const el = containerRef.value;
  if (!el) return;
  d3ApiRef.value = mountKgD3ForceCanvas(el, {
    getFocusHubId: () => selectedId.value,
    getTuning: () => graphTuning.value,
    onNodeClick: (id, m) => {
      const model = { ...m } as unknown as GraphNodeModel;
      selectedId.value = id;
      treeHighlightKey.value = id;
      treeRef.value?.setCurrentKey?.(id);
      pushPayloadFromModel(model);
      highlightNeighborhood(id, graphDataRef.value.edges);
      d3ApiRef.value?.refreshForces();
      d3ApiRef.value?.focusOnNode(id);
    },
    onNodeDblClick: (id) => {
      expandNextLayer(id);
      d3ApiRef.value?.refreshForces();
    },
    onCanvasClick: () => {
      selectedId.value = null;
      treeHighlightKey.value = null;
      aiStore.setDashboardGraphSelectedNode(null);
      highlightNeighborhood(null, graphDataRef.value.edges);
      d3ApiRef.value?.refreshForces();
    },
    onHover: (m, pos) => {
      if (!m || !pos) {
        hoverTip.value = null;
        return;
      }
      hoverTip.value = {
        x: pos.x + 10,
        y: pos.y - 10,
        label: m.label,
        entityType: m.entityType as GraphEntityType,
        entityLabel: entityTypeLabel(m.entityType as GraphEntityType),
        status: m.status as DashboardPartStatus | undefined,
        features: m.features ?? [],
        tier: m.tier,
        lotNo: m.lotNo,
        lineCode: m.lineCode,
        clusterCode: m.clusterCode,
        qcStatus: m.qcStatus,
        embeddingFamily: m.embeddingFamily,
      };
    },
  });
  d3ApiRef.value.changeSize(w, h);
  d3ApiRef.value.setData(graphDataRef.value.nodes as never[], graphDataRef.value.edges as never[]);
}

let resizeObs: ResizeObserver | null = null;
let postLayoutFitTimer: ReturnType<typeof setTimeout> | null = null;

const treeData = ref<TreeNode[]>([]);

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenState);
  document.addEventListener('webkitfullscreenchange', syncFullscreenState as EventListener);

  const cat = USE_CELL_TRACE_SCENARIO ? buildCellScenarioCatalog() : buildIndustrialCatalog();
  catalogRef.value = cat;
  treeData.value = cat.treeData;

  const loadedIds = USE_CELL_TRACE_SCENARIO
    ? new Set<string>(cat.nodesById.keys())
    : new Set<string>([cat.rootId]);
  loadedNodeIdsRef.value = loadedIds;
  const initial = rebuildGraphModels(loadedIds, cat.nodesById, cat.allEdges);
  graphDataRef.value = initial;

  const el = containerRef.value;
  if (!el) return;
  const w = el.clientWidth || 600;
  const h = el.clientHeight || 480;

  mountD3Engine(w, h);
  syncD3RiskOverlay();

  treeHighlightKey.value = cat.rootId;
  const rootModel = cat.nodesById.get(cat.rootId);
  if (rootModel) pushPayloadFromModel(rootModel);

  nextTick(() => {
    treeRef.value?.setCurrentKey?.(cat.rootId);
  });

  requestAnimationFrame(() => {
    layoutPending.value = false;
  });

  postLayoutFitTimer = window.setTimeout(() => {
    postLayoutFitTimer = null;
    d3ApiRef.value?.focusOnNode(cat.rootId);
  }, 600);

  resizeObs = new ResizeObserver(() => {
    const box = containerRef.value;
    if (!box) return;
    const nw = box.clientWidth;
    const nh = box.clientHeight;
    if (nw < 10 || nh < 10) return;
    d3ApiRef.value?.changeSize(nw, nh);
  });
  resizeObs.observe(el);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenState);
  document.removeEventListener('webkitfullscreenchange', syncFullscreenState as EventListener);

  teardownGraphEngine();
  resizeObs?.disconnect();
  resizeObs = null;
});
</script>

<style scoped>
.kg-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  margin-bottom: 0;
  overflow: hidden;
  /* 仅调整按钮用：右缘内边距。侧栏位置用下面 rail，勿混用。 */
  --kg-edge-inset: 10px;
  /* 侧栏右缘定位（与按钮独立，勿为对齐按钮而改此值） */
  --kg-action-rail-width: 68px;
  /* 导航与详情同时展开时，两框之间的竖缝 */
  --kg-nav-detail-gap: 12px;
}

.kg-shell.is-fullscreen {
  margin-bottom: 0;
}

.kg-shell:fullscreen {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin-bottom: 0;
  box-sizing: border-box;
  padding: 0;
  background: #020617;
}

.kg-shell:-webkit-full-screen {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin-bottom: 0;
  box-sizing: border-box;
  padding: 0;
  background: #020617;
}

.kg-shell:fullscreen .kg-main,
.kg-shell:-webkit-full-screen .kg-main {
  flex: 1;
  min-height: 0;
}

.kg-main {
  --kg-graph-gutter: 2px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  box-sizing: border-box;
  isolation: isolate;
  z-index: 0;
  /* 收起侧栏时裁掉滑出区域，避免残影（悬浮提示尽量放在画布中部） */
  overflow: hidden;
}

/* 叠在画布之上、标题与按钮之下，与大屏圆角一致 */
.kg-main::after {
  content: '';
  position: absolute;
  inset: 0;
  /* 低于侧栏(30+)与按钮(45)，仅压住画布 */
  z-index: 24;
  pointer-events: none;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.38);
}

.kg-shell.is-fullscreen .kg-main::after,
.kg-shell:-webkit-full-screen .kg-main::after {
  border-radius: 0;
}

/* 图谱上方浮层标题：透明底，仅圆点 + 文案（与侧栏 panel-title 同级别） */
.kg-heading {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 45;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.kg-heading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 6px #6366f1;
  flex-shrink: 0;
}

.kg-heading-text {
  white-space: nowrap;
  line-height: 1.25;
  text-shadow: 0 1px 8px rgba(2, 6, 23, 0.9), 0 0 12px rgba(2, 6, 23, 0.65);
}

/* 右上角竖排操作（全屏 → 导航 → 详情 → 风险 → 属性），文案均为两字 */
.kg-actions {
  position: absolute;
  /* 与侧栏顶对齐（.kg-drawer top） */
  top: 8px;
  right: var(--kg-edge-inset);
  z-index: 45;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  pointer-events: auto;
}

.kg-action-btn {
  margin: 0;
  padding: 7px 10px;
  min-width: 52px;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid rgba(129, 140, 248, 0.45);
  background: rgba(15, 23, 42, 0.92);
  color: #c7d2fe;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.kg-action-btn:hover {
  border-color: #818cf8;
  background: rgba(49, 46, 129, 0.55);
  color: #e0e7ff;
}

.kg-action-btn.is-active {
  border-color: #a5b4fc;
  background: rgba(99, 102, 241, 0.28);
  color: #e0e7ff;
}

.kg-action-btn--fs[aria-pressed='true'] {
  border-color: #a5b4fc;
  background: rgba(99, 102, 241, 0.22);
  color: #e0e7ff;
}

.kg-action-btn--risk {
  border-color: rgba(251, 113, 133, 0.45);
  color: #fda4af;
}

.kg-action-btn--risk:hover {
  border-color: #fb7185;
  background: rgba(251, 113, 133, 0.12);
  color: #fecaca;
}

.kg-action-btn--risk.is-on {
  border-color: #fbbf24;
  color: #fde68a;
  background: rgba(251, 191, 36, 0.12);
}

.kg-drawer {
  position: absolute;
  top: 8px;
  bottom: 8px;
  /* 导航 / 详情 / 属性统一宽度 */
  width: min(300px, 88vw);
  right: calc(var(--kg-action-rail-width) + 5px);
  /* 必须低于 .kg-actions(45)，抽屉已移入 kg-main 与按钮同一叠层 */
  z-index: 30;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.97);
  border: 1px solid rgba(99, 102, 241, 0.38);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  pointer-events: none;
  transform-origin: 100% 50%;
  backface-visibility: hidden;
  /* 收起：完全不可见；展开：自 transformOrigin（对齐触发按钮）缩放滑入 */
  opacity: 0;
  visibility: hidden;
  transform: translate3d(calc(100% + 36px), 0, 0) scale(0.82);
  transition:
    transform 0.34s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.22s ease,
    visibility 0s linear 0.34s;
}

.kg-drawer.is-open {
  pointer-events: auto;
  opacity: 1;
  visibility: visible;
  transform: translate3d(0, 0, 0) scale(1);
  transition:
    transform 0.34s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.2s ease,
    visibility 0s linear 0s;
}

@media (prefers-reduced-motion: reduce) {
  .kg-drawer {
    transition-duration: 0.12s;
  }
}

.kg-drawer--detail,
.kg-drawer--nav {
  z-index: 31;
}

.kg-drawer--props {
  z-index: 30;
}

/* 仅详情 + 属性双开（无导航）：与导航+详情同款上下半区 + 缝 */
.kg-shell.kg-dual-right:not(.kg-triple-right) .kg-drawer--detail.is-open {
  top: 8px;
  bottom: auto;
  height: calc(50% - 8px - var(--kg-nav-detail-gap) / 2);
  max-height: none;
}

.kg-shell.kg-dual-right:not(.kg-triple-right) .kg-drawer--props.is-open {
  top: calc(50% + var(--kg-nav-detail-gap) / 2);
  bottom: 8px;
  max-height: none;
}

/* 导航 + 详情（无属性）：上下各半区，中间留缝避免叠在一起 */
.kg-shell.kg-nav-detail-dual .kg-drawer--nav.is-open {
  top: 8px;
  bottom: auto;
  height: calc(50% - 8px - var(--kg-nav-detail-gap) / 2);
  max-height: none;
}

.kg-shell.kg-nav-detail-dual .kg-drawer--detail.is-open {
  top: calc(50% + var(--kg-nav-detail-gap) / 2);
  bottom: 8px;
  max-height: none;
}

/* 导航 + 属性（无详情）：与导航+详情同款 */
.kg-shell.kg-nav-props-dual .kg-drawer--nav.is-open {
  top: 8px;
  bottom: auto;
  height: calc(50% - 8px - var(--kg-nav-detail-gap) / 2);
  max-height: none;
}

.kg-shell.kg-nav-props-dual .kg-drawer--props.is-open {
  top: calc(50% + var(--kg-nav-detail-gap) / 2);
  bottom: 8px;
  max-height: none;
}

/* 导航 + 详情 + 属性 三开：三段高度 */
.kg-shell.kg-triple-right .kg-drawer--nav.is-open {
  top: 8px;
  bottom: auto;
  max-height: min(28vh, 340px);
}

.kg-shell.kg-triple-right .kg-drawer--detail.is-open {
  top: calc(8px + min(28vh, 340px) + 8px);
  bottom: auto;
  max-height: min(34vh, 400px);
}

.kg-shell.kg-triple-right .kg-drawer--props.is-open {
  top: auto;
  bottom: 8px;
  max-height: min(34vh, 400px);
}

/* 属性独占展开：外框与导航/详情全高一致（顶底各 8px） */
.kg-drawer--props.is-open.kg-props-full {
  top: 8px;
  bottom: 8px;
  max-height: none;
}

.kg-props-head-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.kg-props-body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  font-size: 11px;
  color: #cbd5e1;
  padding: 14px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kg-props-body .kg-console-section {
  gap: 14px;
}

.kg-props-body .kg-console-row {
  gap: 6px 10px;
}

.kg-drawer-head {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.55);
}

.kg-drawer-title {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  letter-spacing: 0.04em;
}

.kg-drawer-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.35);
  background: rgba(30, 41, 59, 0.85);
  color: #94a3b8;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.kg-drawer-close:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #e2e8f0;
}

.kg-drawer-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.kg-el-tree {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 6px 10px;
  background: transparent;
  font-size: 12px;
  --el-tree-node-hover-bg-color: rgba(99, 102, 241, 0.12);
  --el-tree-text-color: #cbd5e1;
}

:deep(.kg-el-tree .el-tree-node__content) {
  border-radius: 6px;
  height: 28px;
}

:deep(.kg-el-tree .el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(99, 102, 241, 0.22);
  color: #e0e7ff;
}

.kg-container {
  position: relative;
  z-index: 0;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  margin: var(--kg-graph-gutter);
  width: auto;
  align-self: stretch;
  border-radius: 0;
  background: radial-gradient(ellipse 70% 55% at 50% 40%, rgba(30, 58, 138, 0.12), transparent 60%);
}

.kg-console-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kg-console-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 8px;
  align-items: center;
}

.kg-console-label {
  color: #94a3b8;
}

.kg-console-val {
  font-variant-numeric: tabular-nums;
  color: #a5b4fc;
  font-size: 10px;
}

.kg-console-row input[type='range'] {
  grid-column: 1 / -1;
  width: 100%;
  height: 4px;
  accent-color: #818cf8;
  cursor: pointer;
}

.kg-console-play {
  width: 100%;
  flex-shrink: 0;
  margin: 0;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.55);
  color: #e0e7ff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.06em;
}

.kg-console-play:hover {
  background: rgba(129, 140, 248, 0.65);
}

.kg-console-force-block {
  margin: 0;
  padding-top: 14px;
  border-top: 1px solid rgba(51, 65, 85, 0.55);
}

.kg-loading {
  position: absolute;
  inset: var(--kg-graph-gutter);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 34;
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: 0.04em;
  pointer-events: none;
  background: rgba(2, 8, 23, 0.35);
  border-radius: 8px;
}

.kg-tooltip {
  position: absolute;
  z-index: 46;
  min-width: 140px;
  max-width: 260px;
  padding: 10px 12px;
  border-radius: 8px;
  pointer-events: none;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(99, 102, 241, 0.45);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.kg-tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: #a5b4fc;
  margin-bottom: 6px;
}

.kg-tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 3px;
}

.kg-tooltip-features {
  margin-top: 6px;
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.45;
}

.kg-feat-label {
  color: #475569;
  margin-right: 6px;
}

.kg-detail-empty {
  padding: 16px 14px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.55;
}

.kg-detail-card {
  padding: 12px 14px 16px;
  flex: 1;
  overflow: auto;
}

.kg-detail-badge {
  display: inline-block;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  margin-bottom: 10px;
}

.kg-detail-badge.st-in_stock {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}
.kg-detail-badge.st-low_stock {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}
.kg-detail-badge.st-out_of_stock {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}
.kg-detail-badge.st-pending {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.kg-detail-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.kg-detail-id {
  font-size: 10px;
  color: #475569;
  margin-bottom: 12px;
}

.kg-detail-thumb-wrap {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.25);
  margin-bottom: 12px;
  max-width: 120px;
}

.kg-detail-thumb {
  width: 100%;
  display: block;
  vertical-align: middle;
}

.kg-detail-section {
  font-size: 11px;
  color: #818cf8;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.kg-detail-features {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #cbd5e1;
  line-height: 1.55;
}

.kg-detail-muted {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

</style>
