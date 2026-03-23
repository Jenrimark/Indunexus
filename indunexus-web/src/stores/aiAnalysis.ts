// Feature: ai-analysis-page
// Pinia store for AI analysis workflow state management

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  WorkflowNode,
  AnalysisRecord,
  FullRecognitionResult,
  SupplyChainData,
  KnowledgeGraphData,
  DecisionReport,
} from '../types/aiAnalysis';
import { WORKFLOW_NODES } from '../types/aiAnalysis';
import {
  mockRecognize,
  mockQueryKnowledgeGraph,
  mockQuerySupplyChain,
  mockRunDecisionEngine,
} from '../mock/aiAnalysisMock';
import { useAuthStore } from './auth';

// ─── Full Analysis Result ─────────────────────────────────────────────────────

export interface FullAnalysisResult {
  recognitionResult: FullRecognitionResult;
  supplyChainData: SupplyChainData;
  knowledgeGraphData: KnowledgeGraphData;
  decisionReport: DecisionReport;
  isOffline?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildInitialNodes(): WorkflowNode[] {
  return WORKFLOW_NODES.map((n) => ({ ...n, status: 'pending' as const }));
}

function getStorageKey(userId: string): string {
  return `indunexus_ai_analysis_records_${userId}`;
}

// ─── Offline Fallback Data ────────────────────────────────────────────────────

function buildOfflineResult(): FullAnalysisResult {
  const recognitionResult: FullRecognitionResult = {
    category: '传动零件',
    sub_category: '标准直齿轮',
    specs: { modulus: 'M2', material: '45号钢', dimensions: 'Φ60×20mm' },
    confidence: 0.72,
    alternatives: [
      {
        part_id: 'ALT-001',
        part_name: '精密直齿轮',
        part_number: 'GR-M2-30T-P6',
        confidence: 0.65,
        matched_features: ['模数M2', '30齿'],
      },
    ],
  };

  const supplyChainData: SupplyChainData = {
    partId: 'GEAR-001',
    stock: 1240,
    priceRange: { min: 45, max: 88, currency: 'CNY' },
    leadTimeDays: 3,
  };

  const knowledgeGraphData: KnowledgeGraphData = {
    classificationPath: ['机械零件', '传动零件', '齿轮', '圆柱齿轮', '直齿轮'],
    relatedParts: [
      { partId: 'BRG-001', partName: '深沟球轴承', partNumber: '6205-2RS' },
    ],
    alternatives: [
      {
        partId: 'ALT-001',
        partName: '精密直齿轮',
        partNumber: 'GR-M2-30T-P6',
        reason: '精度等级更高（6级），适用于高速传动场景',
      },
    ],
  };

  const decisionReport: DecisionReport = {
    wearLevel: 'light',
    recommendation: 'plan_repair',
    suppliers: [
      { name: '上海精密传动有限公司', rating: 4.8, price: 66, currency: 'CNY', leadTimeDays: 3 },
    ],
  };

  return { recognitionResult, supplyChainData, knowledgeGraphData, decisionReport, isOffline: true };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAiAnalysisStore = defineStore('aiAnalysis', () => {
  // ── State ──────────────────────────────────────────────────────────────────

  const workflowNodes = ref<WorkflowNode[]>(buildInitialNodes());
  const currentNodeIndex = ref<number>(-1);
  const isAnalyzing = ref<boolean>(false);
  const isOfflineMode = ref<boolean>(false);
  const isTimedOut = ref<boolean>(false);
  const analysisResult = ref<FullAnalysisResult | null>(null);
  const records = ref<AnalysisRecord[]>(loadRecords());

  // 跨页面传递：modal 上传图片后设置，AIAnalysisPage 挂载时消费
  const pendingAnalysis = ref<{
    imageDataUrl: string;
    fileName: string;
    preprocessInfo: AnalysisRecord['preprocessInfo'];
  } | null>(null);

  // ── Getters ────────────────────────────────────────────────────────────────

  const filterRecordsByRange = computed(() => {
    return (range: 'today' | '7days' | '30days'): AnalysisRecord[] => {
      const now = Date.now();
      const msMap: Record<typeof range, number> = {
        today: 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
      };
      const cutoff = now - msMap[range];
      return records.value.filter((r) => new Date(r.analyzedAt).getTime() >= cutoff);
    };
  });

  // ── Node helpers ───────────────────────────────────────────────────────────

  function setNodeActive(index: number): number {
    currentNodeIndex.value = index;
    const node = workflowNodes.value[index];
    if (node) node.status = 'active';
    return Date.now();
  }

  function setNodeCompleted(index: number, startTime: number): void {
    const node = workflowNodes.value[index];
    if (node) {
      node.status = 'completed';
      node.durationMs = Date.now() - startTime;
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function runAnalysis(imageDataUrl: string, imageName: string, preprocessInfo: AnalysisRecord['preprocessInfo']): Promise<void> {
    // Node 0: receive (50ms)
    let t = setNodeActive(0);
    await delay(50);
    setNodeCompleted(0, t);

    // Node 1: preprocess (100ms)
    t = setNodeActive(1);
    await delay(100);
    setNodeCompleted(1, t);

    // Nodes 2+3+4: detect + extract + match — backed by mockRecognize
    const detectStart = setNodeActive(2);
    const recognizePromise = mockRecognize(imageDataUrl);

    // Simulate detect phase completing at ~40% of recognition time
    await delay(400);
    setNodeCompleted(2, detectStart);

    // extract phase
    const extractStart = setNodeActive(3);
    await delay(400);
    setNodeCompleted(3, extractStart);

    // match phase — wait for actual recognition result
    const matchStart = setNodeActive(4);
    const recognitionResult = await recognizePromise;
    setNodeCompleted(4, matchStart);

    // Derive partId from recognition result (use first alternative's part_id or a default)
    const partId = recognitionResult.alternatives[0]?.part_id ?? 'GEAR-001';

    // Node 5: knowledge graph
    t = setNodeActive(5);
    const knowledgeGraphData = await mockQueryKnowledgeGraph(partId);
    setNodeCompleted(5, t);

    // Node 6: supply chain
    t = setNodeActive(6);
    const supplyChainData = await mockQuerySupplyChain(partId);
    setNodeCompleted(6, t);

    // Node 7: decision engine
    t = setNodeActive(7);
    const decisionReport = await mockRunDecisionEngine(partId, recognitionResult.confidence);
    setNodeCompleted(7, t);

    // Node 8: output (50ms)
    t = setNodeActive(8);
    await delay(50);
    setNodeCompleted(8, t);

    // Assemble result
    analysisResult.value = { recognitionResult, supplyChainData, knowledgeGraphData, decisionReport };

    // Persist record
    const authStore = useAuthStore();
    const record: AnalysisRecord = {
      id: crypto.randomUUID(),
      userId: authStore.user?.id ?? 'anonymous',
      imageDataUrl,
      imageName,
      analyzedAt: new Date().toISOString(),
      recognitionResult,
      supplyChainData,
      knowledgeGraphData,
      decisionReport,
      preprocessInfo,
    };
    saveRecord(record);
  }

  async function startAnalysis(
    imageDataUrl: string,
    imageName: string,
    preprocessInfo: AnalysisRecord['preprocessInfo'],
  ): Promise<void> {
    // Reset state
    isAnalyzing.value = true;
    isOfflineMode.value = false;
    isTimedOut.value = false;
    analysisResult.value = null;
    workflowNodes.value = buildInitialNodes();
    currentNodeIndex.value = -1;

    const TIMEOUT_MS = 30_000;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject({ type: 'timeout' }), TIMEOUT_MS),
    );

    try {
      await Promise.race([
        runAnalysis(imageDataUrl, imageName, preprocessInfo),
        timeoutPromise,
      ]);
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;

      if (e?.type === 'timeout') {
        // Timeout: mark current active node as pending, reset
        const idx = currentNodeIndex.value;
        if (idx >= 0 && workflowNodes.value[idx]?.status === 'active') {
          workflowNodes.value[idx].status = 'pending';
        }
        isTimedOut.value = true;
      } else if (e?.status === 500) {
        // 5xx error: switch to offline mode with fallback result
        isOfflineMode.value = true;
        analysisResult.value = buildOfflineResult();

        // Complete remaining nodes quickly
        const idx = currentNodeIndex.value;
        const activeNode = idx >= 0 ? workflowNodes.value[idx] : undefined;
        if (activeNode?.status === 'active') {
          activeNode.status = 'completed';
          activeNode.durationMs = 0;
        }
        for (let i = idx + 1; i < workflowNodes.value.length; i++) {
          const n = workflowNodes.value[i];
          if (n) { n.status = 'completed'; n.durationMs = 0; }
        }

        // Save offline record
        const authStore = useAuthStore();
        const result = analysisResult.value;
        const record: AnalysisRecord = {
          id: crypto.randomUUID(),
          userId: authStore.user?.id ?? 'anonymous',
          imageDataUrl,
          imageName,
          analyzedAt: new Date().toISOString(),
          recognitionResult: result.recognitionResult,
          supplyChainData: result.supplyChainData,
          knowledgeGraphData: result.knowledgeGraphData,
          decisionReport: result.decisionReport,
          preprocessInfo,
        };
        saveRecord(record);
      } else {
        // Unknown error — rethrow
        throw err;
      }
    } finally {
      isAnalyzing.value = false;
    }
  }

  function saveRecord(record: AnalysisRecord): void {
    try {
      const authStore = useAuthStore();
      const userId = authStore.user?.id ?? record.userId ?? 'anonymous';
      const key = getStorageKey(userId);

      // Update in-memory list
      records.value.unshift(record);
      if (records.value.length > 50) {
        records.value = records.value.slice(0, 50);
      }

      localStorage.setItem(key, JSON.stringify(records.value));
    } catch {
      // Silent failure — storage quota exceeded or unavailable
    }
  }

  function loadRecords(): AnalysisRecord[] {
    try {
      // We need userId to build the key; try to read from auth store if available
      // During store initialization auth store may not be ready, so we scan known keys
      const prefix = 'indunexus_ai_analysis_records_';
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));

      if (keys.length === 0) return [];

      // Use the first matching key (single user session)
      const firstKey = keys[0] ?? '';
      const raw = localStorage.getItem(firstKey);
      if (!raw) return [];

      const parsed: unknown[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const valid: AnalysisRecord[] = [];
      for (const item of parsed) {
        try {
          // Basic shape validation
          const r = item as AnalysisRecord;
          if (r.id && r.analyzedAt && r.recognitionResult) {
            valid.push(r);
          }
        } catch {
          // Skip corrupted record
        }
      }
      return valid;
    } catch {
      return [];
    }
  }

  function resetAnalysis(): void {
    isAnalyzing.value = false;
    isOfflineMode.value = false;
    isTimedOut.value = false;
    analysisResult.value = null;
    workflowNodes.value = buildInitialNodes();
    currentNodeIndex.value = -1;
  }

  return {
    // State
    workflowNodes,
    currentNodeIndex,
    isAnalyzing,
    isOfflineMode,
    isTimedOut,
    analysisResult,
    records,
    pendingAnalysis,
    // Getters
    filterRecordsByRange,
    // Actions
    startAnalysis,
    saveRecord,
    loadRecords,
    resetAnalysis,
  };
});
