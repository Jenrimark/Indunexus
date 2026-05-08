<template>
  <div class="dashboard-screen" ref="screenRef">
    <!-- 顶栏 + KPI 同区：不再单独占一块主网格上方的纵向条，主视图更高 -->
    <header class="dash-header">
      <div class="dash-header-row">
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
          <button class="back-btn" type="button" @click="router.push('/marketplace')">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
            </svg>
            返回前台
          </button>
        </div>
      </div>
      <section class="kpi-row kpi-row--in-header" aria-label="核心指标">
        <div v-for="kpi in kpiList" :key="kpi.key" class="kpi-card" :class="kpi.color">
          <div class="kpi-card-inner">
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
          </div>
          <div
            v-if="kpi.dockActions?.length"
            class="kpi-card-actions"
            :class="{ 'kpi-card-actions--pair': (kpi.dockActions?.length ?? 0) > 1 }"
          >
            <button
              v-for="btn in (kpi.dockActions ?? [])"
              :key="btn.path"
              type="button"
              class="dock-btn dock-btn--kpi"
              :title="btn.label"
              @click="navigate(btn.path)"
            >
              <div class="dock-glow"></div>
              <div class="dock-icon" v-html="btn.icon"></div>
              <span>{{ btn.label }}</span>
            </button>
          </div>
          <div class="kpi-breath"></div>
        </div>
      </section>
    </header>

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
              <div
                class="pipe-node"
                :class="{ active: aiActiveStep === i }"
                :data-tip="`${step.label} · ${step.count}`"
              >
                <div class="pipe-icon" v-html="step.icon"></div>
              </div>
              <div v-if="i < aiSteps.length - 1" class="pipe-arrow">
                <div class="flow-line" :style="{ '--flow-delay': `${i * 0.25}s` }"></div>
                <div class="pipe-rate">{{ step.rate }}%</div>
              </div>
              <div v-else class="pipe-arrow pipe-arrow--terminal">
                <div class="flow-line"></div>
                <div class="pipe-rate pipe-rate--terminal">{{ step.count }}</div>
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

      <!-- 中央：零件–供应商 网状知识图谱（标题在组件内浮于图谱上方） -->
      <div class="panel panel-center">
        <SupplyChainKnowledgeGraph class="graph-kg-root" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import SupplyChainKnowledgeGraph from '../components/dashboard/SupplyChainKnowledgeGraph.vue'

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

