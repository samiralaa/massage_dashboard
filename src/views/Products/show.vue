
<template>
  <div class="product-detail-container">
    <el-card v-if="!loading && !error" class="product-card">
      <h2 class="product-title">{{ product.name_en }}</h2>
      
      <!-- Images Carousel -->
      <div class="images">
        <el-carousel v-if="product.images && product.images.length > 0" height="300px" arrow="always">
          <el-carousel-item v-for="image in product.images" :key="image.id">
            <img :src="`${BASE_URL}/public/storage/${image.path}`" class="product-image" alt="Product Image" />
          </el-carousel-item>
        </el-carousel>
        <div v-else class="image-error">
          <el-icon><Picture /></el-icon>
          <p>{{ $t('Products.NoImageAvailable') }}</p>
        </div>
      </div>
      
      <!-- Product Information -->
      <div class="info">
        <p><strong>{{ $t('Products.Price') }}:</strong> {{ product.price }} {{ product.currency?.name_en || '' }}</p>
        <p><strong>{{ $t('Products.Availability') }}:</strong> {{ product.is_available ? $t('Products.Available') : $t('Products.NotAvailable') }}</p>
        <p><strong>{{ $t('Products.DescriptionEn') }}:</strong> {{ product.description_en || $t('Products.NA') }}</p>
        <p><strong>{{ $t('Products.DescriptionAr') }}:</strong> <span dir="rtl">{{ product.description_ar || $t('Products.NA') }}</span></p>
      </div>
    </el-card>

    <!-- Loading and Error States -->
    <div v-else-if="loading" class="loading-container">
      <el-spinner type="snake" />
      <p>{{ $t('Products.Loading') }}</p>
    </div>
    <el-alert v-else :title="error" type="error" show-icon></el-alert>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

const route = useRoute()
const product = ref({})
const loading = ref(false)
const error = ref(null)

// Base URL for API and images

const BASE_URL = 'https://massagebackend.webenia.org'

const API_URL = `${BASE_URL}/api/products`

// Fetch single product by id
const fetchProduct = async () => {
  loading.value = true
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    // Use the route parameter id to fetch that product
    const { id } = route.params
    const response = await axios.get(`${API_URL}/${id}`)

    // Ensure response structure is as expected
    if (response.data.status) {
      product.value = response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to fetch product')
    }
  } catch (err) {
    console.error('Fetch product error:', err)
    error.value = err.message || 'Failed to fetch product'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.product-detail-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

.product-card {
  padding: 20px;
}

.product-title {
  margin-bottom: 20px;
}

.images {
  margin-bottom: 20px;
}

.product-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.image-error {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.info p {
  margin: 8px 0;
}

.loading-container {
  text-align: center;
  margin-top: 50px;
}
</style>