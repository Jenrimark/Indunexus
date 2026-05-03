<template>
  <div ref="shellRef" class="kg-shell" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- 主体：工业结构图谱（全宽占用剩余空间） -->
    <div class="kg-main">
      <button
        v-if="!leftDrawerOpen"
        type="button"
        class="kg-drawer-trigger kg-drawer-trigger--left"
        title="展开结构导航"
        aria-expanded="false"
        aria-controls="kg-drawer-nav"
        @click="leftDrawerOpen = true"
      >
        <span class="kg-trigger-ico" aria-hidden="true">›</span>
        <span class="kg-trigger-txt">导航</span>
      </button>
      <button
        v-if="!rightDrawerOpen"
        type="button"
        class="kg-drawer-trigger kg-drawer-trigger--right"
        title="展开节点详情"
        aria-expanded="false"
        aria-controls="kg-drawer-detail"
        @click="rightDrawerOpen = true"
      >
        <span class="kg-trigger-txt">详情</span>
        <span class="kg-trigger-ico" aria-hidden="true">‹</span>
      </button>

      <div class="kg-toolbar">
        <label class="kg-perf-toggle">
          <input v-model="performanceMode" type="checkbox" />
          <span>性能模式</span>
        </label>
        <button type="button" class="kg-risk-btn" :class="{ on: riskMode }" @click="toggleRiskMode">
          {{ riskMode ? '退出风险模式' : '风险模式' }}
        </button>
        <button
          type="button"
          class="kg-fs-btn"
          :aria-pressed="isFullscreen"
          :title="isFullscreen ? '退出全屏 (Esc)' : '全屏查看'"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '还原' : '全屏' }}
        </button>
        <span
          class="kg-toolbar-hint"
          title="Canvas 渲染；gForce 含碰撞分离；单击聚焦两跳高亮，双击渐进展开（BOM 模式）"
        >
          {{
            USE_CELL_TRACE_SCENARIO
              ? '电芯追溯子图 · 单击聚焦两跳穿透 · 双击展开下一层（BOM 模式）'
              : '双击节点展开下一层 · 侧栏可收起'
          }}
        </span>
      </div>
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
    </div>

    <!-- 左侧拉：BOM / 模组导航 -->
    <aside
      id="kg-drawer-nav"
      class="kg-drawer kg-drawer--left"
      :class="{ 'is-open': leftDrawerOpen }"
      :aria-hidden="!leftDrawerOpen"
    >
      <div class="kg-drawer-head">
        <div>
          <span class="kg-drawer-title">结构导航</span>
          <span class="kg-drawer-sub">{{ USE_CELL_TRACE_SCENARIO ? '智鉴车件 · 穿透导航' : '智链数科 · BOM' }}</span>
        </div>
        <button
          type="button"
          class="kg-drawer-close"
          title="收起"
          aria-label="收起结构导航"
          @click="leftDrawerOpen = false"
        >
          ‹
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
      class="kg-drawer kg-drawer--right"
      :class="{ 'is-open': rightDrawerOpen }"
      :aria-hidden="!rightDrawerOpen"
    >
      <div class="kg-drawer-head">
        <div>
          <span class="kg-drawer-title">节点详情</span>
          <span class="kg-drawer-sub">单击图谱写入全局状态</span>
        </div>
        <button
          type="button"
          class="kg-drawer-close"
          title="收起"
          aria-label="收起节点详情"
          @click="rightDrawerOpen = false"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch, computed, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import G6 from '@antv/g6';
import type { IG6GraphEvent } from '@antv/g6';
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

function computeAdaptiveGravity(nodeCount: number, width: number, height: number): number {
  const base = 18;
  const area = Math.max(width * height, 1);
  const nodesPerMp = (nodeCount * 1_000_000) / area;
  const t = Math.min(1, Math.max(0, (nodesPerMp - 90) / 280));
  return base + t * 11;
}

function edgeEndpointId(term: unknown): string {
  if (term && typeof term === 'object' && 'id' in term) {
    return String((term as { id: string }).id);
  }
  return String(term ?? '');
}

