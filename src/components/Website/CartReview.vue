<template>
  <div class="checkout-step">
    <div class="cart-items">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <img :src="item.images[0]" alt="" class="item-image" />
        <div class="item-details">
          <h3>{{ currentLang === 'ar' ? item.product?.name_ar : item.product?.name_en }}</h3>
          <p class="item-price">{{ item.price }} {{ currency }}</p>
          <div class="quantity-controls">
            <button @click="updateQuantity(item, -1)" :disabled="item.quantity <= 1">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQuantity(item, 1)">+</button>
          </div>
        </div>
        <button class="remove-item" @click="removeItem(item.id)">✕</button>
      </div>
    </div>

    <div class="cart-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>{{ subtotal }} {{ currency }}</span>
      </div>
      <div class="summary-row">
        <span>Shipping:</span>
        <span>{{ shippingCost }} {{ currency }}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>{{ total }} {{ currency }}</span>
      </div>
      <button @click="nextStep">Continue to Shipping</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    cartItems: Array,
    subtotal: Number,
    total: Number,
    currency: String,
    shippingCost: Number,
    currentLang: String
  },
  emits: ['update-quantity', 'remove-item', 'next-step'],
  methods: {
    async updateQuantity(item, newQuantity) {
      try {
        const response = await fetch(`https://massagebackend.webenia.org/api/cart-items/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            quantity: newQuantity
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update quantity');
        }

        // Update local state
        item.quantity = newQuantity;
        this.calculateTotal();
        this.$emit('update-cart', this.cartItems);
      } catch (error) {
        console.error('Error updating quantity:', error);
        ElNotification({
          title: this.t('error'),
          message: error.message || this.t('update_quantity_error'),
          type: 'error',
        });
      }
    },
    removeItem(id) {
      this.$emit('remove-item', id);
    },
    nextStep() {
      this.$emit('next-step');
    }
  }
};
</script>

<style scoped>
.checkout-step {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cart-items {
  margin: 2rem 0;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  position: relative;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
}

.item-details {
  flex-grow: 1;
}

.item-details h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.item-price {
  color: #8b6b3d;
  font-weight: bold;
  margin: 0.5rem 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-controls button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #8b6b3d;
  background: transparent;
  color: #8b6b3d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-controls button:hover {
  background: #8b6b3d;
  color: #fff;
}

.remove-item {
  background: transparent;
  border: none;
  color: #ff4757;
  cursor: pointer;
  padding: 0.5rem;
  position: absolute;
  right: 1rem;
  top: 1rem;
}

.cart-summary {
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
}

.summary-row.total {
  border-top: 1px solid #dee2e6;
  margin-top: 1rem;
  padding-top: 1rem;
  font-weight: bold;
  font-size: 1.2rem;
}
</style>
