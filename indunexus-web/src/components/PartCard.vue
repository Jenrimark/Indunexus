<template>
  <div class="part-card cursor-pointer" @click="handleClick">
    <!-- Image Container -->
    <div class="image-container">
      <img
        :src="part.images.thumbnail"
        :alt="part.name"
        class="part-image"
        loading="lazy"
      />
      <div v-if="part.model3D" class="badge-3d">3D</div>
      <button class="favorite-btn cursor-pointer" @click.stop="toggleFavorite">
        <svg viewBox="0 0 20 20" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <h3 class="part-name">{{ part.name }}</h3>
      <p class="part-number">{{ part.partNumber }}</p>

      <!-- Key Specifications -->
      <div class="key-specs">
        <div v-if="part.specifications.material" class="spec-item">
          <svg class="spec-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          <span>{{ part.specifications.material }}</span>
        </div>
        <div v-if="part.specifications.dimensions" class="spec-item">
          <svg class="spec-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span>{{ formatDimensions(part.specifications.dimensions) }}</span>
        </div>
      </div>

      <!-- Card Footer -->
      <div class="card-footer">
        <div class="price-section">
          <span class="price">¥{{ part.price.toFixed(2) }}</span>
          <span class="stock" :class="stockClass">
            库存: {{ part.stock }}
          </span>
        </div>
        <button class="add-cart-btn cursor-pointer" @click.stop="addToCart">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFavoritesStore } from '../stores/favorites';
import type { Part } from '../types';

interface Props {
  part: Part;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [part: Part];
  favorite: [partId: string];
  addToCart: [part: Part];
}>();

const favoritesStore = useFavoritesStore();

const isFavorite = computed(() => favoritesStore.isFavorite(props.part.id));

const stockClass = computed(() => {
  if (props.part.stock === 0) return 'out-of-stock';
  if (props.part.stock < 10) return 'low-stock';
  return 'in-stock';
});

const formatDimensions = (dimensions: any) => {
  if (dimensions.diameter) {
    return `Ø${dimensions.diameter}${dimensions.unit}`;
  }
  if (dimensions.innerDiameter && dimensions.outerDiameter) {
    return `Ø${dimensions.innerDiameter}-${dimensions.outerDiameter}${dimensions.unit}`;
  }
  if (dimensions.length && dimensions.width) {
    return `${dimensions.length}×${dimensions.width}${dimensions.unit}`;
  }
  return '';
};

const handleClick = () => {
  emit('click', props.part);
};

const toggleFavorite = () => {
  emit('favorite', props.part.id);
};

const addToCart = () => {
  emit('addToCart', props.part);
};
</script>

<style scoped>
.part-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-base);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
}

.part-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Image Container */
.image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: var(--color-gray-100);
  overflow: hidden;
}

.part-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.part-card:hover .part-image {
  transform: scale(1.05);
}

.badge-3d {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--color-cta);
  color: white;
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
}

.favorite-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  color: var(--color-gray-400);
}

.favorite-btn:hover {
  transform: scale(1.1);
  color: var(--color-cta);
}

.favorite-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.favorite-btn svg[fill="currentColor"] {
  color: var(--color-cta);
}

/* Card Content */
.card-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.part-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.part-number {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  font-family: var(--font-heading);
}

/* Key Specifications */
.key-specs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.spec-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-gray-600);
}

.spec-icon {
  width: 14px;
  height: 14px;
  color: var(--color-gray-400);
  flex-shrink: 0;
}

/* Card Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-gray-100);
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.price {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-heading);
}

.stock {
  font-size: var(--text-xs);
  font-weight: 500;
}

.stock.in-stock {
  color: var(--color-success);
}

.stock.low-stock {
  color: var(--color-warning);
}

.stock.out-of-stock {
  color: var(--color-error);
}

.add-cart-btn {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.add-cart-btn:hover {
  background: var(--color-secondary);
  transform: scale(1.05);
}

.add-cart-btn svg {
  width: 18px;
  height: 18px;
}
</style>
