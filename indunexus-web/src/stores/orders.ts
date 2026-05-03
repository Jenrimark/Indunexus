// 订单状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as ordersApi from '../api/orders';

export type Order = ordersApi.Order;

export interface OrderItem {
  id: number;
  part_id: string;
  part_name: string;
  part_number: string;
  manufacturer?: string;
  image_url?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([]);
  const loading = ref(false);

  // Getters
  const ordersCount = computed(() => orders.value.length);
  
  const getOrdersByStatus = (status: string) => {
    if (status === 'all') return orders.value;
    return orders.value.filter(order => order.status === status);
  };

  const getOrderById = (orderId: string | number) => {
    const id = typeof orderId === 'string' ? parseInt(orderId) : orderId;
    return orders.value.find(order => order.id === id);
  };

  const pendingOrders = computed(() => getOrdersByStatus('pending'));
  const paidOrders = computed(() => getOrdersByStatus('paid'));
  const shippedOrders = computed(() => getOrdersByStatus('shipped'));
  const completedOrders = computed(() => getOrdersByStatus('completed'));
  const cancelledOrders = computed(() => getOrdersByStatus('cancelled'));

  // Actions
  const fetchOrders = async (status?: string) => {
    loading.value = true;
    try {
      orders.value = await ordersApi.getOrders(status);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createOrder = async (orderData: ordersApi.OrderCreate) => {
    loading.value = true;
    try {
      const newOrder = await ordersApi.createOrder(orderData);
      orders.value.unshift(newOrder);
      return newOrder;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateOrderStatus = async (orderId: number, status: ordersApi.OrderStatus) => {
    loading.value = true;
    try {
      const updatedOrder = await ordersApi.updateOrder(orderId, { status });
      const index = orders.value.findIndex(o => o.id === orderId);
      if (index > -1) {
        orders.value[index] = updatedOrder;
      }
      return true;
    } catch (error) {
      console.error('Failed to update order:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const cancelOrder = async (orderId: number) => {
    return updateOrderStatus(orderId, 'cancelled');
  };

  const deleteOrder = async (orderId: number) => {
    loading.value = true;
    try {
      await ordersApi.deleteOrder(orderId);
      const index = orders.value.findIndex(o => o.id === orderId);
      if (index > -1) {
        orders.value.splice(index, 1);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete order:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateTrackingNumber = async (orderId: number, trackingNumber: string) => {
    loading.value = true;
    try {
      const updatedOrder = await ordersApi.updateOrder(orderId, { tracking_number: trackingNumber });
      const index = orders.value.findIndex(o => o.id === orderId);
      if (index > -1) {
        orders.value[index] = updatedOrder;
      }
      return true;
    } catch (error) {
      console.error('Failed to update tracking number:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    orders,
    loading,
    // Getters
    ordersCount,
    pendingOrders,
    paidOrders,
    shippedOrders,
    completedOrders,
    cancelledOrders,
    getOrdersByStatus,
    getOrderById,
    // Actions
    fetchOrders,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    updateTrackingNumber,
  };
});
