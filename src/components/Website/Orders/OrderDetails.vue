<template>
  <div class="order-details">
    <div class="order-header">
      <h2>{{ $t('orders.orderDetails') }} #{{ order.id }}</h2>
      <el-tag :type="getStatusType(order.status)">{{ order.status }}</el-tag>
    </div>

    <div class="order-info">
      <div class="info-section">
        <h3>{{ $t('orders.shippingDetails') }}</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">{{ $t('checkout.fullName') }}:</span>
            <span>{{ order.shipping.fullName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ $t('checkout.address') }}:</span>
            <span>{{ order.shipping.address }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ $t('checkout.phone') }}:</span>
            <span>{{ order.shipping.phone }}</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>{{ $t('orders.orderItems') }}</h3>
        <el-table :data="order.items" style="width: 100%">
          <el-table-column prop="name" :label="$t('orders.product')" />
          <el-table-column prop="quantity" :label="$t('orders.quantity')" width="100" />
          <el-table-column :label="$t('orders.price')" width="120">
            <template #default="scope">
              {{ scope.row.price }} {{ order.currency }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('orders.total')" width="120">
            <template #default="scope">
              {{ (scope.row.price * scope.row.quantity).toFixed(2) }} {{ order.currency }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="order-summary">
        <div class="summary-item">
          <span>{{ $t('orders.subtotal') }}:</span>
          <span>{{ subtotal }} {{ order.currency }}</span>
        </div>
        <div class="summary-item">
          <span>{{ $t('orders.shipping') }}:</span>
          <span>{{ order.shippingCost }} {{ order.currency }}</span>
        </div>
        <div class="summary-item total">
          <span>{{ $t('orders.total') }}:</span>
          <span>{{ total }} {{ order.currency }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderDetails',
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  computed: {
    subtotal() {
      return this.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    },
    total() {
      return (parseFloat(this.subtotal) + this.order.shippingCost).toFixed(2);
    }
  },
  methods: {
    getStatusType(status) {
      const types = {
        'completed': 'success',
        'processing': 'warning',
        'pending': 'info',
        'cancelled': 'danger'
      };
      return types[status.toLowerCase()] || 'info';
    }
  }
};
</script>

<style scoped>
.order-details {
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.label {
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.order-summary {
  margin-top: 24px;
  border-top: 1px solid var(--el-border-color);
  padding-top: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.total {
  font-weight: bold;
  font-size: 1.1em;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color);
}
</style>