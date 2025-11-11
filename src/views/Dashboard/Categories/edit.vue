<template>
  <div class="category-edit">
    <div class="form-card">
      <h2 class="form-title">{{ $t('Categories.EditCategory') }}</h2>

      <div v-if="loading" class="loading-overlay">
        <span class="spinner"></span>
      </div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <form @submit.prevent="submitCategory" :style="loading ? 'pointer-events:none;opacity:0.5;' : ''">
        <div class="form-group">
          <label>{{ $t('Categories.NameEn') }}</label>
          <input v-model="form.name" required class="form-input" />
        </div>

        <div class="form-group">
          <label>{{ $t('Categories.NameAr') }}</label>
          <input v-model="form.name_ar" required class="form-input" />
        </div>

        <div class="form-group">
          <label>{{ $t('Categories.DescriptionEn') }}</label>
          <textarea v-model="form.description_en" required class="form-input form-textarea"></textarea>
          
        </div>

        <div class="form-group">
          <label>{{ $t('Categories.DescriptionAr') }}</label>
          <textarea v-model="form.description_ar" required class="form-input form-textarea"></textarea>
        </div>

     
        <div class="form-group">
          <label>{{ $t('Categories.Image') }}</label>
          <div class="file-input-wrapper">
            <input type="file" @change="onFileChange" accept="image/*" class="form-input file-input" />
          </div>
        </div>

        <div v-if="originalImageUrl" class="image-preview-container">
          <p class="preview-title">{{ $t('Categories.CurrentImage') || 'Current Image' }}</p>
          <div class="image-preview">
            <el-image
              :src="originalImageUrl"
              fit="contain"
              class="edit-image"
              :preview-src-list="[originalImageUrl]"
              :initial-index="0"
              preview-teleported
            >
              <template #error>
                <div class="image-error"><el-icon><Picture /></el-icon></div>
              </template>
            </el-image>
          </div>
        </div>

        <div v-if="imagePreview" class="image-preview-container">
          <p class="preview-title">{{ $t('Categories.ImagePreview') || 'New Image Preview' }}</p>
          <div class="image-preview">
            <el-image
              :src="imagePreview"
              fit="contain"
              class="edit-image"
              :preview-src-list="[imagePreview]"
              :initial-index="0"
              preview-teleported
            >
              <template #error>
                <div class="image-error"><el-icon><Picture /></el-icon></div>
              </template>
            </el-image>
          </div>
        </div>
        <button type="submit" class="submit-button">{{ $t('Categories.UpdateButton') }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

export default {
  name: 'EditCategory',
  components: { Picture },
  data() {
    return {
      form: {
        name: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        brand_id: '',
        image: null,
      },
      imagePreview: null,
      originalImageUrl: null,
      brands: [],
      successMessage: '',
      errorMessage: '',
      loading: false,
      domain_Img: 'https://massagebackend.webenia.org/public/storage/',
      BASE_URL: 'https://massagebackend.webenia.org',
    }
  },
  created() {
    this.fetchBrands()
    this.fetchCategory()
  },
  methods: {
    resolveImageUrl(path) {
      if (!path) return null
      // Already absolute URL
      if (/^https?:\/\//i.test(path)) return path
      // If it's a storage path like "images/..." ensure we prefix correctly
      const normalized = path.replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/') // collapse duplicate slashes inside the path
      // Prefer public/storage for direct file serving (same as index page)
      return `${this.BASE_URL}/public/storage/${normalized}`
    },
    extractFirstImagePath(cat) {
      if (!cat) return null
      // Common shapes
      if (Array.isArray(cat.images) && cat.images[0]?.path) return cat.images[0].path
      if (cat.images?.data && Array.isArray(cat.images.data) && cat.images.data[0]?.path) return cat.images.data[0].path
      if (cat.image?.path) return cat.image.path
      if (typeof cat.image === 'string') return cat.image
      if (cat.logo?.path) return cat.logo.path
      if (typeof cat.image_url === 'string') return cat.image_url
      return null
    },
    async fetchBrands() {
      try {
        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (tokenData?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
        }
        const response = await axios.get('https://massagebackend.webenia.org/api/brands')
        if (response.data.status) {
          const data = response.data.data
          this.brands = Array.isArray(data) ? data : [data]
        } else {
          throw new Error(response.data.message || 'Failed to fetch brands')
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
        ElMessage.error('Failed to load brands')
      }
    },
    async fetchCategory() {
      this.loading = true
      try {
        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (tokenData?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
        }
        const id = this.$route.params.id
        const response = await axios.get(`https://massagebackend.webenia.org/api/categories/${id}`)
        if (response.data.status && response.data.data) {
          const cat = response.data.data
      
          
          this.form = {
            name: cat.name_en || '',
            name_ar: cat.name_ar || '',
            description_en: cat.description_en || '',
            description_ar: cat.description_ar || '',
            brand_id: cat.brand_id || '',
            image: null,
          }
  
          const firstPath = this.extractFirstImagePath(cat)
          this.originalImageUrl = this.resolveImageUrl(firstPath)
          
        } else {
          throw new Error(response.data.message || 'Failed to fetch category')
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching the category.'
      } finally {
        this.loading = false
        
      }
    },
    onFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.form.image = file
        this.imagePreview = URL.createObjectURL(file)
      } else {
        this.form.image = null
        this.imagePreview = null
      }
    },
    async submitCategory() {
      this.successMessage = ''
      this.errorMessage = ''
      this.loading = true
      try {
        const formData = new FormData()
        formData.append('name_en', this.form.name)
        formData.append('name_ar', this.form.name_ar)
        formData.append('description_en', this.form.description_en)
        formData.append('description_ar', this.form.description_ar)
        formData.append('brand_id', this.form.brand_id)
        if (this.form.image) {
          formData.append('image', this.form.image)
        }
        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (tokenData?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
        }
        
      
        
        const id = this.$route.params.id
        const response = await axios.post(`https://massagebackend.webenia.org/api/categories/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        if (response.data?.status && response.data?.data) {
          this.loading = false
          this.successMessage = 'Category updated successfully!'
          setTimeout(() => {
            this.$router.push('/categories')
          }, 1500)
        } else {
          throw new Error(response.data?.message || 'Failed to update category')
        }
      } catch (error) {
        this.loading = false
        this.errorMessage = error.response?.data?.message || error.message || 'An error occurred while updating the category.'
      }
    },
  },
}
</script>

<style scoped>
/* Copy the styles from create.vue for consistency */
.category-edit {
  padding: 2rem;
  display: flex;
  justify-content: center;
}
.form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 600px;
}
.form-title {
  color: #8b6b3d;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.8rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.form-input:focus {
  border-color: #8b6b3d;
  box-shadow: 0 0 0 2px rgba(139, 107, 61, 0.1);
  outline: none;
}
.form-textarea {
  min-height: 100px;
  resize: vertical;
}
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
}
.file-input-wrapper {
  position: relative;
}
.file-input {
  cursor: pointer;
}
.image-preview-container {
  margin-top: 1.5rem;
}
.preview-title {
  color: #666;
  margin-bottom: 0.5rem;
}
.image-preview {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
}
.image-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}
.edit-image {
  width: 100%;
  max-height: 220px;
}
.image-error {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}
.submit-button {
  background-color: #8b6b3d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-top: 1.5rem;
  transition: background-color 0.3s;
}
.submit-button:hover {
  background-color: #725932;
}
.submit-button:active {
  transform: translateY(1px);
}
.success-message {
  color: #388e3c;
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}
.error-message {
  color: #d32f2f;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #e0e0e0;
  border-top: 5px solid #8b6b3d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 