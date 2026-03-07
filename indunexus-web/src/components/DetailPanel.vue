<template>
  <aside class="detail-panel" :class="{ collapsed: isCollapsed }">
    <!-- Panel Header -->
    <div class="panel-header">
      <h3 v-if="!isCollapsed">零部件详情</h3>
      <button class="collapse-btn cursor-pointer" @click="isCollapsed = !isCollapsed">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" :d="isCollapsed ? 'M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z' : 'M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Panel Content -->
    <div v-if="!isCollapsed && part" class="panel-content">
      <!-- Basic Info -->
      <section class="info-section">
        <div class="part-image-large">
          <img :src="part.images.fullSize[0] || part.images.thumbnail" :alt="part.name" />
        </div>
        
        <h2 class="part-title">{{ part.name }}</h2>
        <p class="part-subtitle">{{ part.partNumber }}</p>
        
        <div v-if="part.brand" class="brand-tag">
          <svg class="brand-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          {{ part.brand }}
        </div>
      </section>

      <!-- Parameters Table -->
      <section class="info-section">
        <h4 class="section-title">技术参数</h4>
        <table class="params-table">
          <tbody>
            <tr v-if="part.specifications.material">
              <td class="param-label">材质</td>
              <td class="param-value">{{ part.specifications.material }}</td>
            </tr>
            <tr v-if="part.specifications.dimensions?.innerDiameter">
              <td class="param-label">内径</td>
              <td class="param-value">
                {{ part.specifications.dimensions.innerDiameter }}
                {{ part.specifications.dimensions.unit }}
              </td>
            </tr>
            <tr v-if="part.specifications.dimensions?.outerDiameter">
              <td class="param-label">外径</td>
              <td class="param-value">
                {{ part.specifications.dimensions.outerDiameter }}
                {{ part.specifications.dimensions.unit }}
              </td>
            </tr>
            <tr v-if="part.specifications.dimensions?.width">
              <td class="param-label">宽度</td>
              <td class="param-value">
                {{ part.specifications.dimensions.width }}
                {{ part.specifications.dimensions.unit }}
              </td>
            </tr>
            <tr v-if="part.specifications.weight">
              <td class="param-label">重量</td>
              <td class="param-value">
                {{ part.specifications.weight.value }}
                {{ part.specifications.weight.unit }}
              </td>
            </tr>
            <tr v-if="part.specifications.tolerance">
              <td class="param-label">公差等级</td>
              <td class="param-value">{{ part.specifications.tolerance }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Compatibility Info -->
      <section v-if="part.compatibleVehicles.length > 0" class="info-section">
        <h4 class="section-title">适配信息</h4>
        <div class="vehicle-tags">
          <span
            v-for="vehicle in part.compatibleVehicles"
            :key="vehicle"
            class="vehicle-tag"
          >
            {{ vehicle }}
          </span>
        </div>
      </section>

      <!-- Alternatives -->
      <section v-if="part.alternatives.length > 0" class="info-section">
        <h4 class="section-title">可替代零件</h4>
        <div class="alternatives-list">
          <button
            v-for="altId in part.alternatives"
            :key="altId"
            class="alternative-btn cursor-pointer"
            @click="$emit('viewAlternative', altId)"
          >
            查看替代件
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </section>

      <!-- Action Buttons -->
      <section class="actions-section">
        <button class="primary-btn cursor-pointer" @click="$emit('addToCart', part)">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          加入采购清单
        </button>

        <button
          v-if="part.technicalDrawing"
          class="secondary-btn cursor-pointer"
          @click="downloadDrawing"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
          </svg>
          下载技术图纸
        </button>

        <div class="icon-buttons">
          <button class="icon-btn cursor-pointer" @click="$emit('favorite', part.id)" title="收藏">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
          <button class="icon-btn cursor-pointer" @click="shareLink" title="分享">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>
        </div>
      </section>
    </div>

    <!-- Empty State -->
    <div v-if="!isCollapsed && !part" class="empty-panel">
      <svg class="empty-icon" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
      </svg>
      <p>选择一个零部件查看详情</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Part } from '../types';

interface Props {
  part?: Part;
}

defineProps<Props>();

const emit = defineEmits<{
  addToCart: [part: Part];
  favorite: [partId: string];
  viewAlternative: [altId: string];
}>();

const isCollapsed = ref(false);

const downloadDrawing = () => {
  console.log('Download technical drawing');
};

const shareLink = () => {
  console.log('Share part link');
};
</script>

<style scoped>
.detail-panel {
  width: var(--panel-width);
  height: calc(100vh - var(--header-height));
  background: white;
  border-left: 1px solid var(--color-gray-200);
  overflow-y: auto;
  transition: width var(--transition-slow);
  display: flex;
  flex-direction: column;
}

.detail-panel.collapsed {
  width: 48px;
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
  flex-shrink: 0;
}

.panel-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-gray-500);
  transition: all var(--transition-base);
}

.collapse-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.collapse-btn svg {
  width: 20px;
  height: 20px;
}

/* Panel Content */
.panel-content {
  flex: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.part-image-large {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-gray-100);
}

.part-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.part-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}

.part-subtitle {
  font-size: var(--text-base);
  color: var(--color-gray-500);
  font-family: var(--font-heading);
}

.brand-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  align-self: flex-start;
}

.brand-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
}

.section-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-gray-200);
}

/* Parameters Table */
.params-table {
  width: 100%;
  border-collapse: collapse;
}

.params-table tr {
  border-bottom: 1px solid var(--color-gray-100);
}

.params-table tr:last-child {
  border-bottom: none;
}

.param-label {
  padding: var(--space-3) 0;
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  font-weight: 500;
  width: 40%;
}

.param-value {
  padding: var(--space-3) 0;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: var(--font-heading);
}

/* Vehicle Tags */
.vehicle-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.vehicle-tag {
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-base);
}

/* Alternatives */
.alternatives-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.alternative-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: var(--color-gray-50);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.alternative-btn:hover {
  background: var(--color-gray-100);
  transform: translateX(4px);
}

.alternative-btn svg {
  width: 16px;
  height: 16px;
}

/* Action Buttons */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-gray-200);
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-base);
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.primary-btn:hover {
  background: var(--color-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.primary-btn svg {
  width: 20px;
  height: 20px;
}

.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.secondary-btn:hover {
  background: var(--color-primary);
  color: white;
}

.secondary-btn svg {
  width: 18px;
  height: 18px;
}

.icon-buttons {
  display: flex;
  gap: var(--space-2);
}

.icon-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  background: var(--color-gray-50);
  color: var(--color-gray-600);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.icon-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-primary);
  transform: translateY(-2px);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}

/* Empty State */
.empty-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-gray-300);
}

.empty-panel p {
  font-size: var(--text-base);
  color: var(--color-gray-500);
}

/* Responsive */
@media (max-width: 1366px) {
  .detail-panel {
    width: 320px;
  }
}

@media (max-width: 1024px) {
  .detail-panel {
    position: fixed;
    right: -100%;
    top: var(--header-height);
    z-index: 90;
    transition: right var(--transition-slow);
  }
  
  .detail-panel.open {
    right: 0;
  }
}
</style>
