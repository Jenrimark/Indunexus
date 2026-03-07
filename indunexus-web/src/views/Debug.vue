<template>
  <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
    <h1>调试信息</h1>
    
    <div style="background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
      <h2>认证状态</h2>
      <p><strong>是否登录:</strong> {{ authStore.isAuthenticated ? '是' : '否' }}</p>
      <p><strong>Token:</strong> {{ token ? '存在' : '不存在' }}</p>
    </div>
    
    <div style="background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
      <h2>用户信息</h2>
      <p><strong>用户名:</strong> {{ authStore.user?.username || '无' }}</p>
      <p><strong>邮箱:</strong> {{ authStore.user?.email || '无' }}</p>
      <p><strong>角色:</strong> {{ authStore.user?.role || '无' }}</p>
      <p><strong>是否管理员:</strong> {{ authStore.isAdmin ? '是' : '否' }}</p>
      <p><strong>是否供应商:</strong> {{ authStore.isSupplier ? '是' : '否' }}</p>
    </div>
    
    <div style="background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
      <h2>LocalStorage</h2>
      <pre style="background: white; padding: 1rem; overflow: auto;">{{ localStorageData }}</pre>
    </div>
    
    <div style="margin-top: 2rem;">
      <button 
        @click="goToAdmin" 
        style="padding: 1rem 2rem; background: #0369A1; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;"
      >
        尝试跳转到管理后台
      </button>
      
      <button 
        @click="reloadUser" 
        style="padding: 1rem 2rem; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-left: 1rem;"
      >
        重新加载用户信息
      </button>
    </div>
    
    <div v-if="error" style="background: #FEE2E2; color: #DC2626; padding: 1rem; margin-top: 1rem; border-radius: 8px;">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const error = ref('');

const token = computed(() => localStorage.getItem('token'));

const localStorageData = computed(() => {
  return {
    token: localStorage.getItem('token')?.substring(0, 50) + '...',
    user: localStorage.getItem('user')
  };
});

const goToAdmin = () => {
  try {
    console.log('尝试跳转到 /admin');
    console.log('用户角色:', authStore.user?.role);
    console.log('isAdmin:', authStore.isAdmin);
    router.push('/admin');
  } catch (e: any) {
    error.value = e.message;
  }
};

const reloadUser = async () => {
  try {
    await authStore.fetchCurrentUser();
    error.value = '';
  } catch (e: any) {
    error.value = '重新加载失败: ' + e.message;
  }
};
</script>
