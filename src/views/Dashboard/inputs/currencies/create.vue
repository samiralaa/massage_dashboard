<template>
    <div class="currency-create-container">
      <el-card class="currency-card">
        <h2>{{ $t('input.currencies.add-currency') }}</h2>
  
        <el-form :model="form" ref="formRef" :rules="rules" label-width="120px">
          <!-- Name (EN) -->
          <el-form-item :label="$t('input.currencies.name-en')" prop="name_en">
            <el-input v-model="form.name_en" />
          </el-form-item>
  
          <!-- Name (AR) -->
          <el-form-item :label="$t('input.currencies.name-ar')" prop="name_ar">
            <el-input v-model="form.name_ar" />
          </el-form-item>
  
          <!-- Exchange Rate -->
          <el-form-item :label="$t('input.currencies.exchangeRate')" prop="exchange_rate">
            <el-input v-model="form.exchange_rate" />
          </el-form-item>
          <!-- Code  -->
            <el-form-item :label="$t('input.currencies.code')" prop="code">
            <el-input v-model="form.code" />
          </el-form-item>
  
          <!-- Submit -->
          <el-form-item>
            <el-button type="primary" @click="submitForm">
              {{ $t('input.currencies.create') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import { ElMessage } from 'element-plus'
  
  const router = useRouter()
  const lang = localStorage.getItem('lang') || 'en'
  const formRef = ref(null)
  
  const form = ref({
    name_en: '',
    name_ar: '',
    exchange_rate: '',
    code:'',
  })
  
  const rules = {
    name_en: [{ required: true, message: lang==='en' ?'Please input currency name (EN)':"من فضلك ادخل سعر العملة بالانجليزي", trigger: 'blur' }],
    name_ar: [{ required: true, message:  lang==='en' ?'Please input currency name (AR)':"من فضلك ادخل سعر العملة بالعربي", trigger: 'blur' }],
    exchange_rate: [
      { required: true, message:lang=== 'en'? 'Please input exchange rate':'من فضلك ادخل سعر الصرف', trigger: 'blur' },
      { pattern: /^\d+(\.\d{1,2})?$/, message: lang=== 'en'?'Exchange rate must be a valid number':'سعر الصرف يجب ان يكون رقم صحيح', trigger: 'blur' }
    ]
  }
  

  const BASE_URL = 'https://massagebackend.webenia.org'

  const currencies_API = `${BASE_URL}/api/currencies`
  
  const submitForm = () => {
    formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const formData = new FormData()
          formData.append('name_en', form.value.name_en)
          formData.append('name_ar', form.value.name_ar)
          formData.append('exchange_rate', form.value.exchange_rate)
          formData.append('code',form.value.code)
  
          const tokenData = JSON.parse(localStorage.getItem('tokenData'))
          if (!tokenData || !tokenData.token) {
            throw new Error('Authentication token not found')
          }
  
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
  
          const response = await axios.post(currencies_API, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
  
          if (response.data.status) {
            ElMessage.success('Currency created successfully')
            router.push('/currencies')
          } else {
            throw new Error(response.data.message || 'Failed to create currency')
          }
        } catch (error) {
          if (error.response && error.response.status === 422) {
            const validationErrors = error.response.data.errors
            for (const key in validationErrors) {
              ElMessage.error(validationErrors[key][0])
            }
          } else {
            ElMessage.error(error.message || 'Failed to create currency')
          }
        }
      } else {
      
        return false
      }
    })
  }
  </script>
  
  <style scoped>
  .currency-create-container {
    max-width: 800px;
    margin: 30px auto;
    padding: 20px;
  }
  
  .currency-card {
    padding: 20px;
  }
  </style>
  