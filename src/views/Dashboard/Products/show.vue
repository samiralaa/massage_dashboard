
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
        <p><strong>{{ $t('Products.Quantity') }}:</strong> {{ totalInventory }}</p>
        <p><strong>{{ $t('Products.Availability') }}:</strong> {{ product.is_available ? $t('Products.Available') : $t('Products.NotAvailable') }}</p>
        <p><strong>{{ $t('Products.DescriptionEn') }}:</strong> {{ product.description_en || $t('Products.NA') }}</p>
        <p><strong>{{ $t('Products.DescriptionAr') }}:</strong> <span dir="rtl">{{ product.description_ar || $t('Products.NA') }}</span></p>

        <!-- Additional Product Details -->
        <el-divider content-position="left">{{ $t('Products.Details') }}</el-divider>
        <p><strong>{{ $t('Products.Category') }}:</strong> {{ selectedCategoryName }}</p>
        <p><strong>{{ $t('Products.brand') }}:</strong> {{ selectedBrandName }}</p>
        <div v-if="productBrandImage" class="image-preview-list" style="margin-bottom: 1em;">
          <img :src="productBrandImage" alt="Brand Image" style="max-width: 120px; max-height: 120px; margin-right: 10px; border-radius: 8px;" />
        </div>
        <p><strong>{{ $t('Products.Currency') }}:</strong> {{ selectedCurrencyLabel }}</p>
        <p><strong>{{ $t('Products.Country') }}:</strong> {{ selectedCountryName }}</p>
        <p><strong>{{ $t('Products.ParentProduct') }}:</strong> {{ selectedParentProductName }}</p>

        <!-- Attributes Display -->
        <template v-if="product.all_attributes && product.all_attributes.length > 0">
          <el-divider content-position="left">{{ $t('Products.Attributes') }}</el-divider>
          <div class="attribute-display-container">
            <div
              v-for="attribute in product.all_attributes"
              :key="attribute.id"
              class="attribute-display-item">
              <div class="attribute-name-icon">
                <div
                  v-if="getAttribute(attribute.id)?.icon"
                  class="attribute-icon"
                  v-html="injectValueIntoIcon(getAttribute(attribute.id).icon, product.attribute_values_map[attribute.id])">
                </div>
                <span>{{ getLocalizedAttributeName(getAttribute(attribute.id)) }}</span>
              </div>
              <span class="attribute-value">{{ product.attribute_values_map[attribute.id] }}</span>
            </div>
          </div>
        </template>

        <!-- Amounts Display -->
        <template v-if="product.amounts && product.amounts.length > 0">
          <el-divider content-position="left">{{ $t('Products.Amounts') }}</el-divider>
          <div v-for="(amount, index) in product.amounts" :key="index" class="amount-display-item">
            <p><strong>{{ $t('Products.Unit') }}:</strong> {{ getLocalizedUnitName(amount.unit_id) }}</p>
            <p><strong>{{ $t('Products.Weight') }}:</strong> {{ amount.weight }}</p>
            <p><strong>{{ $t('Products.amount-Price') }}:</strong> {{ amount.price }} {{ selectedCurrencyLabel }}</p>
          </div>
        </template>

        <!-- Main Ingredients Display -->
        <template v-if="product.main_ingredients && product.main_ingredients.length > 0">
          <el-divider content-position="left">{{ $t('Products.MainIngredients') }}</el-divider>
          <div class="main-ingredient-display-container">
            <div v-for="(ingredient, index) in product.main_ingredients" :key="index" class="main-ingredient-item">
              <img v-if="ingredient.images && ingredient.images.length > 0"
                   :src="getImageUrl(ingredient.images[0].path)"
                   alt="Main Ingredient Image" class="main-ingredient-image" />
              <span>{{ getLocalizedIngredientName(ingredient) }}</span>
            </div>
          </div>
        </template>

        <!-- Fragrance Notes Display -->
        <template v-if="product.fragrance_notes && product.fragrance_notes.length > 0">
          <el-divider content-position="left">{{ $t('Products.FragranceNotes') }}</el-divider>
          <div v-for="(note, index) in product.fragrance_notes" :key="index" class="fragrance-note-display-item">
            <p><strong>{{ $t('Products.NameEn') }}:</strong> {{ getLocalizedFragranceNoteName(note) }}</p>
            <p><strong>{{ $t('Products.DescriptionEn') }}:</strong> {{ getLocalizedFragranceNoteDescription(note) }}</p>
          </div>
        </template>

        <!-- Discount Display -->
        <template v-if="product.discount && product.discount.is_active">
          <el-divider content-position="left">{{ $t('Products.discountInfo') }}</el-divider>
          <p><strong>{{ $t('Products.Discount-Value') }}:</strong> {{ product.discount.value }}%</p>
          <p><strong>{{ $t('Products.Start-Date') }}:</strong> {{ product.discount.startDate }}</p>
          <p><strong>{{ $t('Products.End-Date') }}:</strong> {{ product.discount.endDate }}</p>
        </template>

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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

