<template>
  <div class="product-edit-container">
    <el-card class="product-card" v-loading="loading"> <!-- Add v-loading directive -->
      <h2>{{ $t('Products.EditProduct') }}</h2>

      <el-form :model="form" ref="formRef" :rules="rules" label-width="120px" enctype="multipart/form-data">
        <!-- Existing Main Ingredients (like create) -->
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

        <!-- Attributes select + values (like create) -->
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

        <el-form-item :label="$t('Products.AttributeValues')">
          <div 
            v-for="attributeId in form.attribute_ids" 
            :key="attributeId" 
            class="attribute-value-item">

            <div class="attribute-name">
              <div 
                v-if="getAttribute(attributeId)?.icon" 
                class="attribute-icon" 
                v-html="injectValueIntoIcon(getAttribute(attributeId).icon, form.attribute_values[attributeId])">
              </div>
              <span>{{ getLocalizedAttributeName(getAttribute(attributeId)) || attributeId }}</span>
            </div>

            <div class="attribute-input-container">
              <el-input 
                v-model="form.attribute_values[attributeId]" 
                :placeholder="$t('Products.AttributeValues')"
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

          <div v-if="(form.attribute_ids || []).length === 0" class="no-attributes-message">
            {{ $t('Products.PleaseSelectAttributesFirst') }}
          </div>
        </el-form-item>
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
              <el-col :span="12">
            <el-form-item :label="$t('Products.Unit')" :prop="`amounts.${index}.unit_id`">
              <el-select v-model="amount.unit_id" :placeholder="$t('Products.select-unit')" filterable clearable>
                <el-option v-for="unit in units" :key="unit.id" :label="getUnitLabel(unit)" :value="Number(unit.id)" />
              </el-select>
            </el-form-item>
              </el-col>
              <el-col :span="12">
            <el-form-item :label="$t('Products.Weight')" :prop="`amounts.${index}.weight`">
                  <el-input v-model="amount.weight" type="number" :min="1" :placeholder="$t('Products.Weight')" />
            </el-form-item>
              </el-col>
              <el-col :span="12">
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

        <!-- Optional manual attributes editor (hidden by default to avoid duplication) -->
        <template v-if="showManualAttributes">
          <el-divider content-position="left">{{ $t('Products.Attributes') }}</el-divider>
          <div v-for="(attribute, index) in form.attributes" :key="index" class="attribute-entry">
            <div class="attribute-header">
              <span class="attribute-title">{{ $t('Products.Attributes') }} #{{ index + 1 }}</span>
              <el-button class="attribute-remove" type="danger" text circle :icon="Delete" @click="removeAttribute(index)" />
            </div>
            <el-row :gutter="16" class="attribute-fields">
              <el-col :span="8">
                <el-form-item :label="$t('Products.NameEn')" :prop="`attributes.${index}.name_en`">
                  <el-input v-model="attribute.name_en" :placeholder="$t('Products.NameEn')" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('Products.NameAr')" :prop="`attributes.${index}.name_ar`">
                  <el-input v-model="attribute.name_ar" :placeholder="$t('Products.NameAr')" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('Products.Value')" :prop="`attributes.${index}.value`">
                  <el-input v-model="attribute.value" :placeholder="$t('Products.Value')" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <el-button type="primary" plain @click="addAttribute">{{ $t('Products.AddAttribute') }}</el-button>
        </template>

        <!-- Main Ingredients -->
     
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


        <el-form-item v-if="showDiscountForm" :label="$t('Products.discount')" prop="discount.value">
          <el-switch v-model="form.discount.is_active" active-text="Yes" inactive-text="No" />
        </el-form-item>

        <template v-if="showDiscountForm">
          <div class="amount-entry mb-3">
            <el-divider content-position="left">{{ $t('Products.discountInfo') }}</el-divider>


            <template v-if="showDiscountForm">
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
                v-if="form.discount && (form.discount.value || form.discount.id)"
                @click="removeDiscount"
              >
                {{ $t('Products.removeDiscount') }}
              </el-button>
              <el-divider />
            </template>
          </div>
        </template>


         <!-- Toggle for Amount -->
        <el-form-item v-if="form.amounts.length === 0" :label="$t('Products.Needs-Amount')">
          <el-switch v-model="form.amount_required" active-text="Yes" inactive-text="No" dir="ltr" class="mx-3" />
        </el-form-item>

        <template v-if="form.amount_required">
          <el-divider content-position="left">{{ $t('Products.Amount-Info') }}</el-divider>

          <!-- Unit -->
          <el-form-item :label="$t('Products.Unit')" prop="unit_id">
            <el-select v-model="form.unit_id" :placeholder="$t('Products.select-unit')" filterable clearable>
              <el-option v-for="unit in units" :key="unit.id" :label="getUnitLabel(unit)" :value="Number(unit.id)" />
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

        <!-- Price + converted/discounted display -->
        <el-form-item v-if="!form.amounts || form.amounts.length === 0" :label="$t('Products.Price')" prop="price">
          <el-input v-model="form.price" type="number" :min="1" :placeholder="$t('Products.convertedPrice')" />
          <el-tag v-if="convertedPrice !== null" size="small" effect="plain" class="current-value">Converted: {{ convertedPrice }}</el-tag>
          <el-tag v-if="discountedPrice !== null" size="small" type="success" effect="plain" class="current-value">Discounted: {{ discountedPrice }}</el-tag>
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
          <template v-if="selectedBrandName !== productOnlyBrandName">
            <el-tag size="small" effect="plain" class="current-value">({{$t('Products.Original')}}: {{ productOnlyBrandName }})</el-tag>
          </template>
        </el-form-item>

        <!-- Brand Image Display -->
        <div v-if="productBrandImage || productOnlyBrandImage" class="image-preview-list" style="margin-bottom: 1em;">
          <img v-if="productBrandImage" :src="productBrandImage" alt="Brand Image" style="max-width: 120px; max-height: 120px; margin-right: 10px; border-radius: 8px;" />
          <template v-if="productBrandImage !== productOnlyBrandImage">
            <el-tag size="small" effect="plain" class="current-value">({{$t('Products.Original')}} brand: <img :src="productOnlyBrandImage" alt="Original Brand Image" style="max-width: 40px; max-height: 40px; border-radius: 4px;" />)</el-tag>
          </template>
        </div>


            <el-form-item :label="$t('Products.Category')" prop="category_id">
          <el-select v-model="form.category_id" filterable clearable   :placeholder="$t('Products.SelectCategory')">
            <el-option v-for="cat in categories" :key="cat.id"  :label="cat.name_en || cat.name_ar" :value="cat.id" />
          </el-select>
          <template v-if="selectedCategoryName !== productOnlyCategoryName">
            <el-tag size="small" effect="plain" class="current-value">({{$t('Products.Original')}}: {{ productOnlyCategoryName }})</el-tag>
          </template>
        </el-form-item>

        <el-form-item :label="$t('Products.Currency')" prop="currency_id">
          <el-select v-model="form.currency_id" filterable clearable  :placeholder="$t('Products.SelectCurrency')">
            <el-option v-for="curr in activeCurrencies" :key="curr.id" :label="getCurrencyLabel(curr)"
              :value="curr.id" />
          </el-select>
          <template v-if="selectedCurrencyLabel !== productOnlyCurrencyLabel">
            <el-tag size="small" effect="plain" class="current-value">({{$t('Products.Original')}}: {{ productOnlyCurrencyLabel }})</el-tag>
          </template>
        </el-form-item>

        <el-form-item :label="$t('Products.Country')" prop="country_id">
          <el-select v-model="form.country_id" filterable clearable :placeholder="$t('Products.SelectCountry')">
            <el-option v-for="country in countries" :key="country.id" :label="country.name_en || country.name_ar"
              :value="country.id" />
          </el-select>
          <template v-if="selectedCountryName !== productOnlyCountryName">
            <el-tag size="small" effect="plain" class="current-value">({{$t('Products.Original')}}: {{ productOnlyCountryName }})</el-tag>
          </template>
        </el-form-item>

        <el-form-item :label="$t('Products.ParentProduct')" prop="parent_id">
          <el-select v-model="form.parent_id" clearable :placeholder="$t('Products.SelectParentProduct')">
            <el-option :label="$t('Products.None')" :value="null" />
            <el-option v-for="parent in parentProducts" :key="parent.id" :label="parent.name_en" :value="parent.id" />
          </el-select>
          <template v-if="selectedParentProductName !== productOnlyParentProductName">
            <el-tag size="small" effect="plain" class="current-value">({{$t('Products.Original')}}: {{ productOnlyParentProductName }})</el-tag>
          </template>
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
import { Delete } from '@element-plus/icons-vue'
import { ElLoading } from 'element-plus' // Import ElLoading
import { ElMessageBox } from 'element-plus' // Import ElMessageBox

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const BASE_URL = 'https://backend.msgperfumes.com'
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
  attributes: [],
  main_ingredients: [],
  fragrance_notes: [],
  attribute_ids: [],
  attribute_values: {},
  selected_main_ingredient_ids: [],
})

