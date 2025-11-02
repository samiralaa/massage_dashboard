<template>
  <div class="product-edit-container">
    <el-card class="product-card" v-loading="loading"> <!-- Add v-loading directive -->
      <h2>{{ $t('Products.EditProduct') }}</h2>

      <el-form :model="form" ref="formRef" :rules="rules" label-width="120px" enctype="multipart/form-data">
        <!-- Name EN -->
        <el-form-item :label="$t('Products.NameEn')" prop="name_en">
          <el-input v-model="form.name_en" :placeholder="$t('Products.NameEn')" />
        </el-form-item>

        <!-- Name AR -->
        <el-form-item :label="$t('Products.NameAr')" prop="name_ar">
          <el-input v-model="form.name_ar" :placeholder="$t('Products.NameAr')" />
        </el-form-item>

       

        <template v-if="form.amounts">
          
          <div v-for="(amount, index) in form.amounts" :key="index" class="amount-entry mb-3">
            <el-divider content-position="left">{{ $t('Products.Amount-Info') }}</el-divider>
            <el-row :gutter="20"> <!-- Add el-row for amount fields -->
              <el-col :span="8">
            <el-form-item :label="$t('Products.Unit')" :prop="`amounts.${index}.unit_id`">
              <el-select v-model="amount.unit_id" :placeholder="$t('Products.select-unit')" filterable clearable>
                <el-option v-for="unit in units" :key="unit.id" :label="unit.name_en" :value="unit.id" />
              </el-select>
            </el-form-item>
              </el-col>
              <el-col :span="8">
            <el-form-item :label="$t('Products.Weight')" :prop="`amounts.${index}.weight`">
                  <el-input v-model="amount.weight" type="number" :min="1" :placeholder="$t('Products.Weight')" />
            </el-form-item>
              </el-col>
              <el-col :span="8">
            <el-form-item :label="$t('Products.amount-Price')" :prop="`amounts.${index}.price`">
                  <el-input v-model="amount.price" type="number" :min="1" :placeholder="$t('Products.amount-Price')" />
            </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="button-row">
              <el-col :span="24">
            <el-button type="danger" @click="removeAmount(index)" icon="el-icon-delete" v-if="form.amounts.length > 0">{{ $t('Products.RemoveAmount')
            }}</el-button>
            <el-button type="success" plain @click="addAmount" icon="el-icon-plus" v-if="form.amounts.length > 0">{{ $t('Products.AddAmount')
            }}</el-button>
              </el-col>
            </el-row>
          </div>
          
        </template>

        <!-- Attributes -->
        <el-divider content-position="left">{{ $t('Products.Attributes') }}</el-divider>
        <div v-for="(attribute, index) in form.attributes" :key="index" class="attribute-entry mb-3">
          <el-row :gutter="20"> <!-- Add el-row for attribute fields -->
            <el-col :span="8">
              <el-form-item :label="`Attribute Name EN ${index + 1}`" :prop="`attributes.${index}.name_en`">
                <el-input v-model="attribute.name_en" :placeholder="$t('Products.NameEn')" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`Attribute Name AR ${index + 1}`" :prop="`attributes.${index}.name_ar`">
                <el-input v-model="attribute.name_ar" :placeholder="$t('Products.NameAr')" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`Attribute Value ${index + 1}`" :prop="`attributes.${index}.value`">
                <el-input v-model="attribute.value" :placeholder="$t('Products.Value')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="button-row">
            <el-col :span="24">
              <el-button type="danger" @click="removeAttribute(index)">{{ $t('Products.RemoveAttribute') }}</el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" @click="addAttribute">{{ $t('Products.AddAttribute') }}</el-button>

        <!-- Main Ingredients -->
        <template v-if="form.main_ingredients.length > 0">
          <el-divider content-position="left">{{ $t('Products.MainIngredients') }}</el-divider>
          <div v-for="(ingredient, index) in form.main_ingredients" :key="index" class="ingredient-entry mb-3">
            <el-row :gutter="20"> <!-- Add el-row for main ingredient fields -->
              <el-col :span="12">
                <el-form-item :label="`Main Ingredient Name EN ${index + 1}`" :prop="`main_ingredients.${index}.name_en`">
                  <el-input v-model="ingredient.name_en" :placeholder="$t('Products.NameEn')" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="`Main Ingredient Name AR ${index + 1}`" :prop="`main_ingredients.${index}.name_ar`">
                  <el-input v-model="ingredient.name_ar" :placeholder="$t('Products.NameAr')" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- Main Ingredient Image Upload -->
            <el-row :gutter="20"> <!-- Add el-row for image upload -->
              <el-col :span="24">
                <div v-if="ingredient.images && ingredient.images.length" class="image-preview-list" style="margin-bottom: 1em;">
                  <img v-for="(img, imgIdx) in ingredient.images" :key="imgIdx" :src="img.url ? img.url : getImageUrl(img.path)"
                    alt="Main Ingredient Image" style="max-width: 120px; max-height: 120px; margin-right: 10px; border-radius: 8px;" />
                </div>
                <el-form-item :label="$t('Products.Images')" :prop="`main_ingredients.${index}.images`">
                  <el-upload class="upload-demo" drag action="" :auto-upload="false" :limit="1" :file-list="ingredient.images"
                    list-type="picture" :on-change="(file, fileList) => handleMainIngredientFileChange(file, fileList, index)"
                    :on-remove="(file, fileList) => handleMainIngredientRemove(file, fileList, index)">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">{{ $t('Products.DropFiles') }}</div>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20" class="button-row">
              <el-col :span="24">
                <el-button type="danger" @click="removeMainIngredient(index)">{{ $t('Products.RemoveMainIngredient') }}</el-button>
              </el-col>
            </el-row>
          </div>
        </template>
        <el-button type="primary" @click="addMainIngredient">{{ $t('Products.AddMainIngredient') }}</el-button>

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


        <el-form-item :label="$t('Products.discount')" prop="discount.value">
          <el-switch v-model="form.discount.is_active" active-text="Yes" inactive-text="No" />
        </el-form-item>

        <template v-if="form.discount && form.discount.is_active">
          <div class="amount-entry mb-3">
            <el-divider content-position="left">{{ $t('Products.discountInfo') }}</el-divider>


            <template v-if="form.discount.is_active">
              <el-form-item :label="$t('Products.Discount-Value')" prop="discount.value">
                <el-input-number v-model="form.discount.value" type="number"     :min="1" :max="99" :placeholder="$t('Products.Discount-Value')" />
              </el-form-item>

              <el-form-item :label="$t('Products.Start-Date')" prop="discount.startDate">
                <el-date-picker
                  v-model="form.discount.startDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :placeholder="$t('Products.Start-Date')"
                  style="width: 100%;"
                />
              </el-form-item>

              <el-form-item :label="$t('Products.End-Date')" prop="discount.endDate">
                <el-date-picker
                  v-model="form.discount.endDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :placeholder="$t('Products.End-Date')"
                  style="width: 100%;"

                  
                />
              </el-form-item>

              <el-button
                type="danger"
                icon="el-icon-delete"
                v-if="form.discount.value"
                @click="removeDiscount"
              >
                {{ $t('Products.removeDiscount') }}
              </el-button>
              <el-divider />
            </template>
          </div>
        </template>


         <!-- Toggle for Amount -->
        <el-form-item v-if="!form.amounts.length > 0" :label="$t('Products.Needs-Amount')">
          <el-switch v-model="form.amount_required" active-text="Yes" inactive-text="No" dir="ltr" class="mx-3" />
        </el-form-item>

        <template v-if="form.amount_required">
          <el-divider content-position="left">{{ $t('Products.Amount-Info') }}</el-divider>

          <!-- Unit -->
          <el-form-item :label="$t('Products.Unit')" prop="unit_id">
            <el-select v-model="form.unit_id" :placeholder="$t('Products.select-unit')" filterable clearable>
              <el-option v-for="unit in units" :key="unit.id" :label="unit.name_en" :value="unit.id" />
            </el-select>
          </el-form-item>

          <!-- Weight -->
          <el-form-item :label="$t('Products.Weight')" prop="weight">
            <el-input-number v-model="form.weight" type="number" :min="1"  :placeholder="$t('Products.select-weight')" />
          </el-form-item>

          <!-- Amount Price -->
          <el-form-item :label="$t('Products.amount-Price')" prop="amount_price">
            <el-input-number  v-model="form.amount_price" type="number" :min="1" :placeholder="$t('Products.select-price')" />
          </el-form-item>
        </template>

        <!-- Price -->
        <el-form-item v-if="!form.amounts" :label="$t('Products.Price')" prop="price">
          <el-input v-model="form.price" type="number" :min="1" :placeholder="$t('Products.Price')" />
        </el-form-item>

        <!-- Availability -->
        <el-form-item :label="$t('Products.Availability')" prop="is_available">
          <el-switch v-model="form.is_available" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <!-- Descriptions -->
        <el-form-item :label="$t('Products.DescriptionEn')" prop="description_en">
          <el-input type="textarea" v-model="form.description_en" :placeholder="$t('Products.DescriptionEn')" />
        </el-form-item>
        <el-form-item :label="$t('Products.DescriptionAr')" prop="description_ar">
          <el-input type="textarea" v-model="form.description_ar" :placeholder="$t('Products.DescriptionAr')" />
        </el-form-item>

        <!-- Selects -->
    

        <el-form-item :label="$t('Products.brand')" prop="brand_id">
          <el-select v-model="form.brand_id" filterable clearable :placeholder="$t('Products.SelectBrand')">
            <el-option v-for="brand in brands" :key="brand.id" :label="brand.name_en" :value="brand.id" />
          </el-select>
          <span class="current-value">{{ $t('Products.Current') }}: {{ selectedBrandName }}</span>
        </el-form-item>

            <el-form-item :label="$t('Products.Category')" prop="category_id">
          <el-select v-model="form.category_id" filterable clearable   :placeholder="$t('Products.SelectCategory')">
            <el-option v-for="cat in categories" :key="cat.id"  :label="cat.name_en || cat.name_ar" :value="cat.id" />
          </el-select>
          <span class="current-value">{{ $t('Products.Current') }}: {{ selectedCategoryName }}</span>
        </el-form-item>

        <el-form-item :label="$t('Products.Currency')" prop="currency_id">
          <el-select v-model="form.currency_id" filterable clearable  :placeholder="$t('Products.SelectCurrency')">
            <el-option v-for="curr in activeCurrencies" :key="curr.id" :label="getCurrencyLabel(curr)"
              :value="curr.id" />
          </el-select>
          <span class="current-value">{{ $t('Products.Current') }}: {{ selectedCurrencyLabel }}</span>
        </el-form-item>

        <el-form-item :label="$t('Products.Country')" prop="country_id">
          <el-select v-model="form.country_id" filterable clearable :placeholder="$t('Products.SelectCountry')">
            <el-option v-for="country in countries" :key="country.id" :label="country.name_en || country.name_ar"
              :value="country.id" />
          </el-select>
          <span class="current-value">{{ $t('Products.Current') }}: {{ selectedCountryName }}</span>
        </el-form-item>

        <el-form-item :label="$t('Products.ParentProduct')" prop="parent_id">
          <el-select v-model="form.parent_id" clearable :placeholder="$t('Products.SelectParentProduct')">
            <el-option :label="$t('Products.None')" :value="null" />
            <el-option v-for="parent in parentProducts" :key="parent.id" :label="parent.name_en" :value="parent.id" />
          </el-select>
          <span class="current-value">{{ $t('Products.Current') }}: {{ selectedParentProductName }}</span>
        </el-form-item>

        <!-- Image Upload -->
        <div v-if="form.images && form.images.length" class="image-preview-list" style="margin-bottom: 1em;">
          <img v-for="(img, idx) in form.images" :key="idx" :src="img.url ? img.url : getImageUrl(img.path)"
            alt="Product Image" style="max-width: 120px; max-height: 120px; margin-right: 10px; border-radius: 8px;" />
        </div>
        <el-form-item :label="$t('Products.Images')" prop="images">
          <el-upload class="upload-demo  " drag action="" :auto-upload="false" :limit="5" :file-list="form.images"
            list-type="picture" :on-change="handleFileChange" :on-remove="handleRemove">
            <i class="el-icon-upload "></i>
            <div class="el-upload__text ">{{ $t('Products.DropFiles') }}</div>
          </el-upload>
        </el-form-item>

        <!-- Submit Button -->
        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ $t('Products.UpdateButton') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ElLoading } from 'element-plus' // Import ElLoading
