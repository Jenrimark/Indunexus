<template>
  <div class="tree-node">
    <div
      class="node-content cursor-pointer"
      :class="{ 'is-selected': isSelected }"
      :style="{ paddingLeft: `${node.level * 16}px` }"
      @click="handleClick"
    >
      <!-- Expand Icon -->
      <svg
        v-if="hasChildren"
        class="expand-icon"
        :class="{ 'is-expanded': isExpanded }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <div v-else class="expand-spacer"></div>

      <!-- Category Icon -->
      <svg class="category-icon" viewBox="0 0 20 20" fill="currentColor">
        <path v-if="node.icon === 'cog'" fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        <path v-else-if="node.icon === 'shield'" fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        <path v-else-if="node.icon === 'beaker'" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" />
        <path v-else fill-rule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" clip-rule="evenodd" />
      </svg>

      <!-- Category Name -->
      <span class="category-name">{{ node.name }}</span>
    </div>

    <!-- Children -->
    <transition name="expand">
      <div v-if="isExpanded && hasChildren" class="children">
        <CategoryTreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :selected-id="selectedId"
          @select="$emit('select', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CategoryNode } from '../types';

interface Props {
  node: CategoryNode;
  selectedId?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [node: CategoryNode];
}>();

const isExpanded = ref(props.node.isExpanded || false);

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

const isSelected = computed(() => {
  return props.selectedId === props.node.id;
});

const handleClick = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value;
  }
  emit('select', props.node);
};

// 当选中其他节点时，自动展开父节点
watch(() => props.selectedId, (newId) => {
  if (newId && hasChildren.value) {
    // 检查是否有子节点被选中
    const hasSelectedChild = (node: CategoryNode): boolean => {
      if (node.id === newId) return true;
      if (node.children) {
        return node.children.some(child => hasSelectedChild(child));
      }
      return false;
    };
    
    if (hasSelectedChild(props.node)) {
      isExpanded.value = true;
    }
  }
});
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  transition: all var(--transition-base);
  position: relative;
}

.node-content:hover {
  background: #F1F5F9;
}

.node-content.is-selected {
  background: #0369A1;
  color: white;
}

.node-content.is-selected .category-icon,
.node-content.is-selected .expand-icon {
  color: white;
}

/* Expand Icon */
.expand-icon {
  width: 16px;
  height: 16px;
  color: var(--color-gray-500);
  transition: transform var(--transition-base);
  flex-shrink: 0;
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

.expand-spacer {
  width: 16px;
  flex-shrink: 0;
}

/* Category Icon */
.category-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
}

/* Category Name */
.category-name {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.node-content.is-selected .category-name {
  color: white;
  font-weight: 600;
}

/* Children */
.children {
  overflow: hidden;
}

/* Expand Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all var(--transition-slow);
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
