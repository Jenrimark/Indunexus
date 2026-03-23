<template>
  <header class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="logo cursor-pointer">
        <img src="/favicon-32x32.png" alt="智鉴车件" class="logo-icon" />
        <span class="logo-text">智鉴车件</span>
      </router-link>

      <!-- Navigation Links -->
      <nav v-if="authStore.isAuthenticated" class="nav-links">
        <!-- 管理员菜单 -->
        <template v-if="authStore.isAdmin">
          <router-link to="/" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>首页</span>
          </router-link>
          
          <router-link to="/admin" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span>看板</span>
          </router-link>
          
          <router-link to="/admin/users" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>用户管理</span>
          </router-link>
          
          <router-link to="/admin/categories" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span>类目管理</span>
          </router-link>
          
          <router-link to="/admin/parts" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <span>零部件管理</span>
          </router-link>
        </template>
        
        <!-- 普通用户菜单 -->
        <template v-else>
          <router-link to="/" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>首页</span>
          </router-link>
          
          <router-link to="/marketplace" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span>零件广场</span>
          </router-link>
          
          <router-link v-if="authStore.isBuyer" to="/orders" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
            <span>我的订单</span>
          </router-link>
          
          <router-link v-if="authStore.isBuyer" to="/favorites" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>我的收藏</span>
          </router-link>
          <router-link v-if="authStore.isBuyer" to="/ai-analysis" class="nav-link cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span>AI分析</span>
          </router-link>
        </template>
      </nav>

      <!-- 未登录状态：只显示首页链接 -->
      <nav v-if="!authStore.isAuthenticated" class="nav-links">
        <router-link to="/" class="nav-link cursor-pointer">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span>首页</span>
        </router-link>
      </nav>

      <!-- Search Bar (Compact) - 仅登录且非管理员显示 -->
      <div v-if="authStore.isAuthenticated && !authStore.isAdmin" class="search-wrapper">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜索型号、图号、条码"
            @input="handleSearchInput"
            @focus="showSuggestions = true"
            @keydown.enter="handleSearch"
          />

          <!-- Search Suggestions -->
          <div v-if="showSuggestions && (suggestions.length > 0 || isSearching)" class="suggestions-dropdown">
            <div v-if="isSearching" class="suggestion-loading">
              <div class="loading-spinner"></div>
              <span>搜索中...</span>
            </div>
            
            <div
              v-for="suggestion in suggestions"
              :key="suggestion.partId || suggestion.text"
              class="suggestion-item cursor-pointer"
              @click="selectSuggestion(suggestion)"
            >
              <svg class="suggestion-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <div class="suggestion-content">
                <span class="suggestion-text">{{ suggestion.text }}</span>
                <span v-if="suggestion.partNumber" class="suggestion-part-number">{{ suggestion.partNumber }}</span>
              </div>
              <span v-if="suggestion.count !== undefined" class="suggestion-count">库存: {{ suggestion.count }}</span>
            </div>
          </div>
        </div>

        <!-- Search Button -->
        <button class="search-button cursor-pointer" @click="handleSearch" title="搜索">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- AI Button -->
        <button class="ai-button cursor-pointer" @click="emit('openAIModal')" title="AI识图">
          <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="ai-text">AI</span>
        </button>
      </div>

      <!-- Right Actions -->
      <div class="nav-actions">
        <!-- 未登录：显示登录按钮 -->
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="login-button cursor-pointer">
            登录 / 注册
          </router-link>
        </template>
        
        <!-- 已登录：显示购物车和用户菜单 -->
        <template v-else>
          <!-- Cart Icon -->
          <router-link v-if="authStore.isBuyer" to="/cart" class="cart-icon cursor-pointer">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </router-link>

          <!-- User Menu -->
          <div class="user-menu-wrapper" @click="toggleUserMenu">
            <div class="user-menu cursor-pointer">
              <div class="user-avatar">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="user-name">{{ authStore.user?.username || '用户' }}</span>
              <svg class="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>

            <!-- User Dropdown -->
            <div v-if="showUserMenu" class="user-dropdown" @click.stop>
            <div class="dropdown-header">
              <div class="dropdown-avatar">
                <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.user.username" />
                <svg v-else viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="dropdown-info">
                <div class="dropdown-name">{{ authStore.user?.username }}</div>
                <div class="dropdown-email">{{ authStore.user?.email }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            
            <!-- Supplier: 供应商工作台 -->
            <button v-if="authStore.isSupplier" class="dropdown-item cursor-pointer supplier-item" @click="goToSupplier">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>供应商工作台</span>
              <span class="role-badge supplier-badge">Supplier</span>
            </button>
            
            <div class="dropdown-divider"></div>
            
            <button class="dropdown-item cursor-pointer" @click="goToProfile">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              个人信息
            </button>
            <button class="dropdown-item cursor-pointer logout-item" @click="handleLogout">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { useUIStore } from '../stores/ui';
import { usePartsStore } from '../stores/parts';
import { partsApi } from '../api/parts';
import type { SearchSuggestion } from '../types';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const uiStore = useUIStore();
const partsStore = usePartsStore();

const emit = defineEmits<{
  openAIModal: [];
}>();

const showUserMenu = ref(false);
const searchQuery = ref('');
const showSuggestions = ref(false);
const suggestions = ref<SearchSuggestion[]>([]);
const isSearching = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const goToProfile = () => {
  showUserMenu.value = false;
  router.push('/profile');
};

const goToSupplier = () => {
  showUserMenu.value = false;
  router.push('/supplier');
};

// 防抖函数
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSearchInput = async () => {
  const query = searchQuery.value.trim();
  
  if (query.length === 0) {
    showSuggestions.value = false;
    suggestions.value = [];
    return;
  }
  
  // 防抖：延迟300ms后再搜索
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      isSearching.value = true;
      
      // 调用搜索API获取建议
      const response = await partsApi.search({
        keyword: query,
        page: 1,
        pageSize: 5, // 只获取前5个建议
      });
      
      // 转换为建议格式
      suggestions.value = response.data.parts.map(part => ({
        type: 'part' as const,
        text: part.name,
        partNumber: part.partNumber,
        count: part.stock,
        partId: part.id,
      }));
      
      showSuggestions.value = suggestions.value.length > 0;
    } catch (error) {
      console.error('Search suggestions failed:', error);
      suggestions.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const handleSearch = async () => {
  const query = searchQuery.value.trim();
  showSuggestions.value = false;
  
  // 如果在零件广场，直接搜索（包括空搜索，显示全部）
  if (router.currentRoute.value.path === '/marketplace') {
    try {
      await partsStore.searchParts({
        keyword: query || undefined, // 空字符串转为 undefined
        page: 1,
        pageSize: 20,
      });
      
      // 更新URL但不刷新页面
      router.replace({
        path: '/marketplace',
        query: query ? { q: query } : {},
      });
    } catch (error) {
      console.error('Search failed:', error);
      uiStore.showToast({
        type: 'error',
        message: '搜索失败，请重试',
      });
    }
  } else {
    // 如果不在零件广场，跳转到零件广场并搜索
    router.push({
      path: '/marketplace',
      query: query ? { q: query } : {},
    });
  }
};

const selectSuggestion = (suggestion: SearchSuggestion) => {
  searchQuery.value = suggestion.text;
  showSuggestions.value = false;
  handleSearch();
};

const handleLogout = async () => {
  showUserMenu.value = false;
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
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: white;
  border-bottom: 1px solid #E2E8F0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 var(--space-6);
  max-width: 1920px;
  margin: 0 auto;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
  text-decoration: none;
  transition: opacity var(--transition-base);
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--color-cta);
}

.logo-text {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: var(--space-8);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-base);
}

