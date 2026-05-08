<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo" @click="$router.push('/')">
            <svg viewBox="0 0 24 24" fill="currentColor" class="logo-icon">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span>智鉴车件</span>
          </div>
          
          <nav class="admin-nav">
            <router-link to="/admin" end class="nav-item" active-class="active">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              概览
            </router-link>
            
            <router-link to="/admin/users" class="nav-item" active-class="active">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              用户管理
            </router-link>
            
            <router-link to="/admin/categories" class="nav-item" active-class="active">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              类目管理
            </router-link>
            
            <router-link to="/admin/parts" class="nav-item" active-class="active">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              零部件管理
            </router-link>
          </nav>
        </div>
        
        <div class="header-right">
          <div class="user-info">
            <img :src="authStore.user?.avatar" :alt="authStore.user?.username" class="user-avatar" />
            <span class="username">{{ authStore.user?.username }}</span>
            <span class="role-badge">管理员</span>
          </div>
          
          <button class="btn-back" @click="$router.push('/marketplace')">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            返回前台
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #F8FAFC;
}

.admin-header {
  background: white;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-cta);
}

.logo span {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.admin-nav {
  display: flex;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item svg {
  width: 1.25rem;
  height: 1.25rem;
}

.nav-item:hover {
  background: #F1F5F9;
  color: var(--color-text);
}

.nav-item.active {
  background: var(--color-cta);
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.username {
  font-weight: 500;
  color: var(--color-text);
}

.role-badge {
  padding: 0.25rem 0.75rem;
  background: var(--color-cta);
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  color: var(--color-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.btn-back svg {
  width: 1.25rem;
  height: 1.25rem;
}

.admin-main {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .header-left {
    gap: 1rem;
  }
  
  .admin-nav {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .admin-main {
    padding: 1rem;
  }
}
</style>