const route = useRoute()
const product = ref({}) // This will hold all product data
const loading = ref(false)
const error = ref(null)

// Add new refs for supporting data
const brands = ref([])
const categories = ref([])
const currencies = ref([]) // Use currencies to filter activeCurrencies
const activeCurrencies = computed(() => currencies.value.filter(c => !c.is_deleted))
const countries = ref([])
const parentProducts = ref([])
const units = ref([])
const attributes = ref([])
const mainIngredientsList = ref([]) // New ref for main ingredients

const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (typeof imgPath === 'object' && imgPath.url) return imgPath.url;
  if (imgPath.startsWith('http')) return imgPath;
  return `${BASE_URL}/public/storage/${imgPath}`;
}

// Helper for localized names
const getLocalizedAttributeName = (attribute) => {
  const lang = localStorage.getItem('lang') || 'en'
  if (!attribute) return ''
  return lang === 'ar'
    ? (attribute.name_ar || attribute.name_en || '')
    : (attribute.name_en || attribute.name_ar || '')
}

const getLocalizedIngredientName = (ingredient) => {
  const lang = localStorage.getItem('lang') || 'en'
  if (!ingredient) return ''
  return lang === 'ar'
    ? (ingredient.name_ar || ingredient.name_en || '')
    : (ingredient.name_en || ingredient.name_ar || '')
}

const getLocalizedFragranceNoteName = (note) => {
  const lang = localStorage.getItem('lang') || 'en'
  if (!note) return ''
  return lang === 'ar'
    ? (note.name_ar || note.name_en || '')
    : (note.name_en || note.name_ar || '')
}

const getLocalizedFragranceNoteDescription = (note) => {
  const lang = localStorage.getItem('lang') || 'en'
  if (!note) return ''
  return lang === 'ar'
    ? (note.description_ar || note.description_en || '')
    : (note.description_en || note.description_ar || '')
}

const getLocalizedUnitName = (unitId) => {
  const unit = units.value.find(u => u.id === unitId)
  if (!unit) return ''
  const lang = localStorage.getItem('lang') || 'en'
  return lang === 'ar' ? unit.name_ar : unit.name_en
}

const isPercentageValue = (value) => {
  return typeof value === 'string' && value.includes('%')
}

const getPercentageValue = (value) => {
  if (!value || !isPercentageValue(value)) return 0
  return parseFloat(value.replace('%', '')) || 0
}

const getAttribute = (attributeId) => attributes.value.find(attr => attr.id === attributeId)

