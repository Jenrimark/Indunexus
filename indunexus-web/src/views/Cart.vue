<template>
  <div class="cart-page">
    <Navbar @open-a-i-modal="showAIModal = true" />

    <div class="cart-container">
      <div class="cart-header">
        <h1>采购清单</h1>
        <p>共 {{ cartStore.items.length }} 件商品</p>
      </div>

      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2>采购清单为空</h2>
        <p>快去零件广场挑选您需要的零部件吧</p>
        <button class="btn-primary" @click="$router.push('/marketplace')">
          前往零件广场
        </button>
      </div>

      <div v-else class="cart-content">
        <!-- 商品列表 -->
        <div class="cart-items">
          <div class="items-header">
            <div class="col-select">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
              <span>全选</span>
            </div>
            <div class="col-product">商品信息</div>
            <div class="col-price">单价</div>
            <div class="col-quantity">数量</div>
            <div class="col-total">小计</div>
            <div class="col-actions">操作</div>
          </div>

          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <div class="col-select">
              <input type="checkbox" v-model="item.selected" @change="updateSelection" />
            </div>
            
            <div class="col-product">
              <img :src="item.part.image_url || '/placeholder-part.png'" :alt="item.part.name" />
              <div class="product-info">
                <h3>{{ item.part.name }}</h3>
                <p class="part-number">型号: {{ item.part.part_number }}</p>
                <p class="manufacturer">品牌: {{ item.part.manufacturer }}</p>
              </div>
            </div>

            <div class="col-price">
              <span class="price">¥{{ item.part.price?.toFixed(2) || '0.00' }}</span>
            </div>

            <div class="col-quantity">
              <div class="quantity-control">
                <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
                <input 
                  type="number" 
                  v-model.number="item.quantity" 
                  @change="updateQuantity(item)"
                  min="1"
                  max="9999"
                />
                <button @click="increaseQuantity(item)">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="col-total">
              <span class="total-price">¥{{ ((item.part.price || 0) * item.quantity).toFixed(2) }}</span>
            </div>

            <div class="col-actions">
              <button class="btn-remove" @click="removeItem(item.id)">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="order-summary">
          <div class="summary-card">
            <h2>订单信息</h2>

            <!-- 收货地址 -->
            <div class="form-section">
              <h3>收货地址</h3>
              <div class="form-group">
                <label>收货人</label>
                <input v-model="orderForm.receiverName" type="text" placeholder="请输入收货人姓名" />
              </div>
              <div class="form-group">
                <label>联系电话</label>
                <input v-model="orderForm.receiverPhone" type="tel" placeholder="请输入联系电话" />
              </div>
              <div class="form-group">
                <label>收货地址</label>
                <textarea v-model="orderForm.address" rows="3" placeholder="请输入详细地址"></textarea>
              </div>
            </div>

            <!-- 发票信息 -->
            <div class="form-section">
              <h3>发票信息</h3>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="orderForm.needInvoice" />
                  <span>需要发票</span>
                </label>
              </div>
              <div v-if="orderForm.needInvoice" class="invoice-details">
                <div class="form-group">
                  <label>发票抬头</label>
                  <input v-model="orderForm.invoiceTitle" type="text" placeholder="请输入发票抬头" />
                </div>
                <div class="form-group">
                  <label>税号</label>
                  <input v-model="orderForm.taxNumber" type="text" placeholder="请输入税号" />
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div class="form-section">
              <h3>订单备注</h3>
              <div class="form-group">
                <textarea v-model="orderForm.remark" rows="3" placeholder="选填，请输入订单备注信息"></textarea>
              </div>
            </div>

            <!-- 价格汇总 -->
            <div class="price-summary">
              <div class="price-row">
                <span>商品总价</span>
                <span class="price">¥{{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="price-row">
                <span>运费</span>
                <span class="price">¥{{ shippingFee.toFixed(2) }}</span>
              </div>
              <div class="price-row total">
                <span>合计</span>
                <span class="price">¥{{ totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <!-- 提交按钮 -->
            <button 
              class="btn-submit" 
              @click="submitOrder"
              :disabled="selectedItems.length === 0 || submitting"
            >
              <span v-if="!submitting">提交订单 ({{ selectedItems.length }})</span>
              <span v-else>提交中...</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Recognition Modal -->
    <AIRecognitionModal
      :is-open="showAIModal"
      @close="showAIModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useOrdersStore } from '../stores/orders';
import { useUIStore } from '../stores/ui';
import Navbar from '../components/Navbar.vue';
import AIRecognitionModal from '../components/AIRecognitionModal.vue';

const router = useRouter();
const cartStore = useCartStore();
const ordersStore = useOrdersStore();
const uiStore = useUIStore();

const selectAll = ref(false);
const submitting = ref(false);
const showAIModal = ref(false);

const orderForm = ref({
  receiverName: '',
  receiverPhone: '',
  address: '',
  needInvoice: false,
  invoiceTitle: '',
  taxNumber: '',
  remark: '',
});

const selectedItems = computed(() => {
  return cartStore.items.filter(item => item.selected);
});

const subtotal = computed(() => {
  return selectedItems.value.reduce((sum, item) => {
    return sum + (item.part.price || 0) * item.quantity;
  }, 0);
});

const shippingFee = computed(() => {
  // 满500免运费
  return subtotal.value >= 500 ? 0 : 20;
});

const totalPrice = computed(() => {
  return subtotal.value + shippingFee.value;
});

const toggleSelectAll = () => {
  cartStore.items.forEach(item => {
    item.selected = selectAll.value;
  });
};

const updateSelection = () => {
  selectAll.value = cartStore.items.every(item => item.selected);
};

const increaseQuantity = (item: any) => {
  item.quantity++;
  cartStore.updateQuantity(item.id, item.quantity);
};

const decreaseQuantity = (item: any) => {
  if (item.quantity > 1) {
    item.quantity--;
    cartStore.updateQuantity(item.id, item.quantity);
  }
};

const updateQuantity = (item: any) => {
  if (item.quantity < 1) {
    item.quantity = 1;
  }
  cartStore.updateQuantity(item.id, item.quantity);
};

const removeItem = (itemId: string) => {
  cartStore.removeFromCart(itemId);
  uiStore.showToast({
    type: 'success',
    message: '已从采购清单中移除',
  });
};

const submitOrder = async () => {
  if (selectedItems.value.length === 0) {
    uiStore.showToast({
      type: 'error',
      message: '请选择要购买的商品',
    });
    return;
  }

  // 验证表单
  if (!orderForm.value.receiverName || !orderForm.value.receiverPhone || !orderForm.value.address) {
    uiStore.showToast({
      type: 'error',
      message: '请填写完整的收货信息',
    });
    return;
  }

  if (orderForm.value.needInvoice && (!orderForm.value.invoiceTitle || !orderForm.value.taxNumber)) {
    uiStore.showToast({
      type: 'error',
      message: '请填写完整的发票信息',
    });
    return;
  }

  submitting.value = true;

  try {
    // 创建订单
    const order = await ordersStore.createOrder({
      receiver_name: orderForm.value.receiverName,
      receiver_phone: orderForm.value.receiverPhone,
      shipping_address: orderForm.value.address,
      need_invoice: orderForm.value.needInvoice,
      invoice_title: orderForm.value.invoiceTitle,
      tax_number: orderForm.value.taxNumber,
      remark: orderForm.value.remark,
      items: selectedItems.value.map(item => ({
        part_id: item.part.id,
        part_name: item.part.name,
        part_number: item.part.partNumber || item.part.id, // 使用 partNumber，如果不存在则用 id
        manufacturer: item.part.brand || '',
        image_url: item.part.images?.thumbnail || 'https://placehold.co/120x120/0369A1/white?text=Part',
        quantity: item.quantity,
        price: item.part.price || 0,
      })),
    });

    // 从购物车中移除已下单的商品
    selectedItems.value.forEach(item => {
      cartStore.removeFromCart(item.id);
    });

    uiStore.showToast({
      type: 'success',
      message: '订单提交成功！',
    });

    // 等待一小段时间确保数据同步，然后跳转到订单详情页
    await new Promise(resolve => setTimeout(resolve, 300));
    router.push(`/orders/${order.id}`);
  } catch (error) {
    console.error('Order submission error:', error);
    uiStore.showToast({
      type: 'error',
      message: '订单提交失败，请重试',
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-top: var(--header-height);
}

.cart-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
}

.cart-header {
  margin-bottom: var(--space-6);
}

.cart-header h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.cart-header p {
  font-size: var(--text-base);
  color: var(--color-secondary);
}

/* Empty Cart */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-6);
  background: white;
  border-radius: var(--radius-xl);
  text-align: center;
}

.empty-cart svg {
  width: 120px;
  height: 120px;
  color: var(--color-gray-300);
  margin-bottom: var(--space-6);
}

.empty-cart h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.empty-cart p {
  font-size: var(--text-base);
  color: var(--color-secondary);
  margin-bottom: var(--space-6);
}

.btn-primary {
  padding: var(--space-3) var(--space-6);
  background: var(--color-cta);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  transition: all var(--transition-base);
}

.btn-primary:hover {
  background: #025a8a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
}

/* Cart Content */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-6);
}

/* Cart Items */
.cart-items {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.items-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 150px 120px 100px;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-bottom: 1px solid #E2E8F0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-secondary);
}

.col-select {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.col-select input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-cta);
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 1fr 120px 150px 120px 100px;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid #E2E8F0;
  align-items: center;
}

.cart-item:last-child {
  border-bottom: none;
}

.col-product {
  display: flex;
  gap: var(--space-3);
}

.col-product img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid #E2E8F0;
}

