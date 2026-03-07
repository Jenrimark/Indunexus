// Pinia Store 入口
import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

// 导出所有 stores
export { useAuthStore } from './auth';
export { usePartsStore } from './parts';
export { useCartStore } from './cart';
export { useUIStore } from './ui';
