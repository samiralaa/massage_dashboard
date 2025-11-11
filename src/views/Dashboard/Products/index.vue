  <template>
    <div class="products-container ">
      <div class="header ">
        <div class="d-flex justify-content-between align-items-center w-100">

          <h2>{{ $t('Products.Products') }}</h2>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">{{ $t('Products.AddProduct') }}</el-button>
        </div>
        <el-input v-model="searchQuery" :placeholder="$t('Products.SearchPlaceholder')" :prefix-icon="Search" clearable
          class="search-input" style="max-width: 250px; margin-right: 16px;" />
      </div>
      
      <el-card class="products-table  ">

        <el-table v-loading="loading" :data="filteredProducts" class="table-responsivew" style="height: 70vh" dir="ltr">
          <el-table-column :label="$t('Products.Image')" width="120">
            <template #default="{ row }">
              <el-image v-if="row.images && row.images.length > 0"
                :src="BASE_URL + '/public/storage/' + row.images[0].path" fit="cover" class="product-image"
                :preview-src-list="[BASE_URL + '/public/storage/' + row.images[0].path]" :initial-index="0"
                preview-teleported>
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



          <el-table-column prop="name_en" :label="$t('Products.NameEn')" />
          <el-table-column prop="name_ar" :label="$t('Products.NameAr')">
            <template #default="{ row }">
              <div dir="rtl">{{ row.name_ar || $t('Products.NA') }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="price" :label="$t('Products.Price')" />
          <el-table-column :label="$t('Products.Inventory')">
            <template #default="{ row }">
              {{ getTotalInventory(row) }}
            </template>
          </el-table-column>
          <el-table-column prop="currency.name_en" :label="$t('Products.Currency')" />
          <el-table-column :label="$t('Products.Actions')" width="250">
            <template #default="{ row }">



              <div class="icon-actions" dir="ltr" role="group" aria-label="Row actions">
                <el-tooltip :content="$t('Products.View')" placement="top">
                  <el-button size="small" circle type="success" :icon="View" @click="viewProduct(row.id)" />
                </el-tooltip>
                <el-tooltip :content="$t('Products.Edit')" placement="top">
                  <el-button size="small" circle type="warning" :icon="Edit" @click="editProduct(row)" />
                </el-tooltip>
                <el-tooltip :content="$t('Products.Delete')" placement="top">
                  <el-button size="small" circle type="danger" :icon="Delete" @click="deleteProduct(row)" />
                </el-tooltip>
                <el-dropdown trigger="click" placement="bottom-start" @command="(cmd) => handleAddAction(cmd, row)">
                  <el-button size="small" class="more-btn" circle :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu class="add-menu">
                      <el-dropdown-item command="add-amount">
                        <el-icon class="menu-icon success"><Plus /></el-icon>
                        <span>{{ $t('Products.addAmount') }}</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="add-discount">
                        <el-icon class="menu-icon warning"><Discount /></el-icon>
                        <span>{{ $t('Products.addDiscount') }}</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="increase-inventory">
                        <el-icon class="menu-icon primary"><Top /></el-icon>
                        <span>{{ $t('Products.IncreaseInventory') }}</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

      </el-card>

      <!-- Add Amount Dialog -->
      <el-dialog v-model="showAmountDialog" :title="$t('Products.AddAmount')" width="500px">
        <el-form :model="amountForm" label-width="100px">
          <el-form-item :label="$t('Products.Unit')">
            <el-select v-model="amountForm.unit_id" :placeholder="$t('Products.select-unit')">
              <el-option v-for="unit in units" :key="unit.id" :label="unit.name_en" :value="unit.id" />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('Products.Weight')">
            <el-input v-model="amountForm.weight" type="number" :placeholder="$t('Products.select-weight')" />
          </el-form-item>

          <el-form-item :label="$t('Products.Price')">
            <el-input v-model="amountForm.price" type="number" :placeholder="$t('Products.select-price')" />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="showAmountDialog = false">{{ $t('Products.cancel') }}</el-button>
          <el-button type="primary" class="mx-2" @click="submitAmount">{{ $t('Products.submit') }}</el-button>
        </template>
      </el-dialog>

      <!-- Add Discount Dialog -->
      <el-dialog v-model="showDiscountDialog" :title="$t('Products.addDiscount')" :width="isMobile ? '90%' : '500px'"
        class="discount-dialog">
        <el-form :model="discountForm" label-width="100px" class="discount-form">
          <el-form-item :label="$t('Products.Start-Date')">
            <el-date-picker v-model="discountForm.start_date" type="date"
              :placeholder="$t('Products.Select-start-date')" class="w-100" />
          </el-form-item>
          <el-form-item :label="$t('Products.Duration-days')">
            <el-input v-model="discountForm.duration" type="number" :placeholder="$t('Products.Enter-duration-days')"
              class="w-100" />
          </el-form-item>
          <el-form-item :label="$t('Products.Discount-Value')">
            <el-input v-model="discountForm.discount_value" type="number"
              :placeholder="$t('Products.Enter-discount-percentage')" class="w-100" />
          </el-form-item>
          <el-form-item :label="$t('Products.Is-Active')">
            <el-switch v-model="discountForm.is_active" />
          </el-form-item>
          <input type="hidden" v-model="discountForm.product_id" />
          <input type="hidden" v-model="discountForm.category_id" />
          <el-form-item :label="$t('Products.End-Date')">
            <el-date-picker v-model="discountForm.end_date" type="date" :placeholder="$t('Products.Select-end-date')"
              class="w-100" />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showDiscountDialog = false">{{ $t('Products.cancel') }}</el-button>
            <el-button type="primary" @click="submitDiscount">{{ $t('Products.submit') }}</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- Increase Inventory Dialog -->
      <el-dialog v-model="showIncreaseDialog" :title="$t('Products.IncreaseInventory')" width="500px">
        <el-form :model="increaseForm" label-width="140px">
          <el-form-item :label="$t('Products.Quantity')">
            <el-input v-model="increaseForm.quantity" type="number" :placeholder="$t('Products.EnterQuantity')" />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="showIncreaseDialog = false">{{ $t('Products.cancel') }}</el-button>
          <el-button type="primary" class="mx-2" @click="submitIncrease">{{ $t('Products.submit') }}</el-button>
        </template>
      </el-dialog>
    </div>
  </template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Edit, Delete, Picture, View, Discount, Search, Top, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const { t } = useI18n()
const products = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  const query = searchQuery.value.toLowerCase()
  return products.value.filter(p =>
    (p.name_en && p.name_en.toLowerCase().includes(query)) ||
    (p.name_ar && p.name_ar.toLowerCase().includes(query))
  )
})
const lang = localStorage.getItem('lang') || 'en'
const BASE_URL = 'https://backend.msgperfumes.com'

