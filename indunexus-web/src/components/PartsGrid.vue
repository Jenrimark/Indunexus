<template>
  <div class="parts-grid-container">
    <!-- View Mode Selector -->
    <div class="toolbar">
      <div class="view-controls">
        <button
          v-for="mode in viewModes"
          :key="mode.value"
          class="view-btn cursor-pointer"
          :class="{ active: currentView === mode.value }"
          @click="currentView = mode.value"
          :title="mode.label"
        >
          <component :is="mode.icon" />
          <span class="view-label">{{ mode.label }}</span>
        </button>
      </div>

      <div class="sort-controls">
        <label class="sort-label">排序：</label>
        <select v-model="sortBy" class="sort-select" @change="handleSortChange">
          <option value="created_at">最新上架</option>
          <option value="price_asc">价格从低到高</option>
          <option value="price_desc">价格从高到低</option>
          <option value="stock">库存数量</option>
          <option value="name">名称排序</option>
        </select>
      </div>

      <div class="results-info">
        共找到 <strong>{{ partsStore.total }}</strong> 个零部件
      </div>
    </div>

    <!-- Parts Grid -->
    <div v-if="currentView === 'grid' && !partsStore.loading" class="parts-grid">
      <PartCard
        v-for="part in partsStore.parts"
        :key="part.id"
        :part="part"
        @click="handleSelectPart"
        @favorite="handleFavorite"
        @add-to-cart="handleAddToCart"
      />
    </div>

    <!-- Skeleton Loading -->
    <div v-if="partsStore.loading" class="parts-grid">
      <SkeletonCard v-for="i in 8" :key="i" />
    </div>

    <!-- Parts List -->
    <div v-else-if="currentView === 'list' && !partsStore.loading" class="parts-list">
      <div
        v-for="part in partsStore.parts"
        :key="part.id"
        class="list-item cursor-pointer"
        @click="handleSelectPart(part)"
      >
        <img :src="part.images.thumbnail" :alt="part.name" class="list-thumbnail" />
        <div class="list-content">
          <h3 class="list-title">{{ part.name }}</h3>
          <p class="list-number">{{ part.partNumber }}</p>
          <div class="list-specs">
            <span v-if="part.specifications.material">{{ part.specifications.material }}</span>
            <span v-if="part.specifications.dimensions">
              {{ formatDimensions(part.specifications.dimensions) }}
            </span>
          </div>
        </div>
        <div class="list-actions">
          <div class="list-price">¥{{ part.price.toFixed(2) }}</div>
          <div class="list-stock">库存: {{ part.stock }}</div>
          <button class="list-cart-btn cursor-pointer" @click.stop="handleAddToCart(part)">
            加入采购清单
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!partsStore.loading && partsStore.parts.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
      </svg>
      <h3>未找到相关零部件</h3>
      <p>请尝试调整搜索条件或筛选器</p>
    </div>

    <!-- Load More -->
    <div v-if="partsStore.hasMore && !partsStore.loading" ref="loadMoreTrigger" class="load-more">
      <button class="load-more-btn cursor-pointer" @click="loadMore">
        加载更多
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// import { storeToRefs } from 'pinia';
import { usePartsStore } from '../stores/parts';
import type { Part } from '../types';
import PartCard from './PartCard.vue';
import SkeletonCard from './SkeletonCard.vue';

// View mode icons as inline SVG components
const GridIcon = {
  template: `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" /></svg>`
};

