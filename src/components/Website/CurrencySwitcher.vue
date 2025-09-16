<template>
  <el-dropdown @command="handleCurrencyChange" trigger="click">
    <span class="currency-dropdown">
      {{ getCurrencyName(selectedCurrency) }}
      <el-icon class="el-icon--right"><arrow-down /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="currency in activeCurrencies" :key="currency.id" :command="currency">
          <div class="currency-item">
            <span class="currency-name-ar">{{ currency.name_ar }}</span>
            <span class="currency-name-en">{{ currency.name_en }}</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const currencies = ref([])
const selectedCurrency = ref(null)

const activeCurrencies = computed(() => currencies.value.filter(c => !c.is_deleted))

const getCurrencyName = (currency) => {
  if (!currency) return 'Select Currency'
  const lang = localStorage.getItem('lang') || 'en'
  return lang === 'ar' ? currency.name_ar : currency.name_en
}

const fetchCurrencies = async () => {
  try {
    const response = await axios.get('https://massagebackend.webenia.org/api/currencies')
    if (response.data && Array.isArray(response.data)) {
      currencies.value = response.data
      if (!selectedCurrency.value) {
        const defaultCurrency = currencies.value.find(c => c.name_en === 'US Dollar' && !c.is_deleted)
        if (defaultCurrency) {
          selectedCurrency.value = defaultCurrency
          localStorage.setItem('selectedCurrency', JSON.stringify(defaultCurrency))
          axios.defaults.headers.common['Currency'] = defaultCurrency.code
        }
      }
    }
  } catch (error) {
    console.error('Fetch currencies error:', error)
    ElMessage.error('Failed to fetch currencies')
  }
}

const handleCurrencyChange = async (currency) => {
  try {
    await axios.post('https://massagebackend.webenia.org/api/change-currency', {
      currency: currency.code
    })

    selectedCurrency.value = currency
    localStorage.setItem('selectedCurrency', JSON.stringify(currency))
    axios.defaults.headers.common['Currency'] = currency.code

    window.dispatchEvent(new CustomEvent('currency-changed', { detail: currency }))

    ElMessage.success('Currency changed successfully')
  } catch (err) {
    ElMessage.error('Error switching currency')
    console.error(err)
  }
}

onMounted(async () => {
  const savedCurrency = localStorage.getItem('selectedCurrency')
  if (savedCurrency) {
    selectedCurrency.value = JSON.parse(savedCurrency)
    axios.defaults.headers.common['Currency'] = selectedCurrency.value.code
  }
  await fetchCurrencies()
})
</script>

<style scoped>
.currency-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 14px;
}
.currency-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.currency-name-ar {
  font-size: 14px;
  color: #333;
}
.currency-name-en {
  font-size: 12px;
  color: #666;
}
</style>
