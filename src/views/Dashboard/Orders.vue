<template >
  <div class="orders-page">
    <!-- Header: Title & Search -->
    <div class="orders-header">
      <h2>{{ $t('orders.myOrders') }}</h2>
      <el-input v-model="searchQuery" :placeholder="$t('orders.Search-orders') " class="search-input" clearable>
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
      <el-button type="success" @click="handleExportOrders" class="ml-3">
        <el-icon><Download /></el-icon>
        <span>{{ $t('orders.export') }}</span>
      </el-button>
    </div>

    <!-- Filter Dropdown -->
    <div class="orders-filters">
      <el-select v-model="statusFilter" :placeholder="$t('orders.Filter-by-Status')" clearable>
        <el-option v-for="status in orderStatuses" :key="status" :label="status" :value="status" />
      </el-select>
      <el-date-picker
        v-model="fromDate"
        type="date"
        :placeholder="$t('orders.from')"
        clearable
        @change="fetchOrders"
      />
      <el-date-picker
        v-model="toDate"
        type="date"
        :placeholder="$t('orders.to')"
        clearable
        @change="fetchOrders"
      />
    </div>

    <!-- Orders Table -->
    <el-table v-loading="loading" :data="paginatedOrders" id="orders-table" style="width: 100%" class="orders-table" stripe border>
      <el-table-column prop="id" :label="$t('orders.orderId')" width="120" />
      <el-table-column prop="invoice_number" :label="$t('orders.invoice')" width="180" />
      <el-table-column prop="ordered_at" :label="$t('orders.orderDate')" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.ordered_at) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('orders.total')" width="150">
        <template #default="scope">
          {{ scope.row.currency }} {{ scope.row.total_price }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('orders.status')" width="150">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="method" :label="$t('orders.payment-method')" width="150">
        <template #default="scope" >
          <img v-if="scope.row.payment_method === 'stripe'" :src="imageSrc.strappi" alt="Strappi" width="20" height="20">
          <img v-if="scope.row.payment_method === 'tabby'" :src="imageSrc.tabby" alt="Tabby" width="20" height="20">
          <img v-if="scope.row.payment_method === 'cod'" :src="imageSrc.cash" alt="Cash" width="20" height="20">
            {{ scope.row.payment_method }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('orders.actions')" width="220" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="viewOrder(scope.row)" circle>
            <el-icon>
              <View />
            </el-icon>
          </el-button>
          <el-button size="small" type="danger"
            :disabled="scope.row.status !== 'pending' && scope.row.status !== 'processing'"
            @click="cancelOrder(scope.row)" circle>
            <el-icon>
              <Close />
            </el-icon>
          </el-button>
          <el-button size="small" type="success" @click="acceptOrder(scope.row)"
          :disabled="scope.row.status !== 'pending'"
          circle>
            <el-icon>
              <Select />
            </el-icon>
          </el-button>
          <el-button size="small" type="info" @click="completedOrder(scope.row)"
          :disabled="scope.row.status !== 'accepted'"
          circle>
            <el-icon>
              <FolderChecked />
            </el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination v-if="filteredOrders.length > pageSize" class="pagination" layout="prev, pager, next"
      :current-page="currentPage" :page-size="pageSize" :total="filteredOrders.length"
      @current-change="handlePageChange" />

    <!-- Order Details Dialog -->
    <el-dialog v-model="showDetails" id="order-details-dialog"  :title="$t('orders.orderDetails')" width="600px">
      
      <template #footer>
        <el-button type="primary" @click="printInvoice" v-if="selectedOrder">{{ $t('orders.printInvoice') || 'Print Invoice' }}</el-button>
      </template>
      
      
      <div class=" " id="invoice-print" dir="ltr" >
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center designInIframe">
        <img :src="imageSrc.Message" class="rounded object-fit-contain " width="200" height="100" alt="hi">
        <div>
          <h5>Message Perfume</h5>
          
          <p class="mb-0">00971544887138</p>
          <p>Messageoud22@gmail.com</p>
        </div>
      </div>

      <hr>

      <div class="row mb-4">
        <div class="col-md-6">
          <h6>Billed To:</h6>
          <p class="mb-0">{{ selectedOrder.user.name }}</p>
          <p class="mb-0">{{ selectedOrder.user.address?.street }}</p>
          <p class="mb-0">{{ selectedOrder.user.address?.city }}</p>
          <p class="mb-0">{{ selectedOrder.user.address?.state }}</p>
          <p class="mb-0">{{ selectedOrder.user.address?.zip }}</p>
          <p class="mb-0">{{ selectedOrder.user.address?.country?.name_en }}</p>
          <p class="mb-0">{{ selectedOrder.user.email }}</p>
          <p>{{ selectedOrder.user.phone }}</p>
        </div>
        <div class="col-md-6 text-end ">
          <h6 >Invoice Details:</h6>
          <p class="mb-0"><span class="fw-bold">Invoice ID :</span> {{ selectedOrder.invoice_number }}</p>
          <p class="mb-0"><span class="fw-bold">Order Date:</span> {{ selectedOrder.ordered_at}}</p>
          
        </div>
      </div>

      <table class="table table-hover table-bordered"> 
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Description</th>
            <th >Unit Price</th>
            <th >Quantity</th>
            <th >Subtotal</th>
          </tr>
        </thead>
         <tbody>
            <tr v-for="item in selectedOrder.items" :key="item.id">
              <td>{{ item.product_id }}</td>
              <td>{{ item.product?.name_en }}</td>
              <td>{{ item.price }} {{ selectedOrder.currency }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.subtotal }}</td>
            </tr>
          </tbody>
        <tfoot>
           <tr>
            <th colspan="4" class="text-end">Delivery</th>
            <th class="text-end">{{ selectedOrder.delivery_fee }}</th>
          </tr>
          <tr>
            <th colspan="4" class="text-end">Total</th>
            <th class="text-end">{{ selectedOrder.currency }} {{ selectedOrder.total_price }}</th>
          </tr>
          
        </tfoot>
      </table>

      <p class="mt-4 text-center fw-bold">Message happy to see you again</p>
    </div>
  </div>


    </el-dialog>
    <!-- Debug output -->

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, View, Close, Refresh ,Select, FolderChecked, Download} from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import * as XLSX from 'xlsx'; // Import xlsx library

const store = useStore()

const orders = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const fromDate = ref(null)
const toDate = ref(null)
const currentPage = ref(1)
const pageSize = 5
const showDetails = ref(false)
const selectedOrder = ref(null)
const loading = ref(false)
const imageSrc = ref({
  Message: 'assets/logo2.png',
  strappi :'assets/strappi.png',
  tabby:'assets/tabby.png',
  cash :'assets/cash.png'
})
const orderStatuses = ['all','pending', 'accepted', 'completed', 'cancelled']

const fetchOrders = async () => {
  loading.value = true
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
    await store.dispatch('orders/fetchOrders', {
      from: fromDate.value ? fromDate.value.toISOString().split('T')[0] : null,
      to: toDate.value ? toDate.value.toISOString().split('T')[0] : null,
    })
    orders.value = store.getters['orders/getOrders']
    console.log('Fetched Orders:', orders.value);
    
  } catch (error) {
    console.error('Error fetching orders:', error)
    ElMessage.error( 'Failed to fetch orders')
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const q = (searchQuery.value || '').toString().toLowerCase()
    const matchesSearch =
      q === '' ||
      order.id?.toString().toLowerCase().includes(q) ||
      order.invoice_number?.toString().toLowerCase().includes(q) ||
      order.total_price?.toString().toLowerCase().includes(q)

    const matchesStatus =
      !statusFilter.value || order.status === statusFilter.value
    if (statusFilter.value === 'all') {
      return matchesSearch
    }

    return matchesSearch && matchesStatus
  })
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredOrders.value.slice(start, end)
})

const handlePageChange = (page) => {
  currentPage.value = page
}

const viewOrder = (order) => {
  selectedOrder.value = order
  showDetails.value = true
  console.log('Selected Order:', selectedOrder.value);
  
  
  
}
const acceptOrder = async (order) => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
    const response = await axios.get(`https://backend.msgperfumes.com/api/orders/${order.id}/accept`)

    if (response.data.status === true) {
      ElMessage.success('Order accepted successfully')
      await fetchOrders()
    } else {
      throw new Error(response.data.message || 'Failed to accept order')
    }
  } catch (error) {
    
    ElMessage.error('Failed to accept order')
  }
}

const completedOrder = async (order) => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
    const response = await axios.get(`https://backend.msgperfumes.com/api/orders/${order.id}/complete`)

    if (response.data.status === true) {
      ElMessage.success('Order completed successfully')
      await fetchOrders()
    } else {
      throw new Error(response.data.message || 'Failed to complete order')
    }
  } catch (error) {
    console.error('Error completing order:', error)
    ElMessage.error(error.message || 'Failed to complete order')
  }
}
const printInvoice = () => {

 const invoiceElement = document.getElementById('invoice-print');

  // Create an invisible iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;

  const styleContent = `
    <style>
      /* Example styles — replace/add your own as needed */
      body {
        font-family: Arial, sans-serif;
        // padding: 20px;
        color: #000;
      }
      .text-end { text-align: right; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ccc;
         padding: 8px;
      }
      .header, .footer {
        // margin-bottom: 20px;
      }
        .designInIframe{
        display: flex;
        justify-content: space-between;
        align-items: center;
        }
        .row {
        display: flex;
        justify-content: space-between;
        align-items: start;
       
        }
        p{
        margin: 10px;
        
        }
        span{
        font-weight: bold;
        }
        h6{
        margin: 20px 0;
        }
       
    </style>
  `;

  iframeDoc.open();
  iframeDoc.write(`
    <html>
      <head>
        <title>Invoice</title>
        ${styleContent}
      </head>
      <body>
        ${invoiceElement.innerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  iframe.contentWindow.focus();
  iframe.contentWindow.print();
}
const closeDetails = () => {
  showDetails.value = false
  selectedOrder.value = null
}


const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const getStatusType = (status) => {
  const types = {

    pending: 'warning',
    completed: 'info',
    cancelled: 'danger',
    accepted: 'success',
  }
  return types[status.toLowerCase()] || 'info'
}

const cancelOrder = async (order) => {
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
    const response = await axios.post(`https://backend.msgperfumes.com/api/orders/${order.id}/cancel`)

    if (response.data.status === true) {
      ElMessage.success('Order cancelled successfully')
      await fetchOrders()
    } else {
      throw new Error(response.data.message || 'Failed to cancel order')
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    ElMessage.error(error.message || 'Failed to cancel order')
  }
}

const reorder = (order) => {
  // Simulate reorder logic (e.g., add items to cart)
  ElMessage.info('Reordered items from order #' + order.id)
}

// Removed the backend API call implementation for handleExportOrders
const handleExportOrders = () => {
  const data = filteredOrders.value.map(order => ({
    'Order ID': order.id,
    'Invoice': order.invoice_number,
    'User Name': order.user?.name,
    'User Email': order.user?.email,
    'Status': order.status,
    'Payment Method': order.payment_method,
    'Total Price': `${order.total_price} ${order.currency}`,
    'Items Count': order.items.sum('quantity'),
    'Ordered At': formatDate(order.ordered_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  XLSX.writeFile(workbook, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
};

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-page {
  padding: 24px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-input {
  width: 300px;
}

.orders-filters {
  margin-bottom: 20px;
}

.orders-table {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