const ListIcon = {
  template: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>`
};

const viewModes: Array<{ value: 'grid' | 'list'; label: string; icon: any }> = [
  { value: 'grid', label: '网格视图', icon: GridIcon },
  { value: 'list', label: '列表视图', icon: ListIcon },
];

const partsStore = usePartsStore();

const currentView = ref<'grid' | 'list'>('grid');
const sortBy = ref('created_at');
const sortOrder = ref<'asc' | 'desc'>('desc');
const loadMoreTrigger = ref<HTMLElement | null>(null);

const emit = defineEmits<{
  selectPart: [part: Part];
  favorite: [partId: string];
  addToCart: [part: Part];
}>();

const formatDimensions = (dimensions: any) => {
  if (dimensions.diameter) {
    return `Ø${dimensions.diameter}${dimensions.unit}`;
  }
  if (dimensions.innerDiameter && dimensions.outerDiameter) {
    return `Ø${dimensions.innerDiameter}-${dimensions.outerDiameter}${dimensions.unit}`;
  }
  return '';
};

const handleSelectPart = (part: Part) => {
  emit('selectPart', part);
};

const handleFavorite = (partId: string) => {
  emit('favorite', partId);
};

const handleAddToCart = (part: Part) => {
  emit('addToCart', part);
};

const handleSortChange = async () => {
  // 解析排序字段和顺序
  let field = sortBy.value;
  let order: 'asc' | 'desc' = 'desc';
  
  if (field === 'price_asc') {
    field = 'price';
    order = 'asc';
  } else if (field === 'price_desc') {
    field = 'price';
    order = 'desc';
  } else if (field === 'stock') {
    order = 'desc';
  } else if (field === 'name') {
    order = 'asc';
  }
  
  sortOrder.value = order;
  
  // 获取当前的搜索参数
  const currentQuery = partsStore.parts.length > 0 ? {
    keyword: new URLSearchParams(window.location.search).get('q') || undefined,
    categoryId: new URLSearchParams(window.location.search).get('category') || undefined,
  } : {};
  
  await partsStore.searchParts({
    ...currentQuery,
    page: 1,
    pageSize: 20,
    sortBy: field,
    sortOrder: order,
  });
};

const loadMore = async () => {
  // 获取当前的搜索参数
  const currentQuery = {
    keyword: new URLSearchParams(window.location.search).get('q') || undefined,
    categoryId: new URLSearchParams(window.location.search).get('category') || undefined,
  };
  
  await partsStore.loadMore({
    ...currentQuery,
    page: partsStore.currentPage + 1,
    pageSize: 20,
    sortBy: sortBy.value === 'price_asc' || sortBy.value === 'price_desc' ? 'price' : sortBy.value,
    sortOrder: sortOrder.value,
  });
};

// Intersection Observer for infinite scroll
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (loadMoreTrigger.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting && partsStore.hasMore && !partsStore.loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreTrigger.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.parts-grid-container {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.view-controls {
  display: flex;
  gap: var(--space-1);
  background: var(--color-gray-100);
  padding: var(--space-1);
  border-radius: var(--radius-lg);
}

.view-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--color-gray-600);
  background: transparent;
  transition: all var(--transition-base);
  font-size: var(--text-sm);
  font-weight: 500;
}

.view-btn svg {
  width: 18px;
  height: 18px;
}

.view-btn:hover {
  background: var(--color-gray-200);
  color: var(--color-gray-900);
}

.view-btn.active {
  background: white;
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.view-label {
  white-space: nowrap;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.sort-label {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  font-weight: 500;
}

.sort-select {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  background: white;
  cursor: pointer;
  outline: none;
  transition: all var(--transition-base);
  min-width: 140px;
}

.sort-select:hover {
  border-color: var(--color-gray-400);
}

.sort-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.results-info {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

.results-info strong {
  color: var(--color-primary);
  font-weight: 600;
}

/* Grid View */
.parts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}

/* List View */
.parts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.list-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.list-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.list-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  flex-shrink: 0;
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.list-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.list-number {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  font-family: var(--font-heading);
}

.list-specs {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

.list-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.list-price {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-heading);
}

.list-stock {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

.list-cart-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.list-cart-btn:hover {
  background: var(--color-secondary);
  transform: translateY(-1px);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  gap: var(--space-4);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  gap: var(--space-4);
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-gray-300);
}

.empty-state h3 {
  font-size: var(--text-xl);
  color: var(--color-gray-700);
}

.empty-state p {
  font-size: var(--text-base);
  color: var(--color-gray-500);
}

/* Load More */
.load-more {
  display: flex;
  justify-content: center;
  padding: var(--space-8) 0;
}

.load-more-btn {
  padding: var(--space-3) var(--space-6);
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  font-size: var(--text-base);
  font-weight: 500;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.load-more-btn:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Responsive */
@media (max-width: 768px) {
  .parts-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
  }
  
  .list-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .list-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
