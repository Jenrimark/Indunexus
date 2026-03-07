<template>
  <div class="admin-users-page">
    <Navbar @openAIModal="() => {}" />
    
    <div class="admin-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>用户管理</h1>
        <button class="btn-add" @click="openAddModal">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          添加用户
        </button>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <select v-model="filterRole" @change="loadUsers">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="supplier">供应商</option>
          <option value="buyer">采购方</option>
        </select>
        <select v-model="filterActive" @change="loadUsers">
          <option value="">全部状态</option>
          <option value="true">正常</option>
          <option value="false">禁用</option>
        </select>
      </div>

      <!-- 用户列表 -->
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="users.length === 0" class="empty-state">
        <p>暂无用户数据</p>
      </div>

      <div v-else class="users-table">
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>公司</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <img :src="user.avatar" :alt="user.username" class="user-avatar" />
                  <span>{{ user.username }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['role-tag', user.role]">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span :class="['status-tag', user.is_active ? 'active' : 'inactive']">
                  {{ user.is_active ? '正常' : '禁用' }}
                </span>
              </td>
              <td>{{ user.company_name || '-' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" @click="openEditModal(user)" title="编辑">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button class="btn-icon danger" @click="deleteUser(user)" title="删除">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加/编辑用户弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <h2>{{ editingUser ? '编辑用户' : '添加用户' }}</h2>
              <button class="close-btn" @click="closeModal">×</button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>用户名 *</label>
                <input 
                  v-model="formData.username" 
                  type="text" 
                  :disabled="!!editingUser"
                  placeholder="请输入用户名"
                />
              </div>
              
              <div class="form-group">
                <label>邮箱 *</label>
                <input 
                  v-model="formData.email" 
                  type="email"
                  placeholder="请输入邮箱"
                />
              </div>
              
              <div class="form-group" v-if="!editingUser">
                <label>密码 *</label>
                <input 
                  v-model="formData.password" 
                  type="password"
                  placeholder="请输入密码"
                />
              </div>
              
              <div class="form-group">
                <label>角色 *</label>
                <select v-model="formData.role">
                  <option value="buyer">采购方</option>
                  <option value="supplier">供应商</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              
              <div class="form-group" v-if="editingUser">
                <label>状态</label>
                <select v-model="formData.is_active">
                  <option :value="true">正常</option>
                  <option :value="false">禁用</option>
                </select>
              </div>
              
              <div class="form-group" v-if="formData.role === 'supplier'">
                <label>公司名称</label>
                <input 
                  v-model="formData.company_name" 
                  type="text"
                  placeholder="请输入公司名称"
                />
              </div>
              
              <div class="form-group" v-if="formData.role === 'supplier'">
                <label>公司简介</label>
                <textarea 
                  v-model="formData.company_description" 
                  rows="3"
                  placeholder="请输入公司简介"
                ></textarea>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal">取消</button>
              <button class="btn-save" @click="saveUser" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '../stores/ui';
import { userApi, type User } from '../api/admin';
import Navbar from '../components/Navbar.vue';

const router = useRouter();
const uiStore = useUIStore();

const users = ref<User[]>([]);
const loading = ref(false);
const filterRole = ref('');
const filterActive = ref('');

const showModal = ref(false);
const editingUser = ref<User | null>(null);
const saving = ref(false);

const formData = ref({
  username: '',
  email: '',
  password: '',
  role: 'buyer',
  is_active: true,
  company_name: '',
  company_description: ''
});

onMounted(() => {
  loadUsers();
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (filterRole.value) params.role = filterRole.value;
    if (filterActive.value) params.is_active = filterActive.value === 'true';
    
    console.log('正在加载用户列表...', params);
    const result = await userApi.getUsers(params);
    console.log('用户列表加载成功:', result);
    users.value = result;
  } catch (error: any) {
    console.error('加载用户列表失败:', error);
    console.error('错误详情:', error.response);
    uiStore.showToast({
      type: 'error',
      message: error.response?.data?.detail || error.message || '加载用户列表失败'
    });
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  editingUser.value = null;
  formData.value = {
    username: '',
    email: '',
    password: '',
    role: 'buyer',
    is_active: true,
    company_name: '',
    company_description: ''
  };
  showModal.value = true;
};

const openEditModal = (user: User) => {
  editingUser.value = user;
  formData.value = {
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
    is_active: user.is_active,
    company_name: user.company_name || '',
    company_description: user.company_description || ''
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingUser.value = null;
};

const saveUser = async () => {
  // 验证
  if (!formData.value.username || !formData.value.email) {
    uiStore.showToast({
      type: 'error',
      message: '请填写必填项'
    });
    return;
  }
  
  if (!editingUser.value && !formData.value.password) {
    uiStore.showToast({
      type: 'error',
      message: '请输入密码'
    });
    return;
  }
  
  saving.value = true;
  try {
    if (editingUser.value) {
      // 更新用户
      await userApi.updateUser(editingUser.value.id, {
        email: formData.value.email,
        role: formData.value.role,
        is_active: formData.value.is_active,
        company_name: formData.value.company_name || undefined,
        company_description: formData.value.company_description || undefined
      });
      uiStore.showToast({
        type: 'success',
        message: '用户已更新'
      });
    } else {
      // 创建用户
      await userApi.createUser({
        username: formData.value.username,
        email: formData.value.email,
        password: formData.value.password,
        role: formData.value.role
      });
      uiStore.showToast({
        type: 'success',
        message: '用户已创建'
      });
    }
    
    closeModal();
    loadUsers();
  } catch (error: any) {
    uiStore.showToast({
      type: 'error',
      message: error.response?.data?.detail || '保存失败'
    });
  } finally {
    saving.value = false;
  }
};

const deleteUser = async (user: User) => {
  if (!confirm(`确定要删除用户 ${user.username} 吗？`)) return;
  
  try {
    await userApi.deleteUser(user.id);
    uiStore.showToast({
      type: 'success',
      message: '用户已删除'
    });
    loadUsers();
  } catch (error: any) {
    uiStore.showToast({
      type: 'error',
      message: error.response?.data?.detail || '删除失败'
    });
  }
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: '管理员',
    supplier: '供应商',
    buyer: '采购方'
  };
  return labels[role] || role;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.admin-users-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-top: var(--header-height);
}

.admin-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-primary);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-cta);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #025a8a;
  transform: translateY(-1px);
}

.btn-add svg {
  width: 1.25rem;
  height: 1.25rem;
}

.filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-bar select {
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  background: white;
  min-width: 150px;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-secondary);
}

.users-table {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #F8FAFC;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
}

td {
  padding: 1rem;
  border-top: 1px solid #E2E8F0;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.role-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-tag.admin {
  background: #FEE2E2;
  color: #DC2626;
}

.role-tag.supplier {
  background: #DBEAFE;
  color: #2563EB;
}

.role-tag.buyer {
  background: #D1FAE5;
  color: #059669;
}

.status-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-tag.active {
  background: #D1FAE5;
  color: #059669;
}

.status-tag.inactive {
  background: #FEE2E2;
  color: #DC2626;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.375rem;
  background: #F1F5F9;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #E2E8F0;
}

.btn-icon.danger:hover {
  background: #FEE2E2;
  color: #DC2626;
}

.btn-icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E2E8F0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.close-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  font-size: 1.5rem;
  color: var(--color-secondary);
  cursor: pointer;
}

.close-btn:hover {
  background: #F1F5F9;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group input:disabled {
  background: #F8FAFC;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #E2E8F0;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid #E2E8F0;
  color: var(--color-secondary);
}

.btn-cancel:hover {
  background: #F8FAFC;
}

.btn-save {
  background: var(--color-cta);
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #025a8a;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