import { ElMessageBox } from 'element-plus' // Import ElMessageBox

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const BASE_URL = 'https://massagebackend.webenia.org'
const productId = route.params.id
const loading = ref(false) // Add loading state

const form = ref({
  name_en: '',
  name_ar: '',
  price: '',
  is_available: 1,
  description_en: '',
  description_ar: '',
  category_ar: '',
  category_en: '',
  category_id: null,
  currency_id: null,
  country_id: null,
  parent_id: null,
  brand_id: null,
  images: [],
  amount_required: false,
  amounts: [], // 👈 important
  unit_id: null,
  weight: null,
  amount_price: null,
  discount: {
    id: null,
    value: null,
    startDate: null,
    endDate: null,
    is_active: false
  },
  attributes: [], // Add this line
  main_ingredients: [], // Add this line
  fragrance_notes: [], // Add this line
})
const addAmount = () => {
  form.value.amounts.push({
    unit_id: null,
    weight: null,
    price: null
  })
}

const removeAmount = (index) => {
  if (form.value.amounts.length <= 1) {
    ElMessage.warning(localStorage.getItem('lang') === 'ar' ? 'يجب عليك حفظ كمية واحدة على الاقل' : 'At least one amount entry is required.')
    return ;
  }
  ElMessageBox.confirm(
    localStorage.getItem('lang') === 'ar' ? 'سيتم حذف الكمية' : 'The amount will be deleted',
    'Warning',
    {
      confirmButtonText: localStorage.getItem('lang') === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: localStorage.getItem('lang') === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
   form.value.amounts.splice(index, 1)
    ElMessage.success(
      localStorage.getItem('lang') === 'ar' ? 'تم حذف الكمية بنجاح' : 'Amount deleted successfully'
    )
  }).catch(() => {
    ElMessage.info(
      localStorage.getItem('lang') === 'ar' ? 'تم إلغاء الحذف' : 'Delete cancelled'
    )
  })
}
const rules = {
  name_en: [{ required: true, message: 'Required', trigger: 'blur' }],
  price: [{ required: true, message: 'Required', trigger: 'blur' }],
  ['discount.endDate']: [{ required: true, message: 'Required', trigger: 'blur' }],
  ['discount.startDate']: [{ required: true, message: 'Required', trigger: 'blur' }],

}

const categories = ref([])
const currencies = ref([])
const countries = ref([])
const parentProducts = ref([])
const brands = ref([])
const units = ref([])

const getCurrencyLabel = (currency) => (localStorage.getItem('lang') || 'en') === 'ar' ? currency.name_ar : currency.name_en
const activeCurrencies = computed(() => currencies.value.filter(c => !c.is_deleted))

// Computed property for selected brand name
const selectedBrandName = computed(() => {
  const brand = brands.value.find(b => b.id === form.value.brand_id);
  return brand ? ((localStorage.getItem('lang') || 'en') === 'ar' ? brand.name_ar : brand.name_en) : 'N/A';
});

// Computed property for selected category name
const selectedCategoryName = computed(() => {
  const category = categories.value.find(c => c.id === form.value.category_id);
  return category ? ((localStorage.getItem('lang') || 'en') === 'ar' ? category.name_ar : category.name_en) : 'N/A';
});

// Computed property for selected currency label
const selectedCurrencyLabel = computed(() => {
  const currency = activeCurrencies.value.find(c => c.id === form.value.currency_id);
  return currency ? getCurrencyLabel(currency) : 'N/A';
});

// Computed property for selected country name
const selectedCountryName = computed(() => {
  const country = countries.value.find(c => c.id === form.value.country_id);
  return country ? ((localStorage.getItem('lang') || 'en') === 'ar' ? country.name_ar : country.name_en) : 'N/A';
});

// Computed property for selected parent product name
const selectedParentProductName = computed(() => {
  if (!form.value.parent_id) return 'None';
  const parentProduct = parentProducts.value.find(p => p.id === form.value.parent_id);
  return parentProduct ? parentProduct.name_en : 'N/A';
});

const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (typeof imgPath === 'object' && imgPath.url) return imgPath.url;
  if (imgPath.startsWith('http')) return imgPath;
  return `${BASE_URL}/public/storage/${imgPath}`;
}

const fetchOptions = async () => {
  const token = JSON.parse(localStorage.getItem('tokenData'))?.token
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  loading.value = true; // Set loading to true
  try {
  const [cat, cur, cou, parents, brand, unit] = await Promise.all([
      form.value.brand_id
      ? axios.get(`${BASE_URL}/api/brands/${form.value.brand_id}/categories`)
      : axios.get(`${BASE_URL}/api/categories`),
    axios.get(`${BASE_URL}/api/website/currencies`), // Updated endpoint
    axios.get(`${BASE_URL}/api/countries`),
    axios.get(`${BASE_URL}/api/products`),
    axios.get(`${BASE_URL}/api/brands`),
    axios.get(`${BASE_URL}/api/units`),
  ])
  categories.value = cat.data.data
  console.log('Categories:', categories.value);
  
  currencies.value = cur.data.data; // Changed from cur.data to cur.data.data
  countries.value = cou.data.data
  parentProducts.value = parents.data.data
  brands.value = brand.data.data
  units.value = unit.data.data
  } catch (error) {
    console.error('Error fetching options', error); // Added error logging
  } finally {
    loading.value = false; // Set loading to false
  }
}

const fetchProduct = async () => {
  loading.value = true; // Set loading to true
  try {
    const productRes = await axios.get(`/api/products/${productId}`);
    const product = productRes.data.data;
    console.log(product);
    
    // Fill form with existing product data
    form.value.name_ar = product.name_ar;
    form.value.name_en = product.name_en;
    form.value.description_ar = product.description_ar;
    form.value.description_en = product.description_en;
    form.value.price = product.price;
    form.value.category_ar = product.category?.name_ar; // Safely access name_ar
    form.value.category_en = product.category?.name_en; // Safely access name_en
    form.value.currency_id = product.currency_id;
    form.value.country_id = product.country_id;
    form.value.brand_id = product.brand_id;
    form.value.parent_id = product.parent_id;
    form.value.quantity = product.quantity ?? 1;
    form.value.amounts = product.amounts?.map(a => ({
      unit_id: a.unit_id,
      weight: a.weight,
      price: a.price,
      id: a.id // لو احتجت ID في التعديل
    })) || [];

    form.value.type = product.type ?? 'product';
    form.value.offer = product.discount ? '1' : '0';
    form.value.offer_price = product.discount ? product.discounted_price : '';
    form.value.category_id = product.category_id;
    form.value.images = product.images.map(img => ({
      id: img.id,
      path: img.path,
      url: getImageUrl(img.path)
    }))
    form.value.discount = product.discount
      ? {
          id: product.discount.id,
          value: parseFloat(product.discount.discount_value),
          startDate: product.discount.start_date?.split('T')[0],
          endDate: product.discount.end_date?.split('T')[0],
          is_active: product.discount.is_active,
        }
      : {
          id: null,
          value: null,
          startDate: null,
          endDate: null,
          is_active: false
        };

    form.value.attributes = product.attributes?.map(attr => ({
      name_en: attr.name_en,
      name_ar: attr.name_ar,
      value: attr.value,
      id: attr.id // Add this line to capture attribute ID
    })) || [];

    form.value.main_ingredients = product.main_ingredients?.map(ing => ({
      name_en: ing.name_en,
      name_ar: ing.name_ar,
      id: ing.id, // Add this line to capture main ingredient ID
      images: ing.images.map(img => ({ // Add this section to map images
        id: img.id,
        path: img.path,
        url: getImageUrl(img.path)
      })) || []
    })) || [];

    form.value.fragrance_notes = product.fragrance_notes?.map(note => ({
      name_en: note.name_en,
      name_ar: note.name_ar,
      description_en: note.description_en,
      description_ar: note.description_ar,
      id: note.id // Add this line to capture fragrance note ID
    })) || [];


    // Fetch categories, currencies, and brands
    const [catRes, currRes, brandRes] = await Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/website/currencies'), // Updated endpoint
      axios.get('/api/brands'),
    ]);
    categories.value = catRes.data.data;
    currencies.value = currRes.data.data; // Changed from currRes.data to currRes.data.data
    brands.value = brandRes.data.data; // <-- FIXED LINE
  } catch (error) {
    console.error('Error loading product data', error);
  } finally {
    loading.value = false; // Set loading to false
  }
}

const handleFileChange = (file, fileList) => (form.value.images = fileList)
const handleRemove = (file, fileList) => (form.value.images = fileList)

const handleMainIngredientFileChange = (file, fileList, index) => {
  form.value.main_ingredients[index].images = fileList;
};

const handleMainIngredientRemove = (file, fileList, index) => {
  form.value.main_ingredients[index].images = fileList;
};

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const formData = new FormData()
    for (const key in form.value) {
      if (key !== 'images' && form.value[key] !== null && key !== 'amounts' && key !== 'attributes' && key !== 'main_ingredients' && key !== 'fragrance_notes' && key !== 'discount') {
        formData.append(key, form.value[key])
      }
    }

    form.value.amounts.forEach((amount, i) => {
      formData.append(`amounts[${i}][unit_id]`, amount.unit_id)
      formData.append(`amounts[${i}][weight]`, amount.weight)
      formData.append(`amounts[${i}][price]`, amount.price)
      if (amount.id) {
        formData.append(`amounts[${i}][id]`, amount.id)
      }
    })
    form.value.images.forEach(img => {
      if (img.raw) {
        // New image file
        formData.append('images[]', img.raw)
      } else if (img.id) {
        // Existing image path: send only the relative path
        formData.append('existing_images[]', img.id)
      }
    })
    if (form.value.discount.value) {
      formData.append('discount[value]', form.value.discount.value)
      formData.append('discount[startDate]', form.value.discount.startDate)
      formData.append('discount[endDate]', form.value.discount.endDate)
      if (form.value.discount.id) {
        formData.append('discount[id]', form.value.discount.id)
      }
    }
    
    form.value.attributes.forEach((attr, i) => {
      formData.append(`attributes[${i}][name_en]`, attr.name_en)
      formData.append(`attributes[${i}][name_ar]`, attr.name_ar)
      formData.append(`attributes[${i}][value]`, attr.value)
      if (attr.id) {
        formData.append(`attributes[${i}][id]`, attr.id)
      }
    })

    form.value.main_ingredients.forEach((ing, i) => {
      formData.append(`main_ingredients[${i}][name_en]`, ing.name_en)
      formData.append(`main_ingredients[${i}][name_ar]`, ing.name_ar)
      if (ing.id) {
        formData.append(`main_ingredients[${i}][id]`, ing.id)
      }
      ing.images.forEach(img => {
        if (img.raw) {
          // New image file
          formData.append(`main_ingredients[${i}][images][]`, img.raw)
        } else if (img.id) {
          // Existing image path: send only the relative path
          formData.append(`main_ingredients[${i}][existing_images][]`, img.id)
        }
      })
    })

    form.value.fragrance_notes.forEach((note, i) => {
      formData.append(`fragrance_notes[${i}][name_en]`, note.name_en)
      formData.append(`fragrance_notes[${i}][name_ar]`, note.name_ar)
      formData.append(`fragrance_notes[${i}][description_en]`, note.description_en)
      formData.append(`fragrance_notes[${i}][description_ar]`, note.description_ar)
      if (note.id) {
        formData.append(`fragrance_notes[${i}][id]`, note.id)
      }
    })
    
    
    loading.value = true; // Set loading to true for submission
    try {
    const token = JSON.parse(localStorage.getItem('tokenData'))?.token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    await axios.post(`${BASE_URL}/api/products/${productId}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    ElMessage.success('Product updated successfully')
    router.push('/products')
    } catch (error) {
      console.error('Error submitting form', error); // Added error logging
      ElMessage.error('Error updating product'); // Display error message
    } finally {
      loading.value = false; // Set loading to false
    }
  })
}

const removeDiscount = () => {
  ElMessageBox.confirm(
    localStorage.getItem('lang') === 'ar' ? 'سيتم حذف الخصم' : 'The discount will be deleted',
    'Warning',
    {
      confirmButtonText: localStorage.getItem('lang') === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: localStorage.getItem('lang') === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
  form.value.discount = {
    id: null,
    value: null,
    startDate: null,
    endDate: null,
    is_active: false
  };
    ElMessage.success(
      localStorage.getItem('lang') === 'ar' ? 'تم حذف الخصم بنجاح' : 'Discount deleted successfully'
    );
  }).catch(() => {
    ElMessage.info(
      localStorage.getItem('lang') === 'ar' ? 'تم إلغاء الحذف' : 'Delete cancelled'
    );
  });
};

const addAttribute = () => {
  form.value.attributes.push({
    name_en: '',
    name_ar: '',
    value: ''
  });
};

const removeAttribute = (index) => {
  if (form.value.attributes.length <= 1) {
    ElMessage.warning(localStorage.getItem('lang') === 'ar' ? 'يجب عليك حفظ خاصية واحدة على الاقل' : 'At least one attribute is required.');
    return;
  }
  ElMessageBox.confirm(
    localStorage.getItem('lang') === 'ar' ? 'سيتم حذف الخاصية' : 'The attribute will be deleted',
    'Warning',
    {
      confirmButtonText: localStorage.getItem('lang') === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: localStorage.getItem('lang') === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    form.value.attributes.splice(index, 1);
    ElMessage.success(
      localStorage.getItem('lang') === 'ar' ? 'تم حذف الخاصية بنجاح' : 'Attribute deleted successfully'
    );
  }).catch(() => {
    ElMessage.info(
      localStorage.getItem('lang') === 'ar' ? 'تم إلغاء الحذف' : 'Delete cancelled'
    );
  });
};

const addMainIngredient = () => {
  form.value.main_ingredients.push({
    name_en: '',
    name_ar: ''
  });
};

const removeMainIngredient = (index) => {
  if (form.value.main_ingredients.length <= 1) {
    ElMessage.warning(localStorage.getItem('lang') === 'ar' ? 'يجب عليك حفظ مكون أساسي واحد على الاقل' : 'At least one main ingredient is required.');
    return;
  }
  ElMessageBox.confirm(
    localStorage.getItem('lang') === 'ar' ? 'سيتم حذف المكون الأساسي' : 'The main ingredient will be deleted',
    'Warning',
    {
      confirmButtonText: localStorage.getItem('lang') === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: localStorage.getItem('lang') === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    form.value.main_ingredients.splice(index, 1);
    ElMessage.success(
      localStorage.getItem('lang') === 'ar' ? 'تم حذف المكون الأساسي بنجاح' : 'Main ingredient deleted successfully'
    );
  }).catch(() => {
    ElMessage.info(
      localStorage.getItem('lang') === 'ar' ? 'تم إلغاء الحذف' : 'Delete cancelled'
    );
  });
};

const addFragranceNote = () => {
  form.value.fragrance_notes.push({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: ''
  });
};

const removeFragranceNote = (index) => {
  if (form.value.fragrance_notes.length <= 1) {
    ElMessage.warning(localStorage.getItem('lang') === 'ar' ? 'يجب عليك حفظ ملاحظة عطرية واحدة على الاقل' : 'At least one fragrance note is required.');
    return;
  }
  ElMessageBox.confirm(
    localStorage.getItem('lang') === 'ar' ? 'سيتم حذف الملاحظة العطرية' : 'The fragrance note will be deleted',
    'Warning',
    {
      confirmButtonText: localStorage.getItem('lang') === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: localStorage.getItem('lang') === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    form.value.fragrance_notes.splice(index, 1);
    ElMessage.success(
      localStorage.getItem('lang') === 'ar' ? 'تم حذف الملاحظة العطرية بنجاح' : 'Fragrance note deleted successfully'
    );
  }).catch(() => {
    ElMessage.info(
      localStorage.getItem('lang') === 'ar' ? 'تم إلغاء الحذف' : 'Delete cancelled'
    );
  });
};


watch(
  () => form.value.brand_id, async (newBrandId) => {
  if (newBrandId) {
    try {
      const res = await axios.get(`${BASE_URL}/api/brands/${newBrandId}/categories`)
      categories.value = res.data.data
      console.log('Categories for brand:', categories.value);
      
      // form.value.category_id = null // Reset selected category
    } catch (error) {
      console.error('Failed to fetch categories for brand', error)
    }
  } else {
    // Optionally, reload all categories if no brand is selected
    const catRes = await axios.get(`${BASE_URL}/api/categories`)
    categories.value = catRes.data.data
    form.value.category_id = null
  }
}
)

onMounted(async() => {
  await fetchProduct()
  fetchOptions()
})
</script>

<style scoped>
.product-edit-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

.product-card {
  padding: 20px;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1em;
}

::v-deep(.el-form-item__label) {
  text-align: start;
  justify-content: flex-start;
  width: 170px !important;
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

/* Styling for el-upload component */
::v-deep(.el-upload-dragger) {
  border: 2px dashed #dcdfe6; /* Custom dashed border */
  border-radius: 6px;
  background-color: #f8f8f8; /* Light background */
  cursor: pointer;
  width: 100%;
  height: 120px; /* Adjust height as needed */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
}

::v-deep(.el-upload-dragger:hover) {
  border-color: #409eff; /* Highlight border on hover */
  color: #409eff;
}

::v-deep(.el-upload-dragger .el-icon-upload) {
  font-size: 40px; /* Larger icon */
  color: #c0c4cc;
  margin-bottom: 10px;
}

::v-deep(.el-upload__text) {
  color: #909399; /* Adjust text color */
  font-size: 14px;
}


/*  [dir="rtl"] .el-switch{
  flex-direction: row-reverse;
}*/
.el-dialog__footer {
  justify-content: end;
  display: flex;
  gap: 12px;
}

::v-deep(.el-upload-list__item) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
    form.value.amounts = product.amounts?.map(a => ({

      unit_id: a.unit_id,

      weight: a.weight,

      price: a.price,

      id: a.id // لو احتجت ID في التعديل

    })) || [];



    form.value.type = product.type ?? 'product';

    form.value.offer = product.discount ? '1' : '0';

    form.value.offer_price = product.discount ? product.discounted_price : '';

    form.value.category_id = product.category_id;

    form.value.images = product.images.map(img => ({

      id: img.id,

      path: img.path,

      url: getImageUrl(img.path)

    }))

    form.value.discount = product.discount

      ? {

          id: product.discount.id,

          value: parseFloat(product.discount.discount_value),

          startDate: product.discount.start_date?.split('T')[0],

          endDate: product.discount.end_date?.split('T')[0],

          is_active: product.discount.is_active,

        }

      : {

          id: null,

          value: null,

          startDate: null,

          endDate: null,

          is_active: false

        };



    form.value.attributes = product.attributes?.map(attr => ({
      name_en: attr.name_en,
      name_ar: attr.name_ar,
      value: attr.value,
      id: attr.id // Add this line to capture attribute ID
    })) || [];

    form.value.main_ingredients = product.main_ingredients?.map(ing => ({
      name_en: ing.name_en,
      name_ar: ing.name_ar,
      id: ing.id, // Add this line to capture main ingredient ID
      images: ing.images.map(img => ({ // Add this section to map images
        id: img.id,
        path: img.path,
        url: getImageUrl(img.path)
      })) || []
    })) || [];



    // Fetch categories, currencies, and brands

    const [catRes, currRes, brandRes] = await Promise.all([

      axios.get('/api/categories'),

      axios.get('/api/website/currencies'), // Updated endpoint
      axios.get('/api/brands'),

    ]);

    categories.value = catRes.data.data;

    currencies.value = currRes.data.data; // Changed from currRes.data to currRes.data.data
    brands.value = brandRes.data.data; // <-- FIXED LINE

  } catch (error) {

    console.error('Error loading product data', error);

  } finally {
    loading.value = false; // Set loading to false
  }

}



const handleFileChange = (file, fileList) => (form.value.images = fileList)

const handleRemove = (file, fileList) => (form.value.images = fileList)


const handleMainIngredientFileChange = (file, fileList, index) => {
  form.value.main_ingredients[index].images = fileList;
};

const handleMainIngredientRemove = (file, fileList, index) => {
  form.value.main_ingredients[index].images = fileList;
};


const submitForm = () => {

  formRef.value.validate(async (valid) => {

    if (!valid) return

    const formData = new FormData()

    for (const key in form.value) {

      if (key !== 'images' && form.value[key] !== null && key !== 'amounts' && key !== 'attributes' && key !== 'main_ingredients' && key !== 'discount') {
        formData.append(key, form.value[key])
      }
    }


    form.value.amounts.forEach((amount, i) => {

      formData.append(`amounts[${i}][unit_id]`, amount.unit_id)

      formData.append(`amounts[${i}][weight]`, amount.weight)

      formData.append(`amounts[${i}][price]`, amount.price)

      if (amount.id) {

        formData.append(`amounts[${i}][id]`, amount.id)

      }

    })

    form.value.images.forEach(img => {

      if (img.raw) {

        // New image file

        formData.append('images[]', img.raw)

      } else if (img.id) {

        // Existing image path: send only the relative path

        formData.append('existing_images[]', img.id)

      }

    })

    if (form.value.discount.value) {

      formData.append('discount[value]', form.value.discount.value)

      formData.append('discount[startDate]', form.value.discount.startDate)

      formData.append('discount[endDate]', form.value.discount.endDate)

      if (form.value.discount.id) {

        formData.append('discount[id]', form.value.discount.id)

      }

    }

    
    form.value.attributes.forEach((attr, i) => {
      formData.append(`attributes[${i}][name_en]`, attr.name_en)
      formData.append(`attributes[${i}][name_ar]`, attr.name_ar)
      formData.append(`attributes[${i}][value]`, attr.value)
      if (attr.id) {
        formData.append(`attributes[${i}][id]`, attr.id)
      }
    })

    form.value.main_ingredients.forEach((ing, i) => {
      formData.append(`main_ingredients[${i}][name_en]`, ing.name_en)
      formData.append(`main_ingredients[${i}][name_ar]`, ing.name_ar)
      if (ing.id) {
        formData.append(`main_ingredients[${i}][id]`, ing.id)
      }
      ing.images.forEach(img => {
        if (img.raw) {
          // New image file
          formData.append(`main_ingredients[${i}][images][]`, img.raw)
        } else if (img.id) {
          // Existing image path: send only the relative path
          formData.append(`main_ingredients[${i}][existing_images][]`, img.id)
        }
      })
    })
    
    
    loading.value = true; // Set loading to true for submission
    try {
    const token = JSON.parse(localStorage.getItem('tokenData'))?.token

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    await axios.post(`${BASE_URL}/api/products/${productId}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })

    ElMessage.success('Product updated successfully')

    router.push('/products')

    } catch (error) {
      console.error('Error submitting form', error); // Added error logging
      ElMessage.error('Error updating product'); // Display error message
    } finally {
      loading.value = false; // Set loading to false
    }
  })

}



const removeDiscount = () => {

  const confirmation = confirm(localStorage.getItem('lang') === 'ar'

    ? 'سيتم حذف الخصم'

    : 'The discount will be deleted');



  if (!confirmation) return;



  form.value.discount = {

    id: null,

    value: null,

    startDate: null,

    endDate: null,

    is_active: false

  };

}


const addAttribute = () => {
  form.value.attributes.push({
    name_en: '',
    name_ar: '',
    value: ''
  });
};

const removeAttribute = (index) => {
  if (form.value.attributes.length <= 1) {
    ElMessage.warning(localStorage.getItem('lang') === 'ar' ? 'يجب عليك حفظ خاصية واحدة على الاقل' : 'At least one attribute is required.');
    return;
  }
  ElMessageBox.confirm(
    localStorage.getItem('lang') === 'ar' ? 'سيتم حذف الخاصية' : 'The attribute will be deleted',
    'Warning',
    {
      confirmButtonText: localStorage.getItem('lang') === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: localStorage.getItem('lang') === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    form.value.attributes.splice(index, 1);
    ElMessage.success(
      localStorage.getItem('lang') === 'ar' ? 'تم حذف الخاصية بنجاح' : 'Attribute deleted successfully'
    );
  }).catch(() => {
    ElMessage.info(
      localStorage.getItem('lang') === 'ar' ? 'تم إلغاء الحذف' : 'Delete cancelled'
    );
  });
};

const addMainIngredient = () => {
  form.value.main_ingredients.push({
    name_en: '',
    name_ar: ''
  });
};

const removeMainIngredient = (index) => {
  if (form.value.main_ingredients.length <= 1) {
    ElMessage.warning(localStorage.getItem('lang') === 'ar' ? 'يجب عليك حفظ مكون أساسي واحد على الاقل' : 'At least one main ingredient is required.');
    return;
  }
  ElMessageBox.confirm(
    localStorage.getItem('lang') === 'ar' ? 'سيتم حذف المكون الأساسي' : 'The main ingredient will be deleted',
    'Warning',
    {
      confirmButtonText: localStorage.getItem('lang') === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: localStorage.getItem('lang') === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    form.value.main_ingredients.splice(index, 1);
    ElMessage.success(
      localStorage.getItem('lang') === 'ar' ? 'تم حذف المكون الأساسي بنجاح' : 'Main ingredient deleted successfully'
    );
  }).catch(() => {
    ElMessage.info(
      localStorage.getItem('lang') === 'ar' ? 'تم إلغاء الحذف' : 'Delete cancelled'
    );
  });
};



watch(

  () => form.value.brand_id, async (newBrandId) => {

  if (newBrandId) {

    try {

      const res = await axios.get(`${BASE_URL}/api/brands/${newBrandId}/categories`)

      categories.value = res.data.data

      console.log('Categories for brand:', categories.value);

      

      // form.value.category_id = null // Reset selected category

    } catch (error) {

      console.error('Failed to fetch categories for brand', error)

    }

  } else {

    // Optionally, reload all categories if no brand is selected

    const catRes = await axios.get(`${BASE_URL}/api/categories`)

    categories.value = catRes.data.data

    form.value.category_id = null

  }

}

)



onMounted(async() => {

  await fetchProduct()

  fetchOptions()

})

</script>



<style scoped>

.product-edit-container {

  max-width: 800px;

  margin: 30px auto;

  padding: 20px;

}



.product-card {

  padding: 20px;

}



.image-preview-list {

  display: flex;

  flex-wrap: wrap;

  margin-bottom: 1em;

}



::v-deep(.el-form-item__label) {

  text-align: start;

  justify-content: flex-start;

  width: 170px !important;

}







/*  [dir="rtl"] .el-switch{

  flex-direction: row-reverse;

}*/

.el-dialog__footer {

  justify-content: end;

  display: flex;

  gap: 12px;

}



::v-deep(.el-upload-list__item) {

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

}

</style>
