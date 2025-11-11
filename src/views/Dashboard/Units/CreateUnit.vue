<template>
  <div class="unit-create-container">
    <el-card class="unit-card">
      <h2>{{ $t('input.unites.add-unit') }}</h2>

      <el-form
        :model="form"
        ref="formRef"
        :rules="rules"
        label-width="120px"
      >
        <!-- Name (EN) -->
        <el-form-item :label="$t('input.unites.name-en')" prop="name_en">
          <el-input v-model="form.name_en" />
        </el-form-item>

        <!-- Name (AR) -->
        <el-form-item :label="$t('input.unites.name-ar')" prop="name_ar">
          <el-input v-model="form.name_ar" />
        </el-form-item>

        <!-- Submit Button -->
        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ $t('input.unites.create') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// Router instance for navigation
const router = useRouter()

// Form reference for validation
const formRef = ref(null)

// The unit form object
const form = ref({
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
})

// Basic form validation rules
const rules = {
  name_en: [{ required: true, message: 'Please input unit name (EN)', trigger: 'blur' }],
}


const BASE_URL = 'https://massagebackend.webenia.org'

const UNITS_API = `${BASE_URL}/api/units`

// Submit the unit creation form
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // Prepare form data
        const formData = new FormData()
        formData.append('name_en', form.value.name_en)
        formData.append('name_ar', form.value.name_ar)
     
        // Retrieve token from localStorage
        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (!tokenData || !tokenData.token) {
          throw new Error('Authentication token not found')
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

        // Send POST request to create unit
        const response = await axios.post(UNITS_API, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        // Check response status
        if (response.data.status) {
          ElMessage.success('Unit created successfully')
          // Redirect to unit list or detail page
          router.push('/units')
        } else {
          throw new Error(response.data.message || 'Failed to create unit')
        }
      } catch (error) {
        console.error('Unit creation error:', error)
        ElMessage.error(error.message || 'Failed to create unit')
      }
    } else {
    
      return false
    }
  })
}
</script>

<style scoped>
.unit-create-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

.unit-card {
  padding: 20px;
}
</style>