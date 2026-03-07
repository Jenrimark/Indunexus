<template>
  <div class="orders-page">
    <Navbar @open-a-i-modal="showAIModal = true" />
    
    <div class="orders-container">
      <div class="page-header">
        <h1>我的订单</h1>
        <p>查看和管理您的采购订单</p>
      </div>

      <!-- Order Filters -->
      <div class="order-filters">
        <button
          v-for="status in orderStatuses"
          :key="status.value"
          :class="['filter-btn', { active: currentStatus === status.value }]"
          @click="currentStatus = status.value"
        >
          {{ status.label }}
          <span v-if="status.count > 0" class="count-badge">{{ status.count }}</span>
        </button>
      </div>

      <!-- Orders List -->
      <div v-if="filteredOrders.length > 0" class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号: {{ order.order_number }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <span :class="['order-status', order.status]">{{ getStatusLabel(order.status) }}</span>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img :src="item.image_url || '/placeholder-part.png'" :alt="item.part_name" class="item-image" />
              <div class="item-info">
                <h3>{{ item.part_name }}</h3>
                <p class="item-specs">{{ item.part_number }}</p>
                <p class="item-quantity">数量: {{ item.quantity }}</p>
              </div>
              <div class="item-price">
                <span class="price">¥{{ item.price.toFixed(2) }}</span>
                <span class="total">小计: ¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span>订单总额:</span>
              <span class="total-amount">¥{{ order.total_amount.toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <button v-if="order.status === 'pending'" class="btn-pay" @click="openPaymentModal(order)">
                立即支付
              </button>
              <button v-if="order.status === 'pending'" class="btn-secondary" @click="cancelOrder(order.id)">
                取消订单
              </button>
              <button v-if="order.status === 'shipped'" class="btn-primary" @click="confirmReceipt(order.id)">
                确认收货
              </button>
              <button v-if="order.status === 'cancelled' || order.status === 'completed'" class="btn-danger" @click="deleteOrder(order.id)">
                删除订单
              </button>
              <button class="btn-secondary" @click="viewOrderDetail(order.id)">
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
        </svg>
        <h3>暂无订单</h3>
        <p>您还没有任何{{ currentStatus === 'all' ? '' : getStatusLabel(currentStatus) }}订单</p>
        <button class="btn-primary" @click="$router.push('/marketplace')">去采购</button>
      </div>

      <!-- Loading State -->
      <div v-if="ordersStore.loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>加载订单中...</p>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :show="showPaymentModal"
      :order-number="selectedOrder?.order_number || ''"
      :amount="selectedOrder?.total_amount || 0"
      @close="showPaymentModal = false"
      @pay="handlePayment"
    />

    <!-- AI Recognition Modal -->
    <AIRecognitionModal
      :is-open="showAIModal"
      @close="showAIModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOrdersStore } from '../stores/orders';
import { useUIStore } from '../stores/ui';
import Navbar from '../components/Navbar.vue';
import PaymentModal from '../components/PaymentModal.vue';
import AIRecognitionModal from '../components/AIRecognitionModal.vue';
import type { Order } from '../stores/orders';

const router = useRouter();
const ordersStore = useOrdersStore();
const uiStore = useUIStore();

const currentStatus = ref<string>('all');
const showPaymentModal = ref(false);
const selectedOrder = ref<Order | null>(null);
const showAIModal = ref(false);

// Fetch orders on mount
onMounted(async () => {
  try {
    await ordersStore.fetchOrders();
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    
    // 如果是认证错误，不显示 toast（因为会自动跳转到登录页）
    if (error.response?.status !== 401) {
      uiStore.showToast({
        type: 'error',
        message: '加载订单失败',
      });
    }
  }
});

const orderStatuses = computed(() => [
  { value: 'all', label: '全部订单', count: ordersStore.ordersCount },
  { value: 'pending', label: '待付款', count: ordersStore.pendingOrders.length },
  { value: 'paid', label: '待发货', count: ordersStore.paidOrders.length },
  { value: 'shipped', label: '待收货', count: ordersStore.shippedOrders.length },
  { value: 'completed', label: '已完成', count: ordersStore.completedOrders.length },
  { value: 'cancelled', label: '已取消', count: ordersStore.cancelledOrders.length },
]);

const filteredOrders = computed(() => {
  return ordersStore.getOrdersByStatus(currentStatus.value);
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
  };
  return labels[status] || status;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const openPaymentModal = (order: Order) => {
  selectedOrder.value = order;
  showPaymentModal.value = true;
};

const handlePayment = async (method: string) => {
  if (!selectedOrder.value) return;
  
  console.log('Payment method selected:', method);
  
  // 模拟支付成功
  const success = await ordersStore.updateOrderStatus(selectedOrder.value.id, 'paid');
  
  if (success) {
    showPaymentModal.value = false;
    
    uiStore.showToast({
      type: 'success',
      message: '支付成功！',
    });
    
    selectedOrder.value = null;
  } else {
    uiStore.showToast({
      type: 'error',
      message: '支付失败，请重试',
    });
  }
};

const cancelOrder = async (orderId: number) => {
  if (await ordersStore.cancelOrder(orderId)) {
    uiStore.showToast({
      type: 'success',
      message: '订单已取消',
    });
  }
};

const confirmReceipt = async (orderId: number) => {
  if (await ordersStore.updateOrderStatus(orderId, 'completed')) {
    uiStore.showToast({
      type: 'success',
      message: '已确认收货',
    });
  }
};

const deleteOrder = async (orderId: number) => {
  if (confirm('确定要删除这个订单吗？删除后无法恢复。')) {
    if (await ordersStore.deleteOrder(orderId)) {
      uiStore.showToast({
        type: 'success',
        message: '订单已删除',
      });
    }
  }
};

const viewOrderDetail = (orderId: number) => {
  router.push(`/orders/${orderId}`);
};
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-top: var(--header-height);
}

.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-header h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.page-header p {
  font-size: var(--text-base);
  color: var(--color-secondary);
}

/* Order Filters */
.order-filters {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  overflow-x: auto;
  padding-bottom: var(--space-2);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.filter-btn.active {
  background: var(--color-cta);
  border-color: var(--color-cta);
  color: white;
}

.count-badge {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.filter-btn.active .count-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.order-card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-bottom: 1px solid #E2E8F0;
}

.order-info {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.order-number {
  font-weight: 600;
  color: var(--color-text);
}

.order-date {
  font-size: var(--text-sm);
  color: var(--color-secondary);
}

.order-status {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
}

.order-status.pending {
  background: #FEF3C7;
  color: #D97706;
}

.order-status.paid {
  background: #DBEAFE;
  color: #0369A1;
}

.order-status.shipped {
  background: #E0E7FF;
  color: #4F46E5;
}

.order-status.completed {
  background: #D1FAE5;
  color: #059669;
}

.order-status.cancelled {
  background: #FEE2E2;
  color: #DC2626;
}

/* Order Items */
.order-items {
  padding: var(--space-4);
}

.order-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3) 0;
}

.order-item:not(:last-child) {
  border-bottom: 1px solid #F1F5F9;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.item-specs {
  font-size: var(--text-sm);
  color: var(--color-secondary);
  margin-bottom: var(--space-1);
}

.item-quantity {
  font-size: var(--text-sm);
  color: var(--color-secondary);
}

.item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.item-price .price {
  font-size: var(--text-base);
  color: var(--color-secondary);
}

.item-price .total {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

/* Order Footer */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-top: 1px solid #E2E8F0;
}

.order-total {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  color: var(--color-secondary);
}

.total-amount {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-cta);
}

.order-actions {
  display: flex;
  gap: var(--space-2);
}

.btn-primary,
.btn-secondary,
.btn-danger,
.btn-pay {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-pay {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
  border: none;
}

.btn-pay:hover {
  background: linear-gradient(135deg, #EE5A6F 0%, #DC4E5F 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-primary {
  background: var(--color-cta);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #025a8a;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: var(--color-secondary);
  border: 1px solid #E2E8F0;
}

.btn-secondary:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.btn-danger {
  background: white;
  color: var(--color-error);
  border: 1px solid #FEE2E2;
}

.btn-danger:hover {
  background: #FEE2E2;
  border-color: var(--color-error);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-4);
  text-align: center;
}

.empty-state svg {
  width: 80px;
  height: 80px;
  color: var(--color-gray-400);
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: var(--text-base);
  color: var(--color-secondary);
  margin-bottom: var(--space-6);
}

/* Responsive */
@media (max-width: 768px) {
  .orders-container {
    padding: var(--space-4);
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .order-item {
    flex-direction: column;
  }

  .item-price {
    align-items: flex-start;
  }

  .order-footer {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }

  .order-actions {
    flex-direction: column;
  }
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-overlay .spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E2E8F0;
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  font-size: var(--text-base);
  color: var(--color-secondary);
}
</style>
