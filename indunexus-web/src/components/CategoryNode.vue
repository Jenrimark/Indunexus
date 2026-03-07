<template>
  <div class="category-item">
    <div class="category-header">
      <div class="category-info">
        <svg class="category-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
        <span class="category-name">{{ category.name }}</span>
        <span class="category-name-en" v-if="category.name_en">{{ category.name_en }}</span>
        <span class="category-count">{{ category.parts_count }} 个零部件</span>
      </div>
      <div class="action-buttons">
        <button class="btn-icon" @click="$emit('add-child', category.id)" title="添加子类目">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
        <button class="btn-icon" @click="$emit('edit', category)" title="编辑">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button class="btn-icon danger" @click="$emit('delete', category)" title="删除">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    <div v-if="category.children && category.children.length > 0" class="category-children">
      <CategoryNode 
        v-for="child in category.children" 
        :key="child.id"
        :category="child"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  category: any;
}>();

defineEmits<{
  (e: 'edit', category: any): void;
  (e: 'delete', category: any): void;
  (e: 'add-child', categoryId: string): void;
}>();
</script>

<style scoped>
.category-item {
  margin-bottom: 1rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #F8FAFC;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.category-header:hover {
  background: #F1F5F9;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-cta);
}

.category-name {
  font-weight: 600;
  color: var(--color-text);
}

.category-name-en {
  color: var(--color-secondary);
  font-size: 0.875rem;
}

.category-count {
  color: var(--color-secondary);
  font-size: 0.875rem;
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
  background: white;
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

.category-children {
  margin-left: 2rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid #E2E8F0;
}
</style>
