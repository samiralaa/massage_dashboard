<script>
import axios from 'axios';

export default {
  name: 'UserOrders',
  data() {
    return {
      orders: [],
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get('https://massagebackend.webenia.org/api/orders/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.data.status && response.data.data) {
          this.orders = response.data.data;
        } else {
          this.orders = [];
          this.error = 'No orders found';
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        this.error = error.response?.data?.message || 'Failed to load orders';
        this.orders = [];
      } finally {
        this.loading = false;
      }
    },
    getImageUrl(path) {
      if (!path) return '';
      return `https://massagebackend.webenia.org/public/storage/${path}`;
    },
    statusClass(status) {
      const classes = {
        pending: 'bg-yellow-100 text-yellow-700',
        processing: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        delivered: 'bg-green-100 text-green-700',
        'payment_pending': 'bg-yellow-100 text-yellow-700',
        'payment_failed': 'bg-red-100 text-red-700'
      };
      return classes[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  mounted() {
    this.fetchOrders();
  }
};
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">My Orders</h2>

    <div v-if="loading" class="text-gray-500 text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
      <p class="mt-2">Loading your orders...</p>
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-8">
      {{ error }}
    </div>

    <div v-else-if="orders.length === 0" class="text-gray-600 text-center py-8">
      No orders found.
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
      >
        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="text-lg font-semibold text-gray-700">Order #{{ order.id }}</p>
            <p class="text-sm text-gray-500">Ordered at: {{ formatDate(order.created_at) }}</p>
          </div>
          <div>
            <span
              class="text-sm font-medium px-3 py-1 rounded-full"
              :class="statusClass(order.status)"
            >
              {{ order.status }}
            </span>
          </div>
        </div>

        <div class="text-gray-700 mb-4">
          <p><strong>Total:</strong> ${{ order.total_price }}</p>
          <p><strong>Payment Method:</strong> {{ order.payment_method }}</p>
        </div>

        <div class="border-t pt-4 mt-4">
          <h3 class="text-md font-semibold text-gray-700 mb-3">Items</h3>
          <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4 mb-4">
            <img
              v-if="item.product?.images?.length"
              :src="getImageUrl(item.product.images[0].path)"
              class="w-20 h-20 rounded-md object-cover border"
              alt="Product"
            />
            <div>
              <p class="font-medium text-gray-800">{{ item.product?.name_en || item.product_name }}</p>
              <p class="text-sm text-gray-600">
                Quantity: {{ item.quantity }} · Price: ${{ item.price }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style> 