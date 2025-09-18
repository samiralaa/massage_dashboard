<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2> {{ $t('Login.WelcomeBack')}}</h2>
        <p>{{ $t('Login.Pleaselogintoyouraccount')}}</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            type="email"
            placeholder="Email"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Password"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="form-footer">
          <el-checkbox v-model="loginForm.remember">{{ $t('Login.RememberMe')}}</el-checkbox>
          <a href="#" class="forgot-password">{{ $t('Login.ForgotPassword')}}</a>
        </div>

        <el-button
          type="primary"
          :loading="loading"
          class="login-button"
          @click="handleLogin"
        >
          {{ loading ? 'Logging in...' :  $t('Login.Login') }}
        </el-button>
      </el-form>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        class="login-error"
        @close="clearError"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Message, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'LoginView',
  components: {
    Message,
    Lock
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const loginFormRef = ref(null)
    
    const loginForm = ref({
      email: '',
      password: '',
      remember: false
    })

    const loading = ref(false)
    const error = ref(null)

    const rules = {
      email: [
        { required: true, message: 'Email is required', trigger: 'blur' },
        { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
      ],
      password: [
        { required: true, message: 'Password is required', trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      if (!loginFormRef.value) return

      try {
        loading.value = true
        error.value = null
        
        await loginFormRef.value.validate()
        
        await store.dispatch('login', {
          email: loginForm.value.email,
          password: loginForm.value.password
        })
        
        ElMessage({
          message: 'Login successful!',
          type: 'success',
          duration: 2000
        })
        
        if (loginForm.value.remember) {
          localStorage.setItem('rememberedEmail', loginForm.value.email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }
        
        router.push('/dashboard')
      } catch (err) {
        error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
        ElMessage({
          message: error.value,
          type: 'error',
          duration: 5000
        })
      } finally {
        loading.value = false
      }
    }

    const clearError = () => {
      error.value = null
    }

    // Initialize remembered email if exists
    if (localStorage.getItem('rememberedEmail')) {
      loginForm.value.email = localStorage.getItem('rememberedEmail')
      loginForm.value.remember = true
    }

    return {
      loginForm,
      loginFormRef,
      rules,
      loading,
      error,
      handleLogin,
      clearError
    }
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--dark-gold) 0%, var(--primary-gold) 100%);
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: var(--white-gold);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: var(--dark-brown);
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 10px 0 0;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.forgot-password {
  color: var(--primary-gold);
  text-decoration: none;
}

.forgot-password:hover {
  color: var(--dark-gold);
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background-color: var(--primary-gold);
  border-color: var(--dark-gold);
}

.login-button:hover {
  background-color: var(--dark-gold);
  border-color: var(--dark-gold);
}

.login-error {
  margin-top: 20px;
}

:deep(.el-input__wrapper) {
  background-color: #fff !important;
  border: 1px solid #dcdfe6;
}

:deep(.el-input__inner) {
  height: 40px;
  background-color: #fff !important;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-checkbox__label) {
  color: #666;
}
</style>