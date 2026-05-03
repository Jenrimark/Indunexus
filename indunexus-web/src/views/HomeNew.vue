<template>
  <div class="home-new">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">工业零部件智能采购平台</h1>
        <p class="hero-subtitle">专业的电气设备批发、销售与解决方案</p>
        
        <!-- Search Bar -->
        <div class="hero-search">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索零部件型号、名称或品牌..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button class="ai-search-btn" @click="showAIModal = true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" fill="currentColor"/>
              </svg>
              AI识别
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Section -->
    <section class="category-section">
      <div class="container">
        <h2 class="section-title">产品分类</h2>
        <div class="category-grid">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-card"
            @click="handleCategoryClick(category)"
          >
            <div class="category-icon">
              <component :is="category.icon" />
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-count">{{ category.count }} 个产品</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门产品</h2>
          <button class="view-all-btn" @click="viewAllProducts">
            查看全部
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div v-if="loading" class="products-grid">
          <div v-for="i in 8" :key="i" class="product-card skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>

        <div v-else class="products-grid">
          <div 
            v-for="part in featuredParts" 
            :key="part.id"
            class="product-card"
            @click="handleProductClick(part)"
          >
            <div class="product-image">
              <img :src="part.images?.thumbnail || '/placeholder.png'" :alt="part.name" />
              <button 
                class="favorite-btn"
                :class="{ active: isFavorite(part.id) }"
                @click.stop="toggleFavorite(part.id)"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path 
                    d="M10 17.5L8.825 16.45C4.4 12.45 1.5 9.85 1.5 6.75C1.5 4.15 3.525 2.125 6.125 2.125C7.6 2.125 9.025 2.8 10 3.875C10.975 2.8 12.4 2.125 13.875 2.125C16.475 2.125 18.5 4.15 18.5 6.75C18.5 9.85 15.6 12.45 11.175 16.45L10 17.5Z" 
                    :fill="isFavorite(part.id) ? 'currentColor' : 'none'"
                    stroke="currentColor" 
                    stroke-width="1.5"
                  />
                </svg>
              </button>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ part.name }}</h3>
              <p class="product-model">型号: {{ part.partNumber }}</p>
              <div class="product-footer">
                <span class="product-price">¥{{ part.price }}</span>
                <button class="add-cart-btn" @click.stop="addToCart(part)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2H3.5L5.5 11H13L15 5H4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="6" cy="14" r="1" fill="currentColor"/>
                    <circle cx="12" cy="14" r="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L20 12L28 16L20 20L16 28L12 20L4 16L12 12L16 4Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3>AI智能识别</h3>
            <p>上传图片即可快速识别零部件型号</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M4 8H28M4 16H28M4 24H28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>海量库存</h3>
            <p>超过10万种工业零部件现货供应</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" stroke="currentColor" stroke-width="2"/>
                <path d="M16 10V16L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>快速交付</h3>
            <p>24小时内发货，确保项目进度</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16L15 19L21 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>品质保证</h3>
            <p>原厂正品，提供质量保证服务</p>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Recognition Modal -->
    <AIRecognitionModal
      :is-open="showAIModal"
      @close="showAIModal = false"
      @select-result="handleAIResult"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePartsStore } from '../stores/parts';
import { useCartStore } from '../stores/cart';
import { useFavoritesStore } from '../stores/favorites';
import { useUIStore } from '../stores/ui';
import type { Part, RecognitionResult } from '../types';
import AIRecognitionModal from '../components/AIRecognitionModal.vue';

const router = useRouter();
const partsStore = usePartsStore();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();
const uiStore = useUIStore();

const searchQuery = ref('');
const showAIModal = ref(false);
const loading = ref(true);

