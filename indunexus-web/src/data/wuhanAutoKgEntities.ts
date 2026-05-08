/**
 * 武汉市汽车及零部件产业图谱 — 实体清单（与 docs/sql.md 目标二序号对齐，稳定 ID：WH-ENT-{序号}）
 */

export type WuhanTierCode = 'up' | 'mid' | 'down' | 'plat';

export interface WuhanCompanyEntity {
  /** 稳定主键，与 sql.md 目标二「序号」一致 */
  id: string;
  seq: number;
  tierCode: WuhanTierCode;
  /** 细分领域原文 */
  segment: string;
  displayName: string;
  /** 消歧：同名企业不同节点（如路特斯科技中游 vs 下游） */
  businessContext: string;
  /** 树与详情展示 */
  summaryLine: string;
}

const TIER_LABEL: Record<WuhanTierCode, string> = {
  up: '上游 · 基础材料与核心部件',
  mid: '中游 · 系统总成与模块化供应',
  down: '下游 · 整车集成与后市场',
  plat: '核心整合平台',
};

export function tierLabel(code: WuhanTierCode): string {
  return TIER_LABEL[code];
}

/** 目标二 50 行：空缺「供应链层级 / 细分领域」按表内向前填充规则与原文一致 */
export const WUHAN_COMPANY_ENTITIES: WuhanCompanyEntity[] = [
  { id: 'WH-ENT-001', seq: 1, tierCode: 'up', segment: '高性能轻量化材料', displayName: '隆达铝业（武汉）', businessContext: '', summaryLine: '铝液直供，月供应最高 4500 吨' },
  { id: 'WH-ENT-002', seq: 2, tierCode: 'up', segment: '高性能轻量化材料', displayName: '广东鸿图武汉压铸有限公司', businessContext: '', summaryLine: '一体化压铸产线、免热处理材料' },
  { id: 'WH-ENT-003', seq: 3, tierCode: 'up', segment: '车规级芯片', displayName: '芯擎科技', businessContext: '', summaryLine: '龍鹰一号 / 星辰一号车规芯片' },
  { id: 'WH-ENT-004', seq: 4, tierCode: 'up', segment: '车规级芯片', displayName: '黑芝麻智能', businessContext: '', summaryLine: 'A1000 系列自动驾驶芯片' },
  { id: 'WH-ENT-005', seq: 5, tierCode: 'up', segment: '传感器与控制器', displayName: '武汉神动汽车电子电器股份有限公司', businessContext: '', summaryLine: 'MEMS 传感器' },
  { id: 'WH-ENT-006', seq: 6, tierCode: 'mid', segment: '车身系统', displayName: '武汉东环车身系统有限公司', businessContext: '', summaryLine: '7 地工厂、专利与联合研发' },
  { id: 'WH-ENT-007', seq: 7, tierCode: 'mid', segment: '车身系统', displayName: '武汉方鼎汽车部件制造有限公司', businessContext: '', summaryLine: '自动化率约 70%、多品种零部件' },
  { id: 'WH-ENT-008', seq: 8, tierCode: 'mid', segment: '车身系统', displayName: '武汉爱机新能源汽车有限公司', businessContext: '', summaryLine: '莲花跑车隔墙供应冲压件' },
  { id: 'WH-ENT-009', seq: 9, tierCode: 'mid', segment: '车身系统', displayName: '东风（武汉）实业有限公司', businessContext: '', summaryLine: '白车身分总成、防撞梁、电池箱体' },
  { id: 'WH-ENT-010', seq: 10, tierCode: 'mid', segment: '车身系统', displayName: '地通工业武汉基地', businessContext: '', summaryLine: '车身覆盖件、底盘结构件' },
  { id: 'WH-ENT-011', seq: 11, tierCode: 'mid', segment: '车身系统', displayName: '武汉长华长源汽车零部件有限公司', businessContext: '', summaryLine: '4000T 铝压铸产线' },
  { id: 'WH-ENT-012', seq: 12, tierCode: 'mid', segment: '车身系统', displayName: '万安科技武汉智造基地', businessContext: '', summaryLine: '规划年产能约 100 万套' },
  { id: 'WH-ENT-013', seq: 13, tierCode: 'mid', segment: '车身系统', displayName: '东风模冲', businessContext: '', summaryLine: '跃创旗下模具与冲压件' },
  { id: 'WH-ENT-014', seq: 14, tierCode: 'mid', segment: '车身系统', displayName: '数码模冲压技术（武汉）有限公司', businessContext: '', summaryLine: '车身结构部件' },
  { id: 'WH-ENT-015', seq: 15, tierCode: 'mid', segment: '汽车电子电器', displayName: '湖北三环汽车电器有限公司', businessContext: '', summaryLine: '喇叭、开关、车锁、电子阀' },
  { id: 'WH-ENT-016', seq: 16, tierCode: 'mid', segment: '汽车电子电器', displayName: '武汉正丰汽车零部件系统有限责任公司', businessContext: '', summaryLine: '车身电子控制全系列' },
  { id: 'WH-ENT-017', seq: 17, tierCode: 'mid', segment: '汽车电子电器', displayName: '武汉菲亚姆电气有限公司', businessContext: '', summaryLine: '汽车喇叭、新能源车零部件产线' },
  { id: 'WH-ENT-018', seq: 18, tierCode: 'mid', segment: '智能座舱与车规级芯片', displayName: '亿咖通科技', businessContext: '', summaryLine: '智能座舱平台、车载 OS' },
  {
    id: 'WH-ENT-019',
    seq: 19,
    tierCode: 'mid',
    segment: '智能座舱与车规级芯片',
    displayName: '路特斯科技（智能座舱）',
    businessContext: '智能座舱与算法研发',
    summaryLine: '智能驾驶算法、800V 高压平台研发',
  },
  { id: 'WH-ENT-020', seq: 20, tierCode: 'mid', segment: '智能座舱与车规级芯片', displayName: '南斗六星（武汉）技术有限公司', businessContext: '', summaryLine: '跃创旗下智能驾驶全栈' },
  { id: 'WH-ENT-021', seq: 21, tierCode: 'mid', segment: '智能座舱与车规级芯片', displayName: '中汽创智科技有限公司', businessContext: '', summaryLine: '智能网联技术研发' },
  { id: 'WH-ENT-022', seq: 22, tierCode: 'mid', segment: '汽车饰件与内饰系统', displayName: '武汉钧达汽车饰件有限公司', businessContext: '', summaryLine: '仪表板、保险杠、门内饰板总成' },
  { id: 'WH-ENT-023', seq: 23, tierCode: 'mid', segment: '汽车饰件与内饰系统', displayName: '武汉博奇科技股份有限公司', businessContext: '', summaryLine: '内饰材料、座椅护套' },
  { id: 'WH-ENT-024', seq: 24, tierCode: 'mid', segment: '汽车饰件与内饰系统', displayName: '西上海延鑫汽车座椅和内饰件基地', businessContext: '', summaryLine: '座椅内饰裁剪缝纫包覆' },
  { id: 'WH-ENT-025', seq: 25, tierCode: 'mid', segment: '汽车饰件与内饰系统', displayName: '武汉燎原', businessContext: '', summaryLine: '跃创旗下外饰件' },
  { id: 'WH-ENT-026', seq: 26, tierCode: 'mid', segment: '汽车饰件与内饰系统', displayName: '广佳汽车饰件', businessContext: '', summaryLine: '台资饰件' },
  { id: 'WH-ENT-027', seq: 27, tierCode: 'mid', segment: '动力电池与能源系统', displayName: '中创新航（武汉）', businessContext: '', summaryLine: '动力电池电芯及 PACK' },
  { id: 'WH-ENT-028', seq: 28, tierCode: 'mid', segment: '动力电池与能源系统', displayName: '科新动力电池系统公司', businessContext: '', summaryLine: '跃创旗下固态电池中试线' },
  { id: 'WH-ENT-029', seq: 29, tierCode: 'mid', segment: '动力电池与能源系统', displayName: '人禾电子', businessContext: '', summaryLine: '铜铝排、电池连接件' },
  { id: 'WH-ENT-030', seq: 30, tierCode: 'mid', segment: '电驱动与动力总成系统', displayName: '博格华纳汽车零部件（武汉）', businessContext: '', summaryLine: '电驱动、安全气囊等' },
  { id: 'WH-ENT-031', seq: 31, tierCode: 'mid', segment: '电驱动与动力总成系统', displayName: '智新科技', businessContext: '', summaryLine: '跃创旗下纯电混动动力总成' },
  { id: 'WH-ENT-032', seq: 32, tierCode: 'mid', segment: '电驱动与动力总成系统', displayName: '东风鼎新动力系统科技有限公司', businessContext: '', summaryLine: '传动系统、变速箱' },
  { id: 'WH-ENT-033', seq: 33, tierCode: 'mid', segment: '电驱动与动力总成系统', displayName: '东风（武汉）电驱动系统有限公司', businessContext: '', summaryLine: '电机电控集成、EPOWER 国产化' },
  { id: 'WH-ENT-034', seq: 34, tierCode: 'mid', segment: '电驱动与动力总成系统', displayName: '东风（十堰）有色铸件有限公司', businessContext: '', summaryLine: '电驱铸件' },
  { id: 'WH-ENT-035', seq: 35, tierCode: 'mid', segment: '热管理与高压电气系统', displayName: '启新热系统', businessContext: '', summaryLine: '跃创旗下集成热管理模块' },
  { id: 'WH-ENT-036', seq: 36, tierCode: 'mid', segment: '热管理与高压电气系统', displayName: '鹏翎股份武汉生产基地', businessContext: '', summaryLine: '热管理流体管路' },
  { id: 'WH-ENT-037', seq: 37, tierCode: 'mid', segment: '热管理与高压电气系统', displayName: '逸航汽车零部件（武汉）', businessContext: '', summaryLine: '高压线束、800V 平台' },
  { id: 'WH-ENT-038', seq: 38, tierCode: 'mid', segment: '底盘与制动系统', displayName: '采埃孚（武汉）', businessContext: '', summaryLine: '线控制动、电子驻车卡钳' },
  { id: 'WH-ENT-039', seq: 39, tierCode: 'mid', segment: '底盘与制动系统', displayName: '驭新智能底盘系统公司', businessContext: '', summaryLine: '跃创旗下线控底盘研发' },
  { id: 'WH-ENT-040', seq: 40, tierCode: 'mid', segment: '底盘与制动系统', displayName: '长春英利汽车工业股份有限公司', businessContext: '', summaryLine: '前端框架、车底护板' },
  { id: 'WH-ENT-041', seq: 41, tierCode: 'down', segment: '整车制造', displayName: '东风汽车集团有限公司', businessContext: '', summaryLine: '央企整车主机厂' },
  { id: 'WH-ENT-042', seq: 42, tierCode: 'down', segment: '整车制造', displayName: '神龙汽车有限公司', businessContext: '', summaryLine: '标致雪铁龙系' },
  { id: 'WH-ENT-043', seq: 43, tierCode: 'down', segment: '整车制造', displayName: '东风本田汽车有限公司', businessContext: '', summaryLine: '东风本田系车型' },
  { id: 'WH-ENT-044', seq: 44, tierCode: 'down', segment: '整车制造', displayName: '上汽通用汽车武汉分公司', businessContext: '', summaryLine: '上汽通用武汉基地' },
  {
    id: 'WH-ENT-045',
    seq: 45,
    tierCode: 'down',
    segment: '整车制造',
    displayName: '路特斯科技（整车）',
    businessContext: '整车制造',
    summaryLine: '高端纯电动跑车及 SUV 制造',
  },
  { id: 'WH-ENT-046', seq: 46, tierCode: 'down', segment: '整车制造', displayName: '小鹏汽车武汉基地', businessContext: '', summaryLine: '小鹏 G6、G9 等' },
  { id: 'WH-ENT-047', seq: 47, tierCode: 'down', segment: '整车制造', displayName: '岚图汽车', businessContext: '', summaryLine: '东风高端新能源' },
  { id: 'WH-ENT-048', seq: 48, tierCode: 'down', segment: '后市场服务', displayName: '恒信汽车集团', businessContext: '', summaryLine: '销售与后市场服务' },
  { id: 'WH-ENT-049', seq: 49, tierCode: 'down', segment: '后市场服务', displayName: '东风汽车用品', businessContext: '', summaryLine: '后市场用品' },
  { id: 'WH-ENT-050', seq: 50, tierCode: 'plat', segment: '核心整合平台', displayName: '跃创科技', businessContext: '', summaryLine: '东风零部件统筹平台 · 6+3+N 矩阵' },
];
