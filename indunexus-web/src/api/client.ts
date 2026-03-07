// API 客户端配置
import axios, { type AxiosInstance, type AxiosError } from 'axios';

// 创建 axios 实例
const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 将 snake_case 转换为 camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// 将 camelCase 转换为 snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 转换请求数据为 snake_case
    if (config.data) {
      config.data = toSnakeCase(config.data);
    }
    
    // 添加请求日志
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
client.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.data);
    
    // 转换响应数据为 camelCase
    const data = toCamelCase(response.data);
    return data;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', error);
    
    // 统一错误处理
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';
      
      // 只有在非登录接口返回 401 时才跳转登录页
      if (status === 401 && !url.includes('/auth/login')) {
        // 未授权，清除 token 并跳转登录
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('没有权限访问该资源');
      } else if (status === 404) {
        console.error('请求的资源不存在');
      } else if (status === 500) {
        console.error('服务器错误');
      } else {
        console.error(`请求失败: ${status}`);
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接');
    } else {
      console.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default client;