export interface GraphNodeModel {
  id: string;
  label: string;
  entityType: GraphEntityType;
  /** G6 注册的绘制类型 */
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

let nodesRegistered = false;

function statusRingColor(s: DashboardPartStatus | undefined): string {
  switch (s) {
    case 'in_stock':
      return '#22c55e';
    case 'low_stock':
      return '#f59e0b';
    case 'out_of_stock':
      return '#ef4444';
    default:
      return '#94a3b8';
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

/** G6 v4 无 filterItem：对节点逐一 hide/show，语义等价于按条件过滤可见性 */
function filterGraphItems(
  graph: InstanceType<typeof G6.Graph>,
  shouldHide: (nodeId: string) => boolean,
): void {
  graph.getNodes().forEach((node) => {
    const id = node.getID();
    if (shouldHide(id)) graph.hideItem(node);
    else graph.showItem(node);
  });
}

function registerCustomShapes(): void {
  if (nodesRegistered) return;
  nodesRegistered = true;

  G6.registerNode(
    'dashboard-root',
    {
      draw(cfg, group) {
        const size = (cfg.size as number) || 64;
        const r = size / 2;
        const imgUrl = (cfg.imgUrl as string) || '';
        const st = cfg.status as DashboardPartStatus | undefined;
        const ring = statusRingColor(st);

        const keyShape = group.addShape('circle', {
          attrs: {
            x: 0,
            y: 0,
            r: r + 5,
            fill: '#0f172a',
            stroke: ring,
            lineWidth: 4,
            shadowColor: ring,
            shadowBlur: 14,
          },
          name: 'root-ring',
        });

        const innerR = r - 3;
        const thumb = group.addShape('image', {
          attrs: {
            x: -innerR,
            y: -innerR,
            width: innerR * 2,
            height: innerR * 2,
            img: imgUrl,
          },
          name: 'thumb',
        });
        thumb.setClip({ type: 'circle', attrs: { r: innerR, x: 0, y: 0 } });

        group.addShape('circle', {
          attrs: {
            x: 0,
            y: 0,
            r: innerR,
            fill: 'transparent',
            stroke: 'rgba(251,191,36,0.35)',
            lineWidth: 1,
          },
          name: 'inner-ring',
        });

        return keyShape;
      },
    },
    'single-node',
  );

  G6.registerNode(
    'dashboard-part',
    {
      draw(cfg, group) {
        const size = (cfg.size as number) || 52;
        const r = size / 2;
        const imgUrl = (cfg.imgUrl as string) || '';
        const st = cfg.status as DashboardPartStatus | undefined;
        const ring = statusRingColor(st);

        const keyShape = group.addShape('circle', {
          attrs: {
            x: 0,
            y: 0,
            r: r + 3,
            fill: '#0f172a',
            stroke: ring,
            lineWidth: 3,
            shadowColor: ring,
            shadowBlur: 8,
          },
          name: 'ring-circle',
        });

        const innerR = r - 2;
        const thumb = group.addShape('image', {
          attrs: {
            x: -innerR,
            y: -innerR,
            width: innerR * 2,
            height: innerR * 2,
            img: imgUrl,
          },
          name: 'thumb',
        });
        thumb.setClip({ type: 'circle', attrs: { r: innerR, x: 0, y: 0 } });

        group.addShape('circle', {
          attrs: {
            x: 0,
            y: 0,
            r: innerR,
            fill: 'transparent',
            stroke: 'rgba(148,163,184,0.45)',
            lineWidth: 1,
          },
          name: 'inner-ring',
        });

        return keyShape;
      },
    },
    'single-node',
  );

  G6.registerNode(
    'dashboard-supplier',
    {
      draw(cfg, group) {
        const r = ((cfg.size as number) || 36) / 2;
        const keyShape = group.addShape('circle', {
          attrs: {
            x: 0,
            y: 0,
            r,
            fill: 'rgba(30,41,59,0.95)',
            stroke: '#818cf8',
            lineWidth: 2,
          },
          name: 'supplier-body',
        });
        const label = ((cfg.label as string) || '供').slice(0, 2);
        group.addShape('text', {
          attrs: {
            x: 0,
            y: 0,
            text: label,
            fill: '#c7d2fe',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            textBaseline: 'middle',
          },
          name: 'supplier-txt',
        });
        return keyShape;
      },
    },
    'single-node',
  );

  G6.registerNode(
    'dashboard-visual-cluster',
    {
      draw(cfg, group) {
        const size = (cfg.size as number) || 56;
        const r = size / 2;
        const keyShape = group.addShape('polygon', {
          attrs: {
            points: [
              [0, -r],
              [r * 0.92, 0],
              [0, r],
              [-r * 0.92, 0],
            ],
            fill: 'rgba(30,41,59,0.96)',
            stroke: '#fb7185',
            lineWidth: 2.6,
            shadowColor: 'rgba(251,113,133,0.42)',
            shadowBlur: 16,
          },
          name: 'vc-poly',
        });
        const code = String((cfg.clusterCode as string) || '').slice(0, 8);
        group.addShape('text', {
          attrs: {
            x: 0,
            y: 0,
            text: code || 'VC',
            fill: '#fecdd3',
            fontSize: 10,
            fontWeight: 700,
            textAlign: 'center',
            textBaseline: 'middle',
          },
          name: 'vc-txt',
        });
        return keyShape;
      },
    },
    'single-node',
  );

  G6.registerNode(
    'dashboard-inspection-lot',
    {
      draw(cfg, group) {
        const size = (cfg.size as number) || 52;
        const w = size * 1.15;
        const h = size * 0.58;
        const keyShape = group.addShape('rect', {
          attrs: {
            x: -w / 2,
            y: -h / 2,
            width: w,
            height: h,
            radius: 8,
            fill: 'rgba(15,23,42,0.94)',
            stroke: '#38bdf8',
            lineWidth: 2,
            shadowColor: 'rgba(56,189,248,0.28)',
            shadowBlur: 10,
          },
          name: 'lot-rect',
        });
        const lot = String((cfg.lotNo as string) || 'LOT').slice(0, 12);
        group.addShape('text', {
          attrs: {
            x: 0,
            y: -4,
            text: lot,
            fill: '#e0f2fe',
            fontSize: 9,
            fontWeight: 600,
            textAlign: 'center',
            textBaseline: 'middle',
          },
          name: 'lot-no',
        });
        group.addShape('text', {
          attrs: {
            x: 0,
            y: 8,
            text: '批次',
            fill: '#64748b',
            fontSize: 8,
            textAlign: 'center',
            textBaseline: 'middle',
          },
          name: 'lot-sub',
        });
        return keyShape;
      },
    },
    'single-node',
  );
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

function nodesWithinTwoHops(startId: string, adj: Map<string, Set<string>>): Set<string> {
  const ball = new Set<string>([startId]);
  const dist = new Map<string, number>([[startId, 0]]);
  const q: string[] = [startId];
  while (q.length) {
    const u = q.shift()!;
    const du = dist.get(u)!;
    if (du >= 2) continue;
    for (const v of adj.get(u) || []) {
      if (!dist.has(v)) {
        dist.set(v, du + 1);
        ball.add(v);
        q.push(v);
      }
    }
  }
  return ball;
}

function highlightNeighborhood(
  graph: InstanceType<typeof G6.Graph>,
  nodeId: string | null,
  edges: GraphEdgeModel[],
): void {
  if (!nodeId) {
    graph.getEdges().forEach((edge) => {
      graph.clearItemStates(edge, ['focus', 'dim']);
    });
    graph.getNodes().forEach((node) => graph.clearItemStates(node, ['dim']));
    return;
  }
  const adj = buildAdjacency(edges);
  const ball = nodesWithinTwoHops(nodeId, adj);
  graph.getEdges().forEach((edge) => {
    const m = edge.getModel() as GraphEdgeModel;
    const hit = ball.has(m.source) && ball.has(m.target);
    graph.clearItemStates(edge, ['focus', 'dim']);
    graph.setItemState(edge, hit ? 'focus' : 'dim', true);
  });
  graph.getNodes().forEach((node) => {
    const id = node.getID();
    graph.clearItemStates(node, ['dim']);
    if (!ball.has(id)) graph.setItemState(node, 'dim', true);
  });
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
const graphRef = shallowRef<InstanceType<typeof G6.Graph> | null>(null);
const layoutPending = ref(true);
const graphDataRef = ref<{ nodes: GraphNodeModel[]; edges: GraphEdgeModel[] }>({ nodes: [], edges: [] });
const selectedId = ref<string | null>(null);
const treeHighlightKey = ref<string | null>(null);
const performanceMode = ref(false);
const riskMode = ref(false);
const buildLayoutRef = ref<((w: number, h: number) => Record<string, unknown>) | null>(null);

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

/** 侧拉：左 BOM 默认收起；右详情默认展开（与图谱并列浏览） */
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(true);

let clickTimer: ReturnType<typeof setTimeout> | null = null;

function clearClickTimer(): void {
  if (clickTimer != null) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
}

function applyRiskVisualStates(graph: InstanceType<typeof G6.Graph>, enabled: boolean): void {
  graph.getNodes().forEach((n) => {
    graph.clearItemStates(n, ['riskHot', 'riskPath']);
  });
  graph.getEdges().forEach((e) => {
    graph.clearItemStates(e, ['riskHot']);
  });

  if (!enabled) return;

  const cat = catalogRef.value;
  const rootId = cat?.rootId;
  if (!cat || !rootId) return;

  const { nodes, edges } = graphDataRef.value;
  const loaded = new Set(nodes.map((x) => x.id));
  const keep = computeRiskKeepSet(rootId, edges, loaded);

  for (const id of loaded) {
    const item = graph.findById(id);
    if (!item) continue;
    const m = cat.nodesById.get(id);
    const isAbnormalPart = m?.entityType === 'Part' && m.status && m.status !== 'in_stock';
    if (isAbnormalPart) graph.setItemState(item, 'riskHot', true);
    else if (keep.has(id) && id !== rootId) graph.setItemState(item, 'riskPath', true);
  }

  graph.getEdges().forEach((edge) => {
    const em = edge.getModel() as GraphEdgeModel;
    if (keep.has(em.source) && keep.has(em.target)) {
      const sAb =
        cat.nodesById.get(em.source)?.entityType === 'Part' &&
        cat.nodesById.get(em.source)?.status !== 'in_stock';
      const tAb =
        cat.nodesById.get(em.target)?.entityType === 'Part' &&
        cat.nodesById.get(em.target)?.status !== 'in_stock';
      if (sAb || tAb) graph.setItemState(edge, 'riskHot', true);
    }
  });
}

/** 渐进展开后若处于风险模式，按新可见节点重算过滤与高亮 */
function refreshRiskOverlay(): void {
  if (!riskMode.value) return;
  const graph = graphRef.value;
  const cat = catalogRef.value;
  const rootId = cat?.rootId;
  const bl = buildLayoutRef.value;
  if (!graph || graph.get('destroyed') || !cat || !rootId || !bl) return;

  const { nodes, edges } = graphDataRef.value;
  const loaded = new Set(nodes.map((n) => n.id));
  const abnormalExists = [...loaded].some((id) => {
    const m = cat.nodesById.get(id);
    return m?.entityType === 'Part' && m.status && m.status !== 'in_stock';
  });
  if (!abnormalExists) return;

  const keep = computeRiskKeepSet(rootId, edges, loaded);
  filterGraphItems(graph, (id) => !keep.has(id));
  applyRiskVisualStates(graph, true);
  graph.updateLayout(bl(graph.get('width') as number, graph.get('height') as number));
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
  const graph = graphRef.value;
  if (!graph || graph.get('destroyed')) return;

  const cat = catalogRef.value;
  const rootId = cat?.rootId;
  if (!cat || !rootId) return;

  riskMode.value = !riskMode.value;

  if (!riskMode.value) {
    filterGraphItems(graph, () => false);
    applyRiskVisualStates(graph, false);
    graph.updateLayout(buildLayoutRef.value!(graph.get('width') as number, graph.get('height') as number));
    return;
  }

  const { nodes, edges } = graphDataRef.value;
  const loaded = new Set(nodes.map((n) => n.id));
  const abnormalExists = [...loaded].some((id) => {
    const m = cat.nodesById.get(id);
    return m?.entityType === 'Part' && m.status && m.status !== 'in_stock';
  });

  if (!abnormalExists) {
    riskMode.value = false;
    return;
  }

  const keep = computeRiskKeepSet(rootId, edges, loaded);
  filterGraphItems(graph, (id) => !keep.has(id));
  applyRiskVisualStates(graph, true);

  graph.updateLayout(buildLayoutRef.value!(graph.get('width') as number, graph.get('height') as number));
}

function expandNextLayer(graph: InstanceType<typeof G6.Graph>, hubId: string): void {
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
  graph.changeData(built as unknown as Parameters<InstanceType<typeof G6.Graph>['changeData']>[0]);

  const w = graph.get('width') as number;
  const h = graph.get('height') as number;
  const bl = buildLayoutRef.value;
  if (bl) graph.updateLayout(bl(w, h));

  refreshRiskOverlay();

  const hubItem = graph.findById(hubId);
  if (hubItem) {
    graph.focusItem(hubItem, true, {
      easing: 'easeCubic',
      duration: 420,
    });
  }
}

function onTreeNodeClick(data: TreeNode): void {
  const graph = graphRef.value;
  treeHighlightKey.value = data.id;
  if (!graph || graph.get('destroyed')) return;
  const item = graph.findById(data.id);
  if (!item) return;
  const m = item.getModel() as unknown as GraphNodeModel;
  selectedId.value = data.id;
  pushPayloadFromModel(m);
  graph.getNodes().forEach((n) => graph.clearItemStates(n, ['selected']));
  graph.setItemState(item, 'selected', true);
  highlightNeighborhood(graph, data.id, graphDataRef.value.edges);
  graph.focusItem(item, true, { easing: 'easeCubic', duration: 380 });
}

function createGraph(
  width: number,
  height: number,
): {
  graph: InstanceType<typeof G6.Graph>;
  buildLayout: (w: number, h: number) => Record<string, unknown>;
} {
  registerCustomShapes();
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const pixelRatio = Math.min(performanceMode.value ? 1 : 2, dpr);

  const graphBox: { instance: InstanceType<typeof G6.Graph> | null } = { instance: null };
  let focusHubId: string | null = null;

  function buildDynamicGForceLayout(w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const nodeCount = graphDataRef.value.nodes.length;
    const adj = buildAdjacency(graphDataRef.value.edges);
    const neighborsOfHub = focusHubId ? adj.get(focusHubId) ?? new Set<string>() : new Set<string>();
    const baseNodeStrength = 2600;
    const outsiderStrengthMul = 1.38;
    const collideStrength = 1.45;
    const preventOverlap = true;
    const adaptiveGravity = computeAdaptiveGravity(nodeCount, w, h);
    const gravity = preventOverlap && collideStrength >= 1.2 ? adaptiveGravity : 18;
    const perf = performanceMode.value;
    const magneticG = 58 * (gravity / 18);

    return {
      type: 'gForce' as const,
      gpuEnabled: false,
      width: w,
      height: h,
      center: [cx, cy] as [number, number],
      nodeStrength: (d: { id: string }) => {
        if (!focusHubId) return baseNodeStrength;
        if (d.id === focusHubId || neighborsOfHub.has(d.id)) return baseNodeStrength;
        return baseNodeStrength * outsiderStrengthMul;
      },
      coulombDisScale: 0.0042,
      factor: 1,
      linkDistance: (_e: unknown, s: { id: string }, t: { id: string }) => {
        const normal = 68;
        const tight = 24;
        if (!focusHubId) return normal;
        const a = s.id;
        const b = t.id;
        const isHubNeighborEdge =
          (a === focusHubId && neighborsOfHub.has(b)) || (b === focusHubId && neighborsOfHub.has(a));
        return isHubNeighborEdge ? tight : normal;
      },
      edgeStrength: (edge: { source?: unknown; target?: unknown }) => {
        const base = 140;
        const pull = 380;
        if (!focusHubId) return base;
        const sid = edgeEndpointId(edge.source);
        const tid = edgeEndpointId(edge.target);
        const isHubNeighborEdge =
          (sid === focusHubId && neighborsOfHub.has(tid)) || (tid === focusHubId && neighborsOfHub.has(sid));
        return isHubNeighborEdge ? pull : base;
      },
      getCenter: (node: { id: string }) => {
        const gi = graphBox.instance;
        if (!gi || !focusHubId) return undefined as unknown as number[];
        const hubItem = gi.findById(focusHubId);
        const hm = hubItem?.getModel() as { x?: number; y?: number };
        if (!hm || typeof hm.x !== 'number' || typeof hm.y !== 'number') return undefined as unknown as number[];
        if (node.id === focusHubId) return [cx, cy, gravity];
        if (neighborsOfHub.has(node.id)) return [hm.x, hm.y, magneticG];
        return undefined as unknown as number[];
      },
      gravity,
      preventOverlap,
      collideStrength,
      nodeSpacing: 12,
      damping: perf ? 0.92 : 0.86,
      maxSpeed: perf ? 900 : 480,
      minMovement: perf ? 2.4 : 0.32,
      interval: perf ? 0.05 : 0.022,
      maxIteration: perf ? 700 : 4500,
      workerEnabled: false,
      animate: !perf,
    };
  }

  const g = new G6.Graph({
    container: containerRef.value!,
    width,
    height,
    pixelRatio,
    renderer: 'canvas',
    layout: buildDynamicGForceLayout(width, height),
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    },
    defaultNode: {
      type: 'circle',
      style: { lineWidth: 0 },
    },
    defaultEdge: {
      type: 'line',
      style: {
        stroke: 'rgba(148,163,184,0.35)',
        lineWidth: 1,
        endArrow: false,
      },
    },
    edgeStateStyles: {
      focus: {
        stroke: '#38bdf8',
        lineWidth: 2.2,
        shadowColor: 'rgba(56,189,248,0.45)',
        shadowBlur: 6,
      },
      dim: {
        stroke: 'rgba(51,65,85,0.22)',
        lineWidth: 0.6,
      },
      riskHot: {
        stroke: '#fb7185',
        lineWidth: 2.6,
        shadowColor: 'rgba(251,113,133,0.45)',
        shadowBlur: 8,
      },
    },
    nodeStateStyles: {
      selected: {
        shadowColor: '#a5b4fc',
        shadowBlur: 18,
      },
      dim: {
        opacity: 0.34,
        fillOpacity: 0.4,
      },
      riskHot: {
        shadowColor: '#fb7185',
        shadowBlur: 22,
      },
      riskPath: {
        shadowColor: '#fbbf24',
        shadowBlur: 12,
      },
    },
  });

  graphBox.instance = g;

  g.on('node:click', (ev: IG6GraphEvent) => {
    const item = ev.item;
    if (!item || item.getType?.() !== 'node') return;
    clearClickTimer();
    clickTimer = window.setTimeout(() => {
      clickTimer = null;
      const id = item.getID();
      const m = item.getModel() as unknown as GraphNodeModel;
      selectedId.value = id;
      treeHighlightKey.value = id;
      treeRef.value?.setCurrentKey?.(id);
      pushPayloadFromModel(m);
      g.getNodes().forEach((n) => g.clearItemStates(n, ['selected']));
      g.setItemState(item, 'selected', true);
      highlightNeighborhood(g, id, graphDataRef.value.edges);
      focusHubId = id;
      if (!performanceMode.value) {
        g.updateLayout(buildDynamicGForceLayout(g.get('width') as number, g.get('height') as number));
      }
      g.focusItem(item, true, {
        easing: 'easeCubic',
        duration: 400,
      });
    }, 280);
  });

  g.on('node:dblclick', (ev: IG6GraphEvent) => {
    const item = ev.item;
    if (!item || item.getType?.() !== 'node') return;
    clearClickTimer();
    const id = item.getID();
    expandNextLayer(g, id);
    focusHubId = id;
    if (!performanceMode.value) {
      g.updateLayout(buildDynamicGForceLayout(g.get('width') as number, g.get('height') as number));
    }
  });

  g.on('canvas:click', () => {
    clearClickTimer();
    selectedId.value = null;
    treeHighlightKey.value = null;
    aiStore.setDashboardGraphSelectedNode(null);
    g.getNodes().forEach((n) => g.clearItemStates(n, ['selected']));
    highlightNeighborhood(g, null, graphDataRef.value.edges);
    focusHubId = null;
    if (!performanceMode.value) {
      g.updateLayout(buildDynamicGForceLayout(g.get('width') as number, g.get('height') as number));
    }
  });

  g.on('node:mouseenter', (ev: IG6GraphEvent) => {
    const item = ev.item;
    if (!item || item.getType?.() !== 'node') return;
    const m = item.getModel() as unknown as GraphNodeModel;
    const wrap = containerRef.value?.getBoundingClientRect();
    const oe = ev.originalEvent as MouseEvent | undefined;
    if (!wrap || !oe) return;
    hoverTip.value = {
      x: oe.clientX - wrap.left + 10,
      y: oe.clientY - wrap.top - 10,
      label: m.label,
      entityType: m.entityType,
      entityLabel: entityTypeLabel(m.entityType),
      status: m.status,
      features: m.features ?? [],
      tier: m.tier,
      lotNo: m.lotNo,
      lineCode: m.lineCode,
      clusterCode: m.clusterCode,
      qcStatus: m.qcStatus,
      embeddingFamily: m.embeddingFamily,
    };
  });

  g.on('node:mouseleave', () => {
    hoverTip.value = null;
  });

  return { graph: g, buildLayout: buildDynamicGForceLayout };
}

let resizeObs: ResizeObserver | null = null;
let postLayoutFitTimer: ReturnType<typeof setTimeout> | null = null;
let stopPerformanceWatch: (() => void) | null = null;

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

  const { graph, buildLayout } = createGraph(w, h);
  graphRef.value = graph;
  buildLayoutRef.value = buildLayout;

  graph.data(initial as unknown as Parameters<InstanceType<typeof G6.Graph>['data']>[0]);
  graph.render();

  treeHighlightKey.value = cat.rootId;
  const rootModel = cat.nodesById.get(cat.rootId);
  if (rootModel) pushPayloadFromModel(rootModel);

  nextTick(() => {
    treeRef.value?.setCurrentKey?.(cat.rootId);
  });

  stopPerformanceWatch = watch(performanceMode, () => {
    const g = graphRef.value;
    const bl = buildLayoutRef.value;
    if (!g || g.get('destroyed') || !bl) return;
    g.updateLayout(bl(g.get('width') as number, g.get('height') as number));
  });

  requestAnimationFrame(() => {
    layoutPending.value = false;
  });

  postLayoutFitTimer = window.setTimeout(() => {
    postLayoutFitTimer = null;
    if (!graph.get('destroyed')) {
      graph.fitView(40);
    }
  }, 1200);

  resizeObs = new ResizeObserver(() => {
    const g = graphRef.value;
    const box = containerRef.value;
    if (!g || !box) return;
    const nw = box.clientWidth;
    const nh = box.clientHeight;
    if (nw < 10 || nh < 10) return;
    g.changeSize(nw, nh);
    g.updateLayout(buildLayout(nw, nh));
    g.fitView(36);
  });
  resizeObs.observe(el);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenState);
  document.removeEventListener('webkitfullscreenchange', syncFullscreenState as EventListener);

  clearClickTimer();
  stopPerformanceWatch?.();
  stopPerformanceWatch = null;
  buildLayoutRef.value = null;
  if (postLayoutFitTimer != null) {
    clearTimeout(postLayoutFitTimer);
    postLayoutFitTimer = null;
  }
  resizeObs?.disconnect();
  resizeObs = null;
  graphRef.value?.destroy();
  graphRef.value = null;
});
</script>

<style scoped>
.kg-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  margin-bottom: 56px;
  overflow: hidden;
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
  padding: 10px 12px 14px;
  background: #020617;
}

