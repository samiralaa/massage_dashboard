<template>
  <div class="modal-overlay d-flex justify-content-center align-items-center">
    <div class="cart-modal bg-white rounded-4 shadow p-4 position-relative">

      <div class="mb-4 d-flex justify-content-center align-items-center w-100 logo-container">
        <img src="@/assets/images/EleganceLogo.png" alt="Logo" />
      </div>

      <button type="button" class="btn-close m-3" @click="$emit('close')"
        aria-label="Close"></button>

      <div class="cart-content overflow-auto d-flex align-items-center flex-column" style="max-height: 70vh;">
        <div class="w-50 d-flex align-items-center flex-column text-center">
          <p class="text-center mb-4">sorry to say</p>
          <fa icon="circle-exclamation" size="xl" class="icon mb-2"></fa>
          <h5>Enter the <span>OTP</span> sent in the email to <span>active</span> your <span>account</span></h5>
          <button type="button" @click="handleActiveNow" class="login-btn btn my-4">active now</button>
        </div>
        <div v-if="showOtpInput" class="w-100 d-flex flex-column align-items-center mt-3">
          <input dir="ltr" v-model="otp" type="text" maxlength="6" placeholder="Enter OTP" class="form-control mb-2"
            style="max-width: 200px; text-align: center;" />
          <button type="button" @click="verifyOtp" class="btn btn-success mb-2">Verify OTP</button>
        </div>
        <div v-if="success" class="success-message">{{ success }}</div>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'VerifyOtp',
  emits: ['close'],
  data() {
    return {
      success: '',
      error: '',
      showOtpInput: true,
      otp: ''
    }
  },
  methods: {
    async handleActiveNow() {
      this.success = '';
      this.error = '';
      await this.resendOtp();
      this.showOtpInput = true;
    },
    async resendOtp() {
      try {
        const email = localStorage.getItem('otp_email');
        if (!email) {
          this.error = 'No email found. Please login again.';
          return;
        }
        const response = await axios.post('https://massagebackend.webenia.org/api/resend-otp', {
          email: email,
        });

        if (response.data?.success) {
          this.success = response.data?.message || 'OTP resent successfully.';
        } else {
          this.error = response.data?.message || 'Failed to resend OTP.';
        }
      } catch (error) {
        console.error(error);
        this.error = 'Something went wrong. Please try again.';
      }
    },
    async verifyOtp() {
      this.success = '';
      this.error = '';
      this.otpMessage = '';

      // Convert OTP array to string if necessary
      const code = Array.isArray(this.otp) ? this.otp.join('') : this.otp;
      const isValid = code && /^\d{4}$/.test(code); // Must be 4 digits

      if (!code || !isValid) {
        const msg = this.$t?.('otp.invalidLength') || 'Please enter a valid 4-digit code';
        this.otpMessage = msg;
        this.$toast?.error?.(msg);
        return;
      }

      const email = localStorage.getItem('otp_email');
      if (!email) {
        const msg = this.$t?.('otp.emailMissing') || 'No email found. Please login again.';
        this.error = msg;
        this.$toast?.error?.(msg);
        return;
      }

      try {
        const response = await axios.post('https://massagebackend.webenia.org/api/client/verify-otp', {
          email: email,
          otp: code
        });

        if (response.data.status === true) {
          const userData = {
            ...this.user,
            ...response.data.data.user
          };

          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('auth_token', response.data.data.token);

          this.success = this.$t?.('otp.success') || 'OTP verified successfully!';
          this.otpMessage = '';

          // ✅ Reload the page
          window.location.reload();
        } else {
          const msg = response.data.message || this.$t?.('otp.failed') || 'OTP verification failed.';
          this.otpMessage = msg;
          this.$toast?.error?.(msg);
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        const errorMessage = error.response?.data?.message || this.$t?.('otp.error') || 'OTP verification failed';
        this.otpMessage = errorMessage;
        this.$toast?.error?.(errorMessage);
      }
    }


  },
}
</script>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1050;
  backdrop-filter: blur(2px);
  padding: 1rem;
}

.cart-modal {
  width: 100%;
  max-width: 70%;
  max-height: 90vh;
  overflow: hidden;
  animation: fadeInUp 0.3s ease-in-out;
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.logo-container img {
  height: 80px;
}

.cart-content {
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.cart-content::-webkit-scrollbar {
  width: 6px;
}

.cart-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 5px;
}

.cart-content {
  text-transform: uppercase;
}

.cart-content p {
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
}

h5 {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin: 1rem 0;
  text-align: center;
}

h5 span {
  color: #8B6B3D;
}

.login-btn {
  background-color: #8b6b3d;
  color: #fff !important;
}

.login-btn:hover {
  background-color: #725932;
}

.login-btn:focus {
  color: #fff !important;
}

.icon {
  color: #8B6B3D;
}

.icon {
  font-size: 2rem;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #8B6B3D;
  cursor: pointer;
  z-index: 10;
}

@media screen and (max-width: 768px) {
  .cart-modal {
    max-width: 90%;
  }

  .logo-container img {
    height: 50px;
  }

  h5 {
    font-size: 1rem;
  }
}

.success-message {
  color: #22543d;
  background: #c6f6d5;
  border: 1px solid #68d391;
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
  text-align: center;
}

.error-message {
  color: #c53030;
  background: #fed7d7;
  border: 1px solid #fc8181;
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
  text-align: center;
}

.btn-close{
  position: absolute;
  top: 0;
  right: 0;
}

[dir="rtl"] .btn-close {
  right: auto;
  left: 0;
}
</style>