<template>
  <div class="admin-parts-page">
    <Navbar @openAIModal="() => {}" />
    
    <div class="admin-container">
      <div class="page-header">
        <h1>零件管理</h1>
        <div class="header-actions">
          <button class="btn-import" @click="showImportModal = true">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            批量导入
          </button>
          <button class="btn-add" @click="openAddModal">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            添加零件
          </button>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索零件编号、名称、品牌..."
          @input="handleSearch"
        />
        <select v-model="filterCategory" @change="handleSearch">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Parts Table -->
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="parts.length === 0" class="empty-state">
        <p>暂无零部件数据</p>
        <button class="btn-add-first" @click="openAddModal">创建第一个零部件</button>
      </div>
      
      <div v-else class="parts-table">
        <table>
          <thead>
            <tr>
              <th>零件编号</th>
              <th>名称</th>
              <th>分类</th>
              <th>品牌</th>
              <th>价格</th>
              <th>库存</th>
              <th>图片</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in parts" :key="part.id">
              <td class="part-number">{{ part.part_number }}</td>
              <td>{{ part.name }}</td>
              <td>{{ getCategoryName(part.category_id) }}</td>
              <td>{{ part.brand || '-' }}</td>
              <td class="price">
                <span v-if="part.skus && part.skus[0]">
                  ¥{{ parseFloat(part.skus[0].price).toFixed(2) }}
                </span>
                <span v-else>-</span>
              </td>
              <td :class="['stock', { 'low-stock': part.skus && part.skus[0] && part.skus[0].stock < 10 }]">
                <span v-if="part.skus && part.skus[0]">
                  {{ part.skus[0].stock }}
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <img 
                  v-if="part.skus && part.skus[0] && part.skus[0].images && part.skus[0].images[0]" 
                  :src="part.skus[0].images[0]" 
                  alt="零件图片" 
                  class="part-thumbnail" 
                />
                <span v-else class="no-image">无图片</span>
              </td>
              <td class="actions">
                <button class="btn-edit" @click="openEditModal(part)" title="编辑">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button class="btn-delete" @click="deletePart(part)" title="删除">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="currentPage--" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <h2>{{ editingPart ? '编辑零件' : '添加零件' }}</h2>
              <button class="close-btn" @click="closeEditModal">×</button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>零件编号 *</label>
                <input 
                  v-model="formData.part_number" 
                  type="text" 
                  :disabled="!!editingPart"
                  required 
                />
              </div>
              
              <div class="form-group">
                <label>零件名称 *</label>
                <input v-model="formData.name" type="text" required />
              </div>
              
              <div class="form-group">
                <label>英文名称</label>
                <input v-model="formData.name_en" type="text" />
              </div>
              
              <div class="form-group">
                <label>分类 *</label>
                <select v-model="formData.category_id" required>
                  <option value="">请选择分类</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>品牌/制造商</label>
                <input v-model="formData.brand" type="text" />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>价格 *</label>
                  <input v-model.number="formData.price" type="number" step="0.01" required />
                </div>
                
                <div class="form-group">
                  <label>库存 *</label>
                  <input v-model.number="formData.stock" type="number" required />
                </div>
              </div>
              
              <div class="form-group">
                <label>描述</label>
                <textarea v-model="formData.description" rows="3"></textarea>
              </div>
              
              <div class="form-group">
                <label>图片URL（多个用逗号分隔）</label>
                <input 
                  v-model="imageUrlsInput" 
                  type="text" 
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  @input="updateImages"
                />
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-cancel" @click="closeEditModal">取消</button>
              <button class="btn-save" @click="savePart">保存</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Import Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showImportModal" class="modal-overlay" @click="showImportModal = false">
          <div class="modal-container import-modal" @click.stop>
            <div class="modal-header">
              <h2>批量导入零件</h2>
              <button class="close-btn" @click="showImportModal = false">×</button>
            </div>
            
            <div class="modal-body">
              <div class="import-instructions">
                <h3>导入说明</h3>
                <p>1. 下载模板文件，按照格式填写数据</p>
                <p>2. 支持 CSV 和 Excel 格式</p>
                <p>3. 必填字段：零件编号、名称、分类、价格、库存</p>
                <button class="btn-download-template" @click="downloadTemplate">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  下载模板
                </button>
              </div>
              
              <div class="file-upload">
                <input 
                  ref="fileInputRef" 
                  type="file" 
                  accept=".csv,.xlsx,.xls" 
                  @change="handleFileSelect"
                  style="display: none"
                />
                <button class="btn-select-file" type="button" @click="fileInputRef?.click()">
                  选择文件
                </button>
                <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
              </div>
              
              <div v-if="importProgress" class="import-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: importProgress + '%' }"></div>
                </div>
                <p>导入中... {{ importProgress }}%</p>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-cancel" @click="showImportModal = false">取消</button>
              <button class="btn-import-confirm" @click="importFile" :disabled="!selectedFile || importing">
                {{ importing ? '导入中...' : '开始导入' }}
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
import Navbar from '../components/Navbar.vue';
import { useUIStore } from '../stores/ui';
import { partApi, categoryApi } from '../api/admin';

