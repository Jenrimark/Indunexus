// Feature: ai-analysis-page
// Mock functions for AI analysis pipeline — no real backend required

import type {
  FullRecognitionResult,
  SupplyChainData,
  KnowledgeGraphData,
  DecisionReport,
  WearLevel,
  Recommendation,
} from '../types/aiAnalysis';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Static Part Catalogue ───────────────────────────────────────────────────

interface PartTemplate {
  category: string;
  sub_category: string;
  specs: Record<string, string>;
  part_id: string;
  part_name: string;
  part_number: string;
  features: string[];
}

const PART_TEMPLATES: PartTemplate[] = [
  {
    category: '传动零件',
    sub_category: '标准直齿轮',
    specs: { modulus: 'M2', material: '45号钢', dimensions: 'Φ60×20mm', teeth: '30T', hardness: 'HRC45-50' },
    part_id: 'GEAR-001',
    part_name: '标准直齿轮',
    part_number: 'GR-M2-30T-60',
    features: ['模数M2', '30齿', '渐开线齿形', '精度等级7级'],
  },
  {
    category: '传动零件',
    sub_category: '斜齿轮',
    specs: { modulus: 'M3', material: '20CrMnTi', dimensions: 'Φ90×30mm', teeth: '24T', helix_angle: '15°' },
    part_id: 'GEAR-002',
    part_name: '斜齿圆柱齿轮',
    part_number: 'GR-M3-24T-90H',
    features: ['模数M3', '24齿', '螺旋角15°', '渗碳淬火'],
  },
  {
    category: '轴承',
    sub_category: '深沟球轴承',
    specs: { inner_diameter: '25mm', outer_diameter: '52mm', width: '15mm', material: 'GCr15', load_rating: '14kN' },
    part_id: 'BRG-001',
    part_name: '深沟球轴承',
    part_number: '6205-2RS',
    features: ['内径25mm', '外径52mm', '双面密封', '脂润滑'],
  },
  {
    category: '轴承',
    sub_category: '圆锥滚子轴承',
    specs: { inner_diameter: '40mm', outer_diameter: '80mm', width: '18mm', material: 'GCr15SiMn', contact_angle: '15°' },
    part_id: 'BRG-002',
    part_name: '圆锥滚子轴承',
    part_number: '30208',
    features: ['内径40mm', '外径80mm', '接触角15°', '可分离型'],
  },
  {
    category: '传动零件',
    sub_category: '滚子链',
    specs: { pitch: '12.7mm', roller_diameter: '7.92mm', material: '碳钢', tensile_strength: '17.8kN', standard: 'ISO 606' },
    part_id: 'CHN-001',
    part_name: '08B单排滚子链',
    part_number: 'CHN-08B-1-100L',
    features: ['节距12.7mm', '单排', '100节', 'ISO 606标准'],
  },
  {
    category: '传动零件',
    sub_category: '同步带',
    specs: { pitch: 'HTD-5M', width: '25mm', length: '500mm', material: '氯丁橡胶+玻璃纤维', teeth: '100T' },
    part_id: 'BLT-001',
    part_name: 'HTD同步带',
    part_number: 'HTD-500-5M-25',
    features: ['HTD齿形', '节距5mm', '宽25mm', '100齿'],
  },
  {
    category: '紧固件',
    sub_category: '六角螺栓',
    specs: { thread: 'M12×1.75', length: '60mm', material: '10.9级合金钢', surface: '达克罗', standard: 'GB/T 5782' },
    part_id: 'BOLT-001',
    part_name: '高强度六角螺栓',
    part_number: 'BOLT-M12-60-10.9',
    features: ['M12螺纹', '60mm长', '10.9级', '达克罗涂层'],
  },
  {
    category: '密封件',
    sub_category: '骨架油封',
    specs: { inner_diameter: '35mm', outer_diameter: '55mm', width: '10mm', material: '丁腈橡胶', lip_type: '单唇' },
    part_id: 'SEAL-001',
    part_name: '骨架旋转轴唇形密封圈',
    part_number: 'TC-35×55×10-NBR',
    features: ['内径35mm', '外径55mm', '丁腈橡胶', '单唇带弹簧'],
  },
];

// ─── Alternative Parts Pool ──────────────────────────────────────────────────

const ALTERNATIVE_POOL = [
  { part_id: 'ALT-001', part_name: '精密直齿轮', part_number: 'GR-M2-30T-P6', confidence: 0, matched_features: ['模数M2', '30齿'] },
  { part_id: 'ALT-002', part_name: '铸铁直齿轮', part_number: 'GR-M2-30T-CI', confidence: 0, matched_features: ['模数M2', '渐开线齿形'] },
  { part_id: 'ALT-003', part_name: '不锈钢直齿轮', part_number: 'GR-M2-30T-SS', confidence: 0, matched_features: ['模数M2', '30齿', '耐腐蚀'] },
  { part_id: 'ALT-004', part_name: '深沟球轴承(开式)', part_number: '6205', confidence: 0, matched_features: ['内径25mm', '外径52mm'] },
  { part_id: 'ALT-005', part_name: '角接触球轴承', part_number: '7205B', confidence: 0, matched_features: ['内径25mm', '外径52mm', '角接触'] },
  { part_id: 'ALT-006', part_name: '双排滚子链', part_number: 'CHN-08B-2-100L', confidence: 0, matched_features: ['节距12.7mm', '双排'] },
  { part_id: 'ALT-007', part_name: '不锈钢滚子链', part_number: 'CHN-08B-SS-100L', confidence: 0, matched_features: ['节距12.7mm', '耐腐蚀'] },
];

// ─── Supply Chain Data Pool ──────────────────────────────────────────────────

const SUPPLY_CHAIN_POOL: Record<string, Omit<SupplyChainData, 'partId'>> = {
  'GEAR-001': { stock: 1240, priceRange: { min: 45, max: 88, currency: 'CNY' }, leadTimeDays: 3 },
  'GEAR-002': { stock: 380, priceRange: { min: 120, max: 210, currency: 'CNY' }, leadTimeDays: 5 },
  'BRG-001':  { stock: 5600, priceRange: { min: 18, max: 35, currency: 'CNY' }, leadTimeDays: 1 },
  'BRG-002':  { stock: 2100, priceRange: { min: 55, max: 95, currency: 'CNY' }, leadTimeDays: 2 },
  'CHN-001':  { stock: 890, priceRange: { min: 68, max: 120, currency: 'CNY' }, leadTimeDays: 3 },
  'BLT-001':  { stock: 430, priceRange: { min: 32, max: 58, currency: 'CNY' }, leadTimeDays: 4 },
  'BOLT-001': { stock: 12000, priceRange: { min: 2, max: 5, currency: 'CNY' }, leadTimeDays: 1 },
  'SEAL-001': { stock: 3200, priceRange: { min: 8, max: 22, currency: 'CNY' }, leadTimeDays: 2 },
};

// ─── Knowledge Graph Data Pool ───────────────────────────────────────────────