// 分类数据
const categories = ref([
  { id: 1, name: '电气元件', count: 15234, icon: 'ElectricIcon' },
  { id: 2, name: '传感器', count: 8956, icon: 'SensorIcon' },
  { id: 3, name: '控制器', count: 6789, icon: 'ControllerIcon' },
  { id: 4, name: '电机', count: 5432, icon: 'MotorIcon' },
  { id: 5, name: '开关', count: 4321, icon: 'SwitchIcon' },
  { id: 6, name: '连接器', count: 3210, icon: 'ConnectorIcon' },
  { id: 7, name: '继电器', count: 2987, icon: 'RelayIcon' },
  { id: 8, name: '其他', count: 1876, icon: 'OtherIcon' },
]);

const featuredParts = computed(() => partsStore.parts.slice(0, 8));

onMounted(async () => {
  try {
    await partsStore.searchParts({ page: 1, pageSize: 20 });
  } catch (error) {
    console.error('Failed to load parts:', error);
    uiStore.showToast({
      type: 'error',
      message: '加载产品失败',
    });
  } finally {
    loading.value = false;
  }
});

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value } });
  }
};

const handleCategoryClick = (category: any) => {
  router.push({ name: 'category', params: { id: category.id } });
};

const handleProductClick = (part: Part) => {
  router.push({ name: 'product', params: { id: part.id } });
};

const viewAllProducts = () => {
  router.push({ name: 'products' });
};

const isFavorite = (partId: string) => {
  return favoritesStore.isFavorite(partId);
};

const toggleFavorite = (partId: string) => {
  const part = partsStore.parts.find(p => p.id === partId);
  if (part) {
    const added = favoritesStore.toggleFavorite(part);
    uiStore.showToast({
      type: 'success',
      message: added ? '已添加到收藏' : '已取消收藏',
    });
  }
};

const addToCart = (part: Part) => {
  cartStore.addToCart(part, 1);
  uiStore.showToast({
    type: 'success',
    message: `已将 ${part.name} 加入采购清单`,
  });
};

const handleAIResult = (result: RecognitionResult) => {
  uiStore.showToast({
    type: 'success',
    message: `已识别: ${result.partName}`,
  });
  router.push({ name: 'product', params: { id: result.partId } });
};
</script>

<style scoped>
.home-new {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #0e73eb 0%, #0a5bb8 100%);
  padding: 80px 20px 100px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>');
  opacity: 0.3;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  opacity: 0.95;
  margin-bottom: 40px;
}

/* Search Bar */
.hero-search {
  max-width: 700px;
  margin: 0 auto;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  padding: 8px 8px 8px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.search-icon {
  color: #6c757d;
  margin-right: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #212529;
  background: transparent;
}

.search-input::placeholder {
  color: #adb5bd;
}

.ai-search-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #0e73eb;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.ai-search-btn:hover {
  background: #0a5bb8;
  transform: scale(1.05);
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Section */
.category-section,
.products-section,
.features-section {
  padding: 60px 20px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 32px;
  text-align: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-header .section-title {
  margin-bottom: 0;
  text-align: left;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  color: #0e73eb;
  border: 2px solid #0e73eb;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: #0e73eb;
  color: white;
}

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-card:hover {
  border-color: #0e73eb;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(14, 115, 235, 0.15);
}

.category-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: #e7f3ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0e73eb;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.category-count {
  font-size: 13px;
  color: #6c757d;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #0e73eb;
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: #f8f9fa;
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-btn:hover {
  transform: scale(1.1);
  color: #dc3545;
}

.favorite-btn.active {
  color: #dc3545;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-model {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 12px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #0e73eb;
}

.add-cart-btn {
  width: 36px;
  height: 36px;
  background: #0e73eb;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-cart-btn:hover {
  background: #0a5bb8;
  transform: scale(1.05);
}

/* Features Grid */
.features-section {
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 24px;
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: #e7f3ff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0e73eb;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.6;
}

/* Skeleton Loading */
.skeleton {
  pointer-events: none;
}

.skeleton-image {
  width: 100%;
  padding-top: 75%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .search-input-wrapper {
    padding: 6px 6px 6px 16px;
  }

  .ai-search-btn {
    padding: 10px 16px;
    font-size: 14px;
  }

  .section-title {
    font-size: 24px;
  }

  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
