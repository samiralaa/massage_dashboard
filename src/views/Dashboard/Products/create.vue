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
        <el-form-item :label="$t('Products.brand')" prop="brand_id">
          <el-select v-model="form.brand_id" :placeholder="$t('Products.BrandPlaceholder')" filterable clearable>
            <el-option v-for="brand in brands" :key="brand.id" :label="brand.name_en" :value="brand.id" />
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

        <!-- Gender -->
        <el-form-item :label="$t('Products.Gender')" prop="gender">
          <el-select v-model="form.gender" :placeholder="$t('Products.SelectGender')" clearable>
            <el-option v-for="gender in genders" :key="gender.id" :label="gender.name" :value="gender.id" />
          </el-select>
        </el-form-item>

        <!-- Note -->
        <el-form-item :label="$t('Products.Note')" prop="note">
          <el-select v-model="form.note" :placeholder="$t('Products.SelectNote')" clearable>
            <el-option v-for="note in notes" :key="note.id" :label="note.name" :value="note.id" />
          </el-select>
        </el-form-item>

        <!-- Select existing Main Ingredients --> 
        <el-form-item :label="$t('Products.SelectExistingMainIngredients')">
          <el-select
            v-model="form.selected_main_ingredient_ids"
            :placeholder="$t('Products.SelectExistingMainIngredients')"
            filterable
            clearable
            multiple
          >
            <el-option
              v-for="ingredient in mainIngredientsList"
              :key="ingredient.id"
              :label="getLocalizedIngredientName(ingredient)"
              :value="ingredient.id"
            >
              {{ getLocalizedIngredientName(ingredient) }}
            </el-option>
          </el-select>
        </el-form-item>


        <!-- Attributes -->
        <el-form-item :label="$t('Products.Attributes')" prop="attribute_ids">
          <el-select 
            v-model="form.attribute_ids" 
            :placeholder="$t('Products.SelectAttributes')" 
            filterable 
            clearable 
            multiple
            popper-class="attribute-dropdown"
          >
            <el-option 
              v-for="attribute in attributes" 
              :key="attribute.id" 
              :label="getLocalizedAttributeName(attribute)"
              :value="attribute.id"
            >
              <div class="attribute-option">
                <div v-if="attribute.icon" class="attribute-icon" v-html="attribute.icon"></div>
                <span>{{ getLocalizedAttributeName(attribute) }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- Attribute Values -->
        <el-form-item :label="$t('Products.AttributeValues')">
          <div 
            v-for="attributeId in form.attribute_ids" 
            :key="attributeId" 
            class="attribute-value-item">

            <!-- Attribute Name + Icon -->
            <div class="attribute-name">
              <div 
                v-if="getAttribute(attributeId)?.icon" 
                class="attribute-icon" 
                v-html="injectValueIntoIcon(getAttribute(attributeId).icon, form.attribute_values[attributeId])">
              </div>
              <span>{{ getLocalizedAttributeName(getAttribute(attributeId)) || attributeId }}</span>
            </div>

            <!-- Input + Gradient Slider -->
            <div class="attribute-input-container">
              <el-input 
                v-model="form.attribute_values[attributeId]" 
                placeholder="Enter value for this attribute"
                @input="updateAttributeValue(attributeId, $event)" 
              />

              <div v-if="isPercentageValue(form.attribute_values[attributeId])" class="gradient-control">
                <label class="gradient-label">Gradient %:</label>
                <input 
                  type="range" 
                  :value="getPercentageValue(form.attribute_values[attributeId])" 
                  min="0" 
                  max="100"
                  @input="updatePercentageValue(attributeId, $event.target.value)" 
                  class="gradient-range"
                >
                <span class="percent-display">{{ getPercentageValue(form.attribute_values[attributeId]) }}%</span>
              </div>
            </div>
          </div>

          <div v-if="form.attribute_ids.length === 0" class="no-attributes-message">
            {{ $t('Products.PleaseSelectAttributesFirst') }}
          </div>
        </el-form-item>


        <!-- add main ingeredient -->
        <el-form-item :label="$t('Products.CreateNewMainIngredient')">
          <div v-for="(ingredient, index) in form.main_ingredients" :key="index" class="main-ingredient-item">
            <div class="ingredient-inputs">
              <el-input v-model="ingredient.name_en" :placeholder="$t('Products.IngredientNameEn')" style="margin-bottom: 10px;" />
              <el-input v-model="ingredient.name_ar" :placeholder="$t('Products.IngredientNameAr')" style="margin-bottom: 10px;" />
              <el-upload
                class="ingredient-upload-demo"
                drag
                action=""
                :auto-upload="false"
                :limit="1"
                :file-list="ingredientImageLists[index]"
                list-type="picture"
                :on-change="(file, fileList) => handleIngredientImageChange(file, fileList, index)"
                :on-remove="(file, fileList) => handleIngredientImageRemove(file, fileList, index)"
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">{{ $t('Products.DropIngredientImage') }}</div>
              </el-upload>
            </div>
            <el-button @click="removeMainIngredient(index)" type="danger" :icon="Delete" circle class="remove-ingredient-button" />
          </div>
          <el-button @click="addMainIngredient" type="primary" :icon="Plus">{{ $t('Products.AddIngredient') }}</el-button>
        </el-form-item>

        <!-- Fragrance Notes -->
        <el-divider content-position="left">{{ $t('Products.FragranceNotes') }}</el-divider>
        <div v-for="(note, index) in form.fragrance_notes" :key="index" class="fragrance-note-entry mb-3">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="`Note Name EN ${index + 1}`" :prop="`fragrance_notes.${index}.name_en`">
                <el-input v-model="note.name_en" :placeholder="$t('Products.NameEn')" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="`Note Name AR ${index + 1}`" :prop="`fragrance_notes.${index}.name_ar`">
                <el-input v-model="note.name_ar" :placeholder="$t('Products.NameAr')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="`Note Description EN ${index + 1}`" :prop="`fragrance_notes.${index}.description_en`">
                <el-input type="textarea" v-model="note.description_en" :placeholder="$t('Products.DescriptionEn')" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="`Note Description AR ${index + 1}`" :prop="`fragrance_notes.${index}.description_ar`">
                <el-input type="textarea" v-model="note.description_ar" :placeholder="$t('Products.DescriptionAr')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="button-row">
            <el-col :span="24">
              <el-button type="danger" @click="removeFragranceNote(index)">{{ $t('Products.RemoveFragranceNote') }}</el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" @click="addFragranceNote">{{ $t('Products.AddFragranceNote') }}</el-button>

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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Plus, Delete } from '@element-plus/icons-vue'

const { t, locale } = useI18n()
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
  note: null,
  gender: null,
  main_ingredients: [],
  selected_main_ingredient_ids: [],
  fragrance_notes: [], // Add this line
})

const amountForm = ref({
  unit_id: null,
  weight: null,
  price: null,
})
const lang = localStorage.getItem('lang') || 'en'
const amountRequired = ref(false)
const fileList = ref([])
const ingredientImageLists = ref([])
const categories = ref([])
const currencies = ref([])
const countries = ref([])
const parentProducts = ref([])
const units = ref([])
const brands = ref([])
const attributes = ref([])
const mainIngredientsList = ref([])
const genders = ref([
  { id: 'man', name: lang === 'en' ? 'Man' : 'رجالي' },
  { id: 'woman', name: lang === 'en' ? 'Woman' : 'حريمي' },
  { id: 'unisex', name: lang === 'en' ? 'Unisex' : 'يونيسكس' },
])

const notes = ref([
  { id: 'top', name: lang === 'en' ? 'Top Note' : 'المقدمة' },
  { id: 'middle', name: lang === 'en' ? 'Middle Note' : 'الوسط' },
  { id: 'base', name: lang === 'en' ? 'Base Note' : 'القاعدة' },
])

const currentLocale = computed(() => locale.value)

const getLocalizedAttributeName = (attribute) => {
  if (!attribute) return ''
  return currentLocale.value === 'ar'
    ? attribute.name_ar || attribute.name_en || ''
    : attribute.name_en || attribute.name_ar || ''
}

const getLocalizedIngredientName = (ingredient) => {
  if (!ingredient) return ''
  return currentLocale.value === 'ar'
    ? ingredient.name_ar || ingredient.name_en || ''
    : ingredient.name_en || ingredient.name_ar || ''
}