// Track original (old) IDs to surface previous values inside selects
const originalBrandId = ref(null)
const originalCategoryId = ref(null)
const originalCurrencyId = ref(null)
const originalCountryId = ref(null)
const originalParentId = ref(null)
const addAmount = () => {
  form.value.amounts.push({
    unit_id: null,
    weight: null,
    price: null
  })
}

const removeAmount = (index) => {
  ElMessageBox.confirm(
    localStorage.getItem('lang') === 'ar' ? 'سيتم حذف الكمية' : 'The amount will be deleted',
    'Warning',
    {
      confirmButtonText: localStorage.getItem('lang') === 'ar' ? 'موافق' : 'OK',
      cancelButtonText: localStorage.getItem('lang') === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    const amt = form.value.amounts[index]
    if (amt && amt.id) removedAmountIds.value.push(amt.id)
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
  // discount fields are optional; validated only when shown

}

const categories = ref([])
const currencies = ref([])
const countries = ref([])
const parentProducts = ref([])
const brands = ref([])
const units = ref([])
const attributes = ref([])
const mainIngredientsList = ref([])
const convertedPrice = ref(null)
const discountedPrice = ref(null)
const removedAmountIds = ref([]) // Track amounts removed to delete on backend
const discountDelete = ref(false) // Flag to delete discount
const discountIdToDelete = ref(null) // Preserve discount id for delete payload
const showDiscountForm = ref(false) // Control discount form visibility
const showManualAttributes = ref(false) // Hide manual attributes to avoid duplicate UI

const getCurrencyLabel = (currency) => (localStorage.getItem('lang') || 'en') === 'ar' ? currency.name_ar : currency.name_en
const activeCurrencies = computed(() => currencies.value.filter(c => !c.is_deleted))

const selectedBrandName = computed(() => {

  const lang = localStorage.getItem('lang') || 'en';

  let brand = brands.value.find(b => b.id === form.value.brand_id);



  // If not found, fallback to parent's brand

  if (!brand && form.value.parent && form.value.parent.brand) {

    brand = form.value.parent.brand;

  }



  return brand

    ? (lang === 'ar' ? brand.name_ar || brand.name_en : brand.name_en || brand.name_ar)

    : 'N/A';

});



const selectedCategoryName = computed(() => {

  const lang = localStorage.getItem('lang') || 'en';

  let category = categories.value.find(c => c.id === form.value.category_id);



  // Fallback to parent's category

  if (!category && form.value.parent && form.value.parent.category) {

    category = form.value.parent.category;

  }



  return category

    ? (lang === 'ar' ? category.name_ar || category.name_en : category.name_en || category.name_ar)

    : 'N/A';

});



const selectedCurrencyLabel = computed(() => {

  const lang = localStorage.getItem('lang') || 'en';

  let currency = activeCurrencies.value.find(c => c.id === form.value.currency_id);



  // Fallback to parent's currency

  if (!currency && form.value.parent && form.value.parent.currency) {

    currency = form.value.parent.currency;

  }



  return currency

    ? (lang === 'ar' ? currency.name_ar || currency.name_en : currency.name_en || currency.name_ar)

    : 'N/A';

});



const selectedCountryName = computed(() => {

  const lang = localStorage.getItem('lang') || 'en';

  let country = countries.value.find(c => c.id === form.value.country_id);



  // Fallback to parent's country_id

  if (!country && form.value.parent && form.value.parent.country_id) {

    country = countries.value.find(c => c.id === form.value.parent.country_id);

  }



  return country

    ? (lang === 'ar' ? country.name_ar || country.name_en : country.name_en || country.name_ar)

    : 'N/A';

});



const selectedParentProductName = computed(() => {

  const parent = form.value.parent;

  if (!parent) return 'None';

  const lang = localStorage.getItem('lang') || 'en';

  return lang === 'ar' ? parent.name_ar || parent.name_en : parent.name_en || parent.name_ar;

});



const productBrandImage = computed(() => {

  let brand = brands.value.find(b => b.id === form.value.brand_id);



  // Fallback to parent's brand if not found

  if (!brand && form.value.parent && form.value.parent.brand) {

    brand = form.value.parent.brand;

  }



  return brand && brand.images && brand.images.length > 0

    ? getImageUrl(brand.images[0].path)

    : null;

});

const productOnlyBrandName = computed(() => {
  const lang = localStorage.getItem('lang') || 'en';
  const brand = brands.value.find(b => b.id === form.value.brand_id);
  return brand
    ? (lang === 'ar' ? brand.name_ar || brand.name_en : brand.name_en || brand.name_ar)
    : 'N/A';
});

const productOnlyCategoryName = computed(() => {
  const lang = localStorage.getItem('lang') || 'en';
  const category = categories.value.find(c => c.id === form.value.category_id);
  return category
    ? (lang === 'ar' ? category.name_ar || category.name_en : category.name_en || category.name_ar)
    : 'N/A';
});

const productOnlyCurrencyLabel = computed(() => {
  const lang = localStorage.getItem('lang') || 'en';
  const currency = activeCurrencies.value.find(c => c.id === form.value.currency_id);
  return currency
    ? (lang === 'ar' ? currency.name_ar || currency.name_en : currency.name_en || currency.name_ar)
    : 'N/A';
});

const productOnlyCountryName = computed(() => {
  const lang = localStorage.getItem('lang') || 'en';
  const country = countries.value.find(c => c.id === form.value.country_id);
  return country
    ? (lang === 'ar' ? country.name_ar || country.name_en : country.name_en || country.name_ar)
    : 'N/A';
});

const productOnlyParentProductName = computed(() => {
  const parent = parentProducts.value.find(p => p.id === form.value.parent_id);
  if (!parent) return 'None';
  const lang = localStorage.getItem('lang') || 'en';
  return lang === 'ar' ? parent.name_ar || parent.name_en : parent.name_en || parent.name_ar;
});

const productOnlyBrandImage = computed(() => {
  const brand = brands.value.find(b => b.id === form.value.brand_id);
  return brand && brand.images && brand.images.length > 0
    ? getImageUrl(brand.images[0].path)
    : null;
});

// Helpers to get OLD names by id
const getBrandNameById = (id) => {
  const brand = brands.value.find(b => b.id === id)
  return brand ? ((localStorage.getItem('lang') || 'en') === 'ar' ? brand.name_ar : brand.name_en) : 'N/A'
}
const getCategoryNameById = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? ((localStorage.getItem('lang') || 'en') === 'ar' ? cat.name_ar : cat.name_en) : 'N/A'
}
const getCountryNameById = (id) => {
  const c = countries.value.find(x => x.id === id)
  return c ? ((localStorage.getItem('lang') || 'en') === 'ar' ? c.name_ar : c.name_en) : 'N/A'
}
const getParentNameById = (id) => {
  const p = parentProducts.value.find(x => x.id === id)
  return p ? p.name_en : 'N/A'
}
const getCurrencyLabelById = (id) => {
  const cur = activeCurrencies.value.find(x => x.id === id)
  return cur ? getCurrencyLabel(cur) : 'N/A'
}

const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (typeof imgPath === 'object' && imgPath.url) return imgPath.url;
  if (imgPath.startsWith('http')) return imgPath;
  return `${BASE_URL}/public/storage/${imgPath}`;
}

// Helpers for localized names and attribute value UI
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

const getUnitLabel = (unit) => {
  const lang = localStorage.getItem('lang') || 'en'
  if (!unit) return ''
  return lang === 'ar'
    ? (unit.name_ar || unit.name_en || '')
    : (unit.name_en || unit.name_ar || '')
}

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
const fetchOptions = async () => {
  const token = JSON.parse(localStorage.getItem('tokenData'))?.token
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  loading.value = true; // Set loading to true
  try {
  const [cat, cur, cou, parents, brand, unit, attr, ing] = await Promise.all([
      form.value.brand_id
      ? axios.get(`${BASE_URL}/api/brands/${form.value.brand_id}/categories`)
      : axios.get(`${BASE_URL}/api/categories`),
    axios.get(`${BASE_URL}/api/website/currencies`), // Updated endpoint
    axios.get(`${BASE_URL}/api/countries`),
    axios.get(`${BASE_URL}/api/products`),
    axios.get(`${BASE_URL}/api/brands`),
    axios.get(`${BASE_URL}/api/units`),
    axios.get(`${BASE_URL}/api/attributes`),
    axios.get(`${BASE_URL}/api/main-ingredients`),
  ])
  categories.value = cat.data.data
  console.log('Categories:', categories.value);
  
  currencies.value = cur.data.data; // Changed from cur.data to cur.data.data
  countries.value = cou.data.data
  parentProducts.value = parents.data.data
  brands.value = brand.data.data.map(b => ({
    ...b,
    logo_path: b.images && b.images.length > 0 ? b.images[0].path : null
  }));
  units.value = unit.data.data
  attributes.value = attr.data.data || []
  mainIngredientsList.value = Array.isArray(ing.data) ? ing.data : (ing.data?.data || [])
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
    form.value.brand_id = Number(
      (product.brand && product.brand.id != null ? product.brand.id : (product.brand_id != null ? product.brand_id : (product.parent && (product.parent.brand_id != null || (product.parent.brand && product.parent.brand.id != null)) ? (product.parent.brand_id ?? product.parent.brand.id) : null)))
    ) || null;
    form.value.category_id = Number(
      (product.category && product.category.id != null ? product.category.id : (product.category_id != null ? product.category_id : (product.parent && (product.parent.category_id != null || (product.parent.category && product.parent.category.id != null)) ? (product.parent.category_id ?? product.parent.category.id) : null)))
    ) || null;
    form.value.currency_id = Number(
      (product.currency && product.currency.id != null ? product.currency.id : (product.currency_id != null ? product.currency_id : (product.parent && (product.parent.currency_id != null || (product.parent.currency && product.parent.currency.id != null)) ? (product.parent.currency_id ?? product.parent.currency.id) : null)))
    ) || null;
    form.value.country_id = Number(
      (product.country && product.country.id != null ? product.country.id : (product.country_id != null ? product.country_id : (product.parent && (product.parent.country_id != null || (product.parent.country && product.parent.country.id != null)) ? (product.parent.country_id ?? product.parent.country.id) : null)))
    ) || null;
    form.value.parent_id = Number(product.parent_id != null ? product.parent_id : (product.parent && product.parent.id != null ? product.parent.id : null)) || null;
    // Save originals for showing old values inside selects
    originalCurrencyId.value = product.currency_id;
    originalCountryId.value = product.country_id;
    originalBrandId.value = product.brand_id;
    originalParentId.value = product.parent_id;
    form.value.quantity = product.quantity ?? 1;
    form.value.amounts = product.amounts?.map(a => {
      const unitIdFromObject = a.unit && a.unit.id != null ? Number(a.unit.id) : null
      const unitIdFromField = a.unit_id != null ? Number(a.unit_id) : null
      return {
        unit_id: unitIdFromObject ?? unitIdFromField,
        weight: a.weight,
        price: a.price,
        id: a.id // لو احتجت ID في التعديل
      }
    }) || [];

    if (form.value.amounts.length > 0) {
      form.value.price = form.value.amounts[0]?.price ?? form.value.price;
    }

    form.value.type = product.type ?? 'product';
    form.value.offer = product.discount ? '1' : '0';
    form.value.offer_price = product.discount ? product.discounted_price : '';
    // Ensure category_id is set if not already from above
    if (form.value.category_id == null && (product.category_id != null || (product.category && product.category.id != null))) {
      form.value.category_id = Number(product.category_id != null ? product.category_id : product.category.id);
    }
    originalCategoryId.value = product.category_id;
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
    showDiscountForm.value = !!product.discount

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

    // Combine direct attributes and parent attributes_with_values
    let allAttributes = [];
    if (Array.isArray(product.attributes)) {
      allAttributes = allAttributes.concat(product.attributes);
    }
    if (product.parent && Array.isArray(product.parent.attributes_with_values)) {
      // Ensure we don't duplicate attributes if they exist in both places
      const existingAttributeIds = new Set(allAttributes.map(attr => attr.id));
      const parentAttributesToAdd = product.parent.attributes_with_values.filter(
        parentAttr => !existingAttributeIds.has(parentAttr.id)
      );
      allAttributes = allAttributes.concat(parentAttributesToAdd);
    }

    // Derive attribute_ids and attribute_values for select UI from all combined attributes
    if (Array.isArray(allAttributes) && allAttributes.length > 0) {
      form.value.attribute_ids = allAttributes.map(a => a.id);
      const valuesMap = {};
      allAttributes.forEach(a => {
        valuesMap[a.id] = a.value;
      });
      form.value.attribute_values = valuesMap;
    } else {
      form.value.attribute_ids = [];
      form.value.attribute_values = {};
    }

    // Map selected existing main ingredients by id
    form.value.selected_main_ingredient_ids = (product.main_ingredients || [])
      .filter(mi => mi && mi.id)
      .map(mi => mi.id)

    // Converted / discounted price from API
    convertedPrice.value = product.converted_price ?? null
    discountedPrice.value = product.discounted_price ?? null
    // If there are no amounts, show converted price inside the input
    if ((!Array.isArray(form.value.amounts) || form.value.amounts.length === 0) && convertedPrice.value != null) {
      form.value.price = Number(convertedPrice.value)
    }


    // Fetch categories, currencies, and brands
    const [catRes, currRes, brandRes] = await Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/website/currencies'), // Updated endpoint
      axios.get('/api/brands'),
    ]);
    categories.value = catRes.data.data;
    currencies.value = currRes.data.data; // Changed from currRes.data to currRes.data.data
    brands.value = brandRes.data.data.map(b => ({
      ...b,
      logo_path: b.images && b.images.length > 0 ? b.images[0].path : null
    })); // <-- FIXED LINE
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
    const hasAmounts = Array.isArray(form.value.amounts) && form.value.amounts.length > 0
    for (const key in form.value) {
      if (key === 'images' || key === 'amounts' || key === 'attributes' || key === 'main_ingredients' || key === 'fragrance_notes' || key === 'discount' || key === 'attribute_ids' || key === 'attribute_values' || key === 'selected_main_ingredient_ids') continue
      const value = form.value[key]
      if (value === null || value === undefined || value === '') continue
      if (key === 'price') {
        const numericPrice = typeof value === 'number' ? value : Number(value)
        if (Number.isNaN(numericPrice)) continue
        formData.append('price', numericPrice)
      } else {
        formData.append(key, value)
      }
    }

    // Append attribute_ids and corresponding values
    if (Array.isArray(form.value.attribute_ids)) {
      form.value.attribute_ids.forEach((attrId, index) => {
        formData.append(`attribute_ids[${index}]`, attrId)
        const attrValue = form.value.attribute_values?.[attrId]
        if (attrValue !== undefined && attrValue !== null && attrValue !== '') {
          let v = attrValue
          if (typeof v === 'string' && v.includes('%')) v = parseFloat(v.replace('%', ''))
          formData.append(`attribute_values[${attrId}]`, v)
        }
      })
    }

    // Append selected existing main ingredient IDs
    if (Array.isArray(form.value.selected_main_ingredient_ids) && form.value.selected_main_ingredient_ids.length > 0) {
      form.value.selected_main_ingredient_ids.forEach((id, index) => {
        formData.append(`selected_main_ingredient_ids[${index}]`, id)
      })
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
    if (showDiscountForm.value && form.value.discount && form.value.discount.value) {
      formData.append('discount[value]', form.value.discount.value)
      formData.append('discount[startDate]', form.value.discount.startDate)
      formData.append('discount[endDate]', form.value.discount.endDate)
      if (form.value.discount.id) {
        formData.append('discount[id]', form.value.discount.id)
      }
      // ensure no delete flag
      formData.append('delete_discount', '0')
    } else if (discountDelete.value) {
      // backend accepts either discount[deleted]=true or delete_discount=true
      formData.append('delete_discount', '1')
      formData.append('discount[deleted]', '1')
      if (discountIdToDelete.value) {
        formData.append('discount[id]', discountIdToDelete.value)
      }
    }
    // Append removed amount ids for deletion
    if (removedAmountIds.value.length > 0) {
      removedAmountIds.value.forEach((id, i) => {
        formData.append(`remove_amount_ids[${i}]`, id)
      })
    }
    
    if (showManualAttributes.value) {
      form.value.attributes.forEach((attr, i) => {
        formData.append(`attributes[${i}][name_en]`, attr.name_en)
        formData.append(`attributes[${i}][name_ar]`, attr.name_ar)
        formData.append(`attributes[${i}][value]`, attr.value)
        if (attr.id) {
          formData.append(`attributes[${i}][id]`, attr.id)
        }
      })
    }

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
    // Use method override in body to be compatible with backend
    formData.append('_method', 'PUT')
    await axios.post(`${BASE_URL}/api/products/${productId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    await ElMessageBox.alert(
      (localStorage.getItem('lang') === 'ar') ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully',
      (localStorage.getItem('lang') === 'ar') ? 'نجاح' : 'Success',
      { type: 'success', confirmButtonText: (localStorage.getItem('lang') === 'ar') ? 'حسناً' : 'OK' }
    )
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
    discountDelete.value = true
    discountIdToDelete.value = form.value.discount?.id || null
    // Close the discount form in UI but keep object to avoid validation/path errors
    showDiscountForm.value = false
    form.value.discount.value = null
    form.value.discount.startDate = null
    form.value.discount.endDate = null
    form.value.discount.is_active = false
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
  await fetchOptions()
  await fetchProduct()
})

// Keep top-level price synced to first amount price
watch(
  () => form.value.amounts,
  (newArr) => {
    if (Array.isArray(newArr) && newArr.length > 0) {
      form.value.price = newArr[0]?.price ?? null
    }
  },
  { deep: true }
)
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

.attribute-entry {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px 12px 4px;
  background: #fff;
  margin-bottom: 12px;
}

.attribute-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.attribute-title {
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.attribute-remove {
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;
}

/* Make labels above inputs only inside attributes section */
:deep(.attribute-entry .el-form-item__label) {
  float: none;
  display: block;
  width: auto !important;
  text-align: start;
  padding: 0 0 4px 0;
}

:deep(.attribute-entry .el-form-item__content) {
  margin-left: 0 !important;
}

/* Bigger inputs across this page */
::deep(.el-input__wrapper) {
  min-height: 46px;
  padding: 10px 14px;
  font-size: 15px;
}

::deep(.el-select .el-input__wrapper) {
  min-height: 46px;
}

::deep(.el-input-number .el-input__wrapper) {
  min-height: 46px;
}

::deep(.el-input-number__decrease),
::deep(.el-input-number__increase) {
  height: 46px;
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

.current-value {
  margin-inline-start: 8px;
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
