<template>
  <div class="home">
    <!-- Navbar -->
    <Navbar @open-a-i-modal="showAIModal = true" />

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- Category Sidebar -->
      <CategoryTree />

      <!-- Central Display Area -->
      <main class="display-area">
        <PartsGrid
          @select-part="handleSelectPart"
          @favorite="handleFavorite"
          @add-to-cart="handleAddToCart"
        />
      </main>

      <!-- Detail Panel -->
      <DetailPanel
        :part="selectedPart"
        @add-to-cart="handleAddToCart"
        @favorite="handleFavorite"
        @view-alternative="handleViewAlternative"
      />
    </div>

    <!-- AI Recognition Modal -->
    <AIRecognitionModal
      :is-open="showAIModal"
      @close="showAIModal = false"
      @select-result="handleAIResult"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePartsStore } from '../stores/parts';
import { useCartStore } from '../stores/cart';
import { useFavoritesStore } from '../stores/favorites';
import { useUIStore } from '../stores/ui';
import type { Part, RecognitionResult } from '../types';
import Navbar from '../components/Navbar.vue';
import CategoryTree from '../components/CategoryTree.vue';
import PartsGrid from '../components/PartsGrid.vue';
import DetailPanel from '../components/DetailPanel.vue';
import AIRecognitionModal from '../components/AIRecognitionModal.vue';

const router = useRouter();
const partsStore = usePartsStore();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();
const uiStore = useUIStore();

const selectedPart = ref<Part | undefined>();
const showAIModal = ref(false);

// 执行搜索的函数
const performSearch = async (keyword?: string) => {
  try {
    console.log('Performing search with keyword:', keyword);
    
    if (keyword) {
      await partsStore.searchParts({
        keyword: keyword,
        page: 1,
        pageSize: 20,
      });
    } else {
      await partsStore.searchParts({
        page: 1,
        pageSize: 20,
      });
    }
    
    console.log('Parts loaded:', partsStore.parts.length);
  } catch (error) {
    console.error('Failed to load parts:', error);
    uiStore.showToast({
      type: 'error',
      message: '加载零部件失败，请刷新页面重试',
    });
  }
};

// 初始化加载零部件
onMounted(async () => {
  const searchQuery = router.currentRoute.value.query.q as string;
  await performSearch(searchQuery);
});

// 监听路由查询参数变化
watch(
  () => router.currentRoute.value.query.q,
  (newQuery) => {
    // 当查询参数变化时（包括从有值变为 undefined），执行搜索
    performSearch(newQuery as string);
  }
);

const handleSelectPart = (part: Part) => {
  selectedPart.value = part;
  partsStore.selectPart(part);
};

const handleFavorite = (partId: string) => {
  const part = partsStore.parts.find(p => p.id === partId);
  if (part) {
    const added = favoritesStore.toggleFavorite(part);
    uiStore.showToast({
      type: 'success',
      message: added ? '已添加到收藏' : '已取消收藏',
    });
  }
};

const handleAddToCart = (part: Part) => {
  cartStore.addToCart(part, 1);
  uiStore.showToast({
    type: 'success',
    message: `已将 ${part.name} 加入采购清单`,
  });
};

const handleViewAlternative = (altId: string) => {
  partsStore.getPartById(altId);
};

const handleAIResult = (result: RecognitionResult) => {
  uiStore.showToast({
    type: 'success',
    message: `已选择: ${result.partName}`,
  });
  // 可以跳转到零部件详情或搜索结果
  partsStore.getPartById(result.partId);
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--color-bg);
  padding-top: var(--header-height);
}

.main-layout {
  display: flex;
  height: calc(100vh - var(--header-height));
}

.display-area {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg);
}

/* Responsive */
@media (max-width: 1024px) {
  .main-layout {
    flex-direction: column;
    height: auto;
  }
}
</style>