.nav-link svg {
  width: 18px;
  height: 18px;
}

.nav-link:hover {
  background: #F0F9FF;
  color: var(--color-cta);
}

.nav-link.router-link-active {
  background: #F0F9FF;
  color: var(--color-cta);
}

/* Search Wrapper */
.search-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  max-width: 500px;
  margin: 0 var(--space-6);
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-gray-50);
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.search-input-wrapper:focus-within {
  background: white;
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--color-secondary);
  margin-left: var(--space-3);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-gray-400);
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  color: var(--color-secondary);
  font-size: var(--text-sm);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E2E8F0;
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  transition: background-color var(--transition-base);
  border-bottom: 1px solid #F1F5F9;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--color-gray-50);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--color-cta);
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.suggestion-text {
  font-size: var(--text-sm);
  color: var(--color-text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-part-number {
  font-size: var(--text-xs);
  color: var(--color-secondary);
  font-family: var(--font-heading);
}

.suggestion-count {
  font-size: var(--text-xs);
  color: var(--color-secondary);
  flex-shrink: 0;
  padding: 2px 8px;
  background: #F1F5F9;
  border-radius: var(--radius-sm);
}

/* Search Button */
.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-cta);
  color: white;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: all var(--transition-base);
}

.search-button:hover {
  background: #025a8a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.2);
}

.search-button svg {
  width: 18px;
  height: 18px;
}

/* AI Button */
.ai-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: 0 var(--space-3);
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.ai-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.ai-button:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.ai-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

.ai-text {
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Right Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

/* Login Button */
.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-6);
  background: var(--color-cta);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--transition-base);
  box-shadow: 0 1px 3px rgba(3, 105, 161, 0.2);
}

.login-button:hover {
  background: #025a8a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3);
}

/* Cart Icon */
.cart-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-secondary);
  transition: all var(--transition-base);
  border-radius: var(--radius-md);
}

.cart-icon:hover {
  background: var(--color-gray-50);
  color: var(--color-cta);
}

.cart-icon svg {
  width: 24px;
  height: 24px;
}

.cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--color-error);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* User Menu */
.user-menu-wrapper {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-base);
}

.user-menu:hover {
  background: var(--color-gray-50);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-cta);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar svg {
  width: 18px;
  height: 18px;
}

.user-name {
  font-size: var(--text-sm);
  color: var(--color-text);
  font-weight: 500;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--color-secondary);
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 280px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-gray-50);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-cta);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.dropdown-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-avatar svg {
  width: 24px;
  height: 24px;
}

.dropdown-info {
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-email {
  font-size: var(--text-sm);
  color: var(--color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: #E2E8F0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  text-align: left;
  font-size: var(--text-sm);
  color: var(--color-text);
  transition: background-color var(--transition-base);
}

.dropdown-item svg {
  width: 18px;
  height: 18px;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.dropdown-item:hover {
  background: var(--color-gray-50);
}

.dropdown-item.admin-item,
.dropdown-item.supplier-item {
  font-weight: 600;
}

.dropdown-item.admin-item {
  background: #F0F9FF;
  color: var(--color-cta);
}

.dropdown-item.admin-item svg {
  color: var(--color-cta);
}

.dropdown-item.supplier-item {
  background: #F0F9FF;
  color: var(--color-cta);
}

.dropdown-item.supplier-item svg {
  color: var(--color-cta);
}

.dropdown-item.logout-item {
  color: var(--color-error);
}

.dropdown-item.logout-item svg {
  color: var(--color-error);
}

/* Role Badges */
.role-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-badge {
  background: var(--color-cta);
  color: white;
}

.supplier-badge {
  background: var(--color-secondary);
  color: white;
}

/* Responsive */
@media (max-width: 1200px) {
  .search-wrapper {
    max-width: 300px;
  }
}

@media (max-width: 1024px) {
  .logo-text {
    display: none;
  }
  
  .nav-link span {
    display: none;
  }
  
  .search-wrapper {
    max-width: 200px;
  }
  
  .user-name {
    display: none;
  }
  
  .chevron-icon {
    display: none;
  }
}

@media (max-width: 768px) {
  .search-wrapper {
    max-width: 120px;
  }
  
  .search-input-wrapper {
    display: none;
  }
  
  .search-button {
    width: 40px;
    height: 40px;
  }
  
  .ai-button {
    height: 40px;
    padding: 0 var(--space-3);
  }
  
  .ai-text {
    display: inline;
  }
}
</style>