.kg-shell:-webkit-full-screen {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin-bottom: 0;
  box-sizing: border-box;
  padding: 10px 12px 14px;
  background: #020617;
}

.kg-shell:fullscreen .kg-main,
.kg-shell:-webkit-full-screen .kg-main {
  flex: 1;
  min-height: 0;
}

.kg-main {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 10px 12px 12px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(99, 102, 241, 0.22);
  box-sizing: border-box;
}

.kg-drawer-trigger {
  position: absolute;
  top: 50%;
  z-index: 35;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: 0 10px 10px 0;
  border: 1px solid rgba(99, 102, 241, 0.45);
  background: rgba(15, 23, 42, 0.92);
  color: #a5b4fc;
  font-size: 11px;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  transition: background 0.2s, border-color 0.2s;
}

.kg-drawer-trigger:hover {
  background: rgba(49, 46, 129, 0.55);
  border-color: #818cf8;
  color: #e0e7ff;
}

.kg-drawer-trigger--left {
  left: 0;
}

.kg-drawer-trigger--right {
  right: 0;
  border-radius: 10px 0 0 10px;
  flex-direction: row;
}

.kg-trigger-ico {
  font-size: 14px;
  font-weight: 700;
  opacity: 0.95;
}

.kg-trigger-txt {
  letter-spacing: 0.06em;
}

