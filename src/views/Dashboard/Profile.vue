<template>
  <div class="profile-container">
    <div class="header">
      <h2>Profile</h2>
    </div>

    <div v-if="loading" class="loading">Loading profile...</div>
    <div v-else>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="me">
        <div class="card" v-if="user">
          <h3 class="section-title">User</h3>
          <div class="grid">
           
            <div><strong>Name:</strong> {{ user?.name }}</div>
            <div><strong>Email:</strong> {{ user?.email }}</div>
            <div><strong>Phone:</strong> {{ user?.phone }}</div>
            <div><strong>Role:</strong> {{ user?.role }}</div>
            <div><strong>Verified:</strong> {{ user?.is_verified ? 'Yes' : 'No' }}</div>
            <div><strong>Created at:</strong> {{ user?.created_at }}</div>
          </div>
        </div>

        <div class="card" v-if="user?.address?.length">
          <h3 class="section-title">Addresses</h3>
          <div v-for="addr in user.address" :key="addr.id" class="addr">
            <div class="grid">
              <div><strong>ID:</strong> {{ addr.id }}</div>
              <div><strong>Postal code:</strong> {{ addr.postal_code }}</div>
              <div><strong>Primary:</strong> {{ addr.is_primary ? 'Yes' : 'No' }}</div>
              <div><strong>Building:</strong> {{ addr.building_name }}</div>
              <div><strong>Floor:</strong> {{ addr.floor_number }}</div>
              <div><strong>Apartment:</strong> {{ addr.apartment_number }}</div>
              <div><strong>Landmark:</strong> {{ addr.landmark }}</div>
              <div><strong>City:</strong> {{ addr.city?.name_en }}</div>
              <div><strong>Country:</strong> {{ addr.country?.name_en }}</div>
            </div>
          </div>
        </div>

        <div class="card" v-if="token">
          <h3 class="section-title">Token</h3>
          <div class="grid">
            <div><strong>ID:</strong> {{ token.id }}</div>
            <div><strong>Name:</strong> {{ token.name }}</div>
            <div><strong>Last used:</strong> {{ token.last_used_at }}</div>
            <div><strong>Created at:</strong> {{ token.created_at }}</div>
            <div><strong>Updated at:</strong> {{ token.updated_at }}</div>
            <div><strong>Abilities:</strong> {{ (token.abilities || []).join(', ') }}</div>
          </div>
        </div>

        <div class="card">
          <h3 class="section-title">Reset Password</h3>
          <el-form
            ref="resetFormRef"
            :model="resetForm"
            :rules="resetRules"
            label-position="top"
            @submit.prevent="onSubmitReset"
          >
            <el-form-item label="Email" prop="email">
              <el-input v-model="resetForm.email" type="email" placeholder="Email" />
            </el-form-item>

            <el-form-item label="New Password" prop="password">
              <el-input v-model="resetForm.password" type="password" show-password placeholder="New password" />
            </el-form-item>

            <el-form-item label="Confirm Password" prop="password_confirmation">
              <el-input v-model="resetForm.password_confirmation" type="password" show-password placeholder="Confirm password" />
            </el-form-item>

            <el-button type="primary" :loading="resetSubmitting" @click="onSubmitReset">
              Reset Password
            </el-button>
          </el-form>
        </div>

       
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

const store = useStore()
const loading = ref(false)
const error = ref(null)
const me = ref(null)

const API_BASE = 'https://backend.msgperfumes.com'

const fetchMe = async () => {
  loading.value = true
  error.value = null
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    const token = tokenData?.token
    if (!token) {
      throw new Error('Authentication token not found')
    }

    const res = await axios.get(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: false
    })

    const payload = res.data
    // Normalize possible shapes:
    // 1) { status, message, data: { user, token } }
    // 2) { user: {...}, token?: {...} }
    if (payload?.data?.user || payload?.user) {
      const normalized = payload?.data
        ? payload
        : {
            status: true,
            message: payload?.message || 'User details retrieved',
            data: {
              user: payload.user,
              token: payload.token || null
            }
          }
      me.value = normalized
    } else if (payload?.status === true || payload?.status === 'success') {
      me.value = payload
    } else {
      throw new Error(payload?.message || 'Failed to fetch profile')
    }
  } catch (e) {
    const message = e?.response?.data?.message || e?.message || 'Failed to load profile'
    error.value = message
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

const user = computed(() => me.value?.data?.user || null)
const token = computed(() => me.value?.data?.token || null)

// Reset password form state
const resetFormRef = ref(null)
const resetSubmitting = ref(false)
const resetForm = ref({
  email: '',
  password: '',
  password_confirmation: ''
})

// Prefill email from loaded user
watch(user, (val) => {
  if (val && !resetForm.value.email) {
    resetForm.value.email = val.email || ''
  }
}, { immediate: true })

const resetRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  password_confirmation: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.value.password) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const onSubmitReset = async () => {
  if (!resetFormRef.value) return
  try {
    await resetFormRef.value.validate()
    resetSubmitting.value = true

    const payload = {
      email: resetForm.value.email,
      password: resetForm.value.password,
      password_confirmation: resetForm.value.password_confirmation
    }

    const res = await store.dispatch('resetPassword', payload)
    ElMessage.success(res?.message || 'Password reset successfully')

    resetForm.value.password = ''
    resetForm.value.password_confirmation = ''
  } catch (e) {
    if (e?.name === 'ElFormValidationError') return
    const message = e?.response?.data?.message || e?.message || 'Failed to reset password'
    ElMessage.error(message)
  } finally {
    resetSubmitting.value = false
  }
}

const prettyJson = (obj) => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (_) {
    return String(obj)
  }
}

onMounted(() => {
  fetchMe()
})
</script>

<style scoped>
.profile-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 16px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px;
  margin-bottom: 16px;
}
.section-title {
  margin: 0 0 12px 0;
  font-size: 18px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px 16px;
}
.addr {
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 12px;
}
.json {
  max-height: 400px;
  overflow: auto;
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
}
.loading {
  padding: 12px;
}
.error {
  color: #d03050;
  margin-bottom: 12px;
}
</style>