// Inject dynamic value into SVG icons
const injectValueIntoIcon = (iconSvg, value) => {
  if (!iconSvg) return ''
  let modifiedSvg = iconSvg
  const defsMatch = modifiedSvg.match(/<defs[^>]*>([\s\S]*?)<\/defs>/)
  let existingDefsContent = defsMatch ? defsMatch[1] : ''
  const isPct = typeof value === 'string' && value.includes('%')
  const numericValue = isPct ? parseFloat(value.replace('%', '')) : null
  if (isPct && numericValue !== null && !isNaN(numericValue)) {
    const offset = Math.max(0, Math.min(1, numericValue / 100))
    const linearGradientMatch = existingDefsContent.match(/<linearGradient id="(g[0-9]+)"[^>]*>([\s\S]*?)<\/linearGradient>/)
    if (linearGradientMatch) {
      const gradientId = linearGradientMatch[1]
      let gradientContent = linearGradientMatch[2]
      gradientContent = gradientContent.replace(/<stop offset="[^"]*"([^>]*)>/g, () => {
        return `<stop offset="${offset}" stop-color="#78D6F0"/>` + `<stop offset="${offset}" stop-color="#8D8D8D" stop-opacity="0.2"/>`
      })
      const newLinearGradient = `<linearGradient id="${gradientId}"${linearGradientMatch[0].split(gradientId)[1].split('>')[0]}>${gradientContent}</linearGradient>`
      existingDefsContent = existingDefsContent.replace(linearGradientMatch[0], newLinearGradient)
      if (modifiedSvg.includes('fill="') && !modifiedSvg.includes(`fill="url(#${gradientId})"`)) {
        modifiedSvg = modifiedSvg.replace(/fill="[^"]*"/g, `fill="url(#${gradientId})"`)
      }
      if (modifiedSvg.includes('stroke="') && !modifiedSvg.includes(`stroke="url(#${gradientId})"`)) {
        modifiedSvg = modifiedSvg.replace(/stroke="[^"]*"/g, `stroke="url(#${gradientId})" stroke-width="2"`)
      }
    } else {
      const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`
      const gradientDef = `
      <linearGradient id="${gradientId}" x1="0%" y1="100%" x2="0%" y2="0%" gradientUnits="userSpaceOnUse">
        <stop offset="${offset}" stop-color="#78D6F0"/>
        <stop offset="${offset}" stop-color="#8D8D8D" stop-opacity="0.2"/>
      </linearGradient>
    `
      existingDefsContent += gradientDef
      if (modifiedSvg.includes('fill="')) {
        modifiedSvg = modifiedSvg.replace(/fill="[^"]*"/g, `fill="url(#${gradientId})"`)
      }
      if (modifiedSvg.includes('stroke="')) {
        modifiedSvg = modifiedSvg.replace(/stroke="[^"]*"/g, `stroke="url(#${gradientId})" stroke-width="2"`)
      }
    }
    if (defsMatch) {
      modifiedSvg = modifiedSvg.replace(defsMatch[0], `<defs>${existingDefsContent}</defs>`)
    } else {
      const svgTagMatch = modifiedSvg.match(/<svg[^>]*>/)
      if (svgTagMatch) {
        modifiedSvg = modifiedSvg.replace(svgTagMatch[0], `${svgTagMatch[0]}<defs>${existingDefsContent}</defs>`)
      }
    }
  }
  const closingTagIndex = modifiedSvg.lastIndexOf('</svg>')
  if (closingTagIndex !== -1 && value) {
    return (
      modifiedSvg.substring(0, closingTagIndex) +
      `<text x="50%" y="50%" font-size="16" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#333333" stroke="white" stroke-width="1">${value}</text>` +
      modifiedSvg.substring(closingTagIndex)
    )
  }
  return modifiedSvg
}

// Computed properties for display
const selectedBrandName = computed(() => {
  const lang = localStorage.getItem('lang') || 'en'

  // ✅ First check if product already includes brand object
  if (product.value.brand) {
    return lang === 'ar'
      ? product.value.brand.name_ar || product.value.brand.name_en || 'N/A'
      : product.value.brand.name_en || product.value.brand.name_ar || 'N/A'
  }

  // ✅ Otherwise, check in the fetched brands list
  const brand = brands.value.find(b => b.id === product.value.brand_id)
  return brand
    ? (lang === 'ar' ? brand.name_ar : brand.name_en)
    : 'N/A'
})

const selectedCategoryName = computed(() => {
  const lang = localStorage.getItem('lang') || 'en';
  let category = categories.value.find(c => c.id === product.value.category_id);

  // Fallback to parent's category
  if (!category && product.value.parent && product.value.parent.category) {
    category = product.value.parent.category;
  }

  return category
    ? (lang === 'ar' ? category.name_ar || category.name_en : category.name_en || category.name_ar)
    : 'N/A';
});

const selectedCurrencyLabel = computed(() => {
  const lang = localStorage.getItem('lang') || 'en';
  let currency = activeCurrencies.value.find(c => c.id === product.value.currency_id);

  // Fallback to parent's currency
  if (!currency && product.value.parent && product.value.parent.currency) {
    currency = product.value.parent.currency;
  }

  return currency
    ? (lang === 'ar' ? currency.name_ar || currency.name_en : currency.name_en || currency.name_ar)
    : 'N/A';
});

const selectedCountryName = computed(() => {
  const lang = localStorage.getItem('lang') || 'en';
  let country = countries.value.find(c => c.id === product.value.country_id);

  // Fallback to parent's country_id
  if (!country && product.value.parent && product.value.parent.country_id) {
    country = countries.value.find(c => c.id === product.value.parent.country_id);
  }

  return country
    ? (lang === 'ar' ? country.name_ar || country.name_en : country.name_en || country.name_ar)
    : 'N/A';
});

const selectedParentProductName = computed(() => {
  const parent = product.value.parent;
  if (!parent) return 'None';
  const lang = localStorage.getItem('lang') || 'en';
  return lang === 'ar' ? parent.name_ar || parent.name_en : parent.name_en || parent.name_ar;
});

const productBrandImage = computed(() => {
  let brand = brands.value.find(b => b.id === product.value.brand_id);

  // Fallback to parent's brand if not found
  if (!brand && product.value.parent && product.value.parent.brand) {
    brand = product.value.parent.brand;
  }

  return brand && brand.images && brand.images.length > 0
    ? getImageUrl(brand.images[0].path)
    : null;
});

// Base URL for API and images

const BASE_URL = 'https://backend.msgperfumes.com'

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

    const { id } = route.params
    const [productRes, catRes, currRes, couRes, brandRes, unitRes, attrRes, ingRes, parentRes] = await Promise.all([
      axios.get(`${API_URL}/${id}`),
      axios.get(`${BASE_URL}/api/categories`),
      axios.get(`${BASE_URL}/api/website/currencies`),
      axios.get(`${BASE_URL}/api/countries`),
      axios.get(`${BASE_URL}/api/brands`),
      axios.get(`${BASE_URL}/api/units`),
      axios.get(`${BASE_URL}/api/attributes`),
      axios.get(`${BASE_URL}/api/main-ingredients`),
      axios.get(`${BASE_URL}/api/products`),
    ])

    // Populate refs with fetched data
    categories.value = catRes.data.data
    currencies.value = currRes.data.data
    countries.value = couRes.data.data
    brands.value = brandRes.data.data.map(b => ({
      ...b,
      logo_path: b.images && b.images.length > 0 ? b.images[0].path : null
    }));
    units.value = unitRes.data.data
    attributes.value = attrRes.data.data || []
    // Main ingredients from API might be an array directly or nested in `data`
    mainIngredientsList.value = Array.isArray(ingRes.data) ? ingRes.data : (ingRes.data?.data || [])
    parentProducts.value = parentRes.data.data

    if (productRes.data.status) {
      product.value = productRes.data.data

      // Combine direct attributes and parent attributes_with_values for product.value.all_attributes
      let allAttributes = [];
      if (Array.isArray(product.value.attributes)) {
        allAttributes = allAttributes.concat(product.value.attributes);
      }
      if (product.value.parent && Array.isArray(product.value.parent.attributes_with_values)) {
        const existingAttributeIds = new Set(allAttributes.map(attr => attr.id));
        const parentAttributesToAdd = product.value.parent.attributes_with_values.filter(
          parentAttr => !existingAttributeIds.has(parentAttr.id)
        );
        allAttributes = allAttributes.concat(parentAttributesToAdd);
      }
      // Attach all_attributes and attribute_values_map to product object for easier access in template
      product.value.all_attributes = allAttributes;
      product.value.attribute_values_map = {};
      allAttributes.forEach(attr => {
        product.value.attribute_values_map[attr.id] = attr.value;
      });

    } else {
      throw new Error(productRes.data.message || 'Failed to fetch product')
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

// Total inventory (sum of inventory_items quantities)
const totalInventory = computed(() => {
  const items = Array.isArray(product.value?.inventory_items) ? product.value.inventory_items : []
  return items.reduce((sum, it) => sum + (Number(it?.quantity) || 0), 0)
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

.attribute-display-container,
.main-ingredient-display-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  margin-bottom: 20px;
}

.attribute-display-item,
.main-ingredient-item {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.attribute-name-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.attribute-icon {
  width: 30px;
  height: 30px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attribute-icon svg {
  width: 100%;
  height: 100%;
}

.attribute-value {
  font-weight: bold;
  color: #333;
}

.main-ingredient-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 10px;
}

.amount-display-item,
.fragrance-note-display-item {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1em;
}

.image-preview-list img {
  border: 1px solid #dcdfe6; /* Add a subtle border */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add a subtle shadow */
  transition: all 0.2s ease-in-out;
}

.image-preview-list img:hover {
  transform: scale(1.05); /* Slight zoom on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Enhanced shadow on hover */
}
</style>