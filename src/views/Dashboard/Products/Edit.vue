<template>
  <div class="product-edit-container">
    <el-card class="product-card">
      <h2>{{ $t('Products.EditProduct') }}</h2>

      <el-form :model="form" ref="formRef" :rules="rules" label-width="120px" enctype="multipart/form-data">
        <!-- Name EN -->
        <el-form-item :label="$t('Products.NameEn')" prop="name_en">
          <el-input v-model="form.name_en" />
        </el-form-item>

        <!-- Name AR -->
        <el-form-item :label="$t('Products.NameAr')" prop="name_ar">
          <el-input v-model="form.name_ar" />
        </el-form-item>

       

        <template v-if="form.amounts">
          
          <div v-for="(amount, index) in form.amounts" :key="index" class="amount-entry mb-3">
            <el-divider content-position="left">{{ $t('Products.Amount-Info') }}</el-divider>
            <el-form-item :label="$t('Products.Unit')" :prop="`amounts.${index}.unit_id`">
              <el-select v-model="amount.unit_id" :placeholder="$t('Products.select-unit')" filterable clearable>
                <el-option v-for="unit in units" :key="unit.id" :label="unit.name_en" :value="unit.id" />
              </el-select>
            </el-form-item>

            <el-form-item :label="$t('Products.Weight')" :prop="`amounts.${index}.weight`">
              <el-input v-model="amount.weight" type="number" />
            </el-form-item>

            <el-form-item :label="$t('Products.amount-Price')" :prop="`amounts.${index}.price`">
              <el-input v-model="amount.price" type="number" />
            </el-form-item>

            <el-button type="danger" @click="removeAmount(index)" icon="el-icon-delete" v-if="form.amounts.length > 0">{{ $t('Products.RemoveAmount')
            }}</el-button>
            <el-button type="success" plain @click="addAmount" icon="el-icon-plus" v-if="form.amounts.length > 0">{{ $t('Products.AddAmount')
            }}</el-button>
          </div>
          
        </template>

        <el-form-item :label="$t('Products.discount')" prop="discount.value">
          <el-switch v-model="form.discount.is_active" active-text="Yes" inactive-text="No" />
        </el-form-item>

        <template v-if="form.discount && form.discount.is_active">
          <div class="amount-entry mb-3">
            <el-divider content-position="left">{{ $t('Products.discountInfo') }}</el-divider>


            <template v-if="form.discount.is_active">
              <el-form-item :label="$t('Products.Discount-Value')" prop="discount.value">
                <el-input-number v-model="form.discount.value" type="number"     :min="1" :max="99" />
              </el-form-item>

              <el-form-item :label="$t('Products.Start-Date')" prop="discount.startDate">
                <el-date-picker
                  v-model="form.discount.startDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="Pick start date"
                  style="width: 100%;"
                />
              </el-form-item>

              <el-form-item :label="$t('Products.End-Date')" prop="discount.endDate">
                <el-date-picker
                  v-model="form.discount.endDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="Pick end date"
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
          <el-input v-model="form.price" type="number" />
        </el-form-item>

        <!-- Availability -->
        <el-form-item :label="$t('Products.Availability')" prop="is_available">
          <el-switch v-model="form.is_available" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <!-- Descriptions -->
        <el-form-item :label="$t('Products.DescriptionEn')" prop="description_en">
          <el-input type="textarea" v-model="form.description_en" />
        </el-form-item>
        <el-form-item :label="$t('Products.DescriptionAr')" prop="description_ar">
          <el-input type="textarea" v-model="form.description_ar" />
        </el-form-item>

        <!-- Selects -->
    

        <el-form-item :label="$t('Products.brand')" prop="brand_id">
          <el-select v-model="form.brand_id" filterable clearable placeholder="Select Brand">
            <el-option v-for="brand in brands" :key="brand.id" :label="brand.name_en" :value="brand.id" />
          </el-select>
        </el-form-item>

            <el-form-item :label="$t('Products.Category')" prop="category_id">
          <el-select v-model="form.category_id" filterable clearable   :placeholder="$t('Products.SelectCategory')">
            <el-option v-for="cat in categories" :key="cat.id"  :label="cat.name_en || cat.name_ar" :value="cat.id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('Products.Currency')" prop="currency_id">
          <el-select v-model="form.currency_id" filterable clearable  :placeholder="$t('Products.SelectCurrency')">
            <el-option v-for="curr in activeCurrencies" :key="curr.id" :label="getCurrencyLabel(curr)"
              :value="curr.id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('Products.Country')" prop="country_id">
          <el-select v-model="form.country_id" filterable clearable :placeholder="$t('Products.SelectCountry')">
            <el-option v-for="country in countries" :key="country.id" :label="country.name_en || country.name_ar"
              :value="country.id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('Products.ParentProduct')" prop="parent_id">
          <el-select v-model="form.parent_id" clearable :placeholder="$t('Products.SelectParentProduct')">
            <el-option :label="$t('Products.None')" :value="null" />
            <el-option v-for="parent in parentProducts" :key="parent.id" :label="parent.name_en" :value="parent.id" />
          </el-select>
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

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const BASE_URL = 'https://massagebackend.webenia.org'
const productId = route.params.id

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
  }

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
 const confirmation =  confirm(localStorage.getItem('lang') === 'ar' ? 'سيتم حذف الكمية' : 'The amount will be deleted')
 if (!confirmation) {
    return;
  
 }else{

   form.value.amounts.splice(index, 1)
 }
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

const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (typeof imgPath === 'object' && imgPath.url) return imgPath.url;
  if (imgPath.startsWith('http')) return imgPath;
  return `${BASE_URL}/public/storage/${imgPath}`;
}

const fetchOptions = async () => {
  const token = JSON.parse(localStorage.getItem('tokenData'))?.token
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  const [cat, cur, cou, parents, brand, unit] = await Promise.all([
    axios.get(`${BASE_URL}/api/brands/${form.value.brand_id}/categories`),
    axios.get(`${BASE_URL}/api/currencies`),
    axios.get(`${BASE_URL}/api/countries`),
    axios.get(`${BASE_URL}/api/products`),
    axios.get(`${BASE_URL}/api/brands`),
    axios.get(`${BASE_URL}/api/units`),
  ])
  categories.value = cat.data.data
  console.log('Categories:', categories.value);
  
  currencies.value = cur.data
  countries.value = cou.data.data
  parentProducts.value = parents.data.data
  brands.value = brand.data.data
  units.value = unit.data.data
}

const fetchProduct = async () => {
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
    form.value.category_ar = product.category.name_ar;
    form.value.category_en = product.category.name_en;
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


    // Fetch categories, currencies, and brands
    const [catRes, currRes, brandRes] = await Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/currencies'),
      axios.get('/api/brands'),
    ]);
    categories.value = catRes.data.data;
    currencies.value = currRes.data;
    brands.value = brandRes.data.data; // <-- FIXED LINE
  } catch (error) {
    console.error('Error loading product data', error);
  }
}

const handleFileChange = (file, fileList) => (form.value.images = fileList)
const handleRemove = (file, fileList) => (form.value.images = fileList)

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const formData = new FormData()
    for (const key in form.value) {
      if (key !== 'images' && form.value[key] !== null) formData.append(key, form.value[key])
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
    
    
    const token = JSON.parse(localStorage.getItem('tokenData'))?.token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    await axios.post(`${BASE_URL}/api/products/${productId}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    ElMessage.success('Product updated successfully')
    router.push('/products')
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