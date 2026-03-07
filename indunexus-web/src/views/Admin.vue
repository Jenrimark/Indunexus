<template>
  <div class="admin-page">
    <Navbar @openAIModal="() => {}" />
    
    <!-- Main Content -->
    <div class="admin-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>数据看板</h1>
      </div>
      
      <!-- Stats Overview -->
      <section class="stats-section">
        <div class="stat-card">
          <div class="stat-icon parts-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">零部件总数</div>
            <div class="stat-value">{{ stats.totalParts }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon users-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">注册用户</div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orders-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">订单数量</div>
            <div class="stat-value">{{ stats.totalOrders }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">总营收</div>
            <div class="stat-value">¥{{ stats.totalRevenue.toLocaleString() }}</div>
          </div>
        </div>
      </section>

      <!-- Management Sections -->
      <section class="management-section">
        <h2 class="section-title">管理功能</h2>
        <div class="management-grid">
          <!-- Parts Management -->
          <div class="management-card cursor-pointer" @click="goToPartsManagement">
            <div class="card-icon parts-bg">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 class="card-title">零部件管理</h3>
            <p class="card-desc">添加、编辑、删除零部件信息</p>
            <div class="card-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- User Management -->
          <div class="management-card cursor-pointer" @click="goToUserManagement">
            <div class="card-icon users-bg">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h3 class="card-title">用户管理</h3>
            <p class="card-desc">管理用户账号和权限</p>
            <div class="card-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Category Management -->
          <div class="management-card cursor-pointer" @click="goToCategoryManagement">
            <div class="card-icon category-bg">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <h3 class="card-title">类目管理</h3>
            <p class="card-desc">管理零部件分类体系</p>
            <div class="card-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Order Management -->
          <div class="management-card cursor-pointer" @click="goToOrderManagement">
            <div class="card-icon orders-bg">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="card-title">订单管理</h3>
            <p class="card-desc">查看和处理订单</p>
            <div class="card-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- System Settings -->
          <div class="management-card cursor-pointer" @click="goToSystemSettings">
            <div class="card-icon settings-bg">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="card-title">系统设置</h3>
            <p class="card-desc">配置系统参数和选项</p>
            <div class="card-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Data Analytics -->
          <div class="management-card cursor-pointer" @click="goToAnalytics">
            <div class="card-icon analytics-bg">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 class="card-title">数据分析</h3>
            <p class="card-desc">查看业务数据和报表</p>
            <div class="card-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { useUIStore } from '../stores/ui';

const router = useRouter();
const uiStore = useUIStore();

// Mock stats data
const stats = ref({
  totalParts: 1250,
  totalUsers: 342,
  totalOrders: 856,
  totalRevenue: 1285600,
});


const goToPartsManagement = () => {
  router.push('/admin/parts');
};

const goToUserManagement = () => {
  router.push('/admin/users');
};

const goToCategoryManagement = () => {
  router.push('/admin/categories');
};

const goToOrderManagement = () => {
  router.push('/admin/orders');
};

const goToSystemSettings = () => {
  uiStore.showToast({
    type: 'info',
    message: '系统设置功能开发中',
  });
};

const goToAnalytics = () => {
  uiStore.showToast({
    type: 'info',
    message: '数据分析功能开发中',
  });
};
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-top: var(--header-height);
  padding-bottom: 2rem;
}

.admin-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all var(--transition-fast);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.parts-icon {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
}

.users-icon {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.orders-icon {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.revenue-icon {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
}

/* Management Section */
.management-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.management-card {
  position: relative;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all var(--transition-fast);
}

.management-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.card-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.parts-bg {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
}

.users-bg {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.category-bg {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.orders-bg {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.settings-bg {
  background: linear-gradient(135deg, #64748B 0%, #475569 100%);
}

.analytics-bg {
  background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.card-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.card-arrow {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 24px;
  height: 24px;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
}

.management-card:hover .card-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-header {
    padding: 1rem;
  }

  .admin-container {
    padding: 0 1rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .management-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .admin-badge {
    display: none;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
