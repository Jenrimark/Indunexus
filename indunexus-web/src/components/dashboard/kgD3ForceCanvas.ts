/**
 * d3-force + HTML5 Canvas：工业知识图谱渲染（Obsidian 式力学思路）。
 */
import { drag } from 'd3-drag';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
} from 'd3-force';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomTransform } from 'd3-zoom';

export interface KgD3Node extends SimulationNodeDatum {
  id: string;
  label: string;
  entityType: string;
  type: string;
  size?: number;
  imgUrl?: string;
  status?: string;
  features?: string[];
  tier?: number;
  lotNo?: string;
  lineCode?: string;
  clusterCode?: string;
  qcStatus?: string;
  embeddingFamily?: string;
}

export interface KgD3Edge {
  id: string;
  source: string | KgD3Node;
  target: string | KgD3Node;
  relType?: string;
}

/** 控制台可调：视觉 */
export interface KgD3VisualTuning {
  /** 0–1，节点外显式标题透明度（圆点下方） */
  labelOpacity: number;
  /** 约 0.55–2，节点几何缩放 */
  nodeSizeScale: number;
  /** 约 0.5–3，连线线宽倍率 */
  linkWidthScale: number;
}

/** 控制台可调：力学 */
export interface KgD3PhysicsTuning {
  /** 0–1，映射为向心（forceX/Y）强度 */
  centerStrength: number;
  /** 约 0.35–2，斥力相对默认 -420 的倍率 */
  repulsionScale: number;
  /** 约 0.25–1.5，连线弹簧强度倍率 */
  linkStrengthScale: number;
  /** 约 36–140 px，非聚焦时连线目标长度基值 */
  linkDistanceBase: number;
}

export interface KgD3GraphTuning extends KgD3VisualTuning, KgD3PhysicsTuning {}

export const DEFAULT_KG_D3_TUNING: KgD3GraphTuning = {
  labelOpacity: 0.72,
  nodeSizeScale: 1,
  linkWidthScale: 1,
  centerStrength: 0.42,
  repulsionScale: 1,
  linkStrengthScale: 1,
  linkDistanceBase: 72,
};

export interface KgD3MountOptions {
  /** 单击聚焦的枢纽：影响斥力与边距 */
  getFocusHubId: () => string | null;
  /** 图谱控制台：视觉 + 力学 */
  getTuning: () => KgD3GraphTuning;
  onNodeClick: (id: string, model: KgD3Node) => void;
  onNodeDblClick: (id: string) => void;
  onCanvasClick: () => void;
  onHover: (
    model: KgD3Node | null,
    clientPos: { x: number; y: number } | null,
  ) => void;
}

export interface KgD3Api {
  destroy(): void;
  setData(nodes: KgD3Node[], edges: KgD3Edge[]): void;
  changeSize(width: number, height: number): void;
  /** 枢纽变化后重算斥力/边劲度（单击聚焦邻域） */
  refreshForces(): void;
  /** 控制台参数变更：力学变化会重启仿真，仅视觉则重绘 */
  applyTuning(): void;
  /** 重新播放力导向收敛动画 */
  playLayoutAnimation(): void;
  focusOnNode(id: string): void;
  setHighlightCenter(id: string | null, edgeList: KgD3Edge[]): void;
  setRiskMode(
    active: boolean,
    ctx: {
      rootId: string;
      keepIds: Set<string>;
      nodesById: Map<string, KgD3Node>;
    } | null,
  ): void;
}

function edgeStroke(relType: string | undefined): string {
  switch (relType) {
    case 'MATCHES':
      return 'rgba(251, 113, 133, 0.88)';
    case 'MANUFACTURED_ON':
      return 'rgba(56, 189, 248, 0.78)';
    case 'SUPPLIES':
      return 'rgba(129, 140, 248, 0.62)';
    default:
      return 'rgba(148, 163, 184, 0.35)';
  }
}

function statusRingColor(status: string | undefined): string {
  switch (status) {
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

function nodeRadius(n: KgD3Node, sizeScale: number): number {
  return ((n.size ?? 48) / 2 + 3) * sizeScale;
}

function buildAdjacency(edges: KgD3Edge[]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!m.has(a)) m.set(a, new Set());
    if (!m.has(b)) m.set(b, new Set());
    m.get(a)!.add(b);
    m.get(b)!.add(a);
  };
  for (const e of edges) {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    add(s, t);
  }
  return m;
}

