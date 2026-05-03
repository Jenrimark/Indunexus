import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 请求拦截器 - 添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 无效或过期，清除本地存储并跳转到登录页
      console.error('Authentication failed, redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface OrderItemCreate {
  part_id: string;
  part_name: string;
  part_number: string;
  manufacturer?: string;
  image_url?: string;
  quantity: number;
  price: number;
}

export interface OrderCreate {
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  need_invoice?: boolean;
  invoice_title?: string;
  tax_number?: string;
  remark?: string;
  items: OrderItemCreate[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  part_id: string;
  part_name: string;
  part_number: string;
  manufacturer?: string;
  image_url?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  created_at: string;
  paid_at?: string;
  shipped_at?: string;
  completed_at?: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  tracking_number?: string;
  need_invoice: boolean;
  invoice_title?: string;
  tax_number?: string;
  remark?: string;
  items: OrderItem[];
}

export interface OrderUpdate {
  status?: string;
  tracking_number?: string;
  paid_at?: string;
  shipped_at?: string;
  completed_at?: string;
}

// 创建订单
export const createOrder = async (orderData: OrderCreate): Promise<Order> => {
  const response = await api.post('/orders/', orderData);
  return response.data;
};

// 获取订单列表
export const getOrders = async (status?: string): Promise<Order[]> => {
  const params = status && status !== 'all' ? { status } : {};
  const response = await api.get('/orders/', { params });
  return response.data;
};

// 获取订单详情
export const getOrder = async (orderId: number): Promise<Order> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// 更新订单
export const updateOrder = async (orderId: number, orderUpdate: OrderUpdate): Promise<Order> => {
  const response = await api.patch(`/orders/${orderId}`, orderUpdate);
  return response.data;
};

// 删除订单
export const deleteOrder = async (orderId: number): Promise<void> => {
  await api.delete(`/orders/${orderId}`);
};
