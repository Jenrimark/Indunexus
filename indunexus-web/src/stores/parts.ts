// 零部件状态管理
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { partsApi } from '../api/parts';
import type { Part, SearchQuery } from '../types';

export const usePartsStore = defineStore('parts', () => {
  // State
  const parts = ref<Part[]>([]);
  const selectedPart = ref<Part | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const hasMore = ref(true);
  const currentPage = ref(1);

  // Actions
  async function searchParts(query: SearchQuery) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await partsApi.search(query);
      
      if (query.page === 1) {
        parts.value = response.data.parts;
      } else {
        parts.value.push(...response.data.parts);
      }
      
      total.value = response.data.total;
      hasMore.value = response.data.hasMore;
      currentPage.value = query.page;
      
      return response;
    } catch (err: any) {
      error.value = err.message || '搜索失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(query: SearchQuery) {
    if (!hasMore.value || loading.value) return;
    
    await searchParts({
      ...query,
      page: currentPage.value + 1,
    });
  }

  async function getPartById(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await partsApi.getById(id);
      selectedPart.value = response.data;
      return response;
    } catch (err: any) {
      error.value = err.message || '获取零部件详情失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function selectPart(part: Part) {
    selectedPart.value = part;
  }

  function clearParts() {
    parts.value = [];
    total.value = 0;
    hasMore.value = true;
    currentPage.value = 1;
  }

  return {
    // State
    parts,
    selectedPart,
    loading,
    error,
    total,
    hasMore,
    currentPage,
    // Actions
    searchParts,
    loadMore,
    getPartById,
    selectPart,
    clearParts,
  };
});
