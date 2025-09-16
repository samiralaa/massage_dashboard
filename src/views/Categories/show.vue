<template>
  <div class="category-details-container" :class="{ 'rtl': $i18n.locale === 'ar' }">
    <div class="header">
      <div class="header-left">
        <el-button @click="router.back()" :icon="ArrowLeft" class="back-button">
          {{ $t('common.cancel') }}
        </el-button>
        <h2 class="page-title">
          {{ $t('Categories.Categories') }} {{ $t('Global.View') }}
        </h2>
      </div>
    </div>

    <el-card v-loading="loading" class="category-details">
      <div v-if="category" class="details-content">
        <!-- Image Section -->
        <div class="image-section">
          <el-image
            v-if="category.images && category.images.length > 0"
            :src="`${BASE_URL}/${category.images[0].path}`"
            fit="cover"
            class="category-image"
            :preview-src-list="[`${BASE_URL}/${category.images[0].path}`]"
            :initial-index="0"
            preview-teleported
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div v-else class="image-error">
            <el-icon><Picture /></el-icon>
          </div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('Categories.name') + ' (EN)'">
              {{ category.name_en }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('Categories.name') + ' (AR)'">
              <div dir="rtl">{{ category.name_ar || 'N/A' }}</div>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('Categories.Brand')">
              {{ category.brand?.name_en || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('Categories.DescriptionEn')">
              {{ category.description_en || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('Categories.DescriptionAr')">
              <div dir="rtl">{{ category.description_ar || 'N/A' }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- Divider for Products -->
      <el-divider content-position="left">
        {{ $t('Categories.Products') }}
      </el-divider>

      <!-- Check if products exist -->
      <el-empty v-if="!category?.products || category.products.length === 0" :description="$t('Global.NoProducts')" />

      <el-row v-else :gutter="20">
        <el-col
          v-for="product in category.products"
          :key="product.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="product-card" shadow="hover">
            <el-image
  :src="`${BASE_URL}/${product.image}`"
  fit="cover"
  class="product-image"
  :preview-src-list="[`${BASE_URL}/${product.image}`]"
  preview-teleported
>

              <template #error>
                <div class="image-error"><el-icon><Picture /></el-icon></div>
              </template>
            </el-image>
            <div class="product-info">
              <h3>{{ product.name_en }}</h3>
              <p>{{ $t('Global.Price') }}: ${{ product.price }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const category = ref(null)
const loading = ref(false)


const BASE_URL = 'https://massagebackend.webenia.org'

const API_URL = `${BASE_URL}/api/categories`

const fetchCategory = async () => {
  loading.value = true
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
    const response = await axios.get(`${API_URL}/${route.params.id}`)

    if (response.data.status === 'success') {
      category.value = response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to fetch category')
    }
  } catch (error) {
    console.error('Fetch category error:', error)
    ElMessage.error(error.message || 'Failed to fetch category')
    router.push('/categories')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategory()
})
</script>

<style scoped>
.category-details-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-details {
  margin-top: 20px;
}

.details-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
}

.image-section {
  width: 100%;
}

.category-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

.image-error {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.image-error .el-icon {
  font-size: 48px;
  color: #909399;
}

.info-section {
  flex: 1;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 180px;
  border-radius: 8px;
}

.product-info {
  padding: 16px;
}

.product-info h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.product-info p {
  font-size: 14px;
  color: #606266;
}

@media (max-width: 768px) {
  .details-content {
    grid-template-columns: 1fr;
  }
}
</style>