const rules = {
  name_en: [{ required: true, message: lang === 'en' ? 'Please input product name (EN)' : "من فضلك ادخل اسم المنتج بالانجليزي", trigger: 'blur' }],
  price: [{ required: true, message: lang === 'en' ? 'Please input product price' : 'من فضلك ادخل سعر المنتج', trigger: 'blur' }],
  category_id: [{ required: true, message: lang === 'en' ? 'Please select a category' : 'من فضلك اختر فئة', trigger: 'change' }],
  currency_id: [{ required: true, message: lang === 'en' ? 'Please select a currency' : 'من فضلك اختر عملة', trigger: 'change' }],
  country_id: [{ required: true, message: lang === 'en' ? 'Please select a country' : 'من فضلك اختر بلد', trigger: 'change' }],
  brand_id: [{ required: true, message: lang === 'en' ? 'Please select a brand' : 'من فضلك اختر براند', trigger: 'change' }],
  attribute_ids: [{ required: true, message: lang === 'en' ? 'Please select at least one attribute' : 'من فضلك اختر خاصية واحدة على الأقل', trigger: 'change' }],
  gender: [{ required: true, message: lang === 'en' ? 'Please select gender' : 'من فضلك اختر النوع', trigger: 'change' }],
  note: [{ required: true, message: lang === 'en' ? 'Please select note' : 'من فضلك اختر النوت', trigger: 'change' }],
  main_ingredients: [{ type: 'array', message: lang === 'en' ? 'Main ingredients must be an array' : 'يجب أن تكون المكونات الرئيسية مصفوفة', trigger: 'change' }],
  fragrance_notes: [{ type: 'array', message: lang === 'en' ? 'Fragrance notes must be an array' : 'يجب أن تكون المواطنات العطرية مصفوفة', trigger: 'change' }]
}

const BASE_URL = 'https://backend.msgperfumes.com'

const fetchSelectOptions = async () => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    const [categoryRes, currencyRes, countryRes, parentProductRes, unitRes, attributeRes, mainIngredientRes] = await Promise.all([
      axios.get(`${BASE_URL}/api/categories`),
      axios.get(`${BASE_URL}/api/website/currencies`),
      axios.get(`${BASE_URL}/api/countries`),
      axios.get(`${BASE_URL}/api/products`),
      axios.get(`${BASE_URL}/api/units`),
      axios.get(`${BASE_URL}/api/attributes`),
      axios.get(`${BASE_URL}/api/main-ingredients`),
    ])

    categories.value = categoryRes.data.data || []
    currencies.value = currencyRes.data.data || []
    countries.value = countryRes.data.data || []
    parentProducts.value = parentProductRes.data.data || []
    units.value = unitRes.data.data || []
    attributes.value = attributeRes.data.data || []
    mainIngredientsList.value = mainIngredientRes.data || []
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

const addFragranceNote = () => {
  form.value.fragrance_notes.push({ name_en: '', name_ar: '', description_en: '', description_ar: '' })
}

const removeFragranceNote = (index) => {
  ElMessageBox.confirm(
    lang === 'ar' ? 'سيتم حذف الملاحظة العطرية' : 'The fragrance note will be deleted',
    'Warning',
    {
      confirmButtonText: lang === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: lang === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    form.value.fragrance_notes.splice(index, 1);
    ElMessage.success(
      lang === 'ar' ? 'تم حذف الملاحظة العطرية بنجاح' : 'Fragrance note deleted successfully'
    );
  }).catch(() => {
    ElMessage.info(
      lang === 'ar' ? 'تم إلغاء الحذف' : 'Delete cancelled'
    );
  });
};

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
                let attributeValue = form.value.attribute_values[attrId]
                if (typeof attributeValue === 'string' && attributeValue.includes('%')) {
                  attributeValue = parseFloat(attributeValue.replace('%', '')) // Extract numeric part for backend
                }
                formData.append(`attribute_values[${attrId}]`, attributeValue)
              }
            })
          } else if (key !== 'attribute_values' && key !== 'main_ingredients' && key !== 'selected_main_ingredient_ids' && key !== 'fragrance_notes') {
            formData.append(key, form.value[key])
          }
        }
      }

      // Append newly created main ingredients as a JSON string and their images separately
      if (form.value.main_ingredients.length > 0) {
        form.value.main_ingredients.forEach((ingredient, index) => {
          formData.append(`new_main_ingredients[${index}][name_en]`, ingredient.name_en)
          formData.append(`new_main_ingredients[${index}][name_ar]`, ingredient.name_ar)
          if (ingredientImageLists.value[index] && ingredientImageLists.value[index].length > 0) {
            formData.append(`new_main_ingredients[${index}][image]`, ingredientImageLists.value[index][0].raw)
          }
        })
      }

      // Append selected existing main ingredient IDs individually
      if (form.value.selected_main_ingredient_ids.length > 0) {
        form.value.selected_main_ingredient_ids.forEach((id, index) => {
          formData.append(`selected_main_ingredient_ids[${index}]`, id);
        });
      }

      // Append fragrance notes individually
      if (form.value.fragrance_notes.length > 0) {
        form.value.fragrance_notes.forEach((note, index) => {
          formData.append(`fragrance_notes[${index}][name_en]`, note.name_en);
          formData.append(`fragrance_notes[${index}][name_ar]`, note.name_ar);
          formData.append(`fragrance_notes[${index}][description_en]`, note.description_en);
          formData.append(`fragrance_notes[${index}][description_ar]`, note.description_ar);
        });
      }

      if (fileList.value.length > 0) {
        fileList.value.forEach(file => formData.append('images[]', file.raw))
      }

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
        await ElMessageBox.alert(
          lang === 'en' ? 'Product created successfully' : 'تم إنشاء المنتج بنجاح',
          lang === 'en' ? 'Success' : 'نجاح',
          { type: 'success', confirmButtonText: lang === 'en' ? 'OK' : 'حسناً' }
        )
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
  }
})

