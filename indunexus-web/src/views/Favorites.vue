<template>
  <div class="favorites-page">
    <Navbar @open-a-i-modal="showAIModal = true" />
    
    <div class="favorites-container">
      <div class="page-header">
        <h1>我的收藏</h1>
        <p>管理您收藏的零部件</p>
      </div>

      <!-- Favorites Grid -->
      <div v-if="favorites.length > 0" class="favorites-grid">
        <div v-for="item in favorites" :key="item.id" class="favorite-card">
          <div class="card-image">
            <img :src="item.images?.thumbnail || item.image || '/placeholder-part.png'" :alt="item.name" />
            <button class="remove-btn" @click="removeFavorite(item.id)" title="取消收藏">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="card-content">
            <h3>{{ item.name }}</h3>
            <p class="part-number">{{ item.partNumber }}</p>
            <p class="brand">{{ item.brand }}</p>

            <div class="card-footer">
              <div class="price-section">
                <span class="price">¥{{ item.price.toFixed(2) }}</span>
                <span class="stock" :class="{ 'low-stock': item.stock < 10 }">
                  库存: {{ item.stock }}
                </span>
              </div>

              <div class="card-actions">
                <button class="btn-secondary" @click="viewDetail(item)">
                  查看详情
                </button>
                <button class="btn-primary" @click="addToCart(item)">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  加入采购清单
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h3>暂无收藏</h3>
        <p>您还没有收藏任何零部件</p>
        <button class="btn-primary" @click="$router.push('/')">去浏览</button>
      </div>
    </div>

    <!-- AI Recognition Modal -->
    <AIRecognitionModal
      :is-open="showAIModal"
      @close="showAIModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useFavoritesStore } from '../stores/favorites';
import { useUIStore } from '../stores/ui';
import Navbar from '../components/Navbar.vue';
import AIRecognitionModal from '../components/AIRecognitionModal.vue';

const router = useRouter();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();
const uiStore = useUIStore();

const favorites = computed(() => favoritesStore.favorites);
const showAIModal = ref(false);

const removeFavorite = (id: string) => {
  const success = favoritesStore.removeFavorite(id);
  if (success) {
    uiStore.showToast({
      type: 'success',
      message: '已取消收藏',
    });
  }
};

const viewDetail = (item: any) => {
  console.log('View detail:', item);
  uiStore.showToast({
    type: 'info',
    message: '详情功能开发中',
  });
};

const addToCart = (item: any) => {
  cartStore.addToCart(item, 1);
  uiStore.showToast({
    type: 'success',
    message: `已将 ${item.name} 加入采购清单`,
  });
};
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-top: var(--header-height);
}

.favorites-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-header h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.page-header p {
  font-size: var(--text-base);
  color: var(--color-secondary);
}

/* Favorites Grid */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}

.favorite-card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid #E2E8F0;
  overflow: hidden;
  transition: all var(--transition-base);
}

.favorite-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: var(--color-gray-50);
  overflow: hidden;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  opacity: 0;
}

.favorite-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: #FEE2E2;
  transform: scale(1.1);
}

.remove-btn svg {
  width: 18px;
  height: 18px;
  color: #DC2626;
}

.card-content {
  padding: var(--space-4);
}

.card-content h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.part-number {
  font-size: var(--text-sm);
  color: var(--color-cta);
  font-weight: 500;
  margin-bottom: var(--space-1);
}

.brand {
  font-size: var(--text-sm);
  color: var(--color-secondary);
  margin-bottom: var(--space-4);
}

.card-footer {
  border-top: 1px solid #F1F5F9;
  padding-top: var(--space-4);
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.price {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-cta);
}

.stock {
  font-size: var(--text-sm);
  color: var(--color-success);
  font-weight: 500;
}

.stock.low-stock {
  color: var(--color-error);
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.btn-primary {
  background: var(--color-cta);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #025a8a;
  transform: translateY(-1px);
}

.btn-primary svg {
  width: 18px;
  height: 18px;
}

.btn-secondary {
  background: white;
  color: var(--color-secondary);
  border: 1px solid #E2E8F0;
}

.btn-secondary:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-4);
  text-align: center;
}

.empty-state svg {
  width: 80px;
  height: 80px;
  color: var(--color-gray-400);
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: var(--text-base);
  color: var(--color-secondary);
  margin-bottom: var(--space-6);
}

.empty-state .btn-primary {
  width: auto;
  padding: var(--space-3) var(--space-6);
}

/* Responsive */
@media (max-width: 768px) {
  .favorites-container {
    padding: var(--space-4);
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-4);
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
