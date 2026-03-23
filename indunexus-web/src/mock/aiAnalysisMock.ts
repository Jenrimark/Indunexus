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

interface PartStandard {
  type: string;
  code: string;
  name: string;
  region: string;
}

interface PartTemplate {
  category: string;
  sub_category: string;
  specs: Record<string, string>;
  part_id: string;
  part_name: string;
  part_number: string;
  features: string[];
  usage_description: string;
  standards: PartStandard[];
  param_notes: Record<string, string>;
  selection_tips: string[];
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
    usage_description: '用于减速器、机床主轴箱等传动系统，将旋转运动和扭矩在平行轴之间传递，适合中低速、中等载荷工况。',
    standards: [
      { type: '国家标准', code: 'GB/T 1357', name: '渐开线圆柱齿轮模数', region: '中国' },
      { type: '国际标准', code: 'ISO 54', name: '圆柱齿轮模数', region: '国际' },
      { type: '德国标准', code: 'DIN 780', name: '圆柱齿轮模数系列', region: '德国' },
      { type: '美国标准', code: 'AGMA 2001', name: '圆柱齿轮承载能力基础', region: '美国' },
    ],
    param_notes: {
      modulus: '模数越大，齿越粗，承载能力越强，但传动平稳性下降；M2适合中等载荷场景',
      material: '45号钢调质处理，综合力学性能好，适合中等载荷；重载场景建议改用20CrMnTi渗碳淬火',
      dimensions: '分度圆直径=模数×齿数，影响传动比和安装中心距设计',
      teeth: '齿数越多传动越平稳，但齿轮直径增大；30齿为常用中等规格',
      hardness: 'HRC45-50为中等硬度，兼顾耐磨性与韧性；重载高速场景可提升至HRC58-62',
    },
    selection_tips: [
      '配对齿轮的模数必须相同，压力角通常取20°，否则无法正常啮合',
      '材质选择需结合工况：轻载取铸铁，中载取45钢调质，重载取20CrMnTi渗碳淬火',
      '安装时需保证中心距公差在±0.02mm以内，并检查齿侧间隙符合精度等级要求',
    ],
  },
  {
    category: '传动零件',
    sub_category: '斜齿轮',
    specs: { modulus: 'M3', material: '20CrMnTi', dimensions: 'Φ90×30mm', teeth: '24T', helix_angle: '15°' },
    part_id: 'GEAR-002',
    part_name: '斜齿圆柱齿轮',
    part_number: 'GR-M3-24T-90H',
    features: ['模数M3', '24齿', '螺旋角15°', '渗碳淬火'],
    usage_description: '用于高速重载传动系统，如汽车变速箱、工业减速机，传动平稳、噪声低，适合连续运转工况。',
    standards: [
      { type: '国家标准', code: 'GB/T 1357', name: '渐开线圆柱齿轮模数', region: '中国' },
      { type: '国际标准', code: 'ISO 54', name: '圆柱齿轮模数', region: '国际' },
      { type: '德国标准', code: 'DIN 780', name: '圆柱齿轮模数系列', region: '德国' },
      { type: '美国标准', code: 'AGMA 2001', name: '圆柱齿轮承载能力基础', region: '美国' },
    ],
    param_notes: {
      modulus: 'M3模数较大，承载能力强，适合重载传动；需与配对齿轮模数一致',
      material: '20CrMnTi渗碳淬火，表面硬度高（HRC58-62）、心部韧性好，为重载齿轮首选材料',
      dimensions: '外径Φ90mm，需核对安装空间和轴承跨距是否满足刚度要求',
      teeth: '24齿配合螺旋角15°，重合度约1.8，传动平稳性优于直齿轮',
      helix_angle: '螺旋角15°为常用值，增大螺旋角可提升平稳性但轴向力随之增大，需配置推力轴承',
    },
    selection_tips: [
      '斜齿轮会产生轴向力，安装时必须配置能承受轴向载荷的轴承（如角接触球轴承或圆锥滚子轴承）',
      '左右旋斜齿轮成对使用可抵消轴向力，适用于高速主轴场景',
      '渗碳淬火后需进行磨齿精加工，确保精度等级达到GB/T 10095规定的6级或以上',
    ],
  },
  {
    category: '轴承',
    sub_category: '深沟球轴承',
    specs: { inner_diameter: '25mm', outer_diameter: '52mm', width: '15mm', material: 'GCr15', load_rating: '14kN' },
    part_id: 'BRG-001',
    part_name: '深沟球轴承',
    part_number: '6205-2RS',
    features: ['内径25mm', '外径52mm', '双面密封', '脂润滑'],
    usage_description: '广泛用于电机、泵、风机、减速器等旋转机械，承受径向载荷为主，也可承受一定双向轴向载荷，适合高速轻载工况。',
    standards: [
      { type: '国家标准', code: 'GB/T 276', name: '深沟球轴承外形尺寸', region: '中国' },
      { type: '国际标准', code: 'ISO 15', name: '滚动轴承径向轴承外形尺寸', region: '国际' },
      { type: '德国标准', code: 'DIN 625', name: '深沟球轴承', region: '德国' },
      { type: '日本标准', code: 'JIS B 1521', name: '深沟球轴承', region: '日本' },
    ],
    param_notes: {
      inner_diameter: '内径25mm对应轴径，配合公差通常取k5或m5（过盈配合）以防止内圈蠕动',
      outer_diameter: '外径52mm对应轴承座孔径，配合公差通常取H7（间隙配合）便于拆装',
      width: '宽度15mm影响轴向定位长度，需与轴肩和端盖配合设计',
      material: 'GCr15高碳铬轴承钢，淬火后硬度HRC60-65，耐磨性和疲劳寿命优异',
      load_rating: '基本额定动载荷14kN，用于计算L10寿命；实际工作载荷建议不超过额定值的30%',
    },
    selection_tips: [
      '2RS后缀表示双面橡胶密封，出厂已填充润滑脂，免维护；高温场景（>120°C）应选开式轴承另行润滑',
      '安装时严禁直接敲击内外圈，应使用专用压装工具或加热法（80-100°C）安装',
      '轴承游隙选择：一般工况选C3游隙，高温或过盈配合较大时选C4游隙',
    ],
  },
  {
    category: '轴承',
    sub_category: '圆锥滚子轴承',
    specs: { inner_diameter: '40mm', outer_diameter: '80mm', width: '18mm', material: 'GCr15SiMn', contact_angle: '15°' },
    part_id: 'BRG-002',
    part_name: '圆锥滚子轴承',
    part_number: '30208',
    features: ['内径40mm', '外径80mm', '接触角15°', '可分离型'],
    usage_description: '用于汽车轮毂、机床主轴、减速器输出轴等需同时承受较大径向和轴向联合载荷的场合，通常成对使用。',
    standards: [
      { type: '国家标准', code: 'GB/T 297', name: '圆锥滚子轴承外形尺寸', region: '中国' },
      { type: '国际标准', code: 'ISO 355', name: '圆锥滚子轴承外形尺寸', region: '国际' },
      { type: '德国标准', code: 'DIN 720', name: '圆锥滚子轴承', region: '德国' },
      { type: '日本标准', code: 'JIS B 1512', name: '圆锥滚子轴承', region: '日本' },
    ],
    param_notes: {
      inner_diameter: '内径40mm，安装时内圈与轴采用过盈配合（k5/m5），防止相对转动',
      outer_diameter: '外径80mm，外圈与轴承座采用间隙或过渡配合（H7/JS7）',
      width: '宽度18mm为内圈宽度，安装时需注意内外圈轴向位置调整',
      material: 'GCr15SiMn含硅锰，淬透性更好，适合大截面轴承，疲劳寿命优于GCr15',
      contact_angle: '接触角15°为小角度系列，径向承载能力强；大接触角（30°）轴向承载能力更强',
    },
    selection_tips: [
      '圆锥滚子轴承必须成对使用（面对面或背对背安装），安装后需调整轴向游隙至0.03-0.10mm',
      '润滑脂填充量为轴承空间的1/3-1/2，过多会导致温升过高',
      '定期检查轴向游隙，磨损后可通过调整垫片或螺母恢复游隙',
    ],
  },
  {
    category: '传动零件',
    sub_category: '滚子链',
    specs: { pitch: '12.7mm', roller_diameter: '7.92mm', material: '碳钢', tensile_strength: '17.8kN', standard: 'ISO 606' },
    part_id: 'CHN-001',
    part_name: '08B单排滚子链',
    part_number: 'CHN-08B-1-100L',
    features: ['节距12.7mm', '单排', '100节', 'ISO 606标准'],
    usage_description: '用于农业机械、输送设备、摩托车等中低速传动场合，结构简单、传动效率高（可达98%），适合中心距较大的传动系统。',
    standards: [
      { type: '国家标准', code: 'GB/T 1243', name: '传动用短节距精密滚子链', region: '中国' },
      { type: '国际标准', code: 'ISO 606', name: '短节距传动精密滚子链', region: '国际' },
      { type: '德国标准', code: 'DIN 8187', name: '滚子链ISO系列', region: '德国' },
      { type: '美国标准', code: 'ANSI B29.1', name: '精密滚子链和无衬套滚子链', region: '美国' },
    ],
    param_notes: {
      pitch: '节距12.7mm（1/2英寸）为08B/40号链，节距越大承载能力越强但高速性能下降',
      roller_diameter: '滚子直径7.92mm，与链轮齿槽配合，影响传动平稳性和磨损寿命',
      material: '碳钢材质，销轴和套筒经渗碳淬火处理，表面硬度HRC58-62',
      tensile_strength: '最小抗拉强度17.8kN，实际工作载荷应不超过额定值的1/6-1/8（含安全系数）',
      standard: 'ISO 606标准，与GB/T 1243互换，可与欧洲标准链轮配合使用',
    },
    selection_tips: [
      '链条节数建议取偶数，避免使用过渡链节（强度降低约20%）',
      '链轮齿数建议小链轮≥17齿，大链轮≤120齿，传动比不超过7:1',
      '定期润滑是延长链条寿命的关键，低速用脂润滑，高速用油浴或喷油润滑',
    ],
  },
  {
    category: '传动零件',
    sub_category: '同步带',
    specs: { pitch: 'HTD-5M', width: '25mm', length: '500mm', material: '氯丁橡胶+玻璃纤维', teeth: '100T' },
    part_id: 'BLT-001',
    part_name: 'HTD同步带',
    part_number: 'HTD-500-5M-25',
    features: ['HTD齿形', '节距5mm', '宽25mm', '100齿'],
    usage_description: '用于数控机床、打印机、自动化设备等需要精确同步传动的场合，无滑差、传动比恒定，适合中高速轻载精密传动。',
    standards: [
      { type: '国家标准', code: 'GB/T 11361', name: '同步带传动梯形齿同步带', region: '中国' },
      { type: '国际标准', code: 'ISO 5296', name: '同步带传动梯形齿同步带', region: '国际' },
      { type: '德国标准', code: 'DIN 7721', name: '同步带', region: '德国' },
      { type: '美国标准', code: 'ANSI/RMA IP-24', name: '同步带传动标准', region: '美国' },
    ],
    param_notes: {
      pitch: 'HTD-5M圆弧齿形，节距5mm，承载能力优于梯形齿，适合中等功率传动',
      width: '带宽25mm决定承载能力，宽度越大传递功率越大，但需对应宽度的带轮',
      length: '带长500mm（节线长度），安装时需保证两轴中心距与带长匹配，预张力适当',
      material: '氯丁橡胶耐油耐热（-20°C至+100°C），玻璃纤维芯绳提供高抗拉强度',
      teeth: '100齿，与带轮齿数配合决定传动比，小带轮齿数建议≥18齿',
    },
    selection_tips: [
      '安装时需保证两轴平行度≤0.5mm/m，否则带会跑偏并加速磨损',
      '预张力过大会加速轴承磨损，过小会跳齿；建议按厂家规定的张力值安装',
      '同步带不需要润滑，避免接触油脂，否则会导致橡胶溶胀失效',
    ],
  },
  {
    category: '紧固件',
    sub_category: '六角螺栓',
    specs: { thread: 'M12×1.75', length: '60mm', material: '10.9级合金钢', surface: '达克罗', standard: 'GB/T 5782' },
    part_id: 'BOLT-001',
    part_name: '高强度六角螺栓',
    part_number: 'BOLT-M12-60-10.9',
    features: ['M12螺纹', '60mm长', '10.9级', '达克罗涂层'],
    usage_description: '用于钢结构、机械设备、桥梁等需要高强度连接的场合，10.9级强度高、预紧力大，适合承受动载荷和振动工况。',
    standards: [
      { type: '国家标准', code: 'GB/T 5782', name: '六角头螺栓', region: '中国' },
      { type: '国际标准', code: 'ISO 4014', name: '六角头螺栓（杆部不全螺纹）', region: '国际' },
      { type: '德国标准', code: 'DIN 931', name: '六角头螺栓（杆部不全螺纹）', region: '德国' },
      { type: '美国标准', code: 'ASME B18.2.1', name: '英制六角头螺栓和螺钉', region: '美国' },
    ],
    param_notes: {
      thread: 'M12×1.75为粗牙螺纹，强度高、装配方便；精密连接可选细牙M12×1.25',
      length: '螺栓有效长度=被连接件厚度+螺母高度+垫圈厚度+2-3扣余量',
      material: '10.9级合金钢，屈服强度≥900MPa，抗拉强度≥1000MPa，适合高强度连接',
      surface: '达克罗涂层耐盐雾腐蚀≥720小时，适合户外和潮湿环境；室内可选镀锌',
      standard: 'GB/T 5782与ISO 4014、DIN 931尺寸基本一致，可互换使用',
    },
    selection_tips: [
      '高强度螺栓必须配套使用同等级螺母和垫圈，不得降级混用',
      '拧紧时应使用扭矩扳手，M12×10.9级推荐拧紧扭矩为115-135N·m',
      '重要连接部位应进行防松处理：弹簧垫圈、双螺母或螺纹锁固胶（Loctite 243）',
    ],
  },
  {
    category: '密封件',
    sub_category: '骨架油封',
    specs: { inner_diameter: '35mm', outer_diameter: '55mm', width: '10mm', material: '丁腈橡胶', lip_type: '单唇' },
    part_id: 'SEAL-001',
    part_name: '骨架旋转轴唇形密封圈',
    part_number: 'TC-35×55×10-NBR',
    features: ['内径35mm', '外径55mm', '丁腈橡胶', '单唇带弹簧'],
    usage_description: '用于旋转轴的动密封，防止润滑油脂外漏和外部灰尘、水分侵入，广泛应用于减速器、电机、液压泵等旋转机械。',
    standards: [
      { type: '国家标准', code: 'GB/T 9877', name: '旋转轴唇形密封圈结构尺寸', region: '中国' },
      { type: '国际标准', code: 'ISO 6194', name: '旋转轴唇形密封圈', region: '国际' },
      { type: '德国标准', code: 'DIN 3760', name: '旋转轴唇形密封圈', region: '德国' },
      { type: '日本标准', code: 'JIS B 2402', name: '旋转轴唇形密封圈', region: '日本' },
    ],
    param_notes: {
      inner_diameter: '内径35mm需与轴径精确匹配，轴的表面粗糙度Ra≤0.8μm，硬度HRC45以上',
      outer_diameter: '外径55mm与轴承座孔过盈配合（H8/r7），安装后不得转动',
      width: '宽度10mm决定安装空间，需在轴承座设计时预留足够的油封槽深度',
      material: '丁腈橡胶（NBR）耐矿物油，工作温度-40°C至+120°C；高温场景选氟橡胶（FKM）',
      lip_type: '单唇带弹簧结构，弹簧提供稳定的唇口压力，适合一般工况；双唇型可同时防尘',
    },
    selection_tips: [
      '安装前在唇口涂抹少量润滑脂，安装时使用专用工具均匀压入，避免唇口翻转',
      '轴的线速度超过8m/s时，应选用低摩擦型油封或PTFE唇口油封',
      '更换油封时需同时检查轴的磨损情况，轴径磨损超过0.1mm应修复后再安装新油封',
    ],
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
    usage_description: template.usage_description,
    standards: template.standards,
    param_notes: template.param_notes,
    selection_tips: template.selection_tips,
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
