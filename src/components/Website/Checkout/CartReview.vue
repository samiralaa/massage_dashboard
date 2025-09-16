<template>
  <div class="checkout-step">
    <h2>{{ $t('checkout.reviewCart') }}</h2>
    <div class="cart-items">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <img :src="getProductImage(item)" :alt="item.product?.name_en || ''" class="item-image">
        <div class="item-details">
          <h3>{{ currentLang === 'ar' ? item.product?.name_ar : item.product?.name_en }}</h3>
          <p class="item-price" dir="ltr">{{ calculateDiscountedPrice(item) }} {{ currency }}</p>
          <div class="quantity-controls">
            <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">-</button>
            <input dir="ltr" class="form-control qty-number" type="number" min="1" max="99" v-model.number="item.quantity"
              @change="updateCartItemQuantity(item)" @input="item.quantity = Math.min(Math.max(item.quantity, 1), 99)" @keydown="e => ['e', 'E', '.', '+', '-'].includes(e.key) && e.preventDefault()">
            <button @click="increaseQuantity(item)" :disabled="item.quantity >= 99">+</button>
          </div>
        </div>
        <button class="remove-item" @click="removeItem(item.id)">
          <fa icon="trash" />
        </button>
      </div>
    </div>
    <div class="cart-summary">
      <div class="summary-row">
        <span>{{ $t('checkout.subtotal') }}</span>
        <span dir="ltr">{{ subtotal }} {{ currency }}</span>
      </div>
      <div class="summary-row total">
        <span>{{ $t('checkout.total') }}</span>
        <span dir="ltr">{{ total }} {{ currency }}</span>
      </div>
    </div>
    <button class="btn-primary" @click="$emit('next-step')" :disabled="!cartItems.length">
      {{ $t('checkout.continueToShipping') }}
    </button>
  </div>
</template>

<script>
import { API_URL } from '@/store/index.js';
import axios from 'axios';

export default {
  name: 'CartReview',
  props: {
    cartItems: {
      type: Array,
      required: true
    },
    shippingCost: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true
    }
  },
  computed: {
    currentLang() {
      return localStorage.getItem('lang') || 'en';
    },
    subtotal() {
      return this.cartItems.reduce((total, item) => {
        if (!item.product || !item.product.converted_price) return total;
        return total + (parseFloat(item.product.converted_price) * item.quantity);
      }, 0).toFixed(2);
    },
    total() {
      return (parseFloat(this.subtotal) + this.shippingCost).toFixed(2);
    }
  },
  methods: {
    getProductImage(item) {
      if (item.images && Array.isArray(item.images)) {
        return `${API_URL}/public/storage/${item.images[0]}`;
      }
      return `${API_URL}/images/default.jpg`;
    },
    async updateCartItemQuantity(item) {
  if (item.quantity < 1) item.quantity = 1;
  if (item.quantity > 99) item.quantity = 99;

  try {
    const response = await axios.post(`${API_URL}/api/cart-items/${item.id}`, {
      quantity: item.quantity
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    });

    const success = response.data;

    if (success) {
      alert('etst')
      const updatedItem = response.data.data;

      item.quantity = updatedItem?.quantity ?? item.quantity;
      item.price = updatedItem?.price ?? item.price;
    

      // ✅ أظهر رسالة نجاح
      const successMsg = this.$t('checkout.quantityUpdated') || 'Quantity updated successfully';
      this.$toast.success(successMsg); // إظهار التوست
    } else {
      const errorMessage = response?.data?.message || this.$t('checkout.errorUpdatingQuantity');
      this.$toast.error(errorMessage);
    }

    this.$emit('update-cart');
  } catch (error) {
    console.error('Error updating quantity:', error);

    let errorMessage = 'Error updating quantity';
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (this.$t && this.$t('checkout.errorUpdatingQuantity')) {
      errorMessage = this.$t('checkout.errorUpdatingQuantity');
    }

    this.$toast.error(errorMessage);
  }
},async updateCartItemQuantity(item) {
  if (item.quantity < 1) item.quantity = 1;
  if (item.quantity > 99) item.quantity = 99;

  try {
    const response = await axios.post(`${API_URL}/api/cart-items/${item.id}`, {
      quantity: item.quantity
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    });

    const updatedItem = response?.data?.data;
    if (updatedItem) {
      // تحديث بيانات المنتج في cartItems
      item.quantity = updatedItem.quantity;
      item.price = updatedItem.price;
      item.converted_price = updatedItem.converted_price;
      item.converted_total = updatedItem.converted_total;
      item.currency_code = updatedItem.currency_code;

      // لو فيه product محدث في الريسبونس
      if (updatedItem.product) {
        item.product = updatedItem.product;
      }

      const successMsg = this.$t('checkout.quantityUpdated') || 'Quantity updated successfully';
      this.$toast.success(successMsg);
      this.$emit('update-cart', [...this.cartItems]);
    } else {
      const fallbackMsg = this.$t('checkout.errorUpdatingQuantity') || 'Error updating quantity';
      this.$toast.error(fallbackMsg);
    }

  } catch (error) {
    console.error('Error updating quantity:', error);
    const errorMessage = error?.response?.data?.message || this.$t('checkout.errorUpdatingQuantity') || 'Error updating quantity';
    this.$toast.error(errorMessage);
  }
},
    async increaseQuantity(item) {
      if (item.quantity < 99) {
        item.quantity++;
        await this.updateCartItemQuantity(item);
      } else {
        this.$toast.warning(this.$t('checkout.maxQuantity'));
      }
    },
    async decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
        await this.updateCartItemQuantity(item);
      } else {
        this.$toast.warning(this.$t('checkout.minimumQuantity'));
      }
    },
    async removeItem(itemId) {
      try {
        await axios.delete(`${API_URL}/api/cart-items/${itemId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        this.$emit('update-cart', this.cartItems.filter(item => item.id !== itemId));
        this.$toast.success(this.$t('checkout.itemRemoved'));
      } catch (error) {
        console.error('Error removing item:', error);
        this.$toast.error("this.$t('checkout.errorRemovingItem')");
      }
    },

    calculateDiscountedPrice(item) {
      const product = item.product;
      if (!product) return '';
      if (product.discount && product.discount.length > 0) {
        const discountValue = parseFloat(product.discount[0].discount_value)
        const originalPrice = parseFloat(product.converted_price)
        const discountedPrice = originalPrice - (originalPrice * (discountValue / 100))
        return discountedPrice.toFixed(2)
      }
      return product.converted_price
    }
  }
}
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
  margin: 0 1rem;
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
  width: fit-content;
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

[dir="rtl"] .remove-item {
  left: 1rem;
  right: auto;
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

.btn-primary {
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #8b6b3d;
  color: #fff;
  border: none;
  width: 100%;
}

.btn-primary:hover {
  background: #725932;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.qty-number{
  font-size: 16px;
  font-weight: 600;
  color: #333;
  min-width: 20px;
  width: fit-content;
  padding: 0 8px;
  text-align: center;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style> 