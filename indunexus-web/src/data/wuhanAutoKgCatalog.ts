/**
 * 将 docs/sql.md 产业实体 + §3.1 供应链行转为管理大屏力导向图目录（全量节点、多边有向边）
 */

import { WUHAN_COMPANY_ENTITIES, tierLabel, type WuhanTierCode } from './wuhanAutoKgEntities';
import { WUHAN_SUPPLY_CHAIN_ROWS } from './wuhanAutoKgSupply';

const ROOT_ID = 'WH-GRAPH-ROOT';
const TIER_IDS: Record<WuhanTierCode, string> = {
  up: 'WH-TIER-UP',
  mid: 'WH-TIER-MID',
  down: 'WH-TIER-DOWN',
  plat: 'WH-TIER-PLAT',
};

/** 供给对象名称 → 已在名录中的武汉实体（其余生成 WH-CUST-*） */
const TARGET_LABEL_TO_ENTITY: Record<string, string> = {
  东风汽车: 'WH-ENT-041',
  东风汽车集团有限公司: 'WH-ENT-041',
  东风系整车: 'WH-ENT-041',
  东风系主机厂: 'WH-ENT-041',
  东风系全系新能源车型: 'WH-ENT-041',
  东风乘用车: 'WH-ENT-041',
  神龙汽车: 'WH-ENT-042',
  东风本田: 'WH-ENT-043',
  东风本田汽车有限公司: 'WH-ENT-043',
  东风日产: 'WH-ENT-041',
  上汽通用: 'WH-ENT-044',
  上汽通用汽车武汉分公司: 'WH-ENT-044',
  /** §3.1 客户列「路特斯」均指向整车制造节点 */
  路特斯科技: 'WH-ENT-045',
  路特斯武汉工厂: 'WH-ENT-045',
  小鹏汽车: 'WH-ENT-046',
  小鹏汽车武汉基地: 'WH-ENT-046',
  岚图汽车: 'WH-ENT-047',
  恒信汽车集团: 'WH-ENT-048',
};

let custSeq = 0;
function customerNodeId(label: string, registry: Map<string, string>): string {
  const existing = registry.get(label);
  if (existing) return existing;
  custSeq += 1;
  const id = `WH-CUST-${String(custSeq).padStart(4, '0')}`;
  registry.set(label, id);
  return id;
}

function resolveTargetId(label: string, registry: Map<string, string>): string {
  const ent = TARGET_LABEL_TO_ENTITY[label.trim()];
  if (ent) return ent;
  return customerNodeId(label.trim(), registry);
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

export interface WuhanKgCatalogBundle {
  rootId: string;
  catalogTitle: string;
  nodesById: Map<string, Record<string, unknown>>;
  treeChildren: Map<string, string[]>;
  allEdges: Array<Record<string, unknown>>;
  treeData: Array<{ id: string; label: string; children?: Array<{ id: string; label: string; children?: unknown[] }> }>;
}

export function buildWuhanAutoKgCatalog(): WuhanKgCatalogBundle {
  custSeq = 0;
  const customerRegistry = new Map<string, string>();

  const nodesById = new Map<string, Record<string, unknown>>();
  const treeChildren = new Map<string, string[]>();
  const allEdges: Array<Record<string, unknown>> = [];
  let eid = 0;

  nodesById.set(ROOT_ID, {
    id: ROOT_ID,
    label: '武汉汽车零部件产业图谱',
    entityType: 'Part',
    kgType: 'root',
    type: 'dashboard-root',
    size: 72,
    status: 'in_stock',
    features: ['docs/sql.md', '目标二企业名录', '§3.1 供应链配套'],
  });

  const tierOrder: WuhanTierCode[] = ['up', 'mid', 'down', 'plat'];
  const rootTierChildren: string[] = [];

  for (const code of tierOrder) {
    const tid = TIER_IDS[code];
    rootTierChildren.push(tid);
    nodesById.set(tid, {
      id: tid,
      label: tierLabel(code),
      entityType: 'Part',
      kgType: 'part',
      type: 'dashboard-part',
      size: 52,
      status: 'in_stock',
      features: ['产业链层级', code === 'plat' ? '跃创统筹' : '结构导航'],
    });
    allEdges.push({
      id: `e-h-${eid++}`,
      source: ROOT_ID,
      target: tid,
      relType: 'MANUFACTURED_ON',
      style: edgeStyleForRelType('MANUFACTURED_ON'),
    });
  }
  treeChildren.set(ROOT_ID, rootTierChildren);

  for (const code of tierOrder) {
    const tid = TIER_IDS[code];
    const companies = WUHAN_COMPANY_ENTITIES.filter((c) => c.tierCode === code).map((c) => c.id);
    treeChildren.set(tid, companies);
    for (const cid of companies) {
      const co = WUHAN_COMPANY_ENTITIES.find((c) => c.id === cid)!;
      const feats = [
        co.segment,
        ...(co.businessContext ? [co.businessContext] : []),
        co.summaryLine,
      ];
      nodesById.set(cid, {
        id: cid,
        label: co.displayName,
        entityType: 'Supplier',
        kgType: 'supplier',
        type: 'dashboard-supplier',
        size: code === 'plat' ? 44 : 38,
        tier: co.seq,
        region: '湖北 · 武汉',
        supplierCode: cid,
        features: feats,
      });
      allEdges.push({
        id: `e-h-${eid++}`,
        source: tid,
        target: cid,
        relType: 'MANUFACTURED_ON',
        style: edgeStyleForRelType('MANUFACTURED_ON'),
      });
      treeChildren.set(cid, []);
    }
  }

  for (const row of WUHAN_SUPPLY_CHAIN_ROWS) {
    for (const rawLabel of row.targetLabels) {
      const tid = resolveTargetId(rawLabel, customerRegistry);
      if (!nodesById.has(tid)) {
        nodesById.set(tid, {
          id: tid,
          label: rawLabel,
          entityType: 'Supplier',
          kgType: 'supplier',
          type: 'dashboard-supplier',
          size: 34,
          supplierCode: tid,
          features: ['供给对象 / 市场', '来自 §3.1'],
        });
        treeChildren.set(tid, []);
      }
      allEdges.push({
        id: `e-s-${eid++}`,
        source: row.supplierEntityId,
        target: tid,
        relType: 'SUPPLIES',
        score: 0.85,
        style: edgeStyleForRelType('SUPPLIES'),
        metadata: { product: row.product, mode: row.mode },
      });
    }
  }

  function toTree(id: string): { id: string; label: string; children?: ReturnType<typeof toTree>[] } {
    const n = nodesById.get(id)!;
    const ch = treeChildren.get(id) ?? [];
    return {
      id,
      label: String(n.label),
      children: ch.length ? ch.map(toTree) : undefined,
    };
  }

  return {
    rootId: ROOT_ID,
    catalogTitle: '武汉汽车产业链 · 知识图谱',
    nodesById,
    treeChildren,
    allEdges,
    treeData: [toTree(ROOT_ID)],
  };
}
