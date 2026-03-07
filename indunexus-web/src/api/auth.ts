// 认证相关 API
import client from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      avatar?: string;
    };
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  company?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  avatar?: string;
  companyName?: string;
  companyDescription?: string;
}

export const authApi = {
  // 登录
  async login(data: LoginRequest): Promise<LoginResponse> {
    return client.post('/auth/login', data);
  },

  // 注册
  async register(data: RegisterRequest): Promise<LoginResponse> {
    return client.post('/auth/register', data);
  },

  // 登出
  async logout(): Promise<void> {
    return client.post('/auth/logout');
  },

  // 获取当前用户信息
  async getCurrentUser() {
    return client.get('/auth/me');
  },

  // 更新个人信息
  async updateProfile(data: UpdateProfileRequest) {
    return client.put('/auth/profile', {
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      company_name: data.companyName,
      company_description: data.companyDescription,
    });
  },

  // 刷新 token
  async refreshToken() {
    return client.post('/auth/refresh');
  },
};
