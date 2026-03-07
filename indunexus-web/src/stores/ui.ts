// UI 状态管理
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useUIStore = defineStore('ui', () => {
  // State
  const toasts = ref<Toast[]>([]);
  const sidebarCollapsed = ref(false);
  const detailPanelCollapsed = ref(false);
  const loading = ref(false);

  // Actions
  function showToast(toast: Omit<Toast, 'id'>) {
    const id = `toast-${Date.now()}`;
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration || 3000,
    };
    
    toasts.value.push(newToast);
    
    // 自动移除
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
    
    return id;
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function toggleDetailPanel() {
    detailPanelCollapsed.value = !detailPanelCollapsed.value;
  }

  function setLoading(value: boolean) {
    loading.value = value;
  }

  return {
    // State
    toasts,
    sidebarCollapsed,
    detailPanelCollapsed,
    loading,
    // Actions
    showToast,
    removeToast,
    toggleSidebar,
    toggleDetailPanel,
    setLoading,
  };
});
