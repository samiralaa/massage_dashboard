<template>
  <div class="checkout-step">
    <h2>{{ $t('checkout.payment') }}</h2>
    <div class="payment-methods">
      <div v-for="method in paymentMethods" :key="method.id" class="payment-method"
        :class="{ active: selectedPaymentMethod === method.id }" @click="selectPaymentMethod(method.id)">
        <fa :icon="method.icon" />
        <span>{{ method.name }}</span>
      </div>
    </div>
    <div v-if="selectedPaymentMethod === 1" class="stripe-container">
      <div class="card-element-container">
        <div id="card-element" class="card-element"></div>
        <div id="card-errors" class="card-errors" role="alert"></div>
      </div>
    </div>
    <div class="order-summary">
      <h3>{{ $t('checkout.orderSummary') }}</h3>
      <div class="summary-details">
        <p>{{ cartItems.length }} {{ $t('checkout.items') }}</p>
        <p>{{ $t('checkout.deliveryTo') }}: {{ shippingDetails.city }}</p>
        
        <div class="total-amount">
          {{ $t('checkout.totalAmount') }}: {{ total }} {{ currency }}
        </div>
      </div>
    </div>
    <div class="button-group">
      <button class="btn-secondary" @click="previousStep">
        {{ $t('checkout.back') }}
      </button>
      <button class="btn-primary" @click="placeOrder" :disabled="!selectedPaymentMethod || stripeLoading">
        <span v-if="stripeLoading">{{ $t('checkout.processing') }}...</span>
        <span v-else>{{ $t('checkout.placeOrder') }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'PaymentStep',
  props: {
    cartItems: Array,
    shippingDetails: Object,
    total: Number,
    currency: String,
    paymentMethods: Array,
    selectedPaymentMethod: Number,
    stripeLoading: Boolean
  },
  data() {
    return {
      processing: false,
      error: null
    }
  },
  computed: {
    ...mapGetters('payment', ['isLoading', 'getError'])
  },
  methods: {
    ...mapActions('payment', ['createOrder', 'confirmPayment']),
    selectPaymentMethod(methodId) {
      this.$emit('select-payment-method', methodId);
    },
    previousStep() {
      this.$emit('previous-step');
    },
    async placeOrder() {
      try {
        this.processing = true;
        this.error = null;

        // Create order and get payment intent
        const { order, payment_intent } = await this.createOrder({
          cartItems: this.cartItems,
          shippingDetails: this.shippingDetails,
          paymentMethod: this.selectedPaymentMethod,
          total: this.total,
          currency: this.currency
        });

        // Handle payment confirmation based on payment method
        if (this.selectedPaymentMethod === 1) { // Stripe
          const result = await this.confirmPayment({
            paymentMethodId: payment_intent.payment_method_id,
            paymentIntentId: payment_intent.id
          });

          if (result.status === 'succeeded') {
            this.$emit('order-placed', order);
          } else {
            throw new Error('Payment failed');
          }
        } else {
          // Handle other payment methods
          this.$emit('order-placed', order);
        }
      } catch (error) {
        this.error = error.message || 'An error occurred during payment';
        console.error('Payment error:', error);
      } finally {
        this.processing = false;
      }
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

.payment-methods {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-method {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.payment-method.active {
  border-color: #8b6b3d;
}

.stripe-container {
  margin-bottom: 2rem;
}

.card-element-container {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}

.card-errors {
  color: #fa755a;
  margin-top: 0.5rem;
}

.order-summary {
  margin-bottom: 2rem;
}

.summary-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.total-amount {
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 1rem;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #ccc;
}

.btn-primary {
  background-color: #8b6b3d;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #6b4b2d;
}
</style>