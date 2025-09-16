<template>
  <div class="review-cart">
    <div class="cart-items" v-if="cartItems.length">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <img :src="getImageUrl(item)" :alt="item.name">
        <div class="item-details">
          <h3>{{ item.product ? (currentLang === 'ar' ? item.product.name_ar : item.product.name_en) : 'Product not available' }}</h3>
          <div class="price-quantity">
            <span class="price">{{ item.price }} {{ item.currency?.name_en || 'AED' }}</span>
            <div class="quantity-control">
              <el-button 
                size="small" 
                @click="decreaseQuantity(item)"
                :disabled="item.quantity <= 1"
                class="qty-btn"
              >
                <fa icon="minus" />
              </el-button>
              <span class="qty-number">{{ item.quantity }}</span>
              <el-button 
                size="small" 
                @click="increaseQuantity(item)"
                :disabled="item.quantity >= 99"
                class="qty-btn"
              >
                <fa icon="plus" />
              </el-button>
            </div>
          </div>
        </div>
        <div class="item-total">
          {{ calculateItemTotal(item) }} {{ item.currency?.name_en || 'AED' }}
        </div>
      </div>
      <div class="cart-total">
        <h3>{{ $t('Total') }}: {{ cartTotal }} {{ cartItems[0]?.currency?.name_en || 'AED' }}</h3>
      </div>
    </div>

    <div class="payment-form">
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div id="card-element"></div>
          <div id="card-errors" role="alert" v-if="error">{{ error }}</div>
        </div>
        <button type="submit" :disabled="processing">
          {{ processing ? $t('Processing') : $t('Pay Now') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';
import { ElNotification } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

// Add icons to library
library.add(faMinus, faPlus);

export default {
  name: 'ReviewCart',
  components: {
    'fa': FontAwesomeIcon
  },
  props: {
    cartItems: {
      type: Array,
      required: true
    },
    currentLang: {
      type: String,
      default: 'en'
    }
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      stripe: null,
      card: null,
      error: null,
      processing: false,
      cartTotal: 0
    };
  },
  watch: {
    cartItems: {
      handler(newItems) {
        this.calculateTotal();
      },
      deep: true
    }
  },
  async mounted() {
    // Initialize Stripe
    this.stripe = await loadStripe('your-publishable-key');
    const elements = this.stripe.elements();
    
    // Create card element
    this.card = elements.create('card');
    this.card.mount('#card-element');

    // Handle real-time validation errors
    this.card.addEventListener('change', (event) => {
      if (event.error) {
        this.error = event.error.message;
      } else {
        this.error = null;
      }
    });

    this.calculateTotal();
  },
  methods: {
    getImageUrl(item) {
      if (item.product?.images?.length) {
        return `https://massagebackend.webenia.org/public/storage/${item.product.images[0].path}`;
      }
      return '/placeholder-image.jpg';
    },
    calculateItemTotal(item) {
      return (item.price * item.quantity).toFixed(2);
    },
    calculateTotal() {
      this.cartTotal = this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0).toFixed(2);
    },
    async increaseQuantity(item) {
      try {
        if (item.quantity < 99) {
          const response = await fetch(`https://massagebackend.webenia.org/api/cart-items/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
              quantity: item.quantity + 1
            })
          });

          if (response.ok) {
            item.quantity++;
            this.calculateTotal();
            this.$emit('update-quantity', item);
          } else {
            throw new Error('Failed to update quantity');
          }
        } else {
          ElNotification({
            title: this.t('warning'),
            message: this.t('max_quantity_reached'),
            type: 'warning',
          });
        }
      } catch (error) {
        ElNotification({
          title: this.t('error'),
          message: error.message || this.t('update_quantity_error'),
          type: 'error',
        });
      }
    },
    async decreaseQuantity(item) {
      try {
        if (item.quantity > 1) {
          const response = await fetch(`https://massagebackend.webenia.org/api/cart-items/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
              quantity: item.quantity - 1
            })
          });

          if (response.ok) {
            item.quantity--;
            this.calculateTotal();
            this.$emit('update-quantity', item);
          } else {
            throw new Error('Failed to update quantity');
          }
        } else {
          ElNotification({
            title: this.t('warning'),
            message: this.t('min_quantity_reached'),
            type: 'warning',
          });
        }
      } catch (error) {
        ElNotification({
          title: this.t('error'),
          message: error.message || this.t('update_quantity_error'),
          type: 'error',
        });
      }
    },
    async handleSubmit() {
      this.processing = true;
      this.error = null;

      try {
        // Get payment intent from your backend
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: this.cartTotal * 100 // Convert to cents
          })
        });

        const data = await response.json();

        // Confirm card payment
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: this.card,
            }
          }
        );

        if (error) {
          this.error = error.message;
        } else if (paymentIntent.status === 'succeeded') {
          // Payment successful - handle order completion
          this.$emit('payment-success', paymentIntent);
        }
      } catch (err) {
        this.error = 'An error occurred while processing your payment.';
      }

      this.processing = false;
    }
  }
};
</script>

<style scoped>
.review-cart {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.cart-items {
  margin-bottom: 30px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.cart-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
}

.item-details {
  flex-grow: 1;
}

.item-details h3 {
  margin: 0;
  font-size: 1.1em;
}

.cart-total {
  text-align: right;
  padding: 15px;
  font-size: 1.2em;
}

.payment-form {
  max-width: 500px;
  margin: 0 auto;
}

#card-element {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 20px;
}

#card-errors {
  color: #dc3545;
  margin-bottom: 15px;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #5469d4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #879fff;
  cursor: not-allowed;
}

.price-quantity {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
}

.price {
  color: #666;
  font-size: 0.9em;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f8f8f8;
  padding: 5px;
  border-radius: 8px;
  width: fit-content;
}

.qty-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  color: #a3852c;
  transition: all 0.3s ease;
}

.qty-btn:hover:not(:disabled) {
  background-color: #a3852c;
  color: #fff;
  border-color: #a3852c;
}

.qty-btn:disabled {
  background-color: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.qty-number {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  min-width: 25px;
  text-align: center;
  padding: 0 5px;
}

@media (max-width: 768px) {
  .price-quantity {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .quantity-control {
    width: 100%;
    justify-content: center;
  }
}
</style>