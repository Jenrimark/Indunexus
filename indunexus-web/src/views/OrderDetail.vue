<template>
  <div class="order-detail-page">
    <Navbar @open-a-i-modal="showAIModal = true" />
    
    <div class="order-detail-container">
      <!-- Back Button -->
      <button class="back-btn" @click="$router.push('/orders')">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        返回订单列表
      </button>

      <div v-if="order" class="order-detail">
        <!-- Order Header -->
        <div class="detail-header">
          <div class="header-left">
            <h1>订单详情</h1>
            <p class="order-number">订单号: {{ order.order_number }}</p>
          </div>
          <span :class="['order-status-badge', order.status]">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>

        <!-- Order Timeline -->
        <div class="order-timeline">
          <h2>订单进度</h2>
          <div class="timeline">
            <div :class="['timeline-item', { active: isStepActive('created') }]">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h3>订单创建</h3>
                <p>{{ formatDate(order.created_at) }}</p>
              </div>
            </div>
            <div :class="['timeline-item', { active: isStepActive('paid') }]">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h3>支付完成</h3>
                <p v-if="order.paid_at">{{ formatDate(order.paid_at) }}</p>
                <p v-else class="pending">待支付</p>
              </div>
            </div>
            <div :class="['timeline-item', { active: isStepActive('shipped') }]">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h3>商品发货</h3>
                <p v-if="order.shipped_at">{{ formatDate(order.shipped_at) }}</p>
                <p v-else class="pending">待发货</p>
              </div>
            </div>
            <div :class="['timeline-item', { active: isStepActive('completed') }]">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h3>交易完成</h3>
                <p v-if="order.completed_at">{{ formatDate(order.completed_at) }}</p>
                <p v-else class="pending">待完成</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items-section">
          <h2>商品清单</h2>
          <div class="items-list">
            <div v-for="item in order.items" :key="item.id" class="item-row">
              <img :src="item.image_url || '/placeholder-part.png'" :alt="item.part_name" class="item-image" />
              <div class="item-info">
                <h3>{{ item.part_name || 'Unknown' }}</h3>
                <p class="item-specs">型号: {{ item.part_number || 'N/A' }}</p>
                <p class="item-brand">品牌: {{ item.manufacturer || 'N/A' }}</p>
              </div>
              <div class="item-quantity">
                <span>数量</span>
                <span class="value">{{ item.quantity || 0 }}</span>
              </div>
              <div class="item-price">
                <span>单价</span>
                <span class="value">¥{{ (item.price || 0).toFixed(2) }}</span>
              </div>
              <div class="item-total">
                <span>小计</span>
                <span class="value">¥{{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h2>订单金额</h2>
          <div class="summary-content">
            <div class="summary-row">
              <span>商品总额</span>
              <span>¥{{ order.subtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>运费</span>
              <span>¥{{ order.shipping_fee.toFixed(2) }}</span>
            </div>
            <div v-if="order.discount > 0" class="summary-row discount">
              <span>优惠金额</span>
              <span>-¥{{ order.discount.toFixed(2) }}</span>
            </div>
            <div class="summary-row total">
              <span>订单总额</span>
              <span class="total-amount">¥{{ order.total_amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Info -->
        <div class="shipping-info">
          <h2>收货信息</h2>
          <div class="info-content">
            <div class="info-row">
              <span class="label">收货人:</span>
              <span>{{ order.receiver_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系电话:</span>
              <span>{{ order.receiver_phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货地址:</span>
              <span>{{ order.shipping_address }}</span>
            </div>
            <div v-if="order.tracking_number" class="info-row">
              <span class="label">物流单号:</span>
              <span class="tracking">{{ order.tracking_number }}</span>
            </div>
          </div>
        </div>

        <!-- Order Actions -->
        <div class="order-actions">
          <button v-if="order.status === 'pending'" class="btn-pay-now" @click="showPaymentModal = true">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
            </svg>
            立即支付
          </button>
          <button v-if="order.status === 'shipped'" class="btn-primary" @click="confirmReceipt">
            确认收货
          </button>
          <button v-if="order.status === 'completed'" class="btn-secondary">
            申请售后
          </button>
          <button 
            v-if="order.status === 'pending' || order.status === 'completed' || order.status === 'cancelled'" 
            class="btn-delete" 
            @click="deleteOrder"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ order.status === 'pending' ? '取消订单' : '删除订单' }}
          </button>
          <button class="btn-secondary" @click="contactSupport">
            联系客服
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载订单详情...</p>
      </div>

      <!-- Not Found State -->
      <div v-else-if="notFound" class="not-found-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2>订单不存在</h2>
        <p>正在返回订单列表...</p>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :show="showPaymentModal"
      :order-number="order?.order_number || ''"
      :amount="order?.total_amount || 0"
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrdersStore } from '../stores/orders';
import { useUIStore } from '../stores/ui';
import Navbar from '../components/Navbar.vue';
import PaymentModal from '../components/PaymentModal.vue';
import AIRecognitionModal from '../components/AIRecognitionModal.vue';
import type { Order } from '../stores/orders';

const route = useRoute();
const router = useRouter();
const ordersStore = useOrdersStore();
const uiStore = useUIStore();

const order = ref<Order | null>(null);
const loading = ref(true);
const notFound = ref(false);
const showPaymentModal = ref(false);
const showAIModal = ref(false);

onMounted(async () => {
  const orderId = parseInt(route.params.id as string);
  console.log('Loading order with ID:', orderId);
  
  // 总是从后端获取最新的订单数据
  try {
    await ordersStore.fetchOrders();
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  }
  
  const foundOrder = ordersStore.getOrderById(orderId);
  console.log('Found order:', foundOrder);
  
  order.value = foundOrder || null;
  loading.value = false;
  
  if (!order.value) {
    console.error('Order not found:', orderId);
    notFound.value = true;
    uiStore.showToast({
      type: 'error',
      message: '订单不存在',
    });
    setTimeout(() => {
      router.push('/orders');
    }, 2000);
  }
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

const isStepActive = (step: string) => {
  if (!order.value) return false;
  const statusOrder = ['created', 'paid', 'shipped', 'completed'];
  const currentIndex = statusOrder.indexOf(order.value.status === 'pending' ? 'created' : order.value.status);
  const stepIndex = statusOrder.indexOf(step);
  return stepIndex <= currentIndex;
};

const handlePayment = async (method: string) => {
  if (!order.value) return;
  
  console.log('Payment method selected:', method);
  
  // 模拟支付成功
  const success = await ordersStore.updateOrderStatus(order.value.id, 'paid');
  
  if (success) {
    showPaymentModal.value = false;
    order.value = ordersStore.getOrderById(order.value.id) || null;
    
    uiStore.showToast({
      type: 'success',
      message: '支付成功！',
    });
  } else {
    uiStore.showToast({
      type: 'error',
      message: '支付失败，请重试',
    });
  }
};

const confirmReceipt = async () => {
  if (!order.value) return;
  
  if (await ordersStore.updateOrderStatus(order.value.id, 'completed')) {
    order.value = ordersStore.getOrderById(order.value.id) || null;
    uiStore.showToast({
      type: 'success',
      message: '已确认收货',
    });
  }
};

const contactSupport = () => {
  uiStore.showToast({
    type: 'info',
    message: '客服功能开发中',
  });
};

const deleteOrder = async () => {
  if (!order.value) return;
  
  const isPending = order.value.status === 'pending';
  const confirmMessage = isPending 
    ? '确定要取消这个订单吗？订单将被删除。'
    : '确定要删除这个订单记录吗？删除后将无法恢复。';
  
  if (confirm(confirmMessage)) {
    const success = await ordersStore.deleteOrder(order.value.id);
    if (success) {
      uiStore.showToast({
        type: 'success',
        message: isPending ? '订单已取消' : '订单已删除',
      });
      router.push('/orders');
    } else {
      uiStore.showToast({
        type: 'error',
        message: '操作失败',
      });
    }
  }
};
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-top: var(--header-height);
}

.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  color: var(--color-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: var(--space-6);
}

.back-btn:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid #E2E8F0;
}

.header-left h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.order-number {
  font-size: var(--text-base);
  color: var(--color-secondary);
  font-weight: 500;
}

.order-status-badge {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
}

.order-status-badge.pending {
  background: #FEF3C7;
  color: #D97706;
}

.order-status-badge.paid {
  background: #DBEAFE;
  color: #0369A1;
}

.order-status-badge.shipped {
  background: #E0E7FF;
  color: #4F46E5;
}

.order-status-badge.completed {
  background: #D1FAE5;
  color: #059669;
}

/* Timeline */
.order-timeline {
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid #E2E8F0;
}

.order-timeline h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-6);
}

.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #E2E8F0;
  z-index: 0;
}

.timeline-item {
  flex: 1;
  position: relative;
  z-index: 1;
}

.timeline-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 3px solid #E2E8F0;
  margin: 0 auto var(--space-3);
  transition: all var(--transition-base);
}

.timeline-item.active .timeline-dot {
  background: var(--color-cta);
  border-color: var(--color-cta);
}

.timeline-content {
  text-align: center;
}

.timeline-content h3 {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.timeline-content p {
  font-size: var(--text-xs);
  color: var(--color-secondary);
}

.timeline-content p.pending {
  color: var(--color-gray-400);
}

/* Order Items */
.order-items-section,
.order-summary,
.shipping-info {
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid #E2E8F0;
}

.order-items-section h2,
.order-summary h2,
.shipping-info h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.item-row {
  display: grid;
  grid-template-columns: 120px 1fr auto auto auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.item-image {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.item-info h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.item-specs,
.item-brand {
  font-size: var(--text-sm);
  color: var(--color-secondary);
}

.item-quantity,
.item-price,
.item-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  min-width: 100px;
}

.item-quantity span:first-child,
.item-price span:first-child,
.item-total span:first-child {
  font-size: var(--text-xs);
  color: var(--color-secondary);
}

.item-quantity .value,
.item-price .value,
.item-total .value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

/* Summary */
.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-base);
  color: var(--color-secondary);
}

.summary-row.discount {
  color: var(--color-error);
}

.summary-row.total {
  padding-top: var(--space-3);
  border-top: 2px solid #E2E8F0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.total-amount {
  font-size: var(--text-2xl);
  color: var(--color-cta);
}

/* Shipping Info */
.info-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-row {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-base);
}

.info-row .label {
  min-width: 100px;
  color: var(--color-secondary);
  font-weight: 500;
}

.tracking {
  color: var(--color-cta);
  font-weight: 600;
}

/* Actions */
.order-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-danger,
.btn-pay-now {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-pay-now {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-pay-now:hover {
  background: linear-gradient(135deg, #EE5A6F 0%, #DC4E5F 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.btn-pay-now svg {
  width: 20px;
  height: 20px;
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

.btn-delete {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  transition: all var(--transition-base);
  border: 2px solid var(--color-error);
  background: var(--color-error);
  color: white;
}

.btn-delete:hover {
  background: #DC2626;
  border-color: #DC2626;
  transform: translateY(-1px);
}

.btn-delete svg {
  width: 18px;
  height: 18px;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
}

.spinner {
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

.loading-state p {
  font-size: var(--text-base);
  color: var(--color-secondary);
}

/* Not Found */
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  background: white;
  border-radius: var(--radius-xl);
}

.not-found-state svg {
  width: 120px;
  height: 120px;
  color: var(--color-gray-300);
  margin-bottom: var(--space-6);
  stroke-width: 1.5;
}

.not-found-state h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.not-found-state p {
  font-size: var(--text-base);
  color: var(--color-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .order-detail-container {
    padding: var(--space-4);
  }

  .detail-header {
    flex-direction: column;
    gap: var(--space-4);
  }

  .timeline {
    flex-direction: column;
    gap: var(--space-6);
  }

  .timeline::before {
    display: none;
  }

  .item-row {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .item-image {
    margin: 0 auto;
  }

  .order-actions {
    flex-direction: column;
  }
}
</style>
