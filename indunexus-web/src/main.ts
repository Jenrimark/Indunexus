import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import pinia from './stores'
import './style.css'
import App from './App.vue'
import Landing from './views/Landing.vue'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Profile from './views/Profile.vue'
import Cart from './views/Cart.vue'
import Orders from './views/Orders.vue'
import OrderDetail from './views/OrderDetail.vue'
import Favorites from './views/Favorites.vue'
import Admin from './views/Admin.vue'
import SupplierDashboard from './views/SupplierDashboard.vue'
import AdminUsers from './views/AdminUsers.vue'
import AdminCategories from './views/AdminCategories.vue'
import AdminPartsManagement from './views/AdminPartsManagement.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import Debug from './views/Debug.vue'

// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/debug',
      name: 'Debug',
      component: Debug,
    },
    {
      path: '/',
      name: 'Landing',
      component: Landing,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/marketplace',
      name: 'Marketplace',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/cart',
      name: 'Cart',
      component: Cart,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'Orders',
      component: Orders,
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:id',
      name: 'OrderDetail',
      component: OrderDetail,
      meta: { requiresAuth: true },
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: Favorites,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: AdminUsers,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/categories',
      name: 'AdminCategories',
      component: AdminCategories,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/parts',
      name: 'AdminParts',
      component: AdminPartsManagement,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/supplier',
      name: 'Supplier',
      component: SupplierDashboard,
      meta: { requiresAuth: true, requiresSupplier: true },
    },
    {
      path: '/ai-analysis',
      name: 'AIAnalysis',
      component: () => import('./views/AIAnalysisPage.vue'),
      meta: { requiresAuth: true, requiresBuyer: true },
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // 未登录用户只能访问首页和登录页
  if (!token && to.path !== '/' && to.path !== '/login') {
    // 保存目标页面，登录后跳转
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
    return;
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
    return;
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/');
    return;
  }
  
  // 检查是否需要供应商权限
  if (to.meta.requiresSupplier && user?.role !== 'supplier') {
    next('/');
    return;
  }
  
  // 检查是否需要买家权限
  if (to.meta.requiresBuyer) {
    if (user?.role === 'buyer') {
      next();
      return;
    } else if (user?.role === 'admin') {
      next('/admin');
      return;
    } else if (user?.role === 'supplier') {
      next('/supplier');
      return;
    }
  }
  
  // 已登录用户访问登录页，根据角色跳转
  if (to.path === '/login' && token) {
    if (user?.role === 'admin') {
      next('/admin');
    } else if (user?.role === 'supplier') {
      next('/supplier');
    } else {
      next('/marketplace');
    }
    return;
  }
  
  next();
});

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