const uiStore = useUIStore();

const parts = ref<any[]>([]);
const categories = ref<any[]>([]);
const searchQuery = ref('');
const filterCategory = ref('');
const currentPage = ref(1);
const pageSize = 20;
const totalParts = ref(0);
const totalPages = computed(() => Math.ceil(totalParts.value / pageSize));

const showEditModal = ref(false);
const showImportModal = ref(false);
const editingPart = ref<any>(null);
const selectedFile = ref<File | null>(null);
const importing = ref(false);
const importProgress = ref(0);
const loading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const imageUrlsInput = ref('');

function syncImageUrlsInput() {
  imageUrlsInput.value = formData.value.images.join(', ');
}

function updateImages() {
  formData.value.images = imageUrlsInput.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const formData = ref({
  part_number: '',
  name: '',
  name_en: '',
  category_id: '',
  brand: '',
  description: '',
  // SKU数据
  sku_code: '',
  specifications: {} as Record<string, any>,
  price: 0,
  stock: 0,
  images: [] as string[],
});

onMounted(async () => {
  await loadCategories();
  await loadParts();
});

const loadCategories = async () => {
  try {
    console.log('正在加载类目...');
    categories.value = await categoryApi.getCategories();
    console.log('类目加载成功:', categories.value);
    // 扁平化类目树
    const flatten = (cats: any[]): any[] => {
      return cats.flatMap((cat: any) => [cat, ...flatten(cat.children || [])]);
    };
    categories.value = flatten(categories.value);
    console.log('类目扁平化完成:', categories.value.length);
  } catch (error: any) {
    console.error('加载类目失败:', error);
    uiStore.showToast({
      type: 'error',
      message: '加载类目失败'
    });
  }
};

const loadParts = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize
    };
    if (searchQuery.value) params.keyword = searchQuery.value;
    if (filterCategory.value) params.category_id = filterCategory.value;
    
    console.log('正在加载零部件...', params);
    const result = await partApi.searchParts(params);
    console.log('零部件加载成功:', result);
    parts.value = result.items;
    totalParts.value = result.total;
  } catch (error: any) {
    console.error('加载零部件失败:', error);
    uiStore.showToast({
      type: 'error',
      message: '加载零部件失败'
    });
  } finally {
    loading.value = false;
  }
};

const getCategoryName = (categoryId: string) => {
  const cat = categories.value.find(c => c.id === categoryId);
  return cat?.name || '-';
};

const handleSearch = () => {
  currentPage.value = 1;
  loadParts();
};

const openAddModal = () => {
  editingPart.value = null;
  formData.value = {
    part_number: '',
    name: '',
    name_en: '',
    category_id: '',
    brand: '',
    description: '',
    sku_code: '',
    specifications: {},
    price: 0,
    stock: 0,
    images: [],
  };
  syncImageUrlsInput();
  showEditModal.value = true;
};