.product-info h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.product-info p {
  font-size: var(--text-sm);
  color: var(--color-secondary);
  margin-bottom: 2px;
}

.col-price .price {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-cta);
}

/* Quantity Control */
.quantity-control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.quantity-control button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-50);
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.quantity-control button:hover:not(:disabled) {
  background: var(--color-gray-100);
  border-color: var(--color-cta);
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control button svg {
  width: 16px;
  height: 16px;
  color: var(--color-secondary);
}

.quantity-control input {
  width: 60px;
  height: 32px;
  text-align: center;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: 600;
}

.col-total .total-price {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
}

.btn-remove {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  color: var(--color-error);
  font-size: var(--text-sm);
  transition: all var(--transition-base);
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
}

.btn-remove svg {
  width: 16px;
  height: 16px;
}

/* Order Summary */
.order-summary {
  position: sticky;
  top: calc(var(--header-height) + var(--space-6));
  height: fit-content;
}

.summary-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

.summary-card h2 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 2px solid #E2E8F0;
}

.form-section {
  margin-bottom: var(--space-6);
}

.form-section h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.form-group {
  margin-bottom: var(--space-3);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-secondary);
  margin-bottom: var(--space-2);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all var(--transition-base);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-cta);
}

.invoice-details {
  margin-top: var(--space-3);
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
}

/* Price Summary */
.price-summary {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 2px solid #E2E8F0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  font-size: var(--text-base);
  color: var(--color-secondary);
}

.price-row.total {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid #E2E8F0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.price-row .price {
  font-weight: 600;
  color: var(--color-cta);
}

.price-row.total .price {
  font-size: var(--text-2xl);
  color: var(--color-error);
}

.btn-submit {
  width: 100%;
  padding: var(--space-4);
  background: var(--color-cta);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  font-weight: 600;
  margin-top: var(--space-6);
  transition: all var(--transition-base);
}

.btn-submit:hover:not(:disabled) {
  background: #025a8a;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1200px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .items-header {
    display: none;
  }

  .cart-item {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .col-product {
    grid-column: 1;
  }

  .col-price,
  .col-quantity,
  .col-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .col-price::before {
    content: '单价：';
    color: var(--color-secondary);
  }

  .col-quantity::before {
    content: '数量：';
    color: var(--color-secondary);
  }

  .col-total::before {
    content: '小计：';
    color: var(--color-secondary);
  }
}
</style>
