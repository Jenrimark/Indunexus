<template>
  <div class="admin-categories-page">
    <Navbar @openAIModal="() => {}" />
    
    <div class="admin-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>类目管理</h1>
        <button class="btn-add" @click="openAddModal()">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          添加类目
        </button>
      </div>

      <!-- 类目树 -->
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="categories.length === 0" class="empty-state">
        <p>暂无类目数据</p>
        <button class="btn-add-first" @click="openAddModal()">创建第一个类目</button>
      </div>

      <div v-else class="categories-tree">
        <CategoryNode 
          v-for="category in categories" 
          :key="category.id"
          :category="category"
          @edit="openEditModal"
          @delete="deleteCategory"
          @add-child="openAddModal"
        />
      </div>
    </div>

    <!-- 添加/编辑类目弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <h2>{{ editingCategory ? '编辑类目' : '添加类目' }}</h2>
              <button class="close-btn" @click="closeModal">×</button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>类目名称（中文） *</label>
                <input 
                  v-model="formData.name" 
                  type="text"
                  placeholder="请输入类目名称"
                />
              </div>
              
              <div class="form-group">
                <label>类目名称（英文）</label>
                <input 
                  v-model="formData.name_en" 
                  type="text"
                  placeholder="请输入英文名称"
                />
              </div>
              
              <div class="form-group" v-if="!editingCategory">
                <label>父类目</label>
                <select v-model="formData.parent_id">
                  <option :value="null">无（顶级类目）</option>
                  <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">
                    {{ '　'.repeat(cat.level - 1) }}{{ cat.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>图标</label>
                <input 
                  v-model="formData.icon" 
                  type="text"
                  placeholder="图标名称或URL"
                />
              </div>
              
              <div class="form-group">
                <label>排序</label>
                <input 
                  v-model.number="formData.sort_order" 
                  type="number"
                  placeholder="数字越小越靠前"
                />
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-cancel" @click="closeModal">取消</button>
              <button class="btn-save" @click="saveCategory" :disabled="saving">
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CategoryNode from '../components/CategoryNode.vue';
import Navbar from '../components/Navbar.vue';
import { useUIStore } from '../stores/ui';
import { categoryApi, type Category } from '../api/admin';

const router = useRouter();
const uiStore = useUIStore();

const categories = ref<Category[]>([]);
const loading = ref(false);
const showModal = ref(false);
const editingCategory = ref<Category | null>(null);
const parentForNew = ref<string | null>(null);
const saving = ref(false);

const formData = ref({
  name: '',
  name_en: '',
  parent_id: null as string | null,
  icon: '',
  sort_order: 0
});

// 扁平化类目列表（用于父类目选择）
const flatCategories = computed(() => {
  const flatten = (cats: Category[], level = 1): any[] => {
    return cats.flatMap(cat => [
      { ...cat, level },
      ...flatten(cat.children || [], level + 1)
    ]);
  };
  return flatten(categories.value);
});

onMounted(() => {
  loadCategories();
});

const loadCategories = async () => {
  loading.value = true;
  try {
    categories.value = await categoryApi.getCategories();
  } catch (error: any) {
    uiStore.showToast({
      type: 'error',
      message: error.response?.data?.detail || '加载类目失败'
    });
  } finally {
    loading.value = false;
  }
};

const openAddModal = (parentId: string | null = null) => {
  editingCategory.value = null;
  parentForNew.value = parentId;
  formData.value = {
    name: '',
    name_en: '',
    parent_id: parentId,
    icon: '',
    sort_order: 0
  };
  showModal.value = true;
};

const openEditModal = (category: Category) => {
  editingCategory.value = category;
  formData.value = {
    name: category.name,
    name_en: category.name_en || '',
    parent_id: category.parent_id,
    icon: category.icon || '',
    sort_order: category.sort_order
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingCategory.value = null;
  parentForNew.value = null;
};

const saveCategory = async () => {
  if (!formData.value.name) {
    uiStore.showToast({
      type: 'error',
      message: '请输入类目名称'
    });
    return;
  }
  
  saving.value = true;
  try {
    if (editingCategory.value) {
      // 更新类目
      await categoryApi.updateCategory(editingCategory.value.id, {
        name: formData.value.name,
        name_en: formData.value.name_en || undefined,
        icon: formData.value.icon || undefined,
        sort_order: formData.value.sort_order
      });
      uiStore.showToast({
        type: 'success',
        message: '类目已更新'
      });
    } else {
      // 创建类目
      await categoryApi.createCategory({
        name: formData.value.name,
        name_en: formData.value.name_en || undefined,
        parent_id: formData.value.parent_id || undefined,
        icon: formData.value.icon || undefined,
        sort_order: formData.value.sort_order
      });
      uiStore.showToast({
        type: 'success',
        message: '类目已创建'
      });
    }
    
    closeModal();
    loadCategories();
  } catch (error: any) {
    uiStore.showToast({
      type: 'error',
      message: error.response?.data?.detail || '保存失败'
    });
  } finally {
    saving.value = false;
  }
};

const deleteCategory = async (category: Category) => {
  if (!confirm(`确定要删除类目"${category.name}"吗？`)) return;
  
  try {
    await categoryApi.deleteCategory(category.id);
    uiStore.showToast({
      type: 'success',
      message: '类目已删除'
    });
    loadCategories();
  } catch (error: any) {
    uiStore.showToast({
      type: 'error',
      message: error.response?.data?.detail || '删除失败'
    });
  }
};
</script>

<style scoped>
.admin-categories-page {
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

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-secondary);
}

.btn-add-first {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-cta);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.categories-tree {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Modal样式与用户管理页面相同 */
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
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
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
