<template>
  <div class="supplier-layout">
    <!-- 侧边栏 -->
    <aside class="supplier-sidebar dark-bg">
      <div class="sidebar-header">
        <div class="logo">
          <img src="/favicon-32x32.png" alt="智鉴车件" class="logo-icon" />
          <span>智鉴车件</span>
        </div>
        <div class="supplier-badge">供应商工作台</div>
      </div>

      <nav class="sidebar-nav">
        <a href="#" :class="['nav-item', { active: currentView === 'dashboard' }]" @click.prevent="currentView = 'dashboard'">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span>数据看板</span>
        </a>
        
        <a href="#" :class="['nav-item', { active: currentView === 'products' }]" @click.prevent="currentView = 'products'">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
          </svg>
          <span>我的产品</span>
        </a>
        
        <a href="#" :class="['nav-item', { active: currentView === 'orders' }]" @click.prevent="currentView = 'orders'">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          <span>订单管理</span>
        </a>
        
        <a href="#" :class="['nav-item', { active: currentView === 'shop' }]" @click.prevent="currentView = 'shop'">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
          </svg>
          <span>店铺管理</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="btn-home" @click="router.push('/')">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span>返回首页</span>
        </button>
        <button class="logout-btn" @click="handleLogout">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="supplier-main">
      <header class="supplier-header">
        <h1>{{ viewTitle }}</h1>
        <div class="header-actions">
          <div class="user-info">
            <div class="company-info">
              <span class="company-name">{{ authStore.user?.username }}</span>
              <span class="company-desc">{{ companyName }}</span>
            </div>
            <div class="user-avatar">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div class="supplier-content">
        <!-- 数据看板 -->
        <div v-if="currentView === 'dashboard'" class="dashboard-view">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon products">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalProducts }}</div>
                <div class="stat-label">在售产品</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon orders">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalOrders }}</div>
                <div class="stat-label">总订单数</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon revenue">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">¥{{ stats.totalRevenue.toLocaleString() }}</div>
                <div class="stat-label">总销售额</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon views">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalViews }}</div>
                <div class="stat-label">产品浏览量</div>
              </div>
            </div>
          </div>

          <div class="welcome-card">
            <h3>👋 欢迎回来，{{ authStore.user?.username }}！</h3>
            <p>{{ companyName }}</p>
            <p class="tip">您可以在这里管理您的产品、查看订单和店铺数据</p>
          </div>
        </div>

        <!-- 其他视图 -->
        <div v-else class="placeholder-view">
          <h2>{{ viewTitle }}</h2>
          <p>功能开发中...</p>
          <button class="btn-primary" @click="currentView = 'dashboard'">返回看板</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

const currentView = ref('dashboard');

const viewTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: '数据看板',
    products: '我的产品',
    orders: '订单管理',
    shop: '店铺管理',
  };
  return titles[currentView.value] || '供应商工作台';
});

const companyName = computed(() => {
  // 这里可以从用户信息中获取公司名称
  return 'SKF 轴承（中国）有限公司';
});

const stats = ref({
  totalProducts: 5,
  totalOrders: 23,
  totalRevenue: 12580,
  totalViews: 1234,
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    uiStore.showToast({
      type: 'success',
      message: '已退出登录',
    });
    router.push('/login');
  } catch (error) {
    uiStore.showToast({
      type: 'error',
      message: '退出登录失败',
    });
  }
};
</script>

<style scoped>
.supplier-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.supplier-sidebar {
  width: 260px;
  background: var(--color-primary);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.logo span {
  font-size: 1.25rem;
  font-weight: 700;
}

.supplier-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--color-cta);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: var(--color-cta);
  color: white;
}

.nav-item svg {
  width: 20px;
  height: 20px;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-home {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #93c5fd;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-home:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-home svg {
  width: 20px;
  height: 20px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #fca5a5;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.logout-btn svg {
  width: 20px;
  height: 20px;
}

.supplier-main {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

.supplier-header {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.supplier-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.company-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.company-name {
  font-weight: 600;
  color: #1e293b;
}

.company-desc {
  font-size: 0.75rem;
  color: #64748b;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-cta);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar svg {
  width: 24px;
  height: 24px;
  color: white;
}

.supplier-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.stat-icon.products {
  background: var(--color-cta);
}

.stat-icon.orders {
  background: var(--color-secondary);
}

.stat-icon.revenue {
  background: var(--color-success);
}

.stat-icon.views {
  background: var(--color-cta);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.welcome-card {
  background: var(--color-cta);
  color: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.welcome-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.welcome-card p {
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.welcome-card .tip {
  font-size: 0.875rem;
  opacity: 0.8;
}

.placeholder-view {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.placeholder-view h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.placeholder-view p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: var(--color-cta);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
