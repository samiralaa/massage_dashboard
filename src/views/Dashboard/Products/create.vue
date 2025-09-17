<template>
  <div class="product-create-container">
    <el-card class="product-card">
      <h2>{{ $t('Products.CreateProduct') }}</h2>

      <el-form :model="form" ref="formRef" :rules="rules" label-width="120px" enctype="multipart/form-data">
        <!-- Name EN -->
        <el-form-item :label="$t('Products.NameEn')" prop="name_en">
          <el-input v-model="form.name_en" />
        </el-form-item>

        <!-- Name AR -->
        <el-form-item :label="$t('Products.NameAr')" prop="name_ar">
          <el-input v-model="form.name_ar" />
        </el-form-item>
        
        <!-- Availability -->
        <el-form-item :label="$t('Products.Availability')" prop="is_available">
          <el-switch v-model="form.is_available" active-value="1" inactive-value="0" />
        </el-form-item>

        <!-- Manual toggle for amount -->
        <el-form-item label="Needs Amount?">
          <el-switch v-model="amountRequired" active-text="Yes" inactive-text="No" />
        </el-form-item>

        <!-- Show amount fields conditionally -->
        <template v-if="amountRequired">
          <el-divider content-position="left">Amount Info</el-divider>

          <el-form-item label="Unit">
            <el-select v-model="amountForm.unit_id" placeholder="Select Unit">
              <el-option v-for="unit in units" :key="unit.id" :label="unit.name_en" :value="unit.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="Weight">
            <el-input v-model="amountForm.weight" type="number" placeholder="Enter weight" />
          </el-form-item>

          <el-form-item label="Price">
            <el-input v-model="amountForm.price" type="number" placeholder="Enter price" />
          </el-form-item>
        </template>

        <!-- Price -->
        <el-form-item v-if="!amountRequired" :label="$t('Products.Price')" prop="price">
          <el-input v-model="form.price" type="number" />
        </el-form-item>

        <!-- Description EN -->
        <el-form-item :label="$t('Products.DescriptionEn')" prop="description_en">
          <el-input type="textarea" v-model="form.description_en" />
        </el-form-item>

        <!-- Description AR -->
        <el-form-item :label="$t('Products.DescriptionAr')" prop="description_ar">
          <el-input type="textarea" v-model="form.description_ar" />
        </el-form-item>

        <!-- Brand -->
        <el-form-item label="Brand" prop="brand_id">
          <el-select v-model="form.brand_id" placeholder="Select Brand" filterable clearable>
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.name_en"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>

        <!-- Category -->
        <el-form-item :label="$t('Products.Category')" prop="category_id">
          <el-select v-model="form.category_id" :placeholder="$t('Products.SelectCategory')" filterable clearable>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name_en || cat.name_ar" :value="cat.id" />
          </el-select>
        </el-form-item>

        <!-- Currency -->
        <el-form-item :label="$t('Products.Currency')" prop="currency_id">
          <el-select v-model="form.currency_id" :placeholder="$t('Products.SelectCurrency')" filterable clearable>
            <el-option v-for="curr in activeCurrencies" :key="curr.id" :label="getCurrencyLabel(curr)"
              :value="curr.id" />
          </el-select>
        </el-form-item>

        <!-- Country -->
        <el-form-item :label="$t('Products.Country')" prop="country_id">
          <el-select v-model="form.country_id" :placeholder="$t('Products.SelectCountry')" filterable clearable>
            <el-option v-for="country in countries" :key="country.id" :label="country.name_en || country.name_ar"
              :value="country.id" />
          </el-select>
        </el-form-item>

        <!-- Parent Product -->
        <el-form-item :label="$t('Products.ParentProduct')" prop="parent_id">
          <el-select v-model="form.parent_id" :placeholder="$t('Products.SelectParentProduct')" clearable>
            <el-option :label="$t('Products.None')" :value="null" />
            <el-option v-for="parent in parentProducts" :key="parent.id" :label="parent.name_en" :value="parent.id" />
          </el-select>
        </el-form-item>

        <!-- Attributes -->
        <el-form-item label="Attributes" prop="attribute_ids">
          <el-select v-model="form.attribute_ids" placeholder="Select Attributes" filterable clearable multiple>
            <el-option
              v-for="attribute in attributes"
              :key="attribute.id"
              :label="attribute.name_en"
              :value="attribute.id"
            >
              <div class="attribute-option">
                <div v-if="attribute.icon" class="attribute-icon" v-html="attribute.icon"></div>
                <span>{{ attribute.name_en }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- attributes value -->
        <el-form-item label="Attribute Values">
          <div 
            v-for="(attributeId, index) in form.attribute_ids" 
            :key="attributeId" 
            class="attribute-value-item"
          >
            <div class="attribute-name">
              <div 
                v-if="attributes.find(attr => attr.id === attributeId)?.icon" 
                class="attribute-icon" 
                v-html="injectValueIntoIcon(
                  attributes.find(attr => attr.id === attributeId)?.icon, 
                  form.attribute_values[attributeId]
                )"
              ></div>
              <span>
                {{ attributes.find(attr => attr.id === attributeId)?.name_en || attributeId }}
              </span>
            </div>

            <el-input 
              v-model="form.attribute_values[attributeId]" 
              placeholder="Enter value for this attribute" 
            />
          </div>

          <div v-if="form.attribute_ids.length === 0" class="no-attributes-message">
            Please select attributes first
          </div>
        </el-form-item>

        <!-- Images -->
        <el-form-item :label="$t('Products.Images')" prop="images">
          <el-upload class="upload-demo" drag action="" :auto-upload="false" :limit="5" :file-list="fileList"
            list-type="picture" :on-change="handleFileChange" :on-remove="handleRemove">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">{{ $t('Products.DropFiles') }}</div>
          </el-upload>
        </el-form-item>

        <!-- Submit -->
        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ $t('Products.CreateButton') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const formRef = ref(null)

const form = ref({
  name_en: '',
  name_ar: '',
  price: '',
  is_available: 1,
  description_en: '',
  description_ar: '',
  category_id: null,
  currency_id: null,
  country_id: null,
  parent_id: null,
  attribute_ids: [],
  attribute_values: {},
  brand_id: null,
})

const amountForm = ref({
  unit_id: null,
  weight: null,
  price: null,
})
const lang = localStorage.getItem('lang') || 'en'
const amountRequired = ref(false)
const fileList = ref([])
const categories = ref([])
const currencies = ref([])
const countries = ref([])
const parentProducts = ref([])
const units = ref([])
const brands = ref([])
const attributes = ref([])

const rules = {
  name_en: [{ required: true, message:lang === 'en' ? 'Please input product name (EN)':"من فضلك ادخل اسم المنتج بالانجليزي", trigger: 'blur' }],
  price: [{ required: true, message: lang=== 'en'? 'Please input product price':'من فضلك ادخل سعر المنتج', trigger: 'blur' }],
  category_id: [{ required: true, message:lang === 'en' ? 'Please select a category' : 'من فضلك اختر فئة', trigger: 'change' }],
  currency_id: [{ required: true, message:lang === 'en' ? 'Please select a currency' : 'من فضلك اختر عملة', trigger: 'change' }],
  country_id: [{ required: true, message:lang === 'en' ? 'Please select a country' : 'من فضلك اختر بلد', trigger: 'change' }],
  brand_id: [{ required: true, message:lang === 'en' ? 'Please select a brand' : 'من فضلك اختر براند', trigger: 'change' }],
  attribute_ids: [{ required: true, message:lang === 'en' ? 'Please select at least one attribute' : 'من فضلك اختر خاصية واحدة على الأقل', trigger: 'change' }],
}

const BASE_URL = 'https://massagebackend.webenia.org'

const fetchSelectOptions = async () => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    const [categoryRes, currencyRes, countryRes, parentProductRes, unitRes, attributeRes] = await Promise.all([
      axios.get(`${BASE_URL}/api/categories`),
      axios.get(`${BASE_URL}/api/website/currencies`),
      axios.get(`${BASE_URL}/api/countries`),
      axios.get(`${BASE_URL}/api/products`),
      axios.get(`${BASE_URL}/api/units`),
      axios.get(`${BASE_URL}/api/attributes`),
    ])

    categories.value = categoryRes.data.data || []
    currencies.value = currencyRes.data.data || []
    countries.value = countryRes.data.data || []
    parentProducts.value = parentProductRes.data.data || []
    units.value = unitRes.data.data || []
    attributes.value = attributeRes.data.data || []
  } catch (error) {
    ElMessage.error(lang === 'en' ? 'Failed to load options' : 'فشل تحميل الخيارات')
  }
}

const fetchBrands = async () => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
    const res = await axios.get(`${BASE_URL}/api/brands`)
    brands.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
  } catch (err) {
    ElMessage.error(lang === 'en' ? 'Failed to load brands' : 'فشل تحميل البراندات')
  }
}

const activeCurrencies = computed(() => currencies.value.filter(c => !c.is_deleted))
const getCurrencyLabel = (currency) => {
  const lang = localStorage.getItem('lang') || 'en'
  return lang === 'ar' ? currency.name_ar : currency.name_en
}

const handleFileChange = (file, fileListNew) => (fileList.value = fileListNew)
const handleRemove = (file, fileListNew) => (fileList.value = fileListNew)

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const formData = new FormData()
      for (const key in form.value) {
        if (form.value[key] !== null) {
          if (key === 'attribute_ids' && Array.isArray(form.value[key])) {
            form.value[key].forEach((attrId, index) => {
              formData.append(`attribute_ids[${index}]`, attrId)
              if (form.value.attribute_values[attrId]) {
                formData.append(`attribute_values[${attrId}]`, form.value.attribute_values[attrId])
              }
            })
          } else if (key !== 'attribute_values') {
            formData.append(key, form.value[key])
          }
        }
      }
      fileList.value.forEach(file => formData.append('images[]', file.raw))

      if (amountRequired.value) {
        formData.append('unit_id', amountForm.value.unit_id)
        formData.append('weight', amountForm.value.weight)
        formData.append('price', amountForm.value.price)
      }

      const tokenData = JSON.parse(localStorage.getItem('tokenData'))
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

      const res = await axios.post(`${BASE_URL}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data.status) {
        ElMessage.success(lang === 'en' ? 'Product created successfully' : 'تم إنشاء المنتج بنجاح')
        router.push('/products')
      } else {
        throw new Error(res.data.message || 'Failed to create product')
      }
    } catch (err) {
      ElMessage.error(lang === 'en' ? 'Failed to create product' : 'فشل إنشاء المنتج')
    }
  })
}

watch(() => form.value.brand_id, async (newBrandId) => {
  if (newBrandId) {
    try {
      const tokenData = JSON.parse(localStorage.getItem('tokenData'))
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
      const res = await axios.get(`${BASE_URL}/api/brands/${newBrandId}/categories`)
      categories.value = res.data.data
      form.value.category_id = null
    } catch (error) {
      ElMessage.error(lang === 'en' ? 'Failed to load categories for brand' : 'فشل تحميل الفئات للبراند')
    }
  } else {
    try {
      const tokenData = JSON.parse(localStorage.getItem('tokenData'))
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
      const catRes = await axios.get(`${BASE_URL}/api/categories`)
      categories.value = catRes.data.data
      form.value.category_id = null
    } catch (error) {
      ElMessage.error(lang === 'en' ? 'Failed to load categories' : 'فشل تحميل الفئات')
    }
  }
})

onMounted(() => {
  fetchSelectOptions()
  fetchBrands()
})

const injectValueIntoIcon = (iconSvg, value) => {
  if (!iconSvg) return ''
  if (!value) return iconSvg

  const closingTagIndex = iconSvg.lastIndexOf('</svg>')
  if (closingTagIndex !== -1) {
    return (
      iconSvg.substring(0, closingTagIndex) +
      `<text x="50%" y="50%" font-size="10" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" 
        fill="currentColor">${value}</text>` +
      iconSvg.substring(closingTagIndex)
    )
  }

  return iconSvg
}
</script>

<style scoped>
.product-create-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

.product-card {
  padding: 20px;
}

.currency-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.currency-name {
  font-weight: 500;
}

.currency-rate {
  color: #909399;
  font-size: 0.9em;
  margin-left: 8px;
}

::v-deep(.el-form-item__label){
  text-align: start;
  justify-content:flex-start;
  width: 170px !important;
}

[dir="rtl"] .el-switch{
  flex-direction: row-reverse;
}

.attribute-value-item {
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.attribute-name {
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.attribute-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
}

.attribute-icon svg {
  width: 20px;
  height: 20px;
  position: relative;
}

.attribute-icon svg text {
  font-weight: bold;
  pointer-events: none;
}

.attribute-option {
  display: flex;
  align-items: center;
}

.no-attributes-message {
  color: #909399;
  font-style: italic;
}
</style>
