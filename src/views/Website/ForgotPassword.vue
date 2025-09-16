<template>
  <div class="join-us-container">
    <div class="banner-section">
      <img src="@/assets/images/perfume-banner.svg" alt="Elegance Perfume" class="banner-image">
    </div>
    <div class="join-us-content">
      <div class="form-header">
        <h1 class="elegant-title">{{ $t('forgotPassword.title') }}</h1>
        <p class="elegant-description">{{ $t('forgotPassword.description') }}</p>
      </div>
      <form @submit.prevent="handleSubmit" class="join-form">
        <div class="form-group">
          <label for="email">{{ $t('forgotPassword.email') }}</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            :placeholder="$t('forgotPassword.emailPlaceholder')"
            :class="{ 'error': errors.email, 'valid': formData.email && !errors.email }"
            required 
          />
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">{{ $t('forgotPassword.submit') }}</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <div class="register-section">
          <p>
            <router-link to="account/login" class="link">{{ $t('forgotPassword.loginHere') }}</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'https://massagebackend.webenia.org/api';

export default {
  name: 'ForgotPassword',
  data() {
    return {
      formData: {
        email: ''
      },
      errors: {
        email: ''
      },
      loading: false
    }
  },
  methods: {
    validateEmail(value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        this.errors.email = this.$t('forgotPassword.validation.emailRequired');
      } else if (!emailRegex.test(value)) {
        this.errors.email = this.$t('forgotPassword.validation.emailInvalid');
      } else {
        this.errors.email = '';
      }
    },
    async handleSubmit() {
      // Validate email
      this.validateEmail(this.formData.email);
      if (this.errors.email) return;

      try {
        this.loading = true;
        const response = await axios.post(`${API_URL}/forgot-password`, {
          email: this.formData.email
        });

        if (response.data.status === 'success') {
          this.$toast?.success?.(response.data.message || this.$t('forgotPassword.successMessage'));
          // Store email for OTP page
          localStorage.setItem('otp_email', this.formData.email);
          // Redirect to OTP page
          this.$router.push('/verify-otp');
        } else {
          throw new Error(response.data.message || this.$t('forgotPassword.errorMessage'));
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        if (error.response?.data?.errors) {
          const backendErrors = error.response.data.errors;
          Object.keys(backendErrors).forEach(field => {
            if (this.errors.hasOwnProperty(field)) {
              this.errors[field] = backendErrors[field][0];
            }
          });
        } else {
          this.$toast?.error?.(error.response?.data?.message || this.$t('forgotPassword.errorMessage'));
        }
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    'formData.email'(value) {
      this.validateEmail(value);
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/fonts.css';

.join-us-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background: #fff;
}

.banner-section {
  background: linear-gradient(to bottom, #F5E6D3, #9b7c1f);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-shadow: inset 0 0 50px rgba(155, 124, 31, 0.2);
}

.banner-image {
  max-width: 100%;
  height: auto;
}

.join-us-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  background: #fff;
}

.form-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.elegant-title {
  color: #9b7c1f;
  margin-bottom: 1.5rem;
  font-size: 3rem;
  font-weight: 700;
  font-family: var(--font-heading);
  letter-spacing: 0.5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.elegant-description {
  color: #666;
  font-size: 1.2rem;
  line-height: 1.8;
  font-family: var(--font-body);
  font-weight: 300;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #333;
  font-weight: 500;
}

input {
  padding: 1.2rem;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.4s ease;
  width: 100%;
  font-family: var(--font-body);
  background-color: rgba(255, 255, 255, 0.8);
}

input:focus {
  outline: none;
  border-color: #9b7c1f;
  box-shadow: 0 0 0 4px rgba(155, 124, 31, 0.15);
  background-color: #fff;
}

input.error {
  border-color: #ef4444;
}

input.valid {
  border-color: #10b981;
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.submit-btn {
  background-color: #9b7c1f;
  color: #fff;
  padding: 1.25rem;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  width: 100%;
  margin-top: 1.5rem;
  font-family: var(--font-body);
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;
}

.submit-btn:hover:not(:disabled) {
  background-color: #826618;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(155, 124, 31, 0.3);
}

.submit-btn:disabled {
  background-color: #9b7c1f80;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-section {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.link {
  color: #9b7c1f;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.link:hover {
  color: #826618;
  text-decoration: underline;
}

/* RTL */
[dir="rtl"] .join-form {
  text-align: right;
}

/* Responsive */
@media (max-width: 1024px) {
  .join-us-container {
    grid-template-columns: 1fr;
  }
  .banner-section {
    display: none;
  }
  .join-us-content {
    padding: 2rem;
  }
}
</style> 