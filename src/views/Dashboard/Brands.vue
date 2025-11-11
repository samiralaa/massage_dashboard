<template>
  <div class="brands-container">
    <div class="header">
      <h1 class="text-2xl font-bold text-gray-800">{{ $t('Brands.Management') }}</h1>
      <el-button type="primary" @click="openCreateDialog" class="add-brand-btn">
        <el-icon class="mr-2">
          <Plus />
        </el-icon>
        {{ $t('Brands.AddBrands') }}
      </el-button>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else class="table-container">
      <el-table :data="brands" style="width: 100%" :border="true" v-loading="loading">
        <el-table-column :label="$t('Brands.Logo')" min-width="200" :resizable="true">
          <template #default="{row}">
            <div class="d-flex align-center brand-name">
              <div class="brand-logo-container" @click="previewImage(row)">
                <el-avatar :size="120" class="brand-logo">
                  <el-image v-if="row.images" :src="'https://backend.msgperfumes.com' + '/public/storage/' + row.images[0].path" fit="cover"
                    class="logo-img" :preview-src-list="['https://backend.msgperfumes.com' + '/public/storage/' + row.images[0].path]" />
                  <el-icon v-else size="24" color="#909399">
                    <Picture />
                  </el-icon>
                </el-avatar>
                <div class="logo-overlay">
                  <el-icon>
                    <ZoomIn />
                  </el-icon>
                </div>
              </div>

            </div>
          </template>
        </el-table-column>

        <el-table-column prop="name_ar" :label="$t('Brands.NameAr')" min-width="150" :resizable="true">
          <template #default="scope">
            <div class="text-right arabic-text" dir="rtl">
              {{ scope.row.name_ar || 'N/A' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="description_en" :label="$t('Brands.DescriptionEn')" min-width="200" :resizable="true">
          <template #default="scope">
            <div class="description-cell">
              {{ scope.row.description_en || 'N/A' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="description_ar" :label="$t('Brands.DescriptionAr')" min-width="200" :resizable="true">
          <template #default="scope">
            <div class="text-right arabic-text" dir="rtl">
              {{ scope.row.description_ar || 'N/A' }}
            </div>
          </template>
        </el-table-column>
<!-- category_id -->


<el-table-column :label="$t('Brands.Actions')" width="100" fixed="right">
          <template #default="scope">
            <div class="button-group">
              <el-tooltip content="Edit Brand" placement="top">
                <el-button type="primary" size="small" class="action-button" @click="editItem(scope.row)">
                  <el-icon>
                    <Edit />
                  </el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="Delete Brand" placement="top">
                <el-button type="danger" size="small" class="action-button" @click="deleteItem(scope.row)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <el-empty v-if="!loading && brands.length === 0" description="No brands found" />
    </div>

    <!-- Brand Form Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'create' ? $t('Brands.CreateTitle') : $t('Brands.Edit')"
      width="600px" :close-on-click-modal="false">
      <el-form ref="brandFormRef" :model="brandForm" :rules="formRules" label-position="top">
        <el-form-item :label="$t('Brands.Logo')" prop="logo">
          <el-upload class="logo-uploader" action="#" :show-file-list="false" :auto-upload="false"
            :on-change="handleLogoChange">
            <el-image v-if="brandForm.logo" :src="brandForm.logo" class="logo-preview" />
            <el-icon v-else class="logo-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('Brands.NameEn')" prop="name_en">
              <el-input v-model="brandForm.name_en" :placeholder="$t('Brands.PlaceholderNameEn')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('Brands.NameAr')" prop="name_ar">
              <el-input v-model="brandForm.name_ar" :placeholder="$t('Brands.PlaceholderNameAr')" dir="rtl" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- category_id -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('Brands.Category')" prop="category_id">
              <el-select v-model="brandForm.category_id" placeholder="Select Category" style="width: 100%;">
                <el-option
                  v-for="category in $store.getters['categories/getCategories']"
                  :key="category.id"
                  :label="`${category.name_ar}`"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('Brands.DescriptionEn')" prop="description_en">
              <el-input v-model="brandForm.description_en" type="textarea" :rows="3"
                :placeholder="$t('Brands.PlaceholderDescriptionEn')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('Brands.DescriptionAr')" prop="description_ar">
              <el-input v-model="brandForm.description_ar" type="textarea" :rows="3"
                :placeholder="$t('Brands.PlaceholderDescriptionAr')" dir="rtl" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('Brands.Cancel') }}</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ dialogType === 'create' ? $t('Brands.Create') : $t('Brands.Update') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Delete Confirmation Dialog -->
    <el-dialog v-model="deleteDialogVisible" title="Delete Brand" width="400px" :close-on-click-modal="false">
      <p>Are you sure you want to delete this brand? This action cannot be undone.</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="deleting">
            Delete
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Edit, Delete, Plus, Picture, ZoomIn, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// Create axios instance with default config
const api = axios.create({

  baseURL: 'https://backend.msgperfumes.com',

  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'));
    if (tokenData?.token) {
      config.headers.Authorization = `Bearer ${tokenData.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tokenData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default defineComponent({
  name: 'BrandsView',
  components: {
    Edit,
    Delete,
    Plus,
    Picture,
    ZoomIn,
    Refresh
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const brandFormRef = ref(null)
    const dialogVisible = ref(false)
    const deleteDialogVisible = ref(false)
    const dialogType = ref('create')
    const brands = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const deleting = ref(false)
    const selectedBrand = ref(null)
    const error = ref(null)
    const lang = ref(localStorage.getItem('lang') || 'en')
    const brandForm = reactive({
      logo: '',
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      category_id: null,
    })

    const formRules = {
      name_en: [
        { required: true, message:lang === 'en' ? 'Please enter brand name in English': 'من فضلك ادخل اسم البراند بالانجليزي', trigger: 'blur' }
      ],
      name_ar: [
        { required: true, message:lang === 'en' ? 'Please enter brand name in Arabic': 'من فضلك ادخل اسم البراند بالعربي', trigger: 'blur' }
      ],
      description_en: [
        { required: true, message:lang === 'en' ? 'Please enter brand description in English': 'من فضلك ادخل وصف البراند بالانجليزي', trigger: 'blur' }
      ],
      description_ar: [
        { required: true, message:lang === 'en' ? 'Please enter brand description in Arabic': 'من فضلك ادخل وصف البراند بالعربي', trigger: 'blur' }
      ]
    }

    const fetchBrands = async () => {
      try {
        loading.value = true
        error.value = null

        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (!tokenData?.token) {
          console.error('No token found')
          router.push('/login')
          return
        }

        await store.dispatch('fetchBrands')
        brands.value = store.getters.getBrands

   
      } catch (err) {
        console.error('Error loading brands:', err)
        error.value = err.response?.data?.message ||
          err.message ||
          'Failed to load brands'

        if (err.response?.status === 401) {
          localStorage.removeItem('tokenData')
          router.push('/login')
        }
      } finally {
        loading.value = false
      }
    }

    const openCreateDialog = () => {
      dialogType.value = 'create'
      brandForm.logo = ''
      brandForm.name_en = ''
      brandForm.name_ar = ''
      brandForm.description_en = ''
      brandForm.description_ar = ''
      brandForm.category_id = null
      dialogVisible.value = true
    }

    const editItem = (item) => {
      dialogType.value = 'edit'
      selectedBrand.value = item
      brandForm.logo = item.media?.[0]?.original_url || ''
      brandForm.name_en = item.name_en
      brandForm.name_ar = item.name_ar
      brandForm.description_en = item.description_en
      brandForm.description_ar = item.description_ar
      brandForm.category_id = item.category_id || item.category?.id || null
      dialogVisible.value = true
    }

  
    const deleteItem = (item) => {
      selectedBrand.value = item
      deleteDialogVisible.value = true
    }

    const handleLogoChange = (file) => {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          brandForm.logo = e.target.result
        }
        reader.readAsDataURL(file.raw)
      }
    }

    const submitForm = async () => {
      try {
        if (!brandFormRef.value) return

        await brandFormRef.value.validate()
        submitting.value = true

        const formData = new FormData()
        formData.append('name_en', brandForm.name_en)
        formData.append('name_ar', brandForm.name_ar)
        formData.append('description_en', brandForm.description_en || '')
        formData.append('description_ar', brandForm.description_ar || '')
        if (brandForm.category_id) {
          formData.append('category_id', brandForm.category_id)
        }

        // Do NOT append _method or use PUT for updates

        if (brandForm.logo instanceof File) {
          formData.append('logo', brandForm.logo)
        } else if (brandForm.logo && typeof brandForm.logo === 'string') {
          const response = await fetch(brandForm.logo)
          const blob = await response.blob()
          const file = new File([blob], 'logo.png', { type: 'image/png' })
          formData.append('logo', file)
        }

        const url = dialogType.value === 'create'
          ? '/api/brands'
          : `/api/brands/${selectedBrand.value.id}`

        await api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        ElMessage({
          message:lang === 'en' ? ` ${dialogType.value === 'create' ? 'created' : 'updated'} successfully` : `  ${dialogType.value === 'create' ? 'تم إنشاؤه' : 'تم التحديث'} بنجاح `,
          type: 'success',
          duration: 2000
        })
        dialogVisible.value = false
        fetchBrands()
      } catch (err) {
        // error handling
      } finally {
        submitting.value = false
      }
    }


    const confirmDelete = async () => {
      try {
        deleting.value = true
        await api.delete(`/api/brands/${selectedBrand.value.id}`)
        ElMessage({
          message:lang === 'en' ? 'Brand deleted successfully' : 'تم حذف العلامة التجارية بنجاح',
          type: 'success',
          duration: 2000
        })
        deleteDialogVisible.value = false
        fetchBrands()
      } catch (err) {
        console.error('Error deleting brand:', err)
        ElMessage({
          message: lang === 'en' ? 'Failed to delete brand' : 'فشل في حذف العلامة التجارية',
          type: 'error',
          duration: 5000
        })
      } finally {
        deleting.value = false
      }
    }

    const previewImage = (brand) => {
      if (brand.images && brand.images.length > 0) {
        const imageUrl = `https://backend.msgperfumes.com/public/storage/${brand.images[0].path}`; 
    
        
        window.open(imageUrl, '_blank')
      }
    }

    const clearError = () => {
      error.value = null
    }

    onMounted(async () => {
      try {
        await store.dispatch('categories/fetchCategories')
      } catch (e) {
        console.error('Failed to load categories', e)
      }
      fetchBrands()
    })

    return {
      brands,
      loading,
      error,
      dialogVisible,
      deleteDialogVisible,
      dialogType,
      submitting,
      deleting,
      selectedBrand,
      brandForm,
      formRules,
      brandFormRef,
      fetchBrands,
      openCreateDialog,
      editItem,
      deleteItem,
      handleLogoChange,
      submitForm,
      confirmDelete,
      previewImage,
      clearError
    }
  }
})
</script>

