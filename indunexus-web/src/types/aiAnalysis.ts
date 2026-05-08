// AI Analysis Page — TypeScript type definitions
// Feature: ai-analysis-page

// ─── Union Types ─────────────────────────────────────────────────────────────

export type WearLevel = 'normal' | 'light' | 'moderate' | 'severe';

export type Recommendation = 'continue' | 'plan_repair' | 'immediate_repair' | 'replace';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Wear level → hex color mapping (normal=green, light=blue, moderate=orange, severe=red) */
export const WEAR_LEVEL_COLORS: Record<WearLevel, string> = {
  normal: '#10b981',
  light: '#3b82f6',
  moderate: '#f59e0b',
  severe: '#ef4444',
};

/** Predefined 9-node workflow definition */
export const WORKFLOW_NODES: Array<{ id: string; name: string }> = [
  { id: 'receive',      name: '图像接收' },
  { id: 'preprocess',   name: '预处理' },
  { id: 'detect',       name: '目标检测' },
  { id: 'extract',      name: '特征提取' },
  { id: 'match',        name: '向量匹配' },
  { id: 'knowledge',    name: '知识图谱匹配' },
  { id: 'supply_chain', name: '供应链查询' },
  { id: 'decision',     name: '决策引擎' },
  { id: 'output',       name: '输出结果' },
];

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PartStandard {
  type: string;
  code: string;
  name: string;
  region: string;
}

export interface FullRecognitionResult {
  /** 零件大类 */
  category: string;
  /** 零件子类 */
  sub_category: string;
  /** 关键规格参数（模数、材质、尺寸等） */
  specs: {
    modulus?: string;
    material?: string;
    dimensions?: string;
    [key: string]: string | undefined;
  };
  /** 置信度 [0.00, 1.00] */
  confidence: number;
  /** 候选结果列表，最多 5 条 */
  alternatives: Array<{
    part_id: string;
    part_name: string;
    part_number: string;
    confidence: number;
    matched_features: string[];
  }>;
  /** 零件用途说明 */
  usage_description?: string;
  /** 国内外标准对照 */
  standards?: PartStandard[];
  /** 参数说明（key 与 specs 对齐） */
  param_notes?: Record<string, string>;
  /** 选型建议 */
  selection_tips?: string[];
}

export interface SupplyChainData {
  partId: string;
  stock: number;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  /** 货期（工作日） */
  leadTimeDays: number;
}

/** 管理大屏知识图谱：零件在库状态（外圈颜色） */
export type DashboardPartStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pending';

/** 点击图谱节点写入 Pinia 的零件载荷 */
export interface DashboardGraphPartNodePayload {
  entityType: 'Part';
  id: string;
  label: string;
  imgUrl: string;
  features: string[];
  status: DashboardPartStatus;
}

/** 供应商节点载荷 */
export interface DashboardGraphSupplierNodePayload {
  entityType: 'Supplier';
  id: string;
  label: string;
  tier?: number;
  region?: string;
  supplierCode?: string;
  /** 产业图谱：细分领域、配套说明等 */
  features?: string[];
}

/** 质检批次节点载荷（管理大屏图谱） */
export interface DashboardGraphInspectionLotNodePayload {
  entityType: 'InspectionLot';
  id: string;
  label: string;
  lotNo: string;
  lineCode: string;
  producedAt: string;
  shift: string;
  qcStatus: string;
  defectHint?: string;
}

/** 视觉异常簇节点载荷 */
export interface DashboardGraphVisualClusterNodePayload {
  entityType: 'VisualCluster';
  id: string;
  label: string;
  clusterCode: string;
  embeddingFamily: string;
  similarityThreshold: number;
  trainedAt: string;
}

export type DashboardGraphSelectedPayload =
  | DashboardGraphPartNodePayload
  | DashboardGraphSupplierNodePayload
  | DashboardGraphInspectionLotNodePayload
  | DashboardGraphVisualClusterNodePayload;

export interface KnowledgeGraphData {
  /** 零件分类路径（面包屑） */
  classificationPath: string[];
  /** 关联零件列表，最多 3 条 */
  relatedParts: Array<{
    partId: string;
    partName: string;
    partNumber: string;
  }>;
  /** 可替代零件列表，最多 3 条 */
  alternatives: Array<{
    partId: string;
    partName: string;
    partNumber: string;
    /** 替代原因 */
    reason: string;
  }>;
}

export interface DecisionReport {
  wearLevel: WearLevel;
  recommendation: Recommendation;
  /** 推荐供应商列表，最多 3 家 */
  suppliers: Array<{
    name: string;
    /** 评分 1-5 */
    rating: number;
    price: number;
    currency: string;
    leadTimeDays: number;
  }>;
}

export interface WorkflowNode {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  /** 该阶段实际耗时（毫秒） */
  durationMs?: number;
}

export interface AnalysisRecord {
  /** UUID */
  id: string;
  userId: string;
  /** base64 缩略图 */
  imageDataUrl: string;
  imageName: string;
  /** ISO 8601 时间戳 */
  analyzedAt: string;
  recognitionResult: FullRecognitionResult;
  supplyChainData: SupplyChainData;
  knowledgeGraphData: KnowledgeGraphData;
  decisionReport: DecisionReport;
  preprocessInfo: {
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
    /** 亮度评分 0-100 */
    brightnessScore: number;
    fileSize: number;
  };
}