onMounted(() => {
  fetchSelectOptions()
  fetchBrands()
})

// Helper functions for gradient control
const isPercentageValue = (value) => {
  return typeof value === 'string' && value.includes('%')
}

const getPercentageValue = (value) => {
  if (!value || !isPercentageValue(value)) return 0
  return parseFloat(value.replace('%', '')) || 0
}

const updatePercentageValue = (attributeId, newValue) => {
  form.value.attribute_values[attributeId] = `${newValue}%`
}

const updateAttributeValue = (id, value) => {
  form.value.attribute_values[id] = value
}

// لو عايز تحول أي Icon ليدمج القيمة جوه
const injectValueIntoIcon = (iconSvg, value) => {
  if (!iconSvg) return ''
  
  let modifiedSvg = iconSvg

  // Extract existing defs to ensure gradients are managed correctly
  const defsMatch = modifiedSvg.match(/<defs[^>]*>([\s\S]*?)<\/defs>/)
  let existingDefsContent = defsMatch ? defsMatch[1] : ''

  // Check if value is a percentage
  const isPercentage = typeof value === 'string' && value.includes('%')
  const numericValue = isPercentage ? parseFloat(value.replace('%', '')) : null

  if (isPercentage && numericValue !== null && !isNaN(numericValue)) {
    // Calculate gradient offset (0-100% maps to 0-1)
    const offset = Math.max(0, Math.min(1, numericValue / 100))

    // Find existing linearGradient and update its stops
    const linearGradientMatch = existingDefsContent.match(/<linearGradient id="(g[0-9]+)"[^>]*>([\s\S]*?)<\/linearGradient>/)

    if (linearGradientMatch) {
      const gradientId = linearGradientMatch[1]
      let gradientContent = linearGradientMatch[2]

      // Replace existing stop offsets
      gradientContent = gradientContent.replace(/<stop offset="[^"]*"([^>]*)>/g, (match, p1) => {
        // Assuming the first stop is the primary color stop, and the second is the transparency stop
        // This needs to be robust, perhaps by checking stop-color
        // For simplicity, let's assume the first stop gets the dynamic offset.
        // We need to ensure there are at least two stops for this to work as intended.
        return `<stop offset="${offset}" stop-color="#78D6F0"/>` + `<stop offset="${offset}" stop-color="#8D8D8D" stop-opacity="0.2"/>`
      })

      // Reconstruct the linearGradient with updated stops
      const newLinearGradient = `<linearGradient id="${gradientId}"${linearGradientMatch[0].split(gradientId)[1].split('>')[0]}>${gradientContent}</linearGradient>`
      existingDefsContent = existingDefsContent.replace(linearGradientMatch[0], newLinearGradient)
      
      // Apply the gradient URL to fill or stroke if not already applied
      if (modifiedSvg.includes('fill="') && !modifiedSvg.includes(`fill="url(#${gradientId})"`)) {
        modifiedSvg = modifiedSvg.replace(/fill="[^"]*"/g, `fill="url(#${gradientId})"`)
      }
      if (modifiedSvg.includes('stroke="') && !modifiedSvg.includes(`stroke="url(#${gradientId})"`)) {
        modifiedSvg = modifiedSvg.replace(/stroke="[^"]*"/g, `stroke="url(#${gradientId})" stroke-width="2"`)
      }
    } else {
      // If no linearGradient found, create a new one. This part is largely from your previous implementation.
      const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`
      const gradientDef = `
      <linearGradient id="${gradientId}" x1="0%" y1="100%" x2="0%" y2="0%" gradientUnits="userSpaceOnUse">
        <stop offset="${offset}" stop-color="#78D6F0"/>
        <stop offset="${offset}" stop-color="#8D8D8D" stop-opacity="0.2"/>
      </linearGradient>
    `
      existingDefsContent += gradientDef

    // Apply gradient to fill or stroke
    if (modifiedSvg.includes('fill="')) {
      modifiedSvg = modifiedSvg.replace(/fill="[^"]*"/g, `fill="url(#${gradientId})"`)
    }
    if (modifiedSvg.includes('stroke="')) {
      modifiedSvg = modifiedSvg.replace(/stroke="[^"]*"/g, `stroke="url(#${gradientId})" stroke-width="2"`)
    }
  }

    // Reconstruct SVG with updated defs
    if (defsMatch) {
      modifiedSvg = modifiedSvg.replace(defsMatch[0], `<defs>${existingDefsContent}</defs>`)
    } else {
      const svgTagMatch = modifiedSvg.match(/<svg[^>]*>/)
      if (svgTagMatch) {
        modifiedSvg = modifiedSvg.replace(
          svgTagMatch[0],
          `${svgTagMatch[0]}<defs>${existingDefsContent}</defs>`
        )
      }
    }
  }

  // Add text overlay for any value (percentage or otherwise)
  const closingTagIndex = modifiedSvg.lastIndexOf('</svg>')
  if (closingTagIndex !== -1 && value) {
    return (
      modifiedSvg.substring(0, closingTagIndex) +
      `<text x="50%" y="50%" font-size="16" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" 
        fill="#333333" stroke="white" stroke-width="1">${value}</text>` +
      modifiedSvg.substring(closingTagIndex)
    )
  }

  return modifiedSvg
}

const addMainIngredient = () => {
  form.value.main_ingredients.push({ name_en: '', name_ar: '', image: null })
  ingredientImageLists.value.push([]) // Initialize new file list for the new ingredient
}

const removeMainIngredient = (index) => {
  form.value.main_ingredients.splice(index, 1)
  ingredientImageLists.value.splice(index, 1) // Remove corresponding file list
}

const handleIngredientImageChange = (file, fileList, index) => {
  ingredientImageLists.value[index] = fileList
}

const handleIngredientImageRemove = (file, fileList, index) => {
  ingredientImageLists.value[index] = fileList
}

const getAttribute = (attributeId) => {
  return attributes.value.find(attr => attr.id === attributeId)
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

::v-deep(.el-form-item__label) {
  text-align: start;
  justify-content: flex-start;
  width: 170px !important;
}

[dir="rtl"] .el-switch {
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
  gap: 8px;
}

.attribute-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.attribute-name .attribute-icon {
  margin-inline-end: 4px;
}

.attribute-icon svg {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: visible; /* Ensure text is not clipped */
}

.attribute-icon svg text {
  font-weight: bold;
  pointer-events: none;
  transform: translateY(0.2em); /* Adjust vertical position */
}

.attribute-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.attribute-option span {
  flex: 1;
  color: var(--el-text-color-primary, #303133);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attribute-option .attribute-icon {
  margin-inline-end: 0;
}

:deep(.attribute-dropdown .el-select-dropdown__item) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.attribute-dropdown .el-select-dropdown__item .attribute-option) {
  width: 100%;
}

:deep(.attribute-dropdown .attribute-icon svg) {
  width: 26px;
  height: 26px;
}

.no-attributes-message {
  color: #909399;
  font-style: italic;
}

.main-ingredient-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.ingredient-inputs {
  flex-grow: 1;
  margin-right: 10px;
}

.ingredient-upload-demo {
  width: 100%;
}

.ingredient-upload-demo .el-upload-dragger {
  width: 100%;
}

.remove-ingredient-button {
  margin-left: 10px;
}

.fragrance-note-entry {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
}

.button-row {
  margin-top: 10px;
}
</style>