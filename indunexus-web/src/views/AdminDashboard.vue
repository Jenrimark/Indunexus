<template>
  <div class="dashboard-screen" ref="screenRef">
    <!-- 顶部标题栏 -->
    <header class="dash-header">
      <div class="header-left">
        <div class="logo-glow">
          <img src="/favicon-32x32.png" alt="InduNexus" />
        </div>
        <div>
          <div class="brand-name">InduNexus · 智链产业数智化平台</div>
          <div class="brand-sub">汽车后市场零部件智能采购 · 实时数据大屏</div>
        </div>
      </div>
      <div class="header-center">
        <div class="time-display">{{ currentTime }}</div>
        <div class="date-display">{{ currentDate }}</div>
      </div>
      <div class="header-right">
        <div class="status-dot"></div>
        <span class="status-text">系统运行正常</span>
        <button class="back-btn" @click="router.push('/admin')">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
          返回管理台
        </button>
      </div>
    </header>

    <!-- 顶部4个翻牌统计 -->
    <section class="kpi-row">
      <div v-for="kpi in kpiList" :key="kpi.key" class="kpi-card" :class="kpi.color">
        <div class="kpi-icon" v-html="kpi.icon"></div>
        <div class="kpi-body">
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-value">
            <span class="kpi-prefix">{{ kpi.prefix }}</span>
            <span class="kpi-num" :ref="el => kpiRefs[kpi.key] = el">{{ kpi.display }}</span>
          </div>
          <div class="kpi-trend" :class="kpi.trend > 0 ? 'up' : 'down'">
            {{ kpi.trend > 0 ? '▲' : '▼' }} {{ Math.abs(kpi.trend) }}% 较昨日
          </div>
        </div>
        <div class="kpi-breath"></div>
      </div>
    </section>

    <!-- 主内容三列 -->
    <div class="main-grid">
      <!-- 左侧面板 -->
      <aside class="panel panel-left">
        <!-- AI识图流转 -->
        <div class="panel-box">
          <div class="panel-title">
            <span class="title-dot"></span>AI 识图业务流转
          </div>
          <div class="ai-pipeline">
            <div v-for="(step, i) in aiSteps" :key="i" class="pipe-step">
              <div class="pipe-node" :class="{ active: aiActiveStep === i }">
                <div class="pipe-icon" v-html="step.icon"></div>
                <div class="pipe-label">{{ step.label }}</div>
                <div class="pipe-count">{{ step.count }}</div>
              </div>
              <div v-if="i < aiSteps.length - 1" class="pipe-arrow">
                <div class="flow-line">
                  <div class="flow-particle" :style="{ animationDelay: i * 0.3 + 's' }"></div>
                </div>
                <div class="pipe-rate">{{ step.rate }}%</div>
              </div>
            </div>
          </div>
          <div class="ai-realtime">
            <div class="realtime-label">实时处理队列</div>
            <div class="realtime-bar">
              <div class="realtime-fill" :style="{ width: aiQueuePct + '%' }"></div>
            </div>
            <div class="realtime-num">{{ aiQueue }} 请求/分钟</div>
          </div>
        </div>

        <!-- 订单状态分布 -->
        <div class="panel-box">
          <div class="panel-title">
            <span class="title-dot"></span>订单状态分布
          </div>
          <div ref="orderChartRef" class="echart-box"></div>
        </div>
      </aside>

      <!-- 中央3D知识图谱 -->
      <div class="panel panel-center">
        <div class="panel-title center-title">
          <span class="title-dot"></span>零件·车型 知识图谱
          <span class="graph-hint">拖拽旋转 · 滚轮缩放 · 悬停查看</span>
        </div>
        <canvas ref="graphCanvas" class="graph-canvas"></canvas>
        <!-- 悬停信息卡 -->
        <div v-if="hoveredNode" class="node-tooltip" :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }">
          <div class="tooltip-title">{{ hoveredNode.label }}</div>
          <div class="tooltip-row"><span>类型</span><span>{{ hoveredNode.type }}</span></div>
          <div class="tooltip-row"><span>库存</span><span :class="hoveredNode.stock < 20 ? 'warn' : 'ok'">{{ hoveredNode.stock }}</span></div>
          <div class="tooltip-row"><span>关联</span><span>{{ hoveredNode.links }} 个节点</span></div>
        </div>
        <!-- 底部快捷控制台 -->
        <div class="control-dock">
          <button v-for="btn in dockBtns" :key="btn.path" class="dock-btn" @click="navigate(btn.path)">
            <div class="dock-glow"></div>
            <div class="dock-icon" v-html="btn.icon"></div>
            <span>{{ btn.label }}</span>
          </button>
        </div>
      </div>

      <!-- 右侧面板 -->
      <aside class="panel panel-right">
        <!-- 类目热度 -->
        <div class="panel-box">
          <div class="panel-title">
            <span class="title-dot"></span>类目搜索热度 TOP8
          </div>
          <div ref="categoryChartRef" class="echart-box"></div>
        </div>

        <!-- 最新动态 -->
        <div class="panel-box">
          <div class="panel-title">
            <span class="title-dot"></span>实时业务动态
          </div>
          <div class="event-list">
            <transition-group name="event">
              <div v-for="ev in eventLog" :key="ev.id" class="event-item" :class="ev.type">
                <div class="event-dot"></div>
                <div class="event-content">
                  <span class="event-text">{{ ev.text }}</span>
                  <span class="event-time">{{ ev.time }}</span>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </aside>
    </div>

    <!-- 光束汇聚特效层 -->
    <canvas ref="fxCanvas" class="fx-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

