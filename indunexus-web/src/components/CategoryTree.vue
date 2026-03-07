<template>
  <aside class="category-sidebar">
    <div class="sidebar-header">
      <h3>零部件分类</h3>
      <button 
        v-if="selectedCategoryId" 
        class="reset-btn cursor-pointer" 
        @click="handleResetFilter"
        title="重置筛选"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
        <span>重置</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadCategories" class="retry-btn">重试</button>
    </div>

    <div v-else class="category-tree">
      <CategoryTreeNode
        v-for="node in categoryTree"
        :key="node.id"
        :node="node"
        :selected-id="selectedCategoryId"
        @select="handleSelectCategory"
      />
    </div>

    <!-- Favorites Section -->
    <div class="sidebar-section">
      <div class="section-header">
        <svg class="section-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h4>我的收藏</h4>
        <span class="count-badge">{{ favoritesStore.favoritesCount }}</span>
      </div>
      <div v-if="favoritesStore.favorites.length === 0" class="empty-state">
        <p>暂无收藏</p>
      </div>
      <div v-else class="favorites-list">
        <div
          v-for="fav in favoritesStore.favorites.slice(0, 5)"
          :key="fav.id"
          class="favorite-item cursor-pointer"
          @click="handleSelectFavorite(fav)"
        >
          <img 
            :src="fav.images?.thumbnail || '/placeholder-part.png'" 
            :alt="fav.name" 
            class="favorite-thumbnail" 
          />
          <div class="favorite-info">
            <span class="favorite-name">{{ fav.name }}</span>
            <span class="favorite-number">{{ fav.partNumber }}</span>
          </div>
        </div>
        <router-link v-if="favoritesStore.favoritesCount > 5" to="/favorites" class="view-all-link">
          查看全部 {{ favoritesStore.favoritesCount }} 个收藏 →
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFavoritesStore } from '../stores/favorites';
import { usePartsStore } from '../stores/parts';
import { categoryApi, type Category } from '../api/admin';
import type { CategoryNode, Part } from '../types';
import CategoryTreeNode from './CategoryTreeNode.vue';

const router = useRouter();
const favoritesStore = useFavoritesStore();
const partsStore = usePartsStore();

const categoryTree = ref<CategoryNode[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedCategoryId = ref<string | null>(null);

// 将 API 返回的 Category 转换为 CategoryNode
const convertToTreeNode = (category: Category): CategoryNode => {
  return {
    id: category.id,
    name: category.name,
    nameEn: category.name_en,
    level: category.level,
    parentId: category.parent_id,
    partsCount: category.parts_count || 0,
    path: category.path,
    children: category.children ? category.children.map(convertToTreeNode) : [],
    isExpanded: false,
  };
};

// 加载分类数据
const loadCategories = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const categories = await categoryApi.getCategories();
    console.log('Loaded categories from API:', categories);
    
    // 转换为树形结构
    categoryTree.value = categories.map(convertToTreeNode);
    console.log('Converted category tree:', categoryTree.value);
  } catch (err) {
    console.error('Failed to load categories:', err);
    error.value = '加载分类失败，请重试';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCategories();
});

const handleSelectCategory = async (node: CategoryNode) => {
  console.log('Selected category:', node);
  
  // 更新选中状态
  selectedCategoryId.value = node.id;
  
  // 根据分类ID搜索零部件
  try {
    await partsStore.searchParts({
      categoryId: node.id,
      page: 1,
      pageSize: 20,
    });
    
    // 更新URL
    router.replace({
      path: '/marketplace',
      query: { category: node.id },
    });
  } catch (error) {
    console.error('Failed to search by category:', error);
  }
};

const handleResetFilter = async () => {
  console.log('Reset filter');
  
  // 清除选中状态
  selectedCategoryId.value = null;
  
  // 搜索所有零部件
  try {
    await partsStore.searchParts({
      page: 1,
      pageSize: 20,
    });
    
    // 清除URL查询参数
    router.replace({
      path: '/marketplace',
      query: {},
    });
  } catch (error) {
    console.error('Failed to reset filter:', error);
  }
};

const handleSelectFavorite = (part: Part) => {
  console.log('Selected favorite:', part);
  // 可以跳转到详情页或直接选中该零件
  partsStore.selectPart(part);
};
</script>

<style scoped>
.category-sidebar {
  width: var(--sidebar-width);
  height: calc(100vh - var(--header-height));
  background: white;
  border-right: 1px solid var(--color-gray-200);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
}

.sidebar-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.reset-btn:hover {
  background: var(--color-gray-200);
  color: var(--color-gray-900);
}

.reset-btn svg {
  width: 14px;
  height: 14px;
}

.category-tree {
  flex: 1;
  padding: var(--space-2) 0;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  gap: var(--space-3);
  color: var(--color-gray-500);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  gap: var(--space-3);
  color: var(--color-error);
}

.retry-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.retry-btn:hover {
  background: var(--color-secondary);
}

.empty-state {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-gray-500);
  font-size: var(--text-sm);
}

/* Sidebar Sections */
.sidebar-section {
  border-top: 1px solid var(--color-gray-200);
  padding: var(--space-4);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.section-icon {
  width: 16px;
  height: 16px;
  color: var(--color-gray-500);
}

.section-header h4 {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-gray-700);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--space-2);
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-base);
}

/* Favorites List */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-base);
}

.favorite-item:hover {
  background: var(--color-gray-50);
}

.favorite-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--color-gray-100);
}

.favorite-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.favorite-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-number {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  font-family: var(--font-heading);
}

.view-all-link {
  display: block;
  padding: var(--space-2);
  text-align: center;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: color var(--transition-base);
}

.view-all-link:hover {
  color: var(--color-secondary);
}

/* Responsive */
@media (max-width: 1024px) {
  .category-sidebar {
    position: fixed;
    left: -100%;
    top: var(--header-height);
    z-index: 90;
    transition: left var(--transition-slow);
  }
  
  .category-sidebar.open {
    left: 0;
  }
}
</style>