const openEditModal = (part: any) => {
  editingPart.value = part;
  const firstSku = part.skus && part.skus[0];
  formData.value = {
    part_number: part.part_number,
    name: part.name,
    name_en: part.name_en || '',
    category_id: part.category_id,
    brand: part.brand || '',
    description: part.description || '',
    sku_code: firstSku?.sku_code || '',
    specifications: firstSku?.specifications || {},
    price: firstSku?.price || 0,
    stock: firstSku?.stock || 0,
    images: firstSku?.images || [],
  };
  syncImageUrlsInput();
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingPart.value = null;
};

const savePart = async () => {
  updateImages();
  if (!formData.value.part_number || !formData.value.name || !formData.value.category_id) {
    uiStore.showToast({
      type: 'error',
      message: '请填写必填项'
    });
    return;
  }
  
  try {
    if (editingPart.value) {
      // 更新SPU
      await partApi.updateSPU(editingPart.value.id, {
        name: formData.value.name,
        name_en: formData.value.name_en || undefined,
        brand: formData.value.brand || undefined,
        description: formData.value.description || undefined,
        category_id: formData.value.category_id
      });
      
      // 更新SKU（如果有）
      if (editingPart.value.skus && editingPart.value.skus[0]) {
        await partApi.updateSKU(editingPart.value.skus[0].id, {
          specifications: formData.value.specifications,
          price: formData.value.price,
          stock: formData.value.stock,
          images: formData.value.images
        });
      }
      
      uiStore.showToast({
        type: 'success',
        message: '零部件已更新'
      });
    } else {
      // 创建SPU
      const spu = await partApi.createSPU({
        part_number: formData.value.part_number,
        name: formData.value.name,
        name_en: formData.value.name_en || undefined,
        category_id: formData.value.category_id,
        brand: formData.value.brand || undefined,
        description: formData.value.description || undefined
      });
      
      // 创建SKU
      await partApi.createSKU({
        spu_id: spu.id,
        sku_code: formData.value.sku_code || `${formData.value.part_number}-001`,
        specifications: formData.value.specifications,
        price: formData.value.price,
        stock: formData.value.stock,
        images: formData.value.images
      });
      
      uiStore.showToast({
        type: 'success',
        message: '零部件已创建'
      });
    }
    
    closeEditModal();
    await loadParts();
  } catch (error: any) {
    uiStore.showToast({
      type: 'error',
      message: error.response?.data?.detail || '保存失败'
    });
  }
};

const deletePart = async (part: any) => {
  if (!confirm(`确定要删除零部件 ${part.part_number} 吗？`)) return;
  
  try {
    await partApi.deleteSPU(part.id);
    uiStore.showToast({
      type: 'success',
      message: '零部件已删除'
    });
    await loadParts();
  } catch (error: any) {
    uiStore.showToast({
      type: 'error',
      message: error.response?.data?.detail || '删除失败'
    });
  }
};