.kg-drawer {
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: min(300px, 88vw);
  z-index: 40;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.97);
  border: 1px solid rgba(99, 102, 241, 0.38);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  overflow: hidden;
}

.kg-drawer.is-open {
  pointer-events: auto;
}

.kg-drawer--left {
  left: 10px;
  transform: translateX(calc(-100% - 24px));
}

.kg-drawer--left.is-open {
  transform: translateX(0);
}

.kg-drawer--right {
  right: 10px;
  transform: translateX(calc(100% + 24px));
}

.kg-drawer--right.is-open {
  transform: translateX(0);
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

.kg-drawer-sub {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
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

.kg-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.kg-risk-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid rgba(251, 113, 133, 0.45);
  background: rgba(30, 41, 59, 0.9);
  color: #fda4af;
  transition: background 0.2s, border-color 0.2s;
}

.kg-risk-btn:hover {
  border-color: #fb7185;
  background: rgba(251, 113, 133, 0.12);
}

.kg-risk-btn.on {
  border-color: #fbbf24;
  color: #fde68a;
  background: rgba(251, 191, 36, 0.1);
}

.kg-fs-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid rgba(129, 140, 248, 0.45);
  background: rgba(30, 41, 59, 0.9);
  color: #c7d2fe;
  transition: background 0.2s, border-color 0.2s;
}

.kg-fs-btn:hover {
  border-color: #818cf8;
  background: rgba(99, 102, 241, 0.18);
  color: #e0e7ff;
}

.kg-fs-btn[aria-pressed='true'] {
  border-color: #a5b4fc;
  background: rgba(99, 102, 241, 0.22);
  color: #e0e7ff;
}

.kg-perf-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #cbd5e1;
  cursor: pointer;
  user-select: none;
}

.kg-perf-toggle input {
  accent-color: #818cf8;
}

.kg-toolbar-hint {
  font-size: 11px;
  color: #64748b;
  margin-left: auto;
}

.kg-container {
  flex: 1;
  min-height: 260px;
  width: 100%;
  border-radius: 8px;
  background: radial-gradient(ellipse 70% 55% at 50% 40%, rgba(30, 58, 138, 0.12), transparent 60%);
}

.kg-loading {
  position: absolute;
  inset: 0;
  top: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: 0.04em;
  pointer-events: none;
  background: rgba(2, 8, 23, 0.35);
  border-radius: 8px;
}

.kg-tooltip {
  position: absolute;
  z-index: 8;
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