const KNOWLEDGE_GRAPH_POOL: Record<string, Omit<KnowledgeGraphData, never>> = {
  'GEAR-001': {
    classificationPath: ['机械零件', '传动零件', '齿轮', '圆柱齿轮', '直齿轮'],
    relatedParts: [
      { partId: 'GEAR-002', partName: '斜齿圆柱齿轮', partNumber: 'GR-M3-24T-90H' },
      { partId: 'CHN-001', partName: '08B单排滚子链', partNumber: 'CHN-08B-1-100L' },
      { partId: 'BRG-001', partName: '深沟球轴承', partNumber: '6205-2RS' },
    ],
    alternatives: [
      { partId: 'ALT-001', partName: '精密直齿轮', partNumber: 'GR-M2-30T-P6', reason: '精度等级更高（6级），适用于高速传动场景' },
      { partId: 'ALT-002', partName: '铸铁直齿轮', partNumber: 'GR-M2-30T-CI', reason: '成本降低约40%，适用于低速轻载场景' },
      { partId: 'ALT-003', partName: '不锈钢直齿轮', partNumber: 'GR-M2-30T-SS', reason: '耐腐蚀性强，适用于食品/化工行业' },
    ],
  },
  'BRG-001': {
    classificationPath: ['机械零件', '轴承', '滚动轴承', '球轴承', '深沟球轴承'],
    relatedParts: [
      { partId: 'SEAL-001', partName: '骨架旋转轴唇形密封圈', partNumber: 'TC-35×55×10-NBR' },
      { partId: 'BRG-002', partName: '圆锥滚子轴承', partNumber: '30208' },
      { partId: 'BOLT-001', partName: '高强度六角螺栓', partNumber: 'BOLT-M12-60-10.9' },
    ],
    alternatives: [
      { partId: 'ALT-004', partName: '深沟球轴承(开式)', partNumber: '6205', reason: '无密封盖，适用于有外部润滑系统的场合' },
      { partId: 'ALT-005', partName: '角接触球轴承', partNumber: '7205B', reason: '可承受轴向载荷，适用于高速主轴' },
    ],
  },
  'CHN-001': {
    classificationPath: ['机械零件', '传动零件', '链传动', '滚子链', '单排链'],
    relatedParts: [
      { partId: 'GEAR-001', partName: '标准直齿轮', partNumber: 'GR-M2-30T-60' },
      { partId: 'BLT-001', partName: 'HTD同步带', partNumber: 'HTD-500-5M-25' },
    ],
    alternatives: [
      { partId: 'ALT-006', partName: '双排滚子链', partNumber: 'CHN-08B-2-100L', reason: '承载能力提升约1.8倍，适用于重载场景' },
      { partId: 'ALT-007', partName: '不锈钢滚子链', partNumber: 'CHN-08B-SS-100L', reason: '耐腐蚀，适用于潮湿/化学品环境' },
    ],
  },
};

// ─── Supplier Pool ───────────────────────────────────────────────────────────

const SUPPLIER_POOL = [
  { name: '上海精密传动有限公司', rating: 4.8, price: 0, currency: 'CNY', leadTimeDays: 3 },
  { name: '浙江万向机械集团', rating: 4.6, price: 0, currency: 'CNY', leadTimeDays: 5 },
  { name: '广州南方轴承制造厂', rating: 4.5, price: 0, currency: 'CNY', leadTimeDays: 4 },
  { name: '江苏恒力传动科技', rating: 4.3, price: 0, currency: 'CNY', leadTimeDays: 7 },
  { name: '北京中航精工零件', rating: 4.7, price: 0, currency: 'CNY', leadTimeDays: 2 },
];

// ─── Wear Level Logic ─────────────────────────────────────────────────────────

function inferWearLevel(confidence: number): WearLevel {
  if (confidence >= 0.85) return 'normal';
  if (confidence >= 0.70) return 'light';
  if (confidence >= 0.55) return 'moderate';
  return 'severe';
}

function inferRecommendation(wearLevel: WearLevel): Recommendation {
  const map: Record<WearLevel, Recommendation> = {
    normal: 'continue',
    light: 'plan_repair',
    moderate: 'immediate_repair',
    severe: 'replace',
  };
  return map[wearLevel];
}

// ─── Mock Functions ───────────────────────────────────────────────────────────

/**
 * 模拟 AI 图像识别，延迟 1.5-2.5s，返回真实感工业零件识别结果。
 */
export async function mockRecognize(imageDataUrl: string): Promise<FullRecognitionResult> {
  // imageDataUrl is accepted but not used — mock always returns deterministic data
  void imageDataUrl;

  await delay(randomInt(1500, 2500));

  const template = PART_TEMPLATES[randomInt(0, PART_TEMPLATES.length - 1)] as PartTemplate;
  const confidence = randomFloat(0.55, 0.98);

  // Build up to 5 alternatives with descending confidence
  const altCount = randomInt(2, 5);
  const shuffled = [...ALTERNATIVE_POOL].sort(() => Math.random() - 0.5).slice(0, altCount);
  let altConfidence = confidence - randomFloat(0.05, 0.12);
  const alternatives = shuffled.map((alt) => {
    const c = Math.max(0.30, Math.round(altConfidence * 100) / 100);
    altConfidence -= randomFloat(0.03, 0.08);
    return { ...alt, confidence: c };
  });

  return {
    category: template.category,
    sub_category: template.sub_category,
    specs: template.specs,
    confidence,
    alternatives,
  };
}

