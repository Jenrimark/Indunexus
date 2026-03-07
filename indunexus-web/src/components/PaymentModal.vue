<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>选择支付方式</h2>
            <button class="close-btn" @click="closeModal">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Order Summary -->
            <div class="order-summary">
              <div class="summary-row">
                <span>订单号</span>
                <span class="order-number">{{ orderNumber }}</span>
              </div>
              <div class="summary-row total">
                <span>应付金额</span>
                <span class="amount">¥{{ amount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Payment Methods -->
            <div class="payment-methods">
              <h3>支付方式</h3>
              
              <div class="payment-options">
                <!-- Alipay -->
                <div 
                  :class="['payment-option', { selected: selectedMethod === 'alipay' }]"
                  @click="selectedMethod = 'alipay'"
                >
                  <div class="payment-icon alipay">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm17 11.5c-1.5.5-3.5 1-6 1-3.5 0-6.5-1.5-8-3 0 0 1.5 4 8 4 4 0 6-1 6-1v-1zm-9-6.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm5 0c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5z"/>
                    </svg>
                  </div>
                  <div class="payment-info">
                    <h4>支付宝</h4>
                    <p>推荐使用支付宝支付</p>
                  </div>
                  <div class="payment-check">
                    <svg v-if="selectedMethod === 'alipay'" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>

                <!-- WeChat Pay -->
                <div 
                  :class="['payment-option', { selected: selectedMethod === 'wechat' }]"
                  @click="selectedMethod = 'wechat'"
                >
                  <div class="payment-icon wechat">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.5 8.5c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1zm7 0c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1zM12 2C6.5 2 2 6 2 11c0 2.5 1 4.5 3 6l-1 3 3.5-2c1.5.5 3 .5 4.5.5 5.5 0 10-4 10-9s-4.5-9-10-9z"/>
                    </svg>
                  </div>
                  <div class="payment-info">
                    <h4>微信支付</h4>
                    <p>使用微信扫码支付</p>
                  </div>
                  <div class="payment-check">
                    <svg v-if="selectedMethod === 'wechat'" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>

                <!-- Bank Card -->
                <div 
                  :class="['payment-option', { selected: selectedMethod === 'bank' }]"
                  @click="selectedMethod = 'bank'"
                >
                  <div class="payment-icon bank">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 8H4V6h16m0 12H4v-6h16m0-8H4c-1.11 0-2 .89-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/>
                    </svg>
                  </div>
                  <div class="payment-info">
                    <h4>银行卡支付</h4>
                    <p>支持各大银行储蓄卡及信用卡</p>
                  </div>
                  <div class="payment-check">
                    <svg v-if="selectedMethod === 'bank'" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>

                <!-- UnionPay -->
                <div 
                  :class="['payment-option', { selected: selectedMethod === 'unionpay' }]"
                  @click="selectedMethod = 'unionpay'"
                >
                  <div class="payment-icon unionpay">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.96-7-5.05-7-9V8.3l7-3.5 7 3.5V11c0 3.95-3.14 8.04-7 9z"/>
                    </svg>
                  </div>
                  <div class="payment-info">
                    <h4>云闪付</h4>
                    <p>银联云闪付快捷支付</p>
                  </div>
                  <div class="payment-check">
                    <svg v-if="selectedMethod === 'unionpay'" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>

                <!-- PayPal -->
                <div 
                  :class="['payment-option', { selected: selectedMethod === 'paypal' }]"
                  @click="selectedMethod = 'paypal'"
                >
                  <div class="payment-icon paypal">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.32 21.97a.546.546 0 01-.26-.32c-.03-.15-.01-.3.07-.43l2.18-4.5c.08-.17.24-.28.42-.28h3.45c2.05 0 3.71-1.67 3.71-3.72 0-2.05-1.66-3.72-3.71-3.72h-4.5c-.18 0-.34-.11-.42-.28L6.08 3.22c-.08-.13-.1-.28-.07-.43.03-.15.12-.27.26-.32C6.5 2.37 6.75 2.3 7 2.3h7.14c3.42 0 6.2 2.78 6.2 6.2 0 3.42-2.78 6.2-6.2 6.2h-3.45l-1.95 4.03c-.08.17-.24.28-.42.28H7z"/>
                    </svg>
                  </div>
                  <div class="payment-info">
                    <h4>PayPal</h4>
                    <p>国际支付，支持多币种</p>
                  </div>
                  <div class="payment-check">
                    <svg v-if="selectedMethod === 'paypal'" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">取消</button>
            <button 
              class="btn-pay" 
              @click="handlePay"
              :disabled="!selectedMethod || paying"
            >
              <span v-if="!paying">确认支付 ¥{{ amount.toFixed(2) }}</span>
              <span v-else>处理中...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  show: boolean;
  orderNumber: string;
  amount: number;
}

interface Emits {
  (e: 'close'): void;
  (e: 'pay', method: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedMethod = ref<string>('');
const paying = ref(false);

const closeModal = () => {
  if (!paying.value) {
    emit('close');
  }
};

const handlePay = async () => {
  if (!selectedMethod.value || paying.value) return;
  
  paying.value = true;
  
  try {
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 1500));
    emit('pay', selectedMethod.value);
  } finally {
    paying.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--space-4);
}

.modal-container {
  background: white;
  border-radius: var(--radius-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid #E2E8F0;
}

.modal-header h2 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-secondary);
  transition: all var(--transition-base);
}

.close-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-text);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

/* Order Summary */
.order-summary {
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  font-size: var(--text-sm);
  color: var(--color-secondary);
}

.summary-row.total {
  margin-top: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid #E2E8F0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.order-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--color-text);
}

.amount {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-error);
}

/* Payment Methods */
.payment-methods h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.payment-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 2px solid #E2E8F0;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.payment-option:hover {
  border-color: var(--color-cta);
  background: rgba(3, 105, 161, 0.02);
}

.payment-option.selected {
  border-color: var(--color-cta);
  background: rgba(3, 105, 161, 0.05);
}

.payment-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.payment-icon svg {
  width: 28px;
  height: 28px;
}

.payment-icon.alipay {
  background: linear-gradient(135deg, #1677FF 0%, #00A0E9 100%);
  color: white;
}

.payment-icon.wechat {
  background: linear-gradient(135deg, #09BB07 0%, #2AAE67 100%);
  color: white;
}

.payment-icon.bank {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
}

.payment-icon.unionpay {
  background: linear-gradient(135deg, #E21836 0%, #C8102E 100%);
  color: white;
}

.payment-icon.paypal {
  background: linear-gradient(135deg, #0070BA 0%, #1546A0 100%);
  color: white;
}

.payment-info {
  flex: 1;
}

.payment-info h4 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2px;
}

.payment-info p {
  font-size: var(--text-sm);
  color: var(--color-secondary);
}

.payment-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.payment-option.selected .payment-check {
  border-color: var(--color-cta);
  background: var(--color-cta);
}

.payment-check svg {
  width: 20px;
  height: 20px;
  color: white;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid #E2E8F0;
}

.btn-cancel,
.btn-pay {
  flex: 1;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  transition: all var(--transition-base);
}

.btn-cancel {
  background: white;
  color: var(--color-secondary);
  border: 1px solid #E2E8F0;
}

.btn-cancel:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.btn-pay {
  background: var(--color-cta);
  color: white;
  border: none;
}

.btn-pay:hover:not(:disabled) {
  background: #025a8a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3);
}

.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
  }

  .payment-option {
    padding: var(--space-3);
  }

  .payment-icon {
    width: 40px;
    height: 40px;
  }

  .payment-icon svg {
    width: 24px;
    height: 24px;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
