// 购物车状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Part, CartItem } from '../types';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([]);

  // Getters
  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  const totalPrice = computed(() => 
    items.value.reduce((sum, item) => sum + item.subtotal, 0)
  );

  // Actions
  function addToCart(part: Part, quantity: number = 1) {
    const existingItem = items.value.find(item => item.part.id === part.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.part.price;
    } else {
      items.value.push({
        id: `cart-${Date.now()}`,
        skuId: part.id,
        part,
        quantity,
        subtotal: part.price * quantity,
        selected: true, // 默认选中
      });
    }
    
    // 保存到 localStorage
    saveToLocalStorage();
  }

  function removeFromCart(itemId: string) {
    const index = items.value.findIndex(item => item.id === itemId);
    if (index > -1) {
      items.value.splice(index, 1);
      saveToLocalStorage();
    }
  }

  function updateQuantity(itemId: string, quantity: number) {
    const item = items.value.find(item => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      item.subtotal = item.quantity * item.part.price;
      saveToLocalStorage();
    }
  }

  function clearCart() {
    items.value = [];
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(items.value));
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      items.value = JSON.parse(saved);
    }
  }

  // 初始化时加载
  loadFromLocalStorage();

  return {
    // State
    items,
    // Getters
    itemCount,
    totalPrice,
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
});
