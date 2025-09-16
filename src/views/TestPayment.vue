<template>
  <div class="test-payment-container">
    <h1>Test Payment Page</h1>
    
    <div class="payment-form">
      <form @submit.prevent="handlePayment">
        <div class="form-group">
          <label for="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            v-model="paymentDetails.cardNumber"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="expiryDate">Expiry Date</label>
            <input
              type="text"
              id="expiryDate"
              v-model="paymentDetails.expiryDate"
              placeholder="MM/YY"
              maxlength="5"
              required
            />
          </div>

          <div class="form-group">
            <label for="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              v-model="paymentDetails.cvv"
              placeholder="123"
              maxlength="3"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="amount">Amount</label>
          <input
            type="number"
            id="amount"
            v-model="paymentDetails.amount"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        <button type="submit" class="payment-button" :disabled="isProcessing">
          {{ isProcessing ? 'Processing...' : 'Process Payment' }}
        </button>
      </form>

      <div v-if="paymentStatus" :class="['status-message', paymentStatus.type]">
        {{ paymentStatus.message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestPayment',
  data() {
    return {
      paymentDetails: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        amount: ''
      },
      isProcessing: false,
      paymentStatus: null
    }
  },
  methods: {
    formatCardNumber(value) {
      return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
    },
    formatExpiryDate(value) {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .substr(0, 5)
    },
    async handlePayment() {
      this.isProcessing = true
      this.paymentStatus = null

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // For testing purposes, always succeed
        this.paymentStatus = {
          type: 'success',
          message: 'Payment processed successfully!'
        }
      } catch (error) {
        this.paymentStatus = {
          type: 'error',
          message: 'Payment failed. Please try again.'
        }
      } finally {
        this.isProcessing = false
      }
    }
  },
  watch: {
    'paymentDetails.cardNumber'(value) {
      this.paymentDetails.cardNumber = this.formatCardNumber(value)
    },
    'paymentDetails.expiryDate'(value) {
      this.paymentDetails.expiryDate = this.formatExpiryDate(value)
    }
  }
}
</script>

<style scoped>
.test-payment-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-weight: 500;
  color: #555;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.payment-button {
  background-color: #4a90e2;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.payment-button:hover:not(:disabled) {
  background-color: #357abd;
}

.payment-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status-message {
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.status-message.success {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-message.error {
  background-color: #fde7e7;
  color: #d32f2f;
}
</style> 