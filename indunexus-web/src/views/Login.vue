<template>
  <div class="login-page">
    <!-- 返回按钮 - 左上角 -->
    <button class="back-button cursor-pointer" @click="handleBack">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
      </svg>
      返回
    </button>
    
    <div class="login-container">
      <!-- 登录表单 -->
      <div class="form-section">
        <div class="form-container">
          <!-- Logo & Header -->
          <div class="form-header">
            <div class="logo">
              <img src="/logo-192x192.png" alt="智鉴车件" class="logo-icon" />
            </div>
            <h1>智鉴车件</h1>
            <h2>{{ isLogin ? '登录账户' : '创建账户' }}</h2>
            <p>{{ isLogin ? '基于 AI 视觉与知识图谱的零部件智能识别系统' : '加入我们，开启智能采购之旅' }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="login-form">
            <!-- 用户名 -->
            <div class="form-group">
              <label for="username">用户名</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                placeholder="请输入用户名"
                required
                :disabled="loading"
              />
            </div>

            <!-- 邮箱 (仅注册) -->
            <div v-if="!isLogin" class="form-group">
              <label for="email">邮箱</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="请输入邮箱"
                required
                :disabled="loading"
              />
            </div>

            <!-- 密码 -->
            <div class="form-group">
              <label for="password">密码</label>
              <div class="password-input">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  required
                  :disabled="loading"
                />
                <button
                  type="button"
                  class="toggle-password cursor-pointer"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="showPassword" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                  <svg v-else viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 记住我 & 忘记密码 -->
            <div v-if="isLogin" class="form-options">
              <label class="checkbox-label cursor-pointer">
                <input v-model="rememberMe" type="checkbox" />
                <span>记住我</span>
              </label>
              <a href="#" class="forgot-password">忘记密码？</a>
            </div>

            <!-- 错误提示 -->
            <div v-if="error" class="error-message">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ error }}
            </div>

            <!-- 提交按钮 -->
            <button type="submit" class="submit-btn cursor-pointer" :disabled="loading">
              <span v-if="!loading">{{ isLogin ? '登录' : '注册' }}</span>
              <span v-else class="loading-spinner"></span>
            </button>

            <!-- 切换登录/注册 -->
            <div class="form-footer">
              <span>{{ isLogin ? '还没有账户？' : '已有账户？' }}</span>
              <button type="button" class="toggle-mode cursor-pointer" @click="toggleMode">
                {{ isLogin ? '立即注册' : '立即登录' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUIStore();

const isLogin = ref(true);
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const formData = ref({
  username: '',
  email: '',
  password: '',
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = null;
  formData.value = {
    username: '',
    email: '',
    password: '',
  };
};

const handleBack = () => {
  // 如果已登录，返回上一页
  if (authStore.isAuthenticated) {
    router.back();
  } else {
    // 未登录，返回首页
    router.push('/');
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (isLogin.value) {
      await authStore.login({
        username: formData.value.username,
        password: formData.value.password,
      });
      
      uiStore.showToast({
        type: 'success',
        message: '登录成功！',
      });
      
      // 如果有 redirect 参数，跳转到指定页面
      const redirect = route.query.redirect as string;
      if (redirect) {
        router.push(redirect);
        return;
      }
      
      // 根据用户角色跳转到不同页面
      const userRole = authStore.user?.role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'supplier') {
        router.push('/supplier');
      } else {
        router.push('/marketplace');
      }
    } else {
      await authStore.register({
        username: formData.value.username,
        email: formData.value.email,
        password: formData.value.password,
      });
      
      uiStore.showToast({
        type: 'success',
        message: '注册成功！',
      });
      
      router.push('/marketplace');
    }
  } catch (err: any) {
    error.value = err.message || (isLogin.value ? '登录失败' : '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-4);
  position: relative;
}

/* 返回按钮 - 固定在左上角 */
.back-button {
  position: fixed;
  top: var(--space-6);
  left: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: white;
  color: var(--color-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-base);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.back-button svg {
  width: 18px;
  height: 18px;
}

.back-button:hover {
  background: var(--color-gray-50);
  color: var(--color-text);
  transform: translateX(-2px);
}

.login-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15);
  overflow: hidden;
}

/* 表单区 */
.form-section {
  padding: var(--space-12);
}

.form-container {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.logo-icon {
  width: 96px;
  height: 96px;
  color: var(--color-cta);
}

.form-header h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-6);
  font-family: 'Poppins', sans-serif;
}

.form-header h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
  font-family: 'Poppins', sans-serif;
}

.form-header p {
  font-size: var(--text-sm);
  color: var(--color-secondary);
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.form-group input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all var(--transition-base);
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.form-group input:disabled {
  background: var(--color-gray-50);
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-input input {
  width: 100%;
  padding-right: var(--space-12);
}

.toggle-password {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-secondary);
  transition: color var(--transition-base);
}

.toggle-password:hover {
  color: var(--color-text);
}

.toggle-password svg {
  width: 100%;
  height: 100%;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text);
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-cta);
}

.forgot-password {
  color: var(--color-cta);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-base);
}

.forgot-password:hover {
  color: var(--color-primary);
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--text-sm);
}

.error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.submit-btn {
  padding: var(--space-4);
  background: var(--color-cta);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  transition: all var(--transition-base);
  box-shadow: 0 1px 2px rgba(3, 105, 161, 0.1);
}

.submit-btn:hover:not(:disabled) {
  background: #025a8a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-footer {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-secondary);
}

.toggle-mode {
  color: var(--color-cta);
  font-weight: 600;
  margin-left: var(--space-2);
  transition: color var(--transition-base);
}

.toggle-mode:hover {
  color: var(--color-primary);
}

/* 响应式 */
@media (max-width: 768px) {
  .login-page {
    padding: var(--space-2);
  }
  
  .back-button {
    top: var(--space-4);
    left: var(--space-4);
    padding: var(--space-2) var(--space-3);
  }
  
  .back-button svg {
    width: 16px;
    height: 16px;
  }
  
  .form-section {
    padding: var(--space-8);
  }
  
  .logo-icon {
    width: 72px;
    height: 72px;
  }
  
  .form-header h1 {
    font-size: var(--text-xl);
  }
}
</style>