function twoHopBall(centerId: string | null, edges: KgD3Edge[]): Set<string> | null {
  if (!centerId) return null;
  const adj = buildAdjacency(edges);
  const ball = new Set<string>([centerId]);
  const dist = new Map<string, number>([[centerId, 0]]);
  const q: string[] = [centerId];
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

export function mountKgD3ForceCanvas(
  container: HTMLElement,
  options: KgD3MountOptions,
): KgD3Api {
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const imgCache = new Map<string, HTMLImageElement | 'loading' | 'error'>();

  let width = 0;
  let height = 0;
  let dpr = 1;

  let nodes: KgD3Node[] = [];
  let edges: KgD3Edge[] = [];
  let simulation: Simulation<KgD3Node, KgD3Edge> | null = null;

  let transform: ZoomTransform = zoomIdentity;
  let highlightCenter: string | null = null;
  let highlightEdges: KgD3Edge[] = [];

  let riskActive = false;
  let riskRootId: string | null = null;
  let riskKeep: Set<string> | null = null;
  let riskAbnormal: Set<string> | null = null;

  let draggingId: string | null = null;
  let clickTimer: ReturnType<typeof setTimeout> | null = null;

  let lastPhysicsKey = '';

  function tuning(): KgD3GraphTuning {
    return options.getTuning();
  }

  function physicsKey(t: KgD3GraphTuning): string {
    return `${t.centerStrength}|${t.repulsionScale}|${t.linkStrengthScale}|${t.linkDistanceBase}`;
  }

  function loadThumb(url: string): void {
    if (!url || imgCache.has(url)) return;
    imgCache.set(url, 'loading');
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => {
      imgCache.set(url, im);
      tickDraw();
    };
    im.onerror = () => {
      imgCache.set(url, 'error');
      tickDraw();
    };
    im.src = url;
  }

  function resizeCanvas(): void {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tickDraw();
  }

  function screenToGraph(px: number, py: number): { x: number; y: number } {
    return {
      x: (px - transform.x) / transform.k,
      y: (py - transform.y) / transform.k,
    };
  }

  function pickNode(x: number, y: number): KgD3Node | null {
    const tu = tuning();
    let best: KgD3Node | null = null;
    let bestD = Infinity;
    for (const n of nodes) {
      const nx = n.x ?? 0;
      const ny = n.y ?? 0;
      const r = nodeRadius(n, tu.nodeSizeScale);
      const d = Math.hypot(x - nx, y - ny);
      if (d <= r && d < bestD) {
        bestD = d;
        best = n;
      }
    }
    return best;
  }

  function restartSimulation(): void {
    simulation?.stop();
    if (nodes.length === 0) {
      simulation = null;
      tickDraw();
      return;
    }

    const cx = width / 2;
    const cy = height / 2;
    const hub = options.getFocusHubId();
    const adj = hub ? buildAdjacency(edges) : null;
    const neigh = hub && adj ? adj.get(hub) ?? new Set<string>() : null;

    const tu = tuning();
    lastPhysicsKey = physicsKey(tu);
    const baseLen = tu.linkDistanceBase;

    const linkDist = (e: KgD3Edge) => {
      if (!hub || !neigh) return baseLen;
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      const tight =
        (s === hub && neigh.has(t)) || (t === hub && neigh.has(s));
      return tight ? Math.max(14, baseLen * 0.39) : baseLen;
    };

    const charge = (d: KgD3Node) => {
      const base = -420 * tu.repulsionScale;
      if (!hub || !neigh) return base;
      if (d.id === hub || neigh.has(d.id)) return base;
      return base * 1.35;
    };

    const centerPull = 0.02 + tu.centerStrength * 0.2;

    simulation = forceSimulation<KgD3Node>(nodes)
      .force(
        'link',
        forceLink<KgD3Node, KgD3Edge>(edges)
          .id((d) => d.id)
          .distance(linkDist)
          .strength((e) => {
            const mul = tu.linkStrengthScale;
            if (!hub || !neigh) return 0.35 * mul;
            const s = typeof e.source === 'object' ? e.source.id : e.source;
            const t = typeof e.target === 'object' ? e.target.id : e.target;
            const tight =
              (s === hub && neigh.has(t)) || (t === hub && neigh.has(s));
            return (tight ? 0.95 : 0.35) * mul;
          }),
      )
      .force('charge', forceManyBody<KgD3Node>().strength(charge))
      .force('x', forceX(cx).strength(centerPull))
      .force('y', forceY(cy).strength(centerPull))
      .force(
        'collide',
        forceCollide<KgD3Node>()
          .radius((d) => nodeRadius(d, tu.nodeSizeScale) + 6)
          .strength(0.85),
      )
      .alphaDecay(0.022)
      .velocityDecay(0.6);

    simulation.on('tick', tickDraw);

    for (const n of nodes) {
      if (n.imgUrl) loadThumb(n.imgUrl);
    }
  }

  function tickDraw(): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * transform.k, 0, 0, dpr * transform.k, dpr * transform.x, dpr * transform.y);

    const ball = twoHopBall(highlightCenter, highlightEdges);
    const tu = tuning();
    const lwScale = tu.linkWidthScale;

    for (const e of edges) {
      const s = e.source as KgD3Node;
      const t = e.target as KgD3Node;
      const sx = s.x ?? 0;
      const sy = s.y ?? 0;
      const tx = t.x ?? 0;
      const ty = t.y ?? 0;

      let alpha = 1;
      let lw = 1.1 * lwScale;
      let stroke = edgeStroke(e.relType);

      if (ball) {
        const inBall = ball.has(s.id) && ball.has(t.id);
        if (!inBall) {
          alpha = 0.2;
          lw = 0.7 * lwScale;
        } else {
          lw = 2 * lwScale;
        }
      }

      if (riskActive && riskKeep && riskAbnormal) {
        const vis = riskKeep.has(s.id) && riskKeep.has(t.id);
        if (!vis) {
          alpha *= 0.08;
        } else {
          const hot =
            riskAbnormal.has(s.id) ||
            riskAbnormal.has(t.id) ||
            (riskRootId != null && (s.id === riskRootId || t.id === riskRootId));
          if (hot) {
            stroke = 'rgba(251, 113, 133, 0.92)';
            lw = Math.max(lw, 2.2 * lwScale);
          }
        }
      }

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(0.35, lw);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    for (const n of nodes) {
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      const r = nodeRadius(n, tu.nodeSizeScale);

      let alpha = 1;
      if (ball && !ball.has(n.id)) alpha = 0.28;

      if (riskActive && riskKeep && !riskKeep.has(n.id)) {
        alpha *= 0.12;
      }

      ctx.globalAlpha = alpha;

      const drawCaption = (text: string, fontSize: number, fill: string) => {
        if (tu.labelOpacity < 0.03) return;
        ctx.save();
        ctx.globalAlpha = alpha * tu.labelOpacity;
        ctx.font = `500 ${fontSize}px system-ui,sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const cap = text.length > 16 ? `${text.slice(0, 15)}…` : text;
        ctx.fillStyle = fill;
        ctx.fillText(cap, x, y + r + 6);
        ctx.restore();
      };

      if (n.type === 'dashboard-inspection-lot') {
        const w = r * 2.1;
        const h = r * 1.05;
        ctx.fillStyle = 'rgba(15,23,42,0.94)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        roundRect(ctx, x - w / 2, y - h / 2, w, h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '600 9px system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((n.lotNo || 'LOT').slice(0, 12), x, y - 3);
        ctx.fillStyle = '#64748b';
        ctx.font = '8px system-ui,sans-serif';
        ctx.fillText('批次', x, y + 8);
        drawCaption(n.label, 9, '#94a3b8');
        continue;
      }

      if (n.type === 'dashboard-visual-cluster') {
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r * 0.92, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r * 0.92, y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(30,41,59,0.96)';
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 2.2;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fecdd3';
        ctx.font = '700 10px system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((n.clusterCode || 'VC').slice(0, 8), x, y);
        drawCaption(n.label, 9, '#cbd5e1');
        continue;
      }

      if (n.type === 'dashboard-supplier') {
        ctx.beginPath();
        ctx.arc(x, y, r - 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30,41,59,0.95)';
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#c7d2fe';
        ctx.font = '600 12px system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((n.label || '供').slice(0, 2), x, y);
        drawCaption(n.label, 9, '#a5b4fc');
        continue;
      }

      const ring = statusRingColor(n.status);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = ring;
      ctx.lineWidth = n.type === 'dashboard-root' ? 4 : 3;
      ctx.fill();
      ctx.stroke();

      const innerR = r - 5;
      const url = n.imgUrl;
      const im = url ? imgCache.get(url) : null;
      if (im && im !== 'loading' && im !== 'error') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, innerR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(im, x - innerR, y - innerR, innerR * 2, innerR * 2);
        ctx.restore();
      } else {
        ctx.fillStyle = 'rgba(51,65,85,0.9)';
        ctx.beginPath();
        ctx.arc(x, y, innerR * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }

      drawCaption(n.label, 10, '#cbd5e1');
    }

  }

  function roundRect(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    rad: number,
  ): void {
    const r = Math.min(rad, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  const zoomBehav = zoom<HTMLCanvasElement, unknown>()
    .scaleExtent([0.08, 5])
    .filter((ev) => {
      const typ = ev.type;
      if (typ === 'dblclick') return false;
      if (typ === 'wheel') return true;
      if (typ !== 'mousedown') return false;
      const me = ev as MouseEvent;
      if (me.button !== 0) return false;
      const rect = canvas.getBoundingClientRect();
      const px = me.clientX - rect.left;
      const py = me.clientY - rect.top;
      const g = screenToGraph(px, py);
      return pickNode(g.x, g.y) === null;
    })
    .on('zoom', (ev) => {
      transform = ev.transform;
      tickDraw();
    });

  select(canvas).call(zoomBehav as never);

  const dragBehav = drag<HTMLCanvasElement, KgD3Node, KgD3Node | undefined>()
    .subject((event) => {
      const src = (event.sourceEvent ?? event) as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      const px = src.clientX - rect.left;
      const py = src.clientY - rect.top;
      const { x, y } = screenToGraph(px, py);
      const n = pickNode(x, y);
      if (!n) return undefined;
      return n;
    })
    .on('start', (event) => {
      if (!event.subject) return;
      draggingId = event.subject.id;
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      simulation?.alphaTarget(0.35).restart();
    })
    .on('drag', (event) => {
      if (!event.subject) return;
      const src = (event.sourceEvent ?? event) as MouseEvent;
      const rect = canvas.getBoundingClientRect();
      const px = src.clientX - rect.left;
      const py = src.clientY - rect.top;
      const g = screenToGraph(px, py);
      event.subject.fx = g.x;
      event.subject.fy = g.y;
    })
    .on('end', (event) => {
      draggingId = null;
      if (!event.subject) return;
      event.subject.fx = null;
      event.subject.fy = null;
      simulation?.alphaTarget(0);
    });

  select(canvas).call(dragBehav as never);

  canvas.addEventListener('mousemove', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const g = screenToGraph(px, py);
    const n = pickNode(g.x, g.y);
    options.onHover(n, n ? { x: ev.clientX - rect.left, y: ev.clientY - rect.top } : null);
  });

  canvas.addEventListener('mouseleave', () => {
    options.onHover(null, null);
  });

  canvas.addEventListener('click', (ev) => {
    if (draggingId) return;
    const rect = canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const g = screenToGraph(px, py);
    const n = pickNode(g.x, g.y);
    if (!n) {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      options.onCanvasClick();
      return;
    }

    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    clickTimer = window.setTimeout(() => {
      clickTimer = null;
      options.onNodeClick(n.id, n);
    }, 280);
  });

  canvas.addEventListener('dblclick', (ev) => {
    ev.preventDefault();
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    const rect = canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const g = screenToGraph(px, py);
    const n = pickNode(g.x, g.y);
    if (n) options.onNodeDblClick(n.id);
  });

  const api: KgD3Api = {
    destroy() {
      simulation?.stop();
      simulation = null;
      select(canvas).on('.zoom', null);
      select(canvas).on('.drag', null);
      canvas.remove();
    },
    setData(nextNodes, nextEdges) {
      const prev = new Map(nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
      nodes = nextNodes.map((n) => {
        const p = prev.get(n.id);
        return {
          ...n,
          x:
            p?.x ??
            n.x ??
            width / 2 + (Math.random() - 0.5) * 40,
          y:
            p?.y ??
            n.y ??
            height / 2 + (Math.random() - 0.5) * 40,
        };
      });
      edges = nextEdges.map((e) => ({ ...e }));
      restartSimulation();
    },
    changeSize(w: number, h: number) {
      width = w;
      height = h;
      resizeCanvas();
      restartSimulation();
    },
    refreshForces() {
      restartSimulation();
    },
    applyTuning() {
      const t = tuning();
      const pk = physicsKey(t);
      if (nodes.length === 0) {
        tickDraw();
        return;
      }
      if (pk !== lastPhysicsKey) {
        restartSimulation();
      } else {
        tickDraw();
      }
    },
    playLayoutAnimation() {
      simulation?.alpha(1).alphaTarget(0).restart();
    },
    focusOnNode(id: string) {
      const n = nodes.find((x) => x.id === id);
      if (!n || width < 1 || height < 1) return;
      const nx = n.x ?? width / 2;
      const ny = n.y ?? height / 2;
      const tx = width / 2 - nx * transform.k;
      const ty = height / 2 - ny * transform.k;
      transform = zoomIdentity.translate(tx, ty).scale(transform.k);
      tickDraw();
    },
    setHighlightCenter(id, edgeList) {
      highlightCenter = id;
      highlightEdges = edgeList;
      tickDraw();
    },
    setRiskMode(active, ctx) {
      riskActive = active;
      if (!active || !ctx) {
        riskRootId = null;
        riskKeep = null;
        riskAbnormal = null;
      } else {
        riskRootId = ctx.rootId;
        riskKeep = ctx.keepIds;
        riskAbnormal = new Set<string>();
        for (const id of ctx.keepIds) {
          const m = ctx.nodesById.get(id);
          if (m?.entityType === 'Part' && m.status && m.status !== 'in_stock') {
            riskAbnormal.add(id);
          }
        }
      }
      tickDraw();
    },
  };

  return api;
}
