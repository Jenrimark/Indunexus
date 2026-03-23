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
    
    // 提取后端返回的错误信息
    let message = '请求失败';
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';
      const data = error.response.data as any;
      
      // 优先使用后端返回的 detail 或 message
      if (data?.detail) {
        message = data.detail;
      } else if (data?.message) {
        message = data.message;
      } else if (status === 401) {
        message = '用户名或密码错误';
      } else if (status === 403) {
        message = '没有权限访问该资源';
      } else if (status === 404) {
        message = '请求的资源不存在';
      } else if (status === 500) {
        message = '服务器错误，请稍后重试';
      }
      
      // 只有在非登录接口返回 401 时才跳转登录页
      if (status === 401 && !url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      message = '网络错误，请检查网络连接';
    }
    
    const err = new Error(message);
    return Promise.reject(err);
  }
);

export default client;