/**
 * 模拟供应链查询，返回库存数量、报价区间（人民币）、货期。
 *
 * 特殊 partId：
 *   'error_5xx'     → 抛出 { status: 500, message: 'Internal Server Error' }
 *   'error_timeout' → 延迟 35s（模拟超时）
 */
export async function mockQuerySupplyChain(partId: string): Promise<SupplyChainData> {
  if (partId === 'error_5xx') {
    throw { status: 500, message: 'Internal Server Error' };
  }
  if (partId === 'error_timeout') {
    await delay(35000);
  }

  await delay(randomInt(300, 800));

  const base = SUPPLY_CHAIN_POOL[partId] ?? {
    stock: randomInt(50, 3000),
    priceRange: { min: randomInt(10, 200), max: 0, currency: 'CNY' },
    leadTimeDays: randomInt(1, 14),
  };

  // Ensure max > min when generated randomly
  if (base.priceRange.max === 0) {
    (base.priceRange as { min: number; max: number; currency: string }).max =
      base.priceRange.min + randomInt(20, 150);
  }

  return { partId, ...base };
}

/**
 * 模拟知识图谱查询，返回分类路径、关联零件（≤3）、替代零件（≤3，含原因）。
 *
 * 特殊 partId：
 *   'error_5xx'     → 抛出 { status: 500, message: 'Internal Server Error' }
 *   'error_timeout' → 延迟 35s（模拟超时）
 */
export async function mockQueryKnowledgeGraph(partId: string): Promise<KnowledgeGraphData> {
  if (partId === 'error_5xx') {
    throw { status: 500, message: 'Internal Server Error' };
  }
  if (partId === 'error_timeout') {
    await delay(35000);
  }

  await delay(randomInt(200, 600));

  if (KNOWLEDGE_GRAPH_POOL[partId]) {
    return KNOWLEDGE_GRAPH_POOL[partId];
  }

  // Fallback: generate generic knowledge graph data
  const template = (PART_TEMPLATES.find((t) => t.part_id === partId) ?? PART_TEMPLATES[0]) as PartTemplate;
  return {
    classificationPath: ['机械零件', template.category, template.sub_category],
    relatedParts: PART_TEMPLATES.filter((t) => t.part_id !== partId)
      .slice(0, 3)
      .map((t) => ({ partId: t.part_id, partName: t.part_name, partNumber: t.part_number })),
    alternatives: [
      {
        partId: 'ALT-001',
        partName: '精密直齿轮',
        partNumber: 'GR-M2-30T-P6',
        reason: '精度等级更高（6级），适用于高速传动场景',
      },
      {
        partId: 'ALT-002',
        partName: '铸铁直齿轮',
        partNumber: 'GR-M2-30T-CI',
        reason: '成本降低约40%，适用于低速轻载场景',
      },
    ],
  };
}

/**
 * 模拟决策引擎，根据 confidence 推断磨损等级，返回处置建议和推荐供应商（≤3家）。
 *
 * 特殊 partId：
 *   'error_5xx'     → 抛出 { status: 500, message: 'Internal Server Error' }
 *   'error_timeout' → 延迟 35s（模拟超时）
 */
export async function mockRunDecisionEngine(
  partId: string,
  confidence: number,
): Promise<DecisionReport> {
  if (partId === 'error_5xx') {
    throw { status: 500, message: 'Internal Server Error' };
  }
  if (partId === 'error_timeout') {
    await delay(35000);
  }

  await delay(randomInt(400, 900));

  const wearLevel = inferWearLevel(confidence);
  const recommendation = inferRecommendation(wearLevel);

  // Pick up to 3 suppliers and assign prices based on supply chain data
  const supplyBase = SUPPLY_CHAIN_POOL[partId];
  const basePrice = supplyBase
    ? Math.round((supplyBase.priceRange.min + supplyBase.priceRange.max) / 2)
    : randomInt(30, 300);

  const supplierCount = randomInt(1, 3);
  const suppliers = SUPPLIER_POOL.slice(0, supplierCount).map((s, i) => ({
    ...s,
    price: Math.round(basePrice * (1 + i * 0.08)),
  }));

  return { wearLevel, recommendation, suppliers };
}