const API_URL = `${BASE_URL}/api/dashboard/products`

const fetchProducts = async () => {
  loading.value = true
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    const response = await axios.get(API_URL)

    if (response.data.status) {
      products.value = response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to fetch products')
    }
  } catch (error) {
    console.error('Fetch products error:', error)
    ElMessage.error(lang === 'ar' ? 'فشل في تحميل المنتجات' : 'Failed to load products')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  router.push('/products/create')
}

const viewProduct = (id) => {
  router.push(`/products/${id}`)
}

const editProduct = (product) => {
  router.push(`/products/${product.id}/edit`)
}

const deleteProduct = async (product) => {
  try {
    const result = await ElMessageBox.confirm(
      t('Products.DeleteConfirmation'),
      t('Products.Warning'),
      {
        confirmButtonText: t('Products.Yes'),
        cancelButtonText: t('Products.No'),
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
      const response = await axios.delete(`${API_URL}/${product.id}`)

      if (response.data.status) {
        ElMessage.success(lang === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully')
        products.value = products.value.filter(p => p.id !== product.id)
      } else {
        throw new Error(response.data.message || 'Failed to delete product')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete product error:', error)
      ElMessage.error(lang === 'ar' ? 'فشل في حذف المنتج' : 'Failed to delete product')
    }
  } finally {
    loading.value = false
  }
}

// Add Amount Logic
const showAmountDialog = ref(false)
const selectedProduct = ref(null)
const units = ref([])
const amountForm = ref({
  unit_id: '',
  weight: '',
  price: '',
})

const fetchUnits = async () => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
    const res = await axios.get(`${BASE_URL}/api/units`)
    units.value = res.data.data
  } catch (err) {
    console.error('Failed to fetch units:', err)
    ElMessage.error(lang === 'ar' ? 'فشل في تحميل الوحدات' : 'Failed to load units')
  }
}

const addAmount = (product) => {
  selectedProduct.value = product
  amountForm.value = {
    unit_id: '',
    weight: '',
    price: ''
  }
  fetchUnits()
  showAmountDialog.value = true
}

const submitAmount = async () => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    const payload = {
      product_id: selectedProduct.value.id,
      unit_id: amountForm.value.unit_id,
      weight: amountForm.value.weight,
      price: amountForm.value.price
    }

    const res = await axios.post(`${BASE_URL}/api/amounts`, payload)

    if (res.data.status) {
      ElMessage.success(lang === 'ar' ? 'تم إضافة الكمية بنجاح' : 'Amount added successfully')
      showAmountDialog.value = false
    } else {
      ElMessage.error(lang === 'ar' ? 'فشل في إضافة الكمية' : 'Failed to add amount')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error(lang === 'ar' ? 'حدث خطأ أثناء حفظ الكمية' : 'Error occurred while saving amount')
  }
}

// Add Discount Logic
const showDiscountDialog = ref(false)
const discountForm = ref({
  start_date: '',
  duration: '',
  discount_value: '',
  is_active: false,
  product_id: '',
  category_id: '',
  end_date: '',
})

const openDiscountDialog = (product) => {
  selectedProduct.value = product
  discountForm.value = {
    start_date: '',
    duration: '',
    discount_value: '',
    is_active: false,
    product_id: product.id,
    category_id: product.category_id || '',
    end_date: '',
  }
  showDiscountDialog.value = true
}

const submitDiscount = async () => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    const payload = {
      start_date: discountForm.value.start_date,
      duration: discountForm.value.duration,
      discount_value: discountForm.value.discount_value,
      is_active: discountForm.value.is_active,
      product_id: discountForm.value.product_id,
      category_id: discountForm.value.category_id,
      end_date: discountForm.value.end_date,
    }

    const res = await axios.post(`${BASE_URL}/api/discounts`, payload)

    if (res.data) {
      ElMessage.success(lang === 'ar' ? 'تم إضافة الخصم بنجاح' : 'Discount added successfully')
      showDiscountDialog.value = false
    } else {
      ElMessage.error(lang === 'ar' ? 'فشل في إضافة الخصم' : 'Failed to add discount')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error(lang === 'ar' ? 'حدث خطأ أثناء حفظ الخصم' : 'Error occurred while saving discount')
  }
}

// Add responsive check
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const getTotalInventory = (product) => {
  const items = Array.isArray(product?.inventory_items) ? product.inventory_items : []
  return items.reduce((sum, it) => sum + (Number(it?.quantity) || 0), 0)
}

const handleAddAction = (command, product) => {
  switch (command) {
    case 'add-amount':
      return addAmount(product)
    case 'add-discount':
      return openDiscountDialog(product)
    case 'increase-inventory':
      return openIncreaseDialog(product)
  }
}

// Increase Inventory Logic
const showIncreaseDialog = ref(false)
const increaseForm = ref({
  quantity: ''
})

const openIncreaseDialog = (product) => {
  selectedProduct.value = product
  increaseForm.value = { quantity: '' }
  showIncreaseDialog.value = true
}

const submitIncrease = async () => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    const payload = {
      product_id: selectedProduct.value.id,
      quantity: Number(increaseForm.value.quantity)
    }

    const res = await axios.post(`${BASE_URL}/api/inventory-items/increase`, payload)

    if (res.data) {
      ElMessage.success(lang === 'ar' ? 'تم تحديث المخزون' : 'Inventory updated')
      showIncreaseDialog.value = false
      await fetchProducts()
    } else {
      ElMessage.error(lang === 'ar' ? 'فشل في تحديث المخزون' : 'Failed to update inventory')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error(lang === 'ar' ? 'حدث خطأ أثناء تحديث المخزون' : 'Error occurred while updating inventory')
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-container {
  padding: 24px;
  background-color: #f5f7fa;
  height: 100vh;

}

.header {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  gap: 12px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.products-table {
  background-color: #ffffff;
  height: 80vh;
  display: flex;
  flex-direction: column;
  /* padding: 16px; */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);



}



.product-image {
  width: 100px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #ebeef5;
}

.image-error {
  width: 100px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}

.image-error .el-icon {
  font-size: 24px;
  color: #909399;
}

.el-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

.el-button {
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  border-radius: 8px;
  white-space: nowrap;
}

.el-button:hover {
  filter: brightness(0.95);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.action-buttons .el-button {
  border-radius: 9999px;
  padding: 8px 14px;
  font-weight: 600;
}

/* Dropdown menu styling for Add actions */
:deep(.add-menu) {
  min-width: 220px;
  padding: 8px 0;
}

:deep(.add-menu .el-dropdown-menu__item) {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

:deep(.add-menu .menu-icon) {
  font-size: 16px;
}

:deep(.add-menu .menu-icon.success) {
  color: #67c23a; /* Element Plus success color */
}

:deep(.add-menu .menu-icon.warning) {
  color: #e6a23c; /* Element Plus warning color */
}

:deep(.add-menu .menu-icon.primary) {
  color: #409eff; /* Element Plus primary color */
}

.icon-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.el-dialog .el-form-item {
  margin-bottom: 18px;
}

.el-dialog__footer {
  padding-top: 12px;
}

.el-form .el-input,
.el-form .el-select {
  width: 100%;
}

/* Responsive tweaks */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header h2 {
    font-size: 20px;
  }

  .el-button-group {
    flex-direction: column;
    width: 100%;
  }

  .el-button-group .el-button {
    width: 100%;
  }

  .products-table {
    padding: 12px;

    background-color: #ffffff;
    height: 80vh;
    display: flex;
    flex-direction: column;
    /* padding: 16px; */
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);




  }

  .product-image,
  .image-error {
    width: 80px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .header h2 {
    font-size: 18px;
  }

  .product-image,
  .image-error {
    width: 60px;
    height: 40px;
  }
}

.discount-dialog {
  :deep(.el-dialog) {
    margin: 0 !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 90vh;
    overflow-y: auto;
  }
}

.discount-form {
  :deep(.el-form-item) {
    margin-bottom: 1.5rem;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-input),
  :deep(.el-date-editor) {
    width: 100%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .discount-form {
    :deep(.el-form-item__label) {
      float: none;
      display: block;
      text-align: left;
      padding: 0 0 0.5rem;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }

  .dialog-footer {
    flex-direction: column;
    gap: 0.5rem;

    .el-button {
      width: 100%;
    }
  }
}

::v-deep(.el-form-item__label) {
  text-align: start;
  justify-content: flex-start;
  width: 170px !important;
}

[dir="rtl"] .el-switch {
  flex-direction: row-reverse;
}

.el-dialog__footer {
  justify-content: end;
  display: flex;
  gap: 12px;
}
</style>