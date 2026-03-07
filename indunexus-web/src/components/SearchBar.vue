<template>
  <header class="search-bar">
    <div class="search-bar-container">
      <!-- Logo -->
      <div class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        <span class="logo-text">智鉴车件</span>
      </div>

      <!-- Search Input -->
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

        <select v-model="searchType" class="search-type-selector">
          <option value="auto">智能识别</option>
          <option value="model">型号</option>
          <option value="drawing">图号</option>
          <option value="barcode">条码</option>
        </select>

        <!-- Search Suggestions -->
        <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.text"
            class="suggestion-item cursor-pointer"
            @click="selectSuggestion(suggestion)"
          >
            <svg class="suggestion-icon" viewBox="0 0 20 20" fill="currentColor">
              <path v-if="suggestion.type === 'history'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              <path v-else-if="suggestion.type === 'hot'" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              <path v-else d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
            </svg>
            <span class="suggestion-text">{{ suggestion.text }}</span>
            <span v-if="suggestion.count" class="suggestion-count">{{ suggestion.count }}</span>
          </div>
        </div>
      </div>

      <!-- AI Image Recognition Button -->
      <button class="ai-button cursor-pointer" @click="emit('openAIModal')">
        <svg class="ai-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
        <span>AI识图</span>
        <div class="ai-badge">AI</div>
      </button>

      <!-- User Menu -->
      <div class="user-menu-wrapper" @click="toggleUserMenu">
        <div class="user-menu cursor-pointer">
          <div class="user-avatar">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="user-name">{{ authStore.user?.username || '用户' }}</span>
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
          
          <!-- 根据角色显示不同菜单 -->
          <!-- Admin: 管理面板 -->
          <button v-if="authStore.isAdmin" class="dropdown-item cursor-pointer admin-item" @click="goToAdmin">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
            <span>管理后台</span>
            <span class="role-badge admin-badge">Admin</span>
          </button>
          
          <!-- Supplier: 供应商工作台 -->
          <button v-if="authStore.isSupplier" class="dropdown-item cursor-pointer supplier-item" @click="goToSupplier">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span>供应商工作台</span>
            <span class="role-badge supplier-badge">Supplier</span>
          </button>
          
          <!-- Buyer: 我的订单 -->
          <button v-if="authStore.isBuyer" class="dropdown-item cursor-pointer" @click="goToOrders">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
            <span>我的订单</span>
          </button>
          
          <!-- Buyer: 我的收藏 -->
          <button v-if="authStore.isBuyer" class="dropdown-item cursor-pointer" @click="goToFavorites">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>我的收藏</span>
          </button>
          
          <div class="dropdown-divider"></div>
          
          <button class="dropdown-item cursor-pointer" @click="goToProfile">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            个人信息
          </button>
          <button class="dropdown-item cursor-pointer" @click="handleLogout">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
            </svg>
            退出登录
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';
import type { SearchSuggestion } from '../types';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

const emit = defineEmits<{
  openAIModal: [];
}>();

const searchQuery = ref('');
const searchType = ref<'auto' | 'model' | 'drawing' | 'barcode'>('auto');
const showSuggestions = ref(false);
const showUserMenu = ref(false);

// Mock suggestions data
const suggestions = ref<SearchSuggestion[]>([
  { type: 'history', text: '深沟球轴承 6205' },
  { type: 'history', text: '刹车片 东风天龙' },
  { type: 'hot', text: '液压泵', count: 1250 },
  { type: 'hot', text: '传动轴', count: 890 },
]);

const handleSearchInput = () => {
  // Debounced search suggestions
  showSuggestions.value = searchQuery.value.length > 0;
};

const handleSearch = () => {
  console.log('Searching:', searchQuery.value, searchType.value);
  showSuggestions.value = false;
};

const selectSuggestion = (suggestion: SearchSuggestion) => {
  searchQuery.value = suggestion.text;
  showSuggestions.value = false;
  handleSearch();
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const goToProfile = () => {
  showUserMenu.value = false;
  router.push('/profile');
};

const goToAdmin = () => {
  showUserMenu.value = false;
  router.push('/admin');
};

const goToSupplier = () => {
  showUserMenu.value = false;
  router.push('/supplier');
};

const goToOrders = () => {
  showUserMenu.value = false;
  router.push('/orders');
};

const goToFavorites = () => {
  showUserMenu.value = false;
  router.push('/favorites');
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
.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: white;
  border-bottom: 1px solid var(--color-gray-200);
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.search-bar-container {
  display: flex;
  align-items: center;
  gap: var(--space-4);
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
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
}

.logo-text {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

/* Search Input */
.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 600px;
  display: flex;
  align-items: center;
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.search-input-wrapper:focus-within {
  background: white;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-gray-500);
  margin-left: var(--space-4);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-3) var(--space-2);
  font-size: var(--text-base);
  color: var(--color-text);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-gray-400);
}

.search-type-selector {
  border: none;
  background: transparent;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  cursor: pointer;
  border-left: 1px solid var(--color-gray-300);
  outline: none;
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  transition: background-color var(--transition-base);
}

.suggestion-item:hover {
  background: var(--color-gray-50);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.suggestion-count {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
}

/* AI Button */
.ai-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-cta);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.ai-button:hover {
  background: #D97706;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.ai-icon {
  width: 20px;
  height: 20px;
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
  flex-shrink: 0;
}

.user-menu:hover {
  background: var(--color-gray-50);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar svg {
  width: 20px;
  height: 20px;
}

.user-name {
  font-size: var(--text-sm);
  color: var(--color-text);
  font-weight: 500;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 280px;
  background: white;
  border: 1px solid var(--color-gray-200);
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
  background: var(--color-primary);
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
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-gray-200);
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
  color: var(--color-text-secondary);
}

.dropdown-item:hover {
  background: var(--color-gray-50);
}

.dropdown-item.admin-item {
  color: var(--color-primary);
  font-weight: 500;
}

.dropdown-item.admin-item svg {
  color: var(--color-primary);
}

.dropdown-item:last-child {
  color: var(--color-error);
}

.dropdown-item:last-child svg {
  color: var(--color-error);
}

/* Role Badges */
.role-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.supplier-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.admin-item,
.supplier-item {
  font-weight: 600;
}

.admin-item {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%);
}

.supplier-item {
  background: linear-gradient(90deg, rgba(240, 147, 251, 0.05) 0%, transparent 100%);
}

/* Responsive */
@media (max-width: 1024px) {
  .logo-text {
    display: none;
  }
  
  .ai-button span {
    display: none;
  }
  
  .user-name {
    display: none;
  }
}
</style>
