// 认证状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type LoginRequest, type RegisterRequest, type UpdateProfileRequest } from '../api/auth';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  companyName?: string;
  companyDescription?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isSupplier = computed(() => user.value?.role === 'supplier');
  const isBuyer = computed(() => user.value?.role === 'buyer');
  const userRole = computed(() => user.value?.role || 'guest');

  // Actions
  async function login(credentials: LoginRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authApi.login(credentials);
      
      // 保存 token 和用户信息
      token.value = response.data.token;
      user.value = response.data.user;
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response;
    } catch (err: any) {
      error.value = err.message || '登录失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authApi.register(data);
      
      token.value = response.data.token;
      user.value = response.data.user;
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response;
    } catch (err: any) {
      error.value = err.message || '注册失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // 清除本地数据
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      loading.value = false;
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return;
    
    loading.value = true;
    
    try {
      const response = await authApi.getCurrentUser();
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err: any) {
      error.value = err.message;
      // Token 无效，清除登录状态
      await logout();
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(data: UpdateProfileRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authApi.updateProfile(data);
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
      return response;
    } catch (err: any) {
      error.value = err.message || '更新失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    token,
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isSupplier,
    isBuyer,
    userRole,
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
  };
});