// ── 大屏 KPI 旁快捷入口（与指标语义对齐） ─────────────
const dockBtnParts = { label: '零部件管理', path: '/admin/parts', icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>' }
const dockBtnUsers = { label: '用户管理', path: '/admin/users', icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>' }
const dockBtnCategories = { label: '类目管理', path: '/admin/categories', icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>' }

function navigate(path: string) { router.push(path) }

// ── KPI 翻牌 ──────────────────────────────────────────
const kpiRefs: Record<string, any> = {}
const kpiList = reactive([
  { key: 'parts',   label: '零部件总数', prefix: '',  value: 1250, display: 0, trend: 3.2,  color: 'kpi-blue',   icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>', dockActions: [dockBtnParts, dockBtnCategories] },
  { key: 'users',   label: '注册用户数', prefix: '',  value: 342,  display: 0, trend: 8.1,  color: 'kpi-green',  icon: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>', dockActions: [dockBtnUsers] },
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
  const t = templates[Math.floor(Math.random() * templates.length)]!
  eventLog.value.unshift({ id: eventId++, text: t.text, time: '刚刚', type: t.type })
  if (eventLog.value.length > 8) eventLog.value.pop()
}


// ── ECharts ───────────────────────────────────────────
const orderChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
let orderChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

function initCharts() {
  if (orderChartRef.value) {
    orderChart = echarts.init(orderChartRef.value, 'dark')
    const orderStatusData = [
      { value: 320, name: '已完成', color: '#22c55e' },
      { value: 180, name: '待付款', color: '#f59e0b' },
      { value: 210, name: '已发货', color: '#60a5fa' },
      { value: 96,  name: '已取消', color: '#ef4444' },
      { value: 50,  name: '待处理', color: '#a78bfa' },
    ]
    const totalOrderCount = orderStatusData.reduce((sum, item) => sum + item.value, 0) || 1
    orderChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { show: false },
      animationDuration: 500,
      legend: {
        bottom: 0,
        textStyle: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [{
        type: 'pie',
        radius: ['44%', '66%'],
        center: ['50%', '42%'],
        itemStyle: {
          borderRadius: 4,
          borderColor: '#0a0f2e',
          borderWidth: 2,
        },
        emphasis: { disabled: true },
        label: {
          show: true,
          position: 'inside',
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: (params: any) => `${Number(params.percent).toFixed(1)}%`,
        },
        labelLine: {
          show: true,
          length: 8,
          length2: 6,
          lineStyle: { color: '#94a3b8' },
        },
        data: orderStatusData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color },
          label: {
            // 优先放在环内，扇区过小时才移到外部
            position: (item.value / totalOrderCount) * 100 < 9 ? 'outside' : 'inside',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: 11,
            textBorderColor: '#020617',
            textBorderWidth: 2,
          },
          labelLine: {
            show: (item.value / totalOrderCount) * 100 < 9,
          },
        })),
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
      xAxis: { type: 'value', axisLabel: { color: '#e2e8f0', fontSize: 10, fontWeight: 'bold' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      yAxis: { type: 'category', data: cats.reverse(), axisLabel: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' } },
      series: [{
        type: 'bar', data: vals.reverse(), barMaxWidth: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#6366f1' },
            { offset: 1, color: '#a78bfa' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        label: { show: true, position: 'right', color: '#ffffff', fontSize: 11, fontWeight: 'bold', formatter: '{c}' }
      }]
    })
  }
}

// ── 生命周期 ──────────────────────────────────────────
onMounted(() => {
  // 大屏模式：锁定视口，禁止页面上下滚动
  document.documentElement.classList.add('dashboard-mode')
  document.body.classList.add('dashboard-mode')
  document.getElementById('app')?.classList.add('dashboard-mode')

  updateTime()
  timerId = window.setInterval(updateTime, 1000)
  animateKPI()
  initCharts()

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
  orderChart?.resize()
  categoryChart?.resize()
}

onUnmounted(() => {
  clearInterval(timerId)
  document.documentElement.classList.remove('dashboard-mode')
  document.body.classList.remove('dashboard-mode')
  document.getElementById('app')?.classList.remove('dashboard-mode')
  window.removeEventListener('resize', onResize)
  orderChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style scoped>
/* ── 基础 ── */
.dashboard-screen {
  width: 100vw;
  height: 100vh;
  overflow-x: auto;
  overflow-y: hidden;
  background: #020817;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(167,139,250,0.08) 0%, transparent 50%);
  color: #e2e8f0;
  font-family: 'Fira Code', 'Consolas', monospace;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ── Header（含 KPI 条，与主网格分离，不占主区 flex 高度） ── */
.dash-header {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 10px 24px 8px;
  background: rgba(15,23,42,0.8);
  border-bottom: 1px solid rgba(99,102,241,0.3);
  backdrop-filter: blur(10px);
}
.dash-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

/* ── KPI（嵌在顶栏下方，与三列主内容上下分区） ── */
.kpi-row--in-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px 0 0;
  margin-top: 8px;
  border-top: 1px solid rgba(51, 65, 85, 0.45);
}
.kpi-card {
  position: relative; overflow: hidden;
  background: rgba(15,23,42,0.7);
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 10px; padding: 12px 12px 12px 14px;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  transition: border-color 0.3s;
}
.kpi-card:hover { border-color: rgba(99,102,241,0.6); }
.kpi-card-inner {
  display: flex; align-items: center; gap: 14px;
  min-width: 0; flex: 1;
  position: relative; z-index: 1;
}
.kpi-card-actions {
  display: flex; flex-direction: column; align-items: stretch; gap: 5px;
  flex-shrink: 0; position: relative; z-index: 1;
}
.kpi-card-actions--pair {
  flex-direction: row; flex-wrap: wrap; justify-content: flex-end;
  gap: 6px; max-width: min(52%, 200px);
}
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
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 12px;
  padding: 14px 20px 12px;
  flex: 1;
  min-height: 0;
  min-width: 920px;
  align-items: stretch;
  overflow: hidden;
}
.panel { display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.panel-box {
  background: rgba(15,23,42,0.7);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 10px; padding: 14px;
  flex: 1; min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
.panel-box:hover { scrollbar-color: rgba(99, 102, 241, 0.28) transparent; }
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
  position: relative;
  width: 44px; height: 44px;
  flex: 0 0 44px;
  background: rgba(30,41,59,0.8); border: 1px solid rgba(99,102,241,0.2);
  border-radius: 999px; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}
.pipe-node.active { border-color: #6366f1; box-shadow: 0 0 12px rgba(99,102,241,0.3); }
.pipe-icon { width: 20px; height: 20px; color: #6366f1; flex-shrink: 0; }
.pipe-icon :deep(svg) { width: 100%; height: 100%; }
.pipe-node::after {
  content: attr(data-tip);
  position: absolute;
  left: 52px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  white-space: nowrap;
  font-size: 11px;
  color: #cbd5e1;
  background: rgba(15,23,42,0.94);
  border: 1px solid rgba(99,102,241,0.35);
  border-radius: 6px;
  padding: 4px 8px;
  opacity: 0;
  transition: opacity 0.18s ease;
  z-index: 3;
}
.pipe-node:hover::after {
  opacity: 1;
}
.pipe-arrow { display: flex; flex-direction: column; align-items: center; padding: 2px 0; width: 100%; }
.flow-line { width: 100%; height: 2px; background: rgba(99,102,241,0.2); border-radius: 1px; position: relative; overflow: hidden; margin: 2px 0; }
.flow-line::after {
  content: '';
  position: absolute;
  top: -1px;
  bottom: -1px;
  width: 36px;
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0),
    rgba(129, 140, 248, 0.96) 45%,
    rgba(147, 197, 253, 0.96) 60%,
    rgba(99, 102, 241, 0)
  );
  filter: drop-shadow(0 0 6px rgba(129, 140, 248, 0.7));
  transform: translateX(-42px);
  animation: flowSweep 1.6s linear infinite;
  animation-delay: var(--flow-delay, 0s);
}
.pipe-rate { font-size: 10px; color: #34d399; }
.pipe-arrow--terminal .pipe-rate--terminal {
  font-size: 12px;
  font-weight: 700;
  color: #a5b4fc;
}
.ai-realtime { margin-top: 10px; }
.realtime-label { font-size: 10px; color: #64748b; margin-bottom: 4px; }
.realtime-bar { height: 4px; background: rgba(99,102,241,0.15); border-radius: 2px; overflow: hidden; }
.realtime-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a78bfa); border-radius: 2px; transition: width 0.8s ease; }
.realtime-num { font-size: 11px; color: #a78bfa; margin-top: 4px; }

/* ── 中央图谱 ── */
.panel-center {
  background: rgba(10,15,40,0.8);
  /* 边框改由图谱内 kg-main::after 绘制在画布之上，避免节点盖住描边 */
  border: none;
  border-radius: 12px;
  padding: 0;
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}
.panel-center::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #6366f1, #a78bfa, transparent);
}
/* 与 SupplyChainKnowledgeGraph 根节点 .kg-shell 合并；禁止 column，否则会打成「导航/画布/详情」上下堆叠 */
.graph-kg-root {
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
}

.graph-kg-root :deep(.kg-shell) {
  margin-bottom: 0;
}

/* ── KPI 内嵌快捷入口（零部件 / 用户卡片右侧） ── */
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
.dock-btn--kpi {
  padding: 6px 10px; font-size: 11px; gap: 5px;
  border-radius: 7px; flex-shrink: 0;
}
.dock-btn--kpi .dock-icon { width: 14px; height: 14px; }
.dock-btn--kpi:hover { transform: translateY(-1px); }

/* ── 事件流 ── */
.event-list { display: flex; flex-direction: column; gap: 6px; overflow-x: hidden; overflow-y: auto; }
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

/* ── 动画 ── */
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes breath { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
@keyframes flowSweep {
  from { transform: translateX(-42px); }
  to { transform: translateX(calc(100% + 42px)); }
}

/* ── 响应式 ── */
@media (max-width: 1200px) {
  .main-grid { grid-template-columns: 240px 1fr 240px; }
}
@media (max-width: 900px) {
  .kpi-row--in-header {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 弱化滚动条，避免与大屏风格冲突 */
.panel-box::-webkit-scrollbar,
.event-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.panel-box::-webkit-scrollbar-thumb,
.event-list::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
}
.panel-box:hover::-webkit-scrollbar-thumb,
.event-list:hover::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.28);
}
.panel-box::-webkit-scrollbar-track,
.event-list::-webkit-scrollbar-track {
  background: transparent;
}
</style>
