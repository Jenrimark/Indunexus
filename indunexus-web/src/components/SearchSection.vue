<template>
  <div class="search-section">
    <div class="search-container">
      <!-- Search Input -->
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索型号、图号、条码"
          @input="handleSearchInput"
          @focus="showSuggestions = true"
          @keydown.enter="handleSearch"
        />

        <select v-model="searchType" class="search-type-selector">
          <option value="auto">智能识别</option>
          <option value="model">型号</option>
          <option value="drawing">图号</option>
          <option value="barcode">条码</option>
        </select>

        <!-- Search Suggestions -->
        <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.text"
            class="suggestion-item cursor-pointer"
            @click="selectSuggestion(suggestion)"
          >
            <svg class="suggestion-icon" viewBox="0 0 20 20" fill="currentColor">
              <path v-if="suggestion.type === 'history'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              <path v-else-if="suggestion.type === 'hot'" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              <path v-else d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
            </svg>
            <span class="suggestion-text">{{ suggestion.text }}</span>
            <span v-if="suggestion.count" class="suggestion-count">{{ suggestion.count }}</span>
          </div>
        </div>
      </div>

      <!-- AI Image Recognition Button -->
      <button class="ai-button cursor-pointer" @click="emit('openAIModal')">
        <svg class="ai-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
        <span>AI识图</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { SearchSuggestion } from '../types';

const emit = defineEmits<{
  openAIModal: [];
}>();

const searchQuery = ref('');
const searchType = ref<'auto' | 'model' | 'drawing' | 'barcode'>('auto');
const showSuggestions = ref(false);

// Mock suggestions data
const suggestions = ref<SearchSuggestion[]>([
  { type: 'history', text: '深沟球轴承 6205' },
  { type: 'history', text: '刹车片 东风天龙' },
  { type: 'hot', text: '液压泵', count: 1250 },
  { type: 'hot', text: '传动轴', count: 890 },
]);

const handleSearchInput = () => {
  showSuggestions.value = searchQuery.value.length > 0;
};

const handleSearch = () => {
  console.log('Searching:', searchQuery.value, searchType.value);
  showSuggestions.value = false;
};

const selectSuggestion = (suggestion: SearchSuggestion) => {
  searchQuery.value = suggestion.text;
  showSuggestions.value = false;
  handleSearch();
};
</script>

<style scoped>
.search-section {
  padding: var(--space-6) var(--space-6) var(--space-4);
  background: white;
  border-bottom: 1px solid #E2E8F0;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

/* Search Input */
.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-gray-50);
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.search-input-wrapper:focus-within {
  background: white;
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-secondary);
  margin-left: var(--space-4);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-3) var(--space-2);
  font-size: var(--text-base);
  color: var(--color-text);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-gray-400);
}

.search-type-selector {
  border: none;
  background: transparent;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-secondary);
  cursor: pointer;
  border-left: 1px solid #E2E8F0;
  outline: none;
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  transition: background-color var(--transition-base);
}

.suggestion-item:hover {
  background: var(--color-gray-50);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.suggestion-count {
  font-size: var(--text-xs);
  color: var(--color-secondary);
}

/* AI Button */
.ai-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--color-cta);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-sm);
  flex-shrink: 0;
  transition: all var(--transition-base);
  box-shadow: 0 1px 2px rgba(3, 105, 161, 0.1);
}

.ai-button:hover {
  background: #025a8a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
}

.ai-icon {
  width: 20px;
  height: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .search-section {
    padding: var(--space-4);
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .ai-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