const downloadTemplate = () => {
  const csv = `part_number,name,category_name,manufacturer,price,stock,description,image_url
BRG-6205,深沟球轴承 6205,轴承,SKF,120.50,100,高精度深沟球轴承,
BRG-6206,深沟球轴承 6206,轴承,NSK,145.00,80,高精度深沟球轴承,
SEAL-001,油封 TC 30x42x7,密封件,NOK,25.00,200,橡胶油封,`;
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '零件导入模板.csv';
  link.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const importFile = async () => {
  if (!selectedFile.value) return;
  
  importing.value = true;
  importProgress.value = 0;
  
  // TODO: 实现文件上传和导入
  // 模拟进度
  const interval = setInterval(() => {
    importProgress.value += 10;
    if (importProgress.value >= 100) {
      clearInterval(interval);
      importing.value = false;
      showImportModal.value = false;
      selectedFile.value = null;
      importProgress.value = 0;
      
      uiStore.showToast({
        type: 'success',
        message: '导入完成！',
      });
      
      loadParts();
    }
  }, 300);
};
</script>

<style scoped>
.admin-parts-page {
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
  margin-bottom: var(--space-6);
}

.page-header h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.btn-import,
.btn-add {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all var(--transition-base);
}

.btn-import {
  background: white;
  color: var(--color-secondary);
  border: 1px solid #E2E8F0;
}

.btn-import:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.btn-add {
  background: var(--color-cta);
  color: white;
}

.btn-add:hover {
  background: #025a8a;
  transform: translateY(-1px);
}

.btn-import svg,
.btn-add svg {
  width: 20px;
  height: 20px;
}

/* Search Bar */
.search-bar {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.search-bar input,
.search-bar select {
  padding: var(--space-3);
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
}

.search-bar input {
  flex: 1;
}

.search-bar select {
  min-width: 200px;
}

/* Table */
.parts-table {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-gray-50);
}

th {
  padding: var(--space-4);
  text-align: left;
  font-weight: 600;
  color: var(--color-secondary);
  font-size: var(--text-sm);
}

td {
  padding: var(--space-4);
  border-top: 1px solid #E2E8F0;
}

.part-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--color-cta);
}

.price {
  font-weight: 600;
  color: var(--color-text);
}

.stock {
  font-weight: 600;
}

.stock.low-stock {
  color: var(--color-error);
}

.part-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.no-image {
  color: var(--color-secondary);
  font-size: var(--text-sm);
}

.actions {
  display: flex;
  gap: var(--space-2);
}

.btn-edit,
.btn-delete {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.btn-edit {
  color: var(--color-cta);
}

.btn-edit:hover {
  background: rgba(3, 105, 161, 0.1);
}

.btn-delete {
  color: var(--color-error);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.btn-edit svg,
.btn-delete svg {
  width: 18px;
  height: 18px;
}

.empty-state {
  padding: var(--space-16);
  text-align: center;
  color: var(--color-secondary);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.pagination button {
  padding: var(--space-2) var(--space-4);
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-secondary);
  font-weight: 500;
}

.pagination button:hover:not(:disabled) {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
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
  padding: var(--space-4);
}

.modal-container {
  background: white;
  border-radius: var(--radius-xl);
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
  padding: var(--space-6);
  border-bottom: 1px solid #E2E8F0;
}

.modal-header h2 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: 24px;
  color: var(--color-secondary);
}

.close-btn:hover {
  background: var(--color-gray-100);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--color-text);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.modal-footer {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid #E2E8F0;
}

.btn-cancel,
.btn-save,
.btn-import-confirm {
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-weight: 600;
}

.btn-cancel {
  background: white;
  border: 1px solid #E2E8F0;
  color: var(--color-secondary);
}

.btn-save,
.btn-import-confirm {
  background: var(--color-cta);
  color: white;
}

/* Import Modal */
.import-modal {
  max-width: 500px;
}

.import-instructions {
  background: var(--color-gray-50);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
}

.import-instructions h3 {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: var(--space-3);
}

.import-instructions p {
  font-size: var(--text-sm);
  color: var(--color-secondary);
  margin-bottom: var(--space-2);
}

.btn-download-template {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-cta);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-top: var(--space-3);
}

.btn-download-template svg {
  width: 16px;
  height: 16px;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.btn-select-file {
  padding: var(--space-3) var(--space-4);
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  font-weight: 500;
}

.file-name {
  color: var(--color-secondary);
  font-size: var(--text-sm);
}

.import-progress {
  margin-top: var(--space-4);
}

.progress-bar {
  height: 8px;
  background: var(--color-gray-200);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.progress-fill {
  height: 100%;
  background: var(--color-cta);
  transition: width 0.3s ease;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>


const imageUrlsInput = ref('');

const updateImages = () => {
  formData.value.images = imageUrlsInput.value
    .split(',')
    .map(url => url.trim())
    .filter(url => url);
};

const getCategoryName = (categoryId: string) => {
  const cat = categories.value.find(c => c.id === categoryId);
  return cat?.name || '-';
};
