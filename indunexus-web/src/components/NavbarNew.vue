<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-brand" @click="goHome">
        <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#0e73eb"/>
          <path d="M16 8L20 16L16 24L12 16L16 8Z" fill="white"/>
        </svg>
        <span class="brand-name">InduNexus</span>
      </div>

      <!-- Desktop Navigation -->
      <div class="navbar-menu">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/products" class="nav-link">产品中心</router-link>
        <router-link to="/favorites" class="nav-link">收藏夹</router-link>
        <router-link to="/orders" class="nav-link">订单</router-link>
      </div>

      <!-- Right Actions -->
      <div class="navbar-actions">
        <button class="icon-btn" @click="$emit('open-ai-modal')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" fill="currentColor"/>
          </svg>
        </button>

        <router-link to="/cart" class="icon-btn cart-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 2H4L6 12H16L18 6H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="7" cy="16" r="1" fill="currentColor"/>
            <circle cx="15" cy="16" r="1" fill="currentColor"/>
          </svg>
          <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
        </router-link>

        <div class="user-menu" v-if="isLoggedIn">
          <button class="user-btn" @click="toggleUserMenu">
            <div class="avatar">{{ userInitial }}</div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <div v-if="showUserMenu" class="user-dropdown">
            <router-link to="/profile" class="dropdown-item">个人资料</router-link>
            <router-link to="/orders" class="dropdown-item">我的订单</router-link>
            <router-link to="/favorites" class="dropdown-item">收藏夹</router-link>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="handleLogout">退出登录</button>
          </div>
        </div>

        <router-link v-else to="/login" class="login-btn">登录</router-link>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <svg v-if="!showMobileMenu" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="mobile-menu">
      <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">首页</router-link>
      <router-link to="/products" class="mobile-nav-link" @click="closeMobileMenu">产品中心</router-link>
      <router-link to="/favorites" class="mobile-nav-link" @click="closeMobileMenu">收藏夹</router-link>
      <router-link to="/orders" class="mobile-nav-link" @click="closeMobileMenu">订单</router-link>
      <div class="mobile-divider"></div>
      <router-link v-if="!isLoggedIn" to="/login" class="mobile-nav-link" @click="closeMobileMenu">登录</router-link>
      <template v-else>
        <router-link to="/profile" class="mobile-nav-link" @click="closeMobileMenu">个人资料</router-link>
        <button class="mobile-nav-link" @click="handleLogout">退出登录</button>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

defineEmits(['open-ai-modal']);

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const showUserMenu = ref(false);
const showMobileMenu = ref(false);

const isLoggedIn = computed(() => authStore.isAuthenticated);
const userInitial = computed(() => authStore.user?.username?.charAt(0).toUpperCase() || 'U');
const cartCount = computed(() => cartStore.items.length);

const goHome = () => {
  router.push('/');
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

const handleLogout = () => {
  authStore.logout();
  showUserMenu.value = false;
  showMobileMenu.value = false;
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Brand */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.navbar-brand:hover {
  opacity: 0.8;
}

.logo-icon {
  flex-shrink: 0;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: #212529;
}

/* Menu */
.navbar-menu {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: #495057;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #0e73eb;
}

.nav-link.router-link-active {
  color: #0e73eb;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #0e73eb;
}

/* Actions */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.icon-btn:hover {
  background: #f8f9fa;
  color: #0e73eb;
}

.cart-btn .badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #dc3545;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.user-btn:hover {
  background: #f8f9fa;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0e73eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  padding: 8px 0;
  z-index: 100;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #495057;
  text-align: left;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #0e73eb;
}

.dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 8px 0;
}

.login-btn {
  padding: 8px 20px;
  background: #0e73eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #0a5bb8;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #495057;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background: white;
}

.mobile-nav-link {
  display: block;
  padding: 12px 0;
  color: #495057;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: color 0.3s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: #0e73eb;
}

.mobile-divider {
  height: 1px;
  background: #e9ecef;
  margin: 12px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-menu {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }

  .brand-name {
    font-size: 18px;
  }

  .navbar-actions {
    gap: 8px;
  }

  .login-btn {
    padding: 6px 16px;
    font-size: 13px;
  }
}
</style>
