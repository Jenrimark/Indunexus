/**
 * 管理员 API
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ==================== 用户管理 ====================

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'supplier' | 'buyer';
  is_active: boolean;
  company_name?: string;
  company_description?: string;
  avatar?: string;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserUpdate {
  email?: string;
  role?: string;
  is_active?: boolean;
  company_name?: string;
  company_description?: string;
}

export const userApi = {
  // 获取用户列表
  getUsers: async (params?: { skip?: number; limit?: number; role?: string; is_active?: boolean }) => {
    const response = await axios.get(`${API_BASE_URL}/users/`, {
      headers: getAuthHeaders(),
      params,
    });
    return response.data;
  },

  // 获取用户详情
  getUser: async (userId: string) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 创建用户
  createUser: async (data: UserCreate) => {
    const response = await axios.post(`${API_BASE_URL}/users/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 更新用户
  updateUser: async (userId: string, data: UserUpdate) => {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 删除用户
  deleteUser: async (userId: string) => {
    await axios.delete(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
  },

  // 获取用户统计
  getUserStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/users/stats/summary`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

// ==================== 类目管理 ====================

export interface Category {
  id: string;
  name: string;
  name_en?: string;
  parent_id?: string;
  level: number;
  path?: string;
  icon?: string;
  parts_count: number;
  sort_order: number;
  created_at: string;
  children?: Category[];
}

export interface CategoryCreate {
  name: string;
  name_en?: string;
  parent_id?: string;
  icon?: string;
  sort_order?: number;
}

export interface CategoryUpdate {
  name?: string;
  name_en?: string;
  icon?: string;
  sort_order?: number;
}

export const categoryApi = {
  // 获取类目树
  getCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/categories/`);
    return response.data;
  },

  // 获取类目详情
  getCategory: async (categoryId: string) => {
    const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}`);
    return response.data;
  },

  // 创建类目
  createCategory: async (data: CategoryCreate) => {
    const response = await axios.post(`${API_BASE_URL}/categories/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 更新类目
  updateCategory: async (categoryId: string, data: CategoryUpdate) => {
    const response = await axios.put(`${API_BASE_URL}/categories/${categoryId}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 删除类目
  deleteCategory: async (categoryId: string) => {
    await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, {
      headers: getAuthHeaders(),
    });
  },
};

// ==================== 零部件管理 ====================

export interface PartSKU {
  id: string;
  spu_id: string;
  sku_code: string;
  specifications: Record<string, any>;
  price: number;
  currency: string;
  stock: number;
  images?: string[];
  model_3d_url?: string;
  technical_drawing_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PartSPU {
  id: string;
  part_number: string;
  oem_code?: string;
  name: string;
  name_en?: string;
  category_id: string;
  brand?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  skus: PartSKU[];
}

export interface PartSPUCreate {
  part_number: string;
  oem_code?: string;
  name: string;
  name_en?: string;
  category_id: string;
  brand?: string;
  description?: string;
}

export interface PartSPUUpdate {
  name?: string;
  name_en?: string;
  oem_code?: string;
  category_id?: string;
  brand?: string;
  description?: string;
}

export interface PartSKUCreate {
  spu_id: string;
  sku_code: string;
  specifications: Record<string, any>;
  price: number;
  currency?: string;
  stock: number;
  images?: string[];
  model_3d_url?: string;
  technical_drawing_url?: string;
}

export interface PartSKUUpdate {
  specifications?: Record<string, any>;
  price?: number;
  currency?: string;
  stock?: number;
  images?: string[];
  model_3d_url?: string;
  technical_drawing_url?: string;
}

export const partApi = {
  // 搜索零部件
  searchParts: async (params: {
    keyword?: string;
    category_id?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    page?: number;
    page_size?: number;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/parts/search`, { 
      params,
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // 获取 SPU 详情
  getSPU: async (spuId: string) => {
    const response = await axios.get(`${API_BASE_URL}/parts/spu/${spuId}`);
    return response.data;
  },

  // 创建 SPU
  createSPU: async (data: PartSPUCreate) => {
    const response = await axios.post(`${API_BASE_URL}/parts/spu`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 更新 SPU
  updateSPU: async (spuId: string, data: PartSPUUpdate) => {
    const response = await axios.put(`${API_BASE_URL}/parts/spu/${spuId}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 删除 SPU
  deleteSPU: async (spuId: string) => {
    await axios.delete(`${API_BASE_URL}/parts/spu/${spuId}`, {
      headers: getAuthHeaders(),
    });
  },

  // 创建 SKU
  createSKU: async (data: PartSKUCreate) => {
    const response = await axios.post(`${API_BASE_URL}/parts/sku`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 更新 SKU
  updateSKU: async (skuId: string, data: PartSKUUpdate) => {
    const response = await axios.put(`${API_BASE_URL}/parts/sku/${skuId}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // 删除 SKU
  deleteSKU: async (skuId: string) => {
    await axios.delete(`${API_BASE_URL}/parts/sku/${skuId}`, {
      headers: getAuthHeaders(),
    });
  },

  // 获取零部件统计
  getPartsStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/parts/stats/summary`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
