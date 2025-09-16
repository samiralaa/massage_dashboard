<template>
  <div class="login-container" :class="{ 'rtl': $i18n.locale === 'ar' }">
    <div class="login-card">
      <div class="login-header">
        <h2>{{ $t('login.title') }}</h2>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">{{ $t('login.email') }}</label>
          <input
            type="email"
            id="email"
            v-model="email"
            :placeholder="$t('login.emailPlaceholder')"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">{{ $t('login.password') }}</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              :placeholder="$t('login.passwordPlaceholder')"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
              :aria-label="showPassword ? $t('login.hidePassword') : $t('login.showPassword')"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div class="form-group remember-me">
          <label class="checkbox-container">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            {{ $t('login.rememberMe') }}
          </label>
        </div>
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? $t('login.loggingIn') : $t('login.submit') }}
        </button>
        <div class="form-links">
          <router-link to="/forgot-password" class="forgot-password">
            {{ $t('login.forgotPassword') }}
          </router-link>
          <router-link to="/register" class="register-link">
            {{ $t('login.register') }}
          </router-link>
        </div>
      </form>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'WebsiteLogin',
  setup() {
    const store = useStore()
    const router = useRouter()

    const email = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const showPassword = ref(false)
    const loading = ref(false)
    const error = ref('')

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''

        await store.dispatch('auth/login', {
          email: email.value,
          password: password.value,
          rememberMe: rememberMe.value
        })

        router.push('/dashboard')
      } catch (err) {
        error.value = err.message || 'Login failed'
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      rememberMe,
      showPassword,
      loading,
      error,
      togglePassword,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #333;
  font-size: 1.8rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #b8860b;
  box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.1);
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
}

.rtl .toggle-password {
  right: auto;
  left: 1rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #b8860b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #986c08;
}

.login-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.forgot-password,
.register-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover,
.register-link:hover {
  color: #b8860b;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.rtl {
  direction: rtl;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  .login-header h2 {
    font-size: 1.5rem;
  }
}
</style>