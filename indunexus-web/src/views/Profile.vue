<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="profile-header">
      <div class="header-content">
        <button class="back-btn cursor-pointer" @click="goBack">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          返回
        </button>
        <h1 class="page-title">个人信息</h1>
        <div class="header-actions">
          <button v-if="!isEditing" class="edit-btn cursor-pointer" @click="startEdit">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            编辑
          </button>
          <template v-else>
            <button class="cancel-btn cursor-pointer" @click="cancelEdit">取消</button>
            <button class="save-btn cursor-pointer" @click="saveProfile">保存</button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="profile-container">
      <!-- Avatar Section -->
      <section class="profile-section avatar-section">
        <div class="avatar-wrapper">
          <img :src="editForm.avatar || user.avatar" :alt="user.username" class="avatar" />
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="file-input"
            @change="handleAvatarChange"
          />
          <button 
            v-if="isEditing" 
            class="avatar-upload-btn cursor-pointer" 
            @click="triggerAvatarUpload"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
              <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
            </svg>
            上传头像
          </button>
        </div>
        <div class="avatar-info">
          <h2 class="username">{{ user.username }}</h2>
          <span class="role-badge" :class="`role-${user.role}`">
            {{ getRoleLabel(user.role) }}
          </span>
          <p class="join-date">加入于 {{ formatDate(user.createdAt) }}</p>
        </div>
      </section>

      <!-- Basic Information -->
      <section class="profile-section">
        <h3 class="section-title">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          基本信息
        </h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              用户名
            </label>
            <input
              v-if="isEditing"
              v-model="editForm.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
            />
            <div v-else class="form-value">{{ user.username }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              邮箱
            </label>
            <input
              v-if="isEditing"
              v-model="editForm.email"
              type="email"
              class="form-input"
              placeholder="请输入邮箱"
            />
            <div v-else class="form-value">{{ user.email }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              角色
            </label>
            <div class="form-value">
              <span class="role-badge" :class="`role-${user.role}`">
                {{ getRoleLabel(user.role) }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              注册时间
            </label>
            <div class="form-value">{{ formatDate(user.createdAt) }}</div>
          </div>
        </div>
      </section>

      <!-- Company Information (if applicable) -->
      <section v-if="user.role === 'supplier' || user.role === 'buyer'" class="profile-section">
        <h3 class="section-title">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
          </svg>
          公司信息
        </h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
              </svg>
              公司名称
            </label>
            <input
              v-if="isEditing"
              v-model="editForm.companyName"
              type="text"
              class="form-input"
              placeholder="请输入公司名称"
            />
            <div v-else class="form-value">{{ user.companyName || '未填写' }}</div>
          </div>

          <div class="form-group full-width">
            <label class="form-label">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              公司简介
            </label>
            <textarea
              v-if="isEditing"
              v-model="editForm.companyDescription"
              class="form-textarea"
              rows="4"
              placeholder="请输入公司简介"
            ></textarea>
            <div v-else class="form-value">{{ user.companyDescription || '未填写' }}</div>
          </div>
        </div>
      </section>

      <!-- Account Settings -->
      <section class="profile-section">
        <h3 class="section-title">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
          账户设置
        </h3>
        <div class="settings-list">
          <button class="setting-item cursor-pointer" @click="handleChangePassword">
            <div class="setting-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="setting-content">
              <div class="setting-title">修改密码</div>
              <div class="setting-desc">定期更换密码以保护账户安全</div>
            </div>
            <svg class="setting-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <button class="setting-item danger-item cursor-pointer" @click="handleLogout">
            <div class="setting-icon danger-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="setting-content">
              <div class="setting-title">退出登录</div>
              <div class="setting-desc">退出当前账户</div>
            </div>
            <svg class="setting-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

const avatarInput = ref<HTMLInputElement | null>(null);
const isEditing = ref(false);

const user = computed(() => {
  const currentUser = authStore.user;
  if (!currentUser) {
    return {
      id: '',
      username: 'Guest',
      email: 'guest@example.com',
      role: 'buyer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      createdAt: new Date().toISOString(),
      companyName: '',
      companyDescription: '',
    };
  }
  return {
    ...currentUser,
    companyName: currentUser.companyName || '',
    companyDescription: currentUser.companyDescription || '',
  };
});

const editForm = reactive({
  username: '',
  email: '',
  avatar: '',
  companyName: '',
  companyDescription: '',
});

const goBack = () => {
  router.back();
};

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    supplier: '供应商',
    buyer: '采购员',
  };
  return roleMap[role] || role;
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const startEdit = () => {
  isEditing.value = true;
  editForm.username = user.value.username;
  editForm.email = user.value.email;
  editForm.avatar = user.value.avatar ?? '';
  editForm.companyName = user.value.companyName || '';
  editForm.companyDescription = user.value.companyDescription || '';
};

const cancelEdit = () => {
  isEditing.value = false;
  editForm.username = '';
  editForm.email = '';
  editForm.avatar = '';
  editForm.companyName = '';
  editForm.companyDescription = '';
};

const saveProfile = async () => {
  // 基本验证
  if (!editForm.username.trim()) {
    uiStore.showToast({
      type: 'error',
      message: '用户名不能为空',
    });
    return;
  }
  
  if (editForm.username.length < 3) {
    uiStore.showToast({
      type: 'error',
      message: '用户名至少需要 3 个字符',
    });
    return;
  }
  
  if (!editForm.email.trim()) {
    uiStore.showToast({
      type: 'error',
      message: '邮箱不能为空',
    });
    return;
  }
  
  // 简单的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(editForm.email)) {
    uiStore.showToast({
      type: 'error',
      message: '请输入有效的邮箱地址',
    });
    return;
  }
  
  try {
    await authStore.updateProfile({
      username: editForm.username,
      email: editForm.email,
      avatar: editForm.avatar,
      companyName: editForm.companyName,
      companyDescription: editForm.companyDescription,
    });
    
    uiStore.showToast({
      type: 'success',
      message: '个人信息已更新',
    });
    isEditing.value = false;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || '更新失败，请重试';
    uiStore.showToast({
      type: 'error',
      message: errorMessage,
    });
  }
};

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const handleAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      uiStore.showToast({
        type: 'error',
        message: '请上传图片文件',
      });
      return;
    }
    
    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      uiStore.showToast({
        type: 'error',
        message: '图片大小不能超过 5MB',
      });
      return;
    }
    
    // 读取文件并预览
    const reader = new FileReader();
    reader.onload = (e) => {
      editForm.avatar = e.target?.result as string;
      uiStore.showToast({
        type: 'success',
        message: '头像已选择，请点击保存',
      });
    };
    reader.readAsDataURL(file);
  }
};

const handleChangePassword = () => {
  uiStore.showToast({
    type: 'info',
    message: '修改密码功能开发中',
  });
};

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
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

.profile-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 2rem;
  font-family: 'Open Sans', sans-serif;
}

/* Header */
.profile-header {
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #CBD5E1;
  border-radius: 0.375rem;
  color: #64748B;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.back-btn svg {
  width: 1rem;
  height: 1rem;
}

.back-btn:hover {
  background: #F8FAFC;
  color: #334155;
  border-color: #94A3B8;
}

.page-title {
  flex: 1;
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  font-family: 'Poppins', sans-serif;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.cancel-btn,
.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.edit-btn {
  background: #F97316;
  color: white;
}

.edit-btn svg {
  width: 1rem;
  height: 1rem;
}

.edit-btn:hover {
  background: #EA580C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.cancel-btn {
  background: white;
  color: #64748B;
  border: 1px solid #CBD5E1;
}

.cancel-btn:hover {
  background: #F8FAFC;
  color: #334155;
}

.save-btn {
  background: #F97316;
  color: white;
}

.save-btn:hover {
  background: #EA580C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

/* Container */
.profile-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Section */
.profile-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #E2E8F0;
  transition: all 0.2s;
}

.profile-section:hover {
  border-color: #CBD5E1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #E2E8F0;
  font-family: 'Poppins', sans-serif;
}

.section-title svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #F97316;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: linear-gradient(135deg, #64748B 0%, #475569 100%);
  color: white;
  border: none;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.file-input {
  display: none;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  color: #F97316;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.avatar-upload-btn svg {
  width: 1rem;
  height: 1rem;
}

.avatar-upload-btn:hover {
  background: #F97316;
  color: white;
  transform: scale(1.05);
}

.avatar-info {
  flex: 1;
}

.username {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'Poppins', sans-serif;
}

.role-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.join-date {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.form-label svg {
  width: 1rem;
  height: 1rem;
  color: #64748B;
}

.form-input,
.form-textarea {
  padding: 0.625rem 0.875rem;
  border: 1px solid #CBD5E1;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #334155;
  transition: all 0.2s;
  background: #FFFFFF;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #F97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-value {
  padding: 0.625rem 0.875rem;
  background: #F8FAFC;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #334155;
  border: 1px solid #E2E8F0;
}

/* Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  text-align: left;
  transition: all 0.2s;
}

.setting-item:hover {
  background: #F8FAFC;
  border-color: #F97316;
  transform: translateX(4px);
}

.setting-item.danger-item:hover {
  border-color: #DC2626;
}

.setting-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #64748B 0%, #475569 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.setting-icon.danger-icon {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
}

.setting-icon svg {
  width: 24px;
  height: 24px;
}

.setting-content {
  flex: 1;
}

.setting-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.25rem;
  font-family: 'Poppins', sans-serif;
}

.setting-desc {
  font-size: 0.8125rem;
  color: #64748B;
}

.setting-arrow {
  width: 1.25rem;
  height: 1.25rem;
  color: #94A3B8;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.setting-item:hover .setting-arrow {
  transform: translateX(4px);
  color: #F97316;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    padding: 1rem;
  }

  .profile-container {
    padding: 0 1rem;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .username {
    font-size: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .edit-btn,
  .cancel-btn,
  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
