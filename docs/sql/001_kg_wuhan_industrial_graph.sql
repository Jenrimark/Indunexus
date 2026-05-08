-- ============================================================================
-- 武汉市汽车及零部件产业知识图谱 — 物理表结构（PostgreSQL ≥14）
-- 依据：docs/sql.md 产业层级、企业名录、供应链配套关系（含多边）
-- ============================================================================
-- ID 生成规则（应用层实现，入库前校验；库内以 TEXT 主键承载）
-- ----------------------------------------------------------------------------
-- 1) 实体主键 entity_id（稳定、可读、可去重）
--    格式：  {域前缀}:{类型码}:{规范片段}
--    域前缀： wh  （武汉产业图谱；其他项目可换 cn、hub 等）
--    类型码： ent=企业/组织  seg=产业链细分  reg=区域  plt=整合平台
--    规范片段：
--      - 若有统一社会信用代码 / 工商注册号：  reg_{18位数字大写}
--      - 否则： slug_{name_key}_{disamb}
--          name_key = 小写；仅保留 [a-z0-9\u4e00-\u9fff]；连续空白变 - ；截断至 32 字符
--          disamb = 2 位序号 01..99，按「同名 + 同细分」分组递增；分组键为：
--                  normalize(display_name) || '|' || coalesce(segment_code,'') || '|' || coalesce(business_context,'')
--      - 同一企业在不同业务语境下视为不同图节点时（如「路特斯科技」整车 vs 智驾）：
--          在 business_context 中区分，并纳入 disamb 分组键，得到不同 entity_id。
--
-- 2) 边主键 edge_id
--    使用 BIGSERIAL  surrogate；允许 (src,dst) 多边：同对节点多条边靠
--    relation_code + supply_product + supply_mode + evidence_digest 区分。
--
-- 3) 多边语义
--    - 同一 supplier → 同一 customer 可存在多条边：不同 supply_product、或不同 relation_code、
--      或不同 evidence_digest（不同出处行）。
--    - 可选唯一性（应用或部分唯一索引）：见表末 UNIQUE INDEX 说明。
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS indu_kg;

COMMENT ON SCHEMA indu_kg IS '产业知识图谱：武汉汽车零部件示例域，可与前端 d3 力导向图节点/边对接';

SET search_path TO indu_kg, public;

-- ---------------------------------------------------------------------------
-- 产业链层级（上游 / 中游 / 下游 / 创新生态…）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indu_kg.chain_tier (
  tier_code   TEXT PRIMARY KEY,
  tier_label  TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  description TEXT
);

COMMENT ON TABLE indu_kg.chain_tier IS '产业链大层，对应 sql.md 表格「供应链层级」列的归一化枚举';

-- ---------------------------------------------------------------------------
-- 细分领域（可树形扩展；文档中「细分领域」）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indu_kg.segment (
  segment_code TEXT PRIMARY KEY,
  parent_code  TEXT REFERENCES indu_kg.segment (segment_code) ON DELETE SET NULL,
  tier_code    TEXT REFERENCES indu_kg.chain_tier (tier_code) ON UPDATE CASCADE ON DELETE SET NULL,
  label        TEXT NOT NULL,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_segment_parent ON indu_kg.segment (parent_code);
CREATE INDEX IF NOT EXISTS idx_segment_tier ON indu_kg.segment (tier_code);

COMMENT ON TABLE indu_kg.segment IS '细分领域节点；可与图上的「类目/环节」或树导航对齐';

-- ---------------------------------------------------------------------------
-- 区域（一核四区两翼等，可选入库）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indu_kg.region (
  region_code TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE indu_kg.region IS '空间区域；企业可挂 region_code 作属性，或单独作为图节点';

-- ---------------------------------------------------------------------------
-- 关系类型字典（边语义）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indu_kg.relation_type (
  relation_code TEXT PRIMARY KEY,
  label_zh      TEXT NOT NULL,
  is_directed   BOOLEAN NOT NULL DEFAULT TRUE,
  description   TEXT
);

COMMENT ON TABLE indu_kg.relation_type IS '如：SUPPLIES_TO、BELONGS_GROUP、LOCATED_IN、STRATEGIC_PARTNER 等';

-- ---------------------------------------------------------------------------
-- 实体（企业 / 平台 / 虚拟分组等）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indu_kg.entity (
  entity_id          TEXT PRIMARY KEY,
  entity_kind        TEXT NOT NULL
                       CHECK (entity_kind IN ('enterprise', 'platform', 'group', 'virtual', 'segment_ref', 'region_ref')),
  display_name       TEXT NOT NULL,
  name_norm          TEXT GENERATED ALWAYS AS (lower(trim(display_name))) STORED,
  business_context   TEXT,
  registration_no    TEXT,
  segment_code       TEXT REFERENCES indu_kg.segment (segment_code) ON UPDATE CASCADE ON DELETE SET NULL,
  region_code        TEXT REFERENCES indu_kg.region (region_code) ON UPDATE CASCADE ON DELETE SET NULL,
  attributes         JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_row_ref     TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE indu_kg.entity IS '图节点主表；entity_id 由应用按文档头部规则生成';
COMMENT ON COLUMN indu_kg.entity.business_context IS '消歧：如 整车制造 / 智能座舱 / 下游整车 — 用于同名企业多节点';
COMMENT ON COLUMN indu_kg.entity.registration_no IS '统一社会信用代码等；有则优先参与 entity_id 的 reg_ 分支';
COMMENT ON COLUMN indu_kg.entity.source_row_ref IS '溯源：如 sql.md 目标二表 行号或稳定业务键';

CREATE UNIQUE INDEX IF NOT EXISTS uq_entity_reg_no
  ON indu_kg.entity (registration_no)
  WHERE registration_no IS NOT NULL;

-- NULL 在唯一约束中互不相等，故用 coalesce 保证「同名+同细分+同语境」仅一行
CREATE UNIQUE INDEX IF NOT EXISTS uq_entity_name_segment_context
  ON indu_kg.entity (
    name_norm,
    coalesce(segment_code, ''),
    coalesce(business_context, '')
  );

CREATE INDEX IF NOT EXISTS idx_entity_segment ON indu_kg.entity (segment_code);
CREATE INDEX IF NOT EXISTS idx_entity_region ON indu_kg.entity (region_code);
CREATE INDEX IF NOT EXISTS idx_entity_kind ON indu_kg.entity (entity_kind);

-- ---------------------------------------------------------------------------
-- 实体别名（检索、对齐外部库）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indu_kg.entity_alias (
  id           BIGSERIAL PRIMARY KEY,
  entity_id    TEXT NOT NULL REFERENCES indu_kg.entity (entity_id) ON UPDATE CASCADE ON DELETE CASCADE,
  alias_text   TEXT NOT NULL,
  alias_norm   TEXT GENERATED ALWAYS AS (lower(trim(alias_text))) STORED,
  source_note  TEXT,
  UNIQUE (entity_id, alias_norm)
);

CREATE INDEX IF NOT EXISTS idx_entity_alias_norm ON indu_kg.entity_alias (alias_norm);

-- ---------------------------------------------------------------------------
-- 边（多边：无 (src,dst,relation) 唯一约束；用业务字段区分）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indu_kg.edge (
  edge_id           BIGSERIAL PRIMARY KEY,
  src_entity_id     TEXT NOT NULL REFERENCES indu_kg.entity (entity_id) ON UPDATE CASCADE ON DELETE CASCADE,
  dst_entity_id     TEXT NOT NULL REFERENCES indu_kg.entity (entity_id) ON UPDATE CASCADE ON DELETE CASCADE,
  relation_code     TEXT NOT NULL REFERENCES indu_kg.relation_type (relation_code) ON UPDATE CASCADE ON DELETE RESTRICT,
  supply_product    TEXT,
  supply_mode       TEXT,
  evidence_digest   TEXT,
  source_section    TEXT,
  weight            DOUBLE PRECISION,
  valid_from        DATE,
  valid_to          DATE,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_edge_no_self_loop CHECK (src_entity_id <> dst_entity_id)
);

COMMENT ON TABLE indu_kg.edge IS '多边：同一对 (src,dst) 允许多行；以 supply_product / relation_code / evidence_digest 区分';
COMMENT ON COLUMN indu_kg.edge.supply_product IS '对应 sql.md 3.1「核心供应产品」';
COMMENT ON COLUMN indu_kg.edge.supply_mode IS '对应 sql.md 3.1「配套模式」';
COMMENT ON COLUMN indu_kg.edge.evidence_digest IS '可选：引用段落/表/行的摘要或哈希，便于去重导入';

CREATE INDEX IF NOT EXISTS idx_edge_src ON indu_kg.edge (src_entity_id);
CREATE INDEX IF NOT EXISTS idx_edge_dst ON indu_kg.edge (dst_entity_id);
CREATE INDEX IF NOT EXISTS idx_edge_relation ON indu_kg.edge (relation_code);
CREATE INDEX IF NOT EXISTS idx_edge_src_dst ON indu_kg.edge (src_entity_id, dst_entity_id);

-- 若导入时希望「同供应品不重复」，可启用（按需取消注释）：
-- CREATE UNIQUE INDEX uq_edge_semantic ON indu_kg.edge (
--   src_entity_id, dst_entity_id, relation_code,
--   coalesce(supply_product, ''), coalesce(supply_mode, ''), coalesce(evidence_digest, '')
-- );

-- ---------------------------------------------------------------------------
-- 触发器：更新 entity.updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION indu_kg.touch_entity_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_entity_touch ON indu_kg.entity;
CREATE TRIGGER tr_entity_touch
  BEFORE UPDATE ON indu_kg.entity
  FOR EACH ROW EXECUTE PROCEDURE indu_kg.touch_entity_updated_at();

-- ---------------------------------------------------------------------------
-- 可选：批量导入批次（审计）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indu_kg.import_batch (
  batch_id    TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  doc_ref     TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  row_count   INTEGER
);

ALTER TABLE indu_kg.entity
  ADD COLUMN IF NOT EXISTS import_batch_id TEXT REFERENCES indu_kg.import_batch (batch_id) ON DELETE SET NULL;

ALTER TABLE indu_kg.edge
  ADD COLUMN IF NOT EXISTS import_batch_id TEXT REFERENCES indu_kg.import_batch (batch_id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 种子：关系类型（可按业务扩展）
-- ---------------------------------------------------------------------------
INSERT INTO indu_kg.relation_type (relation_code, label_zh, is_directed, description) VALUES
  ('SUPPLIES_TO', '供应/配套', TRUE, '零部件或系统供给整车厂或其他企业'),
  ('BELONGS_GROUP', '隶属/集团内', TRUE, '跃创科技旗下等组织关系'),
  ('LOCATED_IN', '位于/布局于', TRUE, '区域或园区布局'),
  ('STRATEGIC_PARTNER', '战略合作', FALSE, '联合研发、联合体等'),
  ('SERVES_MARKET', '服务市场/客户群', TRUE, '后市场、出口等')
ON CONFLICT (relation_code) DO NOTHING;

RESET search_path;