<style scoped>
.brands-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header h1 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.add-brand-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: auto;
  font-weight: 500;
}

.add-brand-btn .el-icon {
  margin-right: 8px;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.brand-name {
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-logo-container {
  position: relative;
  margin-right: 16px;

  cursor: pointer;
  transition: all 0.3s ease;
}

.brand-logo {
  background-color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  width: 60px !important;
  height: 60px !important;
}

.brand-logo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(239, 68, 68, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 10px;
  cursor: pointer;
}

.brand-logo-container:hover .logo-overlay {
  opacity: 1;
}

.logo-overlay .el-icon {
  color: white;
  font-size: 24px;
  transition: transform 0.3s ease;
}

.brand-logo-container:hover .logo-overlay .el-icon {
  transform: scale(1.2);
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.brand-text {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  line-height: 1.4;
}

.arabic-text {
  font-family: 'Noto Sans Arabic', sans-serif;
  color: #1e293b;
  font-size: 0.875rem;
  line-height: 1.4;
}

.description-cell {
  max-width: none;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  color: #64748b;
  font-weight: 400;
  line-height: 1.5;
  word-break: break-word;
  text-align: left;
  font-size: 0.875rem;
  padding: 8px 0;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button.primary:hover {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.action-button.danger:hover {
  background-color: #ef4444;
  border-color: #ef4444;
}

.action-button .el-icon {
  font-size: 16px;
}

.loading-state {
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-table) {
  --el-table-border-color: #e2e8f0;
  --el-table-header-bg-color: #ffffff;
  --el-table-row-hover-bg-color: #f8fafc;
  --el-table-text-color: #1e293b;
  --el-table-header-text-color: #475569;
  --el-table-border: 1px solid #e2e8f0;
  width: 100% !important;
  table-layout: fixed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.el-table__header) {
  background-color: #ffffff !important;
}

:deep(.el-table__header-wrapper) {
  border-bottom: 2px solid #e2e8f0;
}

:deep(.el-table th) {
  background-color: #ffffff !important;
  color: #475569 !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  padding: 16px !important;
  white-space: normal !important;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.el-table td) {
  padding: 16px !important;
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: normal !important;
  word-break: break-word;
  vertical-align: middle;
  line-height: 1.4;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-table__row) {
  height: auto !important;
  transition: all 0.2s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-table__body-wrapper) {
  overflow-x: visible !important;
}

:deep(.el-table__body) {
  width: 100% !important;
}

.bottom-add-button {
  display: none;
}

.logo-uploader {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.logo-uploader:hover {
  border-color: #3b82f6;
  background-color: #f0f7ff;
  transform: scale(1.02);
}

.logo-uploader-icon {
  font-size: 32px;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.logo-uploader:hover .logo-uploader-icon {
  color: #3b82f6;
  transform: scale(1.1);
}

.logo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.logo-preview:hover {
  transform: scale(1.05);
}

.logo-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

@media screen and (max-width: 1200px) {
  .brands-container {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header h1 {
    font-size: 1.25rem;
  }

  .add-brand-btn {
    width: 100%;
    justify-content: center;
  }

  :deep(.el-table) {
    font-size: 0.8125rem;
  }

  :deep(.el-table td),
  :deep(.el-table th) {
    padding: 12px !important;
  }

  .brand-logo {
    width: 50px !important;
    height: 50px !important;
  }

  .logo-overlay .el-icon {
    font-size: 20px;
  }
}

@media screen and (max-width: 768px) {
  .brands-container {
    padding: 12px;
  }

  .table-container {
    padding: 12px;
  }

  .header {
    padding: 12px;
  }

  :deep(.el-table) {
    font-size: 0.75rem;
  }

  :deep(.el-table td),
  :deep(.el-table th) {
    padding: 10px !important;
  }

  .brand-logo {
    width: 45px !important;
    height: 45px !important;
  }

  .logo-overlay .el-icon {
    font-size: 18px;
  }

  .logo-uploader {
    width: 120px;
    height: 120px;
  }

  .action-button {
    width: 28px;
    height: 28px;
  }
}

@media screen and (max-width: 480px) {
  .brands-container {
    padding: 8px;
  }

  .table-container {
    padding: 8px;
  }

  .header {
    padding: 8px;
  }

  .header h1 {
    font-size: 1rem;
  }

  :deep(.el-table) {
    font-size: 0.6875rem;
  }

  :deep(.el-table td),
  :deep(.el-table th) {
    padding: 8px !important;
  }

  .brand-logo {
    width: 40px !important;
    height: 40px !important;
  }

  .logo-overlay .el-icon {
    font-size: 16px;
  }

  .logo-uploader {
    width: 100px;
    height: 100px;
  }

  .action-button {
    width: 24px;
    height: 24px;
  }
}
</style>
