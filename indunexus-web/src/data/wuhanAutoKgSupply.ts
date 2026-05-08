/**
 * docs/sql.md §3.1 核心企业供应链配套 — 多边有向边（供应方 → 供给对象）
 * targetLabels 经 catalog 转为 WH-CUST-* 稳定节点
 */

export interface WuhanSupplyRow {
  supplierEntityId: string;
  targetLabels: string[];
  product: string;
  mode: string;
}

export const WUHAN_SUPPLY_CHAIN_ROWS: WuhanSupplyRow[] = [
  {
    supplierEntityId: 'WH-ENT-001',
    targetLabels: ['小鹏汽车', '帅驰', '武汉锦瑞', '周边压铸产业集群'],
    product: '高性能铝合金新材料（铝液直供）',
    mode: '本地近地化配套',
  },
  {
    supplierEntityId: 'WH-ENT-002',
    targetLabels: ['通用汽车', '东风系整车', '省内新能源整车'],
    product: '一体化轻量化铝合金压铸件',
    mode: '本地 + 国内跨区域配套',
  },
  {
    supplierEntityId: 'WH-ENT-003',
    targetLabels: ['吉利汽车', '东风汽车', '一汽集团', '长安汽车', '湖北省智能网联化项目'],
    product: '智能座舱芯片「龍鹰一号」、辅助驾驶芯片「星辰一号」',
    mode: '联合研发定向配套',
  },
  {
    supplierEntityId: 'WH-ENT-004',
    targetLabels: ['一汽集团', '东风汽车', '吉利汽车', '江淮汽车', '省内商用车与专用车'],
    product: '智能驾驶域控制器、A1000 系列自动驾驶芯片',
    mode: '联合研发定向配套',
  },
  {
    supplierEntityId: 'WH-ENT-005',
    targetLabels: ['国内主流主机厂', '汽车电子集成商', '省内电驱动与商用车企业'],
    product: '车用 MEMS 传感器',
    mode: '本地 + 国内跨区域配套',
  },
  {
    supplierEntityId: 'WH-ENT-006',
    targetLabels: ['一汽大众', '上汽大众', '比亚迪', '吉利汽车', '襄十随汽车产业'],
    product: '玻璃升降器、镁铝合金铸件、冲压焊接零部件',
    mode: '省内产业链分工配套',
  },
  {
    supplierEntityId: 'WH-ENT-007',
    targetLabels: ['东风奕派', '东风猛士', '比亚迪', '奇瑞汽车', '三一重工', '省内商用车与专用车'],
    product: '钣金件、焊接总成、底盘冲焊件',
    mode: '本地近地化配套',
  },
  {
    supplierEntityId: 'WH-ENT-008',
    targetLabels: ['路特斯武汉工厂', '武汉经开区新能源整车企业'],
    product: '汽车冲压零配件',
    mode: '零距离隔墙供应',
  },
  {
    supplierEntityId: 'WH-ENT-009',
    targetLabels: ['东风日产', '东风本田', '岚图汽车', '中国重汽', '省内整车厂', '出口欧美市场'],
    product: '白车身分总成、防撞梁、动力电池箱体',
    mode: '本地 + 省内 + 海外出口',
  },
  {
    supplierEntityId: 'WH-ENT-010',
    targetLabels: ['吉利银河新车型'],
    product: '新能源汽车车身覆盖件、底盘结构件、电池箱体',
    mode: '快速响应配套（43 天投产）',
  },
  {
    supplierEntityId: 'WH-ENT-015',
    targetLabels: ['东风汽车', '一汽集团', '吉利汽车', '比亚迪', '沃尔沃', '欧亚多国出口', '省内全产业链'],
    product: '汽车喇叭、开关、车锁、电子阀件',
    mode: '本地 + 国内 + 海外出口',
  },
  {
    supplierEntityId: 'WH-ENT-017',
    targetLabels: ['比亚迪', '奇瑞汽车', '蔚来汽车', '全球二十多个国家和地区市场'],
    product: '汽车喇叭',
    mode: '国内 + 海外出口',
  },
  {
    supplierEntityId: 'WH-ENT-018',
    targetLabels: ['吉利汽车', '路特斯科技', '沃尔沃汽车', '全球十二个汽车品牌', '省内新能源整车'],
    product: '智能座舱计算平台、车载 OS',
    mode: '联合研发定向配套',
  },
  {
    supplierEntityId: 'WH-ENT-022',
    targetLabels: ['岚图汽车', '东风乘用车', '小鹏汽车', '赛力斯', '武汉经开区新能源整车厂'],
    product: '仪表板、保险杠、门内饰板总成',
    mode: '联合研发定向配套（研发团队常驻客户周边）',
  },
  {
    supplierEntityId: 'WH-ENT-027',
    targetLabels: ['东风汽车', '小鹏汽车', '襄十随新能源商用车与专用车'],
    product: '动力电池电芯及 PACK',
    mode: '本地 + 省内产业链分工配套',
  },
  {
    supplierEntityId: 'WH-ENT-030',
    targetLabels: ['国内主流新能源整车厂', '东风系主机厂', '岚图汽车', '小鹏汽车'],
    product: '电驱动模块、多合一电驱系统',
    mode: '本地 + 国内跨区域配套',
  },
  {
    supplierEntityId: 'WH-ENT-031',
    targetLabels: ['东风系全系新能源车型', '襄十随新能源整车与专用车'],
    product: '纯电、混动动力总成系统',
    mode: '省内产业链分工配套',
  },
  {
    supplierEntityId: 'WH-ENT-037',
    targetLabels: ['东风汽车', '上汽通用', '赛力斯', '比亚迪', '小鹏汽车', '蔚来汽车'],
    product: '汽车线束（支持 800V 高压平台）',
    mode: '本地 + 国内跨区域配套',
  },
  {
    supplierEntityId: 'WH-ENT-038',
    targetLabels: ['国内主流新能源整车厂', '东风系主机厂', '岚图汽车', '小鹏汽车', '亚太市场'],
    product: '电子驻车卡钳、线控制动卡钳',
    mode: '本地 + 国内 + 亚太出口',
  },
  {
    supplierEntityId: 'WH-ENT-041',
    targetLabels: ['全国市场', '全球市场'],
    product: '全系列汽车产品',
    mode: '全球销售网络',
  },
  {
    supplierEntityId: 'WH-ENT-045',
    targetLabels: ['全球高端汽车市场'],
    product: '高端纯电动车型',
    mode: '全球销售网络',
  },
  {
    supplierEntityId: 'WH-ENT-048',
    targetLabels: ['湖北省汽车消费者', '全国汽车消费者'],
    product: '汽车销售、维修保养',
    mode: '线下门店网络',
  },
  {
    supplierEntityId: 'WH-ENT-050',
    targetLabels: ['东风系整车厂', '吉利汽车', '岚图汽车', '本地主机厂', '湖北省汽车全产业链'],
    product: '智能驾驶、智能底盘、热管理、电池系统等',
    mode: '集团内部协同 + 外部配套',
  },
];