// ── 时间 ──────────────────────────────────────────────
const currentTime = ref('')
const currentDate = ref('')
let timerId: number
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

// ── KPI 翻牌 ──────────────────────────────────────────
const kpiRefs: Record<string, any> = {}
const kpiList = reactive([
  { key: 'parts',   label: '零部件总数', prefix: '',  value: 1250, display: 0, trend: 3.2,  color: 'kpi-blue',   icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>' },
  { key: 'users',   label: '注册用户数', prefix: '',  value: 342,  display: 0, trend: 8.1,  color: 'kpi-green',  icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>' },
  { key: 'orders',  label: '订单总数',   prefix: '',  value: 856,  display: 0, trend: 12.5, color: 'kpi-purple', icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>' },
  { key: 'revenue', label: '总营收(元)',  prefix: '¥', value: 1285600, display: 0, trend: 5.7, color: 'kpi-orange', icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/></svg>' },
])

function animateKPI() {
  kpiList.forEach(kpi => {
    let start = 0
    const end = kpi.value
    const duration = 1800
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      kpi.display = Math.floor(eased * end)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

// ── AI 流转 ───────────────────────────────────────────
const aiActiveStep = ref(0)
const aiQueue = ref(47)
const aiQueuePct = ref(62)
const aiSteps = reactive([
  { label: '拍照上传', count: 128, rate: 94, icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>' },
  { label: 'AI识别', count: 120, rate: 88, icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 7H7v6h6V7z"/><path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clip-rule="evenodd"/></svg>' },
  { label: '匹配零件', count: 106, rate: 79, icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>' },
  { label: '完成下单', count: 84, rate: 0, icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' },
])

// ── 事件流 ────────────────────────────────────────────
interface EventItem { id: number; text: string; time: string; type: string }
const eventLog = ref<EventItem[]>([
  { id: 1, text: '用户 user_2891 完成订单 #ORD-20260323-001', time: '刚刚', type: 'order' },
  { id: 2, text: 'AI识别成功：深沟球轴承 6205，置信度 97%', time: '1分钟前', type: 'ai' },
  { id: 3, text: '新用户注册：supplier_0042 (供应商)', time: '3分钟前', type: 'user' },
  { id: 4, text: '零件库存预警：制动盘 BD-2201 库存 < 10', time: '5分钟前', type: 'warn' },
  { id: 5, text: '用户 user_1203 完成订单 #ORD-20260323-002', time: '7分钟前', type: 'order' },
])
let eventId = 10

function pushEvent() {
  const templates = [
    { text: `用户 user_${Math.floor(Math.random()*9999)} 完成订单 #ORD-${Date.now().toString().slice(-6)}`, type: 'order' },
    { text: `AI识别成功：${['轴承','制动盘','离合器片','传动轴'][Math.floor(Math.random()*4)]}，置信度 ${85+Math.floor(Math.random()*14)}%`, type: 'ai' },
    { text: `新用户注册：buyer_${Math.floor(Math.random()*9999)}`, type: 'user' },
    { text: `库存预警：零件 P-${Math.floor(Math.random()*9999)} 库存不足`, type: 'warn' },
  ]
  const t = templates[Math.floor(Math.random() * templates.length)]
  eventLog.value.unshift({ id: eventId++, text: t.text, time: '刚刚', type: t.type })
  if (eventLog.value.length > 8) eventLog.value.pop()
  triggerFX()
}

// ── 快捷控制台 ────────────────────────────────────────
const dockBtns = [
  { label: '零部件管理', path: '/admin/parts', icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>' },
  { label: '用户管理',   path: '/admin/users', icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>' },
  { label: '类目管理',   path: '/admin/categories', icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>' },
]

function navigate(path: string) { router.push(path) }

// ── ECharts ───────────────────────────────────────────
const orderChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
let orderChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

function initCharts() {
  if (orderChartRef.value) {
    orderChart = echarts.init(orderChartRef.value, 'dark')
    orderChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, textStyle: { color: '#94a3b8', fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
      series: [{
        type: 'pie', radius: ['40%', '65%'], center: ['50%', '45%'],
        itemStyle: { borderRadius: 4, borderColor: '#0a0f2e', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 320, name: '已完成', itemStyle: { color: '#22c55e' } },
          { value: 180, name: '待付款', itemStyle: { color: '#f59e0b' } },
          { value: 210, name: '已发货', itemStyle: { color: '#60a5fa' } },
          { value: 96,  name: '已取消', itemStyle: { color: '#ef4444' } },
          { value: 50,  name: '待处理', itemStyle: { color: '#a78bfa' } },
        ]
      }]
    })
  }

  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value, 'dark')
    const cats = ['轴承', '制动系统', '传动系统', '发动机', '悬挂系统', '电气系统', '密封件', '滤清器']
    const vals = [320, 280, 245, 210, 185, 160, 140, 120]
    categoryChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 8, right: 8, top: 8, bottom: 4, containLabel: true },
      xAxis: { type: 'value', axisLabel: { color: '#475569', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e293b' } } },
      yAxis: { type: 'category', data: cats.reverse(), axisLabel: { color: '#94a3b8', fontSize: 10 } },
      series: [{
        type: 'bar', data: vals.reverse(), barMaxWidth: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#6366f1' },
            { offset: 1, color: '#a78bfa' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        label: { show: true, position: 'right', color: '#94a3b8', fontSize: 10, formatter: '{c}' }
      }]
    })
  }
}

// ── 3D 知识图谱 Canvas ────────────────────────────────
const graphCanvas = ref<HTMLCanvasElement>()
interface GraphNode { x: number; y: number; z: number; vx: number; vy: number; vz: number; label: string; type: string; stock: number; links: number; r: number; color: string }
interface GraphEdge { a: number; b: number }

let nodes: GraphNode[] = []
let edges: GraphEdge[] = []
let rotX = 0.3, rotY = 0, isDragging = false
let lastMX = 0, lastMY = 0
let animFrameId: number
const hoveredNode = ref<GraphNode | null>(null)
const tooltipPos = reactive({ x: 0, y: 0 })

const carModels = ['宝马3系','奔驰C级','奥迪A4','丰田凯美瑞','本田雅阁','大众帕萨特','福特蒙迪欧','别克君越']
const partNames = ['深沟球轴承','制动盘','离合器片','传动轴','减震器','点火线圈','节气门','水泵','正时链条','刹车片','转向拉杆','空气滤芯']

function buildGraph() {
  nodes = []
  edges = []
  const R = 180
  // 车型节点（中心环）
  carModels.forEach((name, i) => {
    const angle = (i / carModels.length) * Math.PI * 2
    nodes.push({
      x: Math.cos(angle) * R * 0.5, y: (Math.random() - 0.5) * 60,
      z: Math.sin(angle) * R * 0.5,
      vx: 0, vy: 0, vz: 0,
      label: name, type: '车型', stock: 0, links: 0, r: 10,
      color: '#60a5fa'
    })
  })
  // 零件节点（外环）
  partNames.forEach((name, i) => {
    const angle = (i / partNames.length) * Math.PI * 2
    nodes.push({
      x: Math.cos(angle) * R, y: (Math.random() - 0.5) * 100,
      z: Math.sin(angle) * R,
      vx: 0, vy: 0, vz: 0,
      label: name, type: '零件', stock: Math.floor(Math.random() * 100) + 5, links: 0, r: 7,
      color: '#a78bfa'
    })
  })
  // 连线：每个零件随机连2-4辆车
  for (let p = carModels.length; p < nodes.length; p++) {
    const count = 2 + Math.floor(Math.random() * 3)
    const used = new Set<number>()
    for (let k = 0; k < count; k++) {
      let c = Math.floor(Math.random() * carModels.length)
      while (used.has(c)) c = Math.floor(Math.random() * carModels.length)
      used.add(c)
      edges.push({ a: c, b: p })
      nodes[c].links++
      nodes[p].links++
    }
  }
}

function project(x: number, y: number, z: number, w: number, h: number) {
  // 旋转 Y
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
  const x1 = x * cosY + z * sinY
  const z1 = -x * sinY + z * cosY
  // 旋转 X
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
  const y2 = y * cosX - z1 * sinX
  const z2 = y * sinX + z1 * cosX
  const fov = 600
  const scale = fov / (fov + z2 + 300)
  return { sx: w / 2 + x1 * scale, sy: h / 2 + y2 * scale, scale, z: z2 }
}

function drawGraph() {
  const canvas = graphCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)

  rotY += 0.003

  // 投影所有节点
  const projected = nodes.map(n => project(n.x, n.y, n.z, w, h))

  // 画边
  edges.forEach(e => {
    const a = projected[e.a], b = projected[e.b]
    const alpha = Math.max(0.05, Math.min(0.3, (a.scale + b.scale) / 2))
    ctx.beginPath()
    ctx.moveTo(a.sx, a.sy)
    ctx.lineTo(b.sx, b.sy)
    const grad = ctx.createLinearGradient(a.sx, a.sy, b.sx, b.sy)
    grad.addColorStop(0, `rgba(96,165,250,${alpha})`)
    grad.addColorStop(1, `rgba(167,139,250,${alpha})`)
    ctx.strokeStyle = grad
    ctx.lineWidth = 0.8
    ctx.stroke()
  })

  // 画节点（按z排序）
  const sorted = projected.map((p, i) => ({ ...p, i })).sort((a, b) => a.z - b.z)
  sorted.forEach(({ sx, sy, scale, i }) => {
    const n = nodes[i]
    const r = n.r * scale * 1.5
    // 光晕
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.5)
    glow.addColorStop(0, n.color + 'aa')
    glow.addColorStop(1, n.color + '00')
    ctx.beginPath()
    ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()
    // 节点
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fillStyle = n.color
    ctx.fill()
    ctx.strokeStyle = '#fff4'
    ctx.lineWidth = 0.5
    ctx.stroke()
    // 标签（只显示较大节点）
    if (scale > 0.85) {
      ctx.fillStyle = `rgba(226,232,240,${Math.min(1, (scale - 0.85) * 6)})`
      ctx.font = `${Math.floor(9 * scale)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(n.label, sx, sy - r - 3)
    }
  })

  animFrameId = requestAnimationFrame(drawGraph)
}

function onMouseMove(e: MouseEvent) {
  const canvas = graphCanvas.value
  if (!canvas) return
  if (isDragging) {
    rotY += (e.clientX - lastMX) * 0.005
    rotX += (e.clientY - lastMY) * 0.005
    rotX = Math.max(-1.2, Math.min(1.2, rotX))
    lastMX = e.clientX; lastMY = e.clientY
    return
  }
  // 悬停检测
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left, my = e.clientY - rect.top
  const w = canvas.width, h = canvas.height
  let found: GraphNode | null = null
  nodes.forEach(n => {
    const p = project(n.x, n.y, n.z, w, h)
    const r = n.r * p.scale * 1.5
    if (Math.hypot(p.sx - mx, p.sy - my) < r + 6) found = n
  })
  hoveredNode.value = found
  if (found) { tooltipPos.x = e.clientX - rect.left + 12; tooltipPos.y = e.clientY - rect.top - 10 }
}

function onWheel(e: WheelEvent) { e.preventDefault() }

// ── 光束特效 ─────────────────────────────────────────
const fxCanvas = ref<HTMLCanvasElement>()
interface Beam { x: number; y: number; tx: number; ty: number; life: number; maxLife: number; color: string }
const beams: Beam[] = []

function triggerFX() {
  const canvas = fxCanvas.value
  if (!canvas) return
  const w = canvas.width, h = canvas.height
  const cx = w / 2, cy = h / 2
  const colors = ['#60a5fa', '#a78bfa', '#f472b6', '#34d399']
  for (let i = 0; i < 8; i++) {
    beams.push({
      x: Math.random() * w, y: Math.random() * h,
      tx: cx, ty: cy,
      life: 0, maxLife: 40 + Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }
}

function drawFX() {
  const canvas = fxCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let i = beams.length - 1; i >= 0; i--) {
    const b = beams[i]
    b.life++
    const t = b.life / b.maxLife
    const x = b.x + (b.tx - b.x) * t
    const y = b.y + (b.ty - b.y) * t
    const alpha = Math.sin(t * Math.PI) * 0.8
    ctx.beginPath()
    ctx.moveTo(b.x, b.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = b.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
    ctx.lineWidth = 1.5
    ctx.stroke()
    if (b.life >= b.maxLife) beams.splice(i, 1)
  }
  requestAnimationFrame(drawFX)
}

// ── 生命周期 ──────────────────────────────────────────
onMounted(() => {
  updateTime()
  timerId = window.setInterval(updateTime, 1000)
  animateKPI()
  initCharts()
  buildGraph()

  // 设置 canvas 尺寸
  const gc = graphCanvas.value!
  const parent = gc.parentElement!
  gc.width = parent.clientWidth
  gc.height = parent.clientHeight - 80
  drawGraph()

  const fx = fxCanvas.value!
  fx.width = window.innerWidth
  fx.height = window.innerHeight
  drawFX()

  // 事件监听
  gc.addEventListener('mousemove', onMouseMove)
  gc.addEventListener('mousedown', (e) => { isDragging = true; lastMX = e.clientX; lastMY = e.clientY })
  gc.addEventListener('mouseup', () => { isDragging = false })
  gc.addEventListener('mouseleave', () => { isDragging = false; hoveredNode.value = null })
  gc.addEventListener('wheel', onWheel, { passive: false })

  // 模拟实时事件
  setInterval(pushEvent, 4000)
  setInterval(() => {
    aiActiveStep.value = (aiActiveStep.value + 1) % aiSteps.length
    aiQueue.value = 30 + Math.floor(Math.random() * 60)
    aiQueuePct.value = 30 + Math.floor(Math.random() * 60)
  }, 2000)

  window.addEventListener('resize', onResize)
})

function onResize() {
  const gc = graphCanvas.value
  if (gc) { gc.width = gc.parentElement!.clientWidth; gc.height = gc.parentElement!.clientHeight - 80 }
  const fx = fxCanvas.value
  if (fx) { fx.width = window.innerWidth; fx.height = window.innerHeight }
  orderChart?.resize()
  categoryChart?.resize()
}

onUnmounted(() => {
  clearInterval(timerId)
  cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', onResize)
  orderChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style scoped>
/* ── 基础 ── */
.dashboard-screen {
  width: 100vw; min-height: 100vh;
  background: #020817;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(167,139,250,0.08) 0%, transparent 50%);
  color: #e2e8f0;
  font-family: 'Fira Code', 'Consolas', monospace;
  display: flex; flex-direction: column;
  overflow: hidden; position: relative;
}

/* ── Header ── */
.dash-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 24px;
  background: rgba(15,23,42,0.8);
  border-bottom: 1px solid rgba(99,102,241,0.3);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.logo-glow img { width: 32px; height: 32px; filter: drop-shadow(0 0 8px #6366f1); }
.brand-name { font-size: 14px; font-weight: 700; color: #a5b4fc; letter-spacing: 1px; }
.brand-sub { font-size: 10px; color: #475569; }
.header-center { text-align: center; }
.time-display { font-size: 22px; font-weight: 700; color: #60a5fa; letter-spacing: 3px; font-variant-numeric: tabular-nums; }
.date-display { font-size: 11px; color: #64748b; }
.header-right { display: flex; align-items: center; gap: 10px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e; animation: pulse 2s infinite; }
.status-text { font-size: 12px; color: #64748b; }
.back-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.4); border-radius: 6px; color: #a5b4fc; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.back-btn:hover { background: rgba(99,102,241,0.3); color: #e0e7ff; }

/* ── KPI ── */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 12px 20px; flex-shrink: 0; }
.kpi-card {
  position: relative; overflow: hidden;
  background: rgba(15,23,42,0.7);
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 10px; padding: 14px 16px;
  display: flex; align-items: center; gap: 14px;
  transition: border-color 0.3s;
}
.kpi-card:hover { border-color: rgba(99,102,241,0.6); }
.kpi-blue  { border-left: 3px solid #60a5fa; }
.kpi-green { border-left: 3px solid #34d399; }
.kpi-purple{ border-left: 3px solid #a78bfa; }
.kpi-orange{ border-left: 3px solid #fb923c; }
.kpi-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-blue  .kpi-icon { background: rgba(96,165,250,0.15); color: #60a5fa; }
.kpi-green .kpi-icon { background: rgba(52,211,153,0.15); color: #34d399; }
.kpi-purple.kpi-icon { background: rgba(167,139,250,0.15); color: #a78bfa; }
.kpi-orange.kpi-icon { background: rgba(251,146,60,0.15);  color: #fb923c; }
.kpi-icon :deep(svg) { width: 20px; height: 20px; }
.kpi-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
.kpi-value { font-size: 22px; font-weight: 700; color: #f1f5f9; font-variant-numeric: tabular-nums; }
.kpi-prefix { font-size: 14px; color: #94a3b8; }
.kpi-trend { font-size: 10px; margin-top: 2px; }
.kpi-trend.up { color: #34d399; }
.kpi-trend.down { color: #f87171; }
.kpi-breath {
  position: absolute; inset: 0; border-radius: 10px; pointer-events: none;
  animation: breath 3s ease-in-out infinite;
}
.kpi-blue  .kpi-breath { box-shadow: inset 0 0 20px rgba(96,165,250,0.05); }
.kpi-green .kpi-breath { box-shadow: inset 0 0 20px rgba(52,211,153,0.05); }
.kpi-purple .kpi-breath { box-shadow: inset 0 0 20px rgba(167,139,250,0.05); }
.kpi-orange .kpi-breath { box-shadow: inset 0 0 20px rgba(251,146,60,0.05); }

/* ── 主网格 ── */
.main-grid {
  display: grid; grid-template-columns: 280px 1fr 280px;
  gap: 12px; padding: 0 20px 12px;
  flex: 1; min-height: 0;
}
.panel { display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.panel-box {
  background: rgba(15,23,42,0.7);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 10px; padding: 14px;
  flex: 1; min-height: 0; overflow: hidden;
  position: relative;
}
.panel-box::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent);
}
.panel-title {
  font-size: 12px; color: #94a3b8; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;
}
.title-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 6px #6366f1; flex-shrink: 0; }
.echart-box { width: 100%; height: calc(100% - 30px); }

/* ── AI 流转 ── */
.ai-pipeline { display: flex; flex-direction: column; gap: 0; }
.pipe-step { display: flex; align-items: center; gap: 8px; }
.pipe-node {
  flex: 1; background: rgba(30,41,59,0.8); border: 1px solid rgba(99,102,241,0.2);
  border-radius: 8px; padding: 8px 10px;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.3s;
}
.pipe-node.active { border-color: #6366f1; box-shadow: 0 0 12px rgba(99,102,241,0.3); }
.pipe-icon { width: 24px; height: 24px; color: #6366f1; flex-shrink: 0; }
.pipe-icon :deep(svg) { width: 100%; height: 100%; }
.pipe-label { font-size: 11px; color: #94a3b8; flex: 1; }
.pipe-count { font-size: 14px; font-weight: 700; color: #a5b4fc; }
.pipe-arrow { display: flex; flex-direction: column; align-items: center; padding: 2px 0; width: 100%; }
.flow-line { width: 100%; height: 2px; background: rgba(99,102,241,0.2); border-radius: 1px; position: relative; overflow: hidden; margin: 2px 0; }
.flow-particle {
  position: absolute; top: 0; left: -20%; width: 20%; height: 100%;
  background: linear-gradient(90deg, transparent, #6366f1, transparent);
  animation: flowAnim 1.5s linear infinite;
}
.pipe-rate { font-size: 10px; color: #34d399; }
.ai-realtime { margin-top: 10px; }
.realtime-label { font-size: 10px; color: #64748b; margin-bottom: 4px; }
.realtime-bar { height: 4px; background: rgba(99,102,241,0.15); border-radius: 2px; overflow: hidden; }
.realtime-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a78bfa); border-radius: 2px; transition: width 0.8s ease; }
.realtime-num { font-size: 11px; color: #a78bfa; margin-top: 4px; }

/* ── 中央图谱 ── */
.panel-center {
  background: rgba(10,15,40,0.8);
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 12px; padding: 14px;
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}
.panel-center::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #6366f1, #a78bfa, transparent);
}
.center-title { justify-content: space-between; }
.graph-hint { font-size: 10px; color: #334155; margin-left: auto; }
.graph-canvas { flex: 1; width: 100%; cursor: grab; }
.graph-canvas:active { cursor: grabbing; }

.node-tooltip {
  position: absolute; background: rgba(15,23,42,0.95); border: 1px solid rgba(99,102,241,0.5);
  border-radius: 8px; padding: 10px 14px; pointer-events: none; z-index: 10; min-width: 140px;
  backdrop-filter: blur(8px);
}
.tooltip-title { font-size: 13px; font-weight: 600; color: #a5b4fc; margin-bottom: 6px; }
.tooltip-row { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 3px; }
.tooltip-row .warn { color: #fb923c; }
.tooltip-row .ok { color: #34d399; }

/* ── 控制台 ── */
.control-dock {
  display: flex; gap: 12px; justify-content: center; padding-top: 10px;
  border-top: 1px solid rgba(99,102,241,0.15); flex-shrink: 0;
}
.dock-btn {
  position: relative; display: flex; align-items: center; gap: 8px;
  padding: 8px 20px; border-radius: 8px; cursor: pointer;
  background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.35);
  color: #a5b4fc; font-size: 12px; overflow: hidden;
  transition: all 0.25s;
}
.dock-btn:hover { background: rgba(99,102,241,0.25); border-color: #6366f1; color: #e0e7ff; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(99,102,241,0.3); }
.dock-glow {
  position: absolute; inset: 0; opacity: 0;
  background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(167,139,250,0.3));
  transition: opacity 0.25s;
}
.dock-btn:hover .dock-glow { opacity: 1; }
.dock-icon { width: 16px; height: 16px; position: relative; z-index: 1; }
.dock-icon :deep(svg) { width: 100%; height: 100%; }
.dock-btn span { position: relative; z-index: 1; }

/* ── 事件流 ── */
.event-list { display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
.event-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 8px; border-radius: 6px; background: rgba(30,41,59,0.5); }
.event-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.event-item.order .event-dot { background: #34d399; box-shadow: 0 0 6px #34d399; }
.event-item.ai    .event-dot { background: #a78bfa; box-shadow: 0 0 6px #a78bfa; }
.event-item.user  .event-dot { background: #60a5fa; box-shadow: 0 0 6px #60a5fa; }
.event-item.warn  .event-dot { background: #fb923c; box-shadow: 0 0 6px #fb923c; }
.event-content { flex: 1; min-width: 0; }
.event-text { font-size: 11px; color: #94a3b8; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-time { font-size: 10px; color: #334155; }
.event-enter-active { transition: all 0.4s ease; }
.event-enter-from { opacity: 0; transform: translateX(-10px); }

/* ── 特效层 ── */
.fx-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 50; }

/* ── 动画 ── */
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes breath { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
@keyframes flowAnim { to { left: 120%; } }

/* ── 响应式 ── */
@media (max-width: 1200px) {
  .main-grid { grid-template-columns: 240px 1fr 240px; }
}
@media (max-width: 900px) {
  .main-grid { grid-template-columns: 1fr; grid-template-rows: auto; overflow-y: auto; }
  .panel-center { min-height: 400px; }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
