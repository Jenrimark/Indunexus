// 收藏状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Part } from '../types';

const STORAGE_KEY = 'indunexus_favorites';

export const useFavoritesStore = defineStore('favorites', () => {
  // State
  const favorites = ref<Part[]>([]);
  const loading = ref(false);

  // Load from localStorage on init
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        favorites.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load favorites from storage:', error);
    }
  };

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value));
    } catch (error) {
      console.error('Failed to save favorites to storage:', error);
    }
  };

  // Getters
  const favoriteIds = computed(() => favorites.value.map(item => item.id));
  const favoritesCount = computed(() => favorites.value.length);
  const isFavorite = (partId: string) => favoriteIds.value.includes(partId);

  // Actions
  const addFavorite = (part: Part) => {
    if (!isFavorite(part.id)) {
      favorites.value.push(part);
      saveToStorage();
      return true;
    }
    return false;
  };

  const removeFavorite = (partId: string) => {
    const index = favorites.value.findIndex(item => item.id === partId);
    if (index > -1) {
      favorites.value.splice(index, 1);
      saveToStorage();
      return true;
    }
    return false;
  };

  const toggleFavorite = (part: Part) => {
    if (isFavorite(part.id)) {
      return removeFavorite(part.id);
    } else {
      return addFavorite(part);
    }
  };

  const clearFavorites = () => {
    favorites.value = [];
    saveToStorage();
  };

  // Initialize
  loadFromStorage();

  return {
    // State
    favorites,
    loading,
    // Getters
    favoriteIds,
    favoritesCount,
    isFavorite,
    // Actions
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
  };
});
