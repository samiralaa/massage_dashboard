<template>
  <div class="categories-container">
    <div class="header">
      <h2>{{ $t('Categories.Categories') }}</h2>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog"> {{ $t('Categories.AddCategory') }}</el-button>
    </div>

    <el-card class="categories-table">
      <div class="table-wrapper" v-show="!isMobile">
        <el-table
          v-loading="loading"
          :data="categories"
          style="width: 100%"
          border
          stripe
          size="large"
          :default-sort="{ prop: 'name_en', order: 'ascending' }"
        >
        <el-table-column :label="$t('Categories.Image')" width="120">
          <template #default="{ row }">
            <el-image v-if="row.images && row.images.length > 0"
              :src="`${BASE_URL}/public/storage/${row.images[0].path}`" fit="cover" class="category-image"
              :preview-src-list="[`${BASE_URL}/${row.images[0].path}`]" :initial-index="0" preview-teleported>
              <template #error>
                <div class="image-error">
                  <el-icon>
                    <Picture />
                  </el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="image-error">
              <el-icon>
                <Picture />
              </el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="name_en" :label="$t('Categories.Categories')" min-width="180" show-overflow-tooltip />

        <el-table-column :label="$t('Categories.name')" min-width="180">
          <template #default="{ row }">
            <div class="clamp-1" dir="rtl">{{ row.name_ar || 'N/A' }}</div>
          </template>
        </el-table-column>

     

        <el-table-column :label="$t('Categories.DescriptionEn')" min-width="320">
          <template #default="{ row }">
            <el-tooltip :content="row.description_en || 'N/A'" placement="top">
              <div class="clamp-3">{{ row.description_en || 'N/A' }}</div>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column :label="$t('Categories.DescriptionAr')" min-width="320">
          <template #default="{ row }">
            <el-tooltip :content="row.description_ar || 'N/A'" placement="top">
              <div class="clamp-3" dir="rtl">{{ row.description_ar || 'N/A' }}</div>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column :label="$t('Categories.Actions')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>

              <el-button type="warning" :icon="Edit" @click="editCategory(row)">{{ $t('Global.Edit') }}</el-button>
              <el-button type="danger" :icon="Delete" @click="deleteCategory(row)">{{ $t('Global.Delete') }}</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <div class="mobile-list" v-show="isMobile">
        <div v-if="!categories || categories.length === 0" class="no-data">{{$t('Global.NoData') || 'No data'}}</div>
        <div v-for="row in categories" :key="row.id" class="mobile-item">
          <div class="mobile-left">
            <el-image v-if="row.images && row.images.length > 0"
              :src="`${BASE_URL}/public/storage/${row.images[0].path}`"
              fit="cover"
              class="category-image-mobile">
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
          <div class="mobile-right">
            <div class="name-row">{{ row.name_en || '—' }}</div>
            <div class="name-ar" dir="rtl">{{ row.name_ar || '—' }}</div>
            <div class="brand-row">
              <el-tag v-if="row.brand && (row.brand.name_en || row.brand.name_ar)" size="small" effect="plain">
                {{ row.brand.name_en || row.brand.name_ar }}
              </el-tag>
            </div>
            <div class="actions">
              <el-button type="warning" :icon="Edit" size="small" @click="editCategory(row)">{{ $t('Global.Edit') }}</el-button>
              <el-button type="danger" :icon="Delete" size="small" @click="deleteCategory(row)">{{ $t('Global.Delete') }}</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Delete, Picture, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const categories = ref([])
const loading = ref(false)
const isMobile = ref(false)


const BASE_URL = 'https://backend.msgperfumes.com'

const API_URL = `${BASE_URL}/api/categories`

const fetchCategories = async () => {
  loading.value = true
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    const response = await axios.get(API_URL)

    if (response.data.status === true) {
      categories.value = response.data.data


    } else {
      ElMessage.error(response.data.message || 'Failed to fetch categories')
    }
  } catch (error) {
    console.error('Fetch categories error:', error)
    if (error instanceof SyntaxError) {
      ElMessage.error('Invalid token format')
    } else {
      ElMessage.error(error.message || 'Failed to fetch categories')
    }
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  router.push('/categories/create')
}

const viewCategory = (id) => {
  router.push(`/categories/${id}`)
}

const editCategory = (category) => {
  router.push(`/categories/edit/${category.id}`)
}

const deleteCategory = async (category) => {
  try {
    const result = await ElMessageBox.confirm(
      'Are you sure you want to delete this category?',
      'Warning',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
      }
    )

    if (result === 'confirm') {
      loading.value = true
      const tokenData = JSON.parse(localStorage.getItem('tokenData'))
      if (!tokenData || !tokenData.token) {
        throw new Error('Authentication token not found')
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
      const response = await axios.delete(`${API_URL}/${category.id}`)

      if (response.data) {
        ElMessage.success('Category deleted successfully')
        // Remove the deleted category from the list without re-fetching
        categories.value = categories.value.filter(cat => cat.id !== category.id)
      } else {
        throw new Error(response.data.message || 'Failed to delete category')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete category error:', error)
      ElMessage.error(error.message || 'Failed to delete category')
    }
  } finally {
    loading.value = false
  }
}

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  fetchCategories()
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})
</script>

<style scoped>
.categories-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.categories-table {
  margin-top: 20px;
}

.category-image {
  width: 100px;
  height: 60px;
  border-radius: 4px;
}

.image-error {
  width: 100px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.image-error .el-icon {
  font-size: 24px;
  color: #909399;
}

.clamp-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  max-height: calc(1.5em * 3);
}
</style>
