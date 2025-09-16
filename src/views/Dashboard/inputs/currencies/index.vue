<template>
    <div class="currencies-container">
      <div class="header">
        <h2>{{ $t('input.currencies.title') }}</h2>
        <el-button type="primary" :to="'/currencies/create'" tag="router-link">
          {{ $t('input.currencies.create') }}
        </el-button>
      </div>
  
      <el-card class="currencies-table">
        <el-table v-loading="loading" :data="currencies" style="width: 100%">
          <el-table-column prop="name_ar" :label="$t('input.currencies.name-ar')" min-width="150" />
          <el-table-column prop="name_en" :label="$t('input.currencies.name-en')" min-width="150" />
          <el-table-column prop="exchange_rate" :label="$t('input.currencies.exchangeRate')" min-width="120">
            <template #default="scope">
              {{ parseFloat(scope.row.exchange_rate).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('input.currencies.status.status')" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.is_deleted ? 'danger' : 'success'" size="small">
                {{ scope.row.is_deleted ? $t('currencies.deleted') : $t('input.currencies.status.active') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('input.currencies.action')" min-width="150" fixed="right">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleUpdate(scope.row)"
                :disabled="scope.row.is_deleted"
              >
                {{ $t('input.currencies.update') }}
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDelete(scope.row)"
                :disabled="scope.row.is_deleted"
              >
                {{ $t('input.currencies.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  const router = useRouter()
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import { ElMessageBox, ElMessage } from 'element-plus';
  
  const currencies = ref([])
  const loading = ref(false)

  const BASE_URL = 'https://massagebackend.webenia.org'

  const API_URL = `${BASE_URL}/api/website/currencies`
  
  const fetchCurrencies = async () => {
    loading.value = true
    try {
      const tokenData = JSON.parse(localStorage.getItem('tokenData'))
      if (!tokenData || !tokenData.token) {
        throw new Error('Authentication token not found')
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
  
      const response = await axios.get(API_URL)

      if (response.data.data && Array.isArray(response.data.data)) {
        currencies.value = response.data.data
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Fetch currencies error:', error)
      ElMessage.error(error.message || 'Failed to fetch currencies')
    } finally {
      loading.value = false
    }
  }
  
  const openAddcurrencyModal = () => {
  
    // Logic to open a modal or redirect to a form for adding a new currency
 
  }
  
  onMounted(() => {
    fetchCurrencies()
  })
  const handleUpdate = (row) => {
  router.push({ name: 'currencies.edit', params: { id: row.id } })
}
  
  const handleDelete = async (currency) => {
    try {
      await ElMessageBox.confirm(
        'Are you sure you want to delete this currency?',
        'Warning',
        {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }
      )

      const response = await axios.delete(`https://massagebackend.webenia.org/api/currencies/${currency.id}`)
      if (response.data.status) {
        ElMessage.success('Currency deleted successfully')
        await fetchCurrencies()
      } else {
        throw new Error(response.data.message || 'Failed to delete currency')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Delete currency error:', error)
        ElMessage.error(error.message || 'Failed to delete currency')
      }
    }
  };
  
  </script>
  
  <style scoped>
  .currencies-container {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .currencies-table {
    margin-top: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .el-table {
    border-radius: 8px;
    overflow: hidden;
  }
  
  .el-table-column {
    text-align: center;
  }
  
  .el-button {
    margin: 0 4px;
  }
  
  .el-tag {
    text-transform: capitalize;
  }
  </style>
    