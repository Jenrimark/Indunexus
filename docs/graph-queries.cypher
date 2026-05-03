// ─── InduNexus / 智鉴车件 — Neo4j Cypher 参考（INDU. 命名空间）────────────────
// 与前端 Mock（supplyChainKnowledgeGraphMock.json）语义对齐：
//   MATCHES: VisualCluster → InspectionLot（score）
//   MANUFACTURED_ON: InspectionLot → Part（批次产出绑定）
//   SUPPLIES: Supplier → Part（边上 tier = 供货层级）
// 下图库 schema 在 Mock 基础上扩展产线节点以满足「PRODUCED_AT → LINE → SUPPLIED_BY」穿透叙述。

// ═══ 索引建议（多跳性能）══════════════════════════════════════════════════════
CREATE CONSTRAINT lot_id IF NOT EXISTS FOR (n:INDU.InspectionLot) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT part_id IF NOT EXISTS FOR (n:INDU.Part) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT sup_id IF NOT EXISTS FOR (n:INDU.Supplier) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT vc_id IF NOT EXISTS FOR (n:INDU.VisualCluster) REQUIRE n.id IS UNIQUE;
CREATE INDEX line_code IF NOT EXISTS FOR (n:INDU.ProductionLine) ON (n.code);

// ═══ 上游穿透：异常簇 H + 指定批次 → 锁定 Tier 2 供应商 ═══════════════════════
// 假设：Lot 经 PRODUCED_AT 绑定 Part；Part 由 ProductionLine 加工；
//       Line 再经 SUPPLIED_BY 接收 Tier1/Tier2 物料输入（与「向上游」一致时使用反向遍历）。
// 参数：$clusterId, $lotId, $threshold（相似度下限）

MATCH (vc:INDU.VisualCluster {id: $clusterId})
MATCH (vc)-[m:INDU.MATCHES]->(lot:INDU.InspectionLot {id: $lotId})
WHERE m.score >= $threshold
MATCH (lot)-[:INDU.PRODUCED_AT]->(part:INDU.Part)
MATCH path = (lot)-[:INDU.PRODUCED_AT]->(part)
           <-[:INDU.ON_LINE]-(line:INDU.ProductionLine)
           <-[:INDU.SUPPLIED_BY]-(sup:INDU.Supplier)
WHERE sup.tier = 2
RETURN DISTINCT sup AS suspiciousTier2,
       collect(DISTINCT path) AS evidencePaths,
       m.score AS matchScore;

// 若无 ProductionLine，可退化为 Lot→Part 后直接挂供应商（与前端简化 Mock 一致）：
MATCH (vc:INDU.VisualCluster {id: $clusterId})-[m:INDU.MATCHES]->(lot:INDU.InspectionLot {id: $lotId})
WHERE m.score >= $threshold
MATCH (lot)-[:INDU.PRODUCED_AT]->(part:INDU.Part)<-[:INDU.SUPPLIES]-(sup:INDU.Supplier)
WHERE sup.tier = 2
RETURN DISTINCT sup, part, m.score;

// ═══ 风险级联：阻断最大暴露的供应关系（思路 + 可执行骨架）══════════════════════
// 业务权重：在 SUPPLIES 边上维护 annualVolume 或 exposureUnits（金额/产量）。
// 步骤 1：从已确认的污染源节点 src（如 Tier2 某批次原材料对应的 Supplier）向下游 BFS，
//         收集可达的 WorkOrder / InspectionLot / SKU（需在模型中扩展标签）。
// 步骤 2：对每条进入「高危可达集」的 SUPPLIES 边 e，计算 gain(e) = 删除 e 后不可达的
//         exposureUnits 之和（近似最小割可用最大流或贪心 Top-K）。
// 步骤 3：输出 gain 最大的前 K 条边供业务决策（合同冻结、切换源）。

// 候选边打分（示意）：对每条 SUPPLIES 边 r 维护 r.exposureUnits（下游年化暴露）。
// 应用层：从污染源 BFS 得高危可达集 R；枚举一端在 R 内的 SUPPLIES 边，
//        gain(r) = sum(exposureUnits downstream after removing r)；取 Top-K。
// Neo4j 侧可预先物化下游体积视图或使用 APOC 遍历聚合；精确全局最小割建议在应用层用网络流 / MILP。
