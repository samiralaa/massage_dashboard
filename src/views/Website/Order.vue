<template>
  <Header />

  <div class="container py-4">
    <h2 class="mb-4 fw-bold">{{ $t('orders.myOrders') }}</h2>

    <div class="orders-header">
      <a class="order-stage" href="#" @click.prevent="filterOrders(null)" :class="{ active: !currentFilter }">
        <h3>{{ $t('orders.allOrders') }}</h3>
        <h3 class="num">{{ allOrdersCount }}</h3>
      </a>
      <a class="order-stage" href="#" @click.prevent="filterOrders('accepted')"
      :class="{ active: currentFilter === 'accepted' }">
        <h3>{{ $t('orders.accepted') }}</h3>
        <h3 class="num">{{ acceptedOrdersCount }}</h3>
      </a>
      <a class="order-stage" href="#" @click.prevent="filterOrders('pending')"
        :class="{ active: currentFilter === 'pending' }">
        <h3>{{ $t('orders.inProgress') }}</h3>
        <h3 class="num">{{ pendingOrdersCount }}</h3>
      </a>
      <a class="order-stage" href="#" @click.prevent="filterOrders('completed')"
        :class="{ active: currentFilter === 'completed' }">
        <h3>{{ $t('orders.completed') }}</h3>
        <h3 class="num">{{ completedOrdersCount }}</h3>
      </a>
      <a class="order-stage" href="#" @click.prevent="filterOrders('cancelled')"
        :class="{ active: currentFilter === 'cancelled' }">
        <h3>{{ $t('orders.cancelled') }}</h3>
        <h3 class="num">{{ cancelledOrdersCount }}</h3>
      </a>
    </div>

    <div class="dropdown-container">
      <button id="selectDropdownButton" type="button" class="select-dropdown-button">
        <span id="selectedValue" class="selected-value">{{ $t('orders.allOrders') }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <div id="selectDropdownContent" class="select-dropdown-content">
        <div style="padding-top: 0.25rem; padding-bottom: 0.25rem;" role="menu" aria-orientation="vertical" aria-labelledby="selectDropdownButton">
          <a class="select-option" href="#" @click.prevent="filterOrders(null)">
            {{ $t('orders.allOrders') }}
            <h3 class="num">{{ allOrdersCount }}</h3>
          </a>
          <a class="select-option" href="#" @click.prevent="filterOrders('accepted')">
            {{ $t('orders.accepted') }}
            <h3 class="num">{{ acceptedOrdersCount }}</h3>
          </a>
          <a class="select-option" href="#" @click.prevent="filterOrders('pending')">
            {{ $t('orders.inProgress') }}
            <h3 class="num">{{ pendingOrdersCount }}</h3>
          </a>
          <a class="select-option" href="#" @click.prevent="filterOrders('completed')">
            {{ $t('orders.completed') }}
            <h3 class="num">{{ completedOrdersCount }}</h3>
          </a>
          <a class="select-option" href="#" @click.prevent="filterOrders('cancelled')">
            {{ $t('orders.cancelled') }}
            <h3 class="num">{{ cancelledOrdersCount }}</h3>
          </a>
        </div>
      </div>
      <input type="hidden" id="hiddenSelectValue" name="selectOption" value="">
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-else-if="filteredOrders.length > 0" class="row g-4">
      <div v-for="order in filteredOrders" :key="order.id" class="col-12 col-md-6">
        <div class="order-card p-4 rounded-4 shadow-sm bg-white ">
          <div class="d-flex justify-content-between align-items-start flex-wrap mb-3">
            <div>
              <small class="text-muted">{{ $t('orders.orderId') }}</small>
              <h5 class="fw-bold">#{{ order.invoice_number }}</h5>
            </div>
            <div class="text-end">
              <small class="text-muted">{{ formatDate(order.ordered_at) }}</small><br>
              <span :class="['badge', getStatusBadgeClass(order.status)]">
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </div>

          <div class="items row gy-3 overflow-auto mb-3 pb-2 border-bottom ">
            <div v-for="item in order.items" :key="item.id" class="d-flex flex-column align-items-start col-4">
              <img v-if="item.product && item.product.images && item.product.images.length"
                :src="imageUrl(item.product.images[0].path)" class="rounded mb-2"
                style="width: 100%; aspect-ratio: 1; object-fit: cover" />
              <img v-else src="https://via.placeholder.com/150" class="rounded mb-2"
                style="width: 100%; aspect-ratio: 1; object-fit: cover" alt="No Image Available" />
              <strong class="small">{{ $i18n.locale ==  'ar' ? item.product.name_ar : item.product.name_en
                }}</strong>
              <small class="text-muted" dir="ltr">{{ item.price }} {{ order.currency }} x{{ item.quantity }}</small>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <strong>Total: {{ order.total_price }} {{ order.currency }} ({{ order.items.length }} Items)</strong>
            <button class="btn btn-outline-dark btn-sm" @click="showOrderDetailsPopup(order.id)">{{$t('orders.details')}}</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info text-center">
      {{ $t('orders.noOrder') }}
    </div>
  </div>

  <div class="modal-overlay d-flex justify-content-center align-items-center" v-if="isDialogVisible">
    <div class="cart-modal bg-white rounded-4 shadow p-4 position-relative">
      <!-- Close Button -->
      <button type="button" class="btn-close position-absolute top-0 end-0 m-3" @click="isDialogVisible = false"
        aria-label="Close"></button>

      <!-- Title -->
      <h4 class="mb-3">{{ $t('orders.orderDetails') }}</h4>

      <!-- Loading Spinner -->
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status"></div>
      </div>

      <!-- Order content -->
      <div v-else class="cart-content   " >
        <div class="mb-3">
          <strong>Status:</strong>
          <span :class="['badge', getStatusBadgeClass(selectedOrder.status)]">
            {{ formatStatus(selectedOrder.status) }}
          </span>
        </div>
        <div
  class="row flex-wrap gap-2 align-items-start border-bottom flex justify-content-center py-3 px-2"
  style="max-height: 70vh; overflow-y: auto;"
>
  <div
    v-for="item in selectedOrder.items"
    :key="item.id"
    class="col-12 col-md-4 col-lg-3"
  >
    <div class="card h-100 border-0 shadow-sm rounded-3">
      <img
        v-if="item.product?.images?.length"
        :src="imageUrl(item.product.images[0].path)"
        class="card-img-top rounded-top "
        style="aspect-ratio: 1 / 1; object-fit: cover"
        alt="Product Image"
      />
      
      <img
        v-else
        src="https://via.placeholder.com/300x300?text=No+Image"
        class="card-img-top rounded-top"
        style="aspect-ratio: 1 / 1; object-fit: cover"
        alt="No Image Available"
      />
      <div class="card-body d-flex flex-column">
        <strong class="card-title small mb-1">
          {{ item.product?.name_en || 'No Name' }}
        </strong>
        <small class="text-muted"  dir="ltr">
          {{ item.price }} {{ selectedCurrency }} × {{ item.quantity }}
        </small>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  </div>

</template>

<script>
import axios from 'axios';
import Header from "@/components/Website/Header.vue";


export default {
  components: { Header },
  name: 'UserOrder',
  data() {
    return {
      orders: [],
      currentFilter: null,
      selectedOrder: null,
      isDialogVisible: false,
      loading: true,
      selectedCurrency: localStorage.getItem('selectedCurrency')
        ? JSON.parse(localStorage.getItem('selectedCurrency')).code
        : 'EGP',
      
    };
  },
  computed: {

    allOrdersCount() {
      return this.orders.length;
    },
    pendingOrdersCount() {
      return this.orders.filter(order => order.status === 'pending').length;
    },
    acceptedOrdersCount() {
      return this.orders.filter(order => order.status === 'accepted').length;
    },
    completedOrdersCount() {
      return this.orders.filter(order => order.status === 'completed').length;
    },
    cancelledOrdersCount() {
      return this.orders.filter(order => order.status === 'cancelled').length;
    },
    filteredOrders() {
      return !this.currentFilter
        ? this.orders
        : this.orders.filter(order => order.status === this.currentFilter);
    },
  },
  methods: {
    
  
    async fetchOrders() {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          this.$toast.error('Please login to view your orders');
          this.$router.push('/login');
          return;
        }

        const res = await axios.get('https://massagebackend.webenia.org/api/orders/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.data.status && res.data.data.original.success) {
          this.orders = res.data.data.original.orders;
        } else {
          this.$toast.error(res.data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        if (err.response?.status === 401) {
          this.$toast.error('Please login to view your orders');
          this.$router.push('/login');
        } else {
          this.$toast.error(err.response?.data?.message || 'Failed to fetch orders');
        }
      } finally {
        this.loading = false;
      }
    },
    filterOrders(status) {
      this.currentFilter = this.currentFilter === status ? null : status;
    },
    imageUrl(path) {
      return `https://massagebackend.webenia.org/public/storage/${path}`;
    },
    formatDate(datetime) {
      const date = new Date(datetime);
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    },
    formatStatus(status) {
      const statusMap = {
        'pending': 'In Progress',
        'accepted': 'Accepted',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };
      return statusMap[status.toLowerCase()] || status;
    },
    getStatusBadgeClass(status) {
      const statusClasses = {
        'pending': 'bg-warning',
        'accepted': 'bg-info',
        'completed': 'bg-success',
        'cancelled': 'bg-danger'
      };
      return statusClasses[status.toLowerCase()] || 'bg-secondary';
    },
    updateCurrency() {
      const stored = localStorage.getItem('selectedCurrency');
      this.selectedCurrency = stored ? JSON.parse(stored).code : 'EGP';
    },
    toggleDropdown(el) {
      el.classList.toggle("show");
    },
    setupDropdown() {
      const btn = document.getElementById("selectDropdownButton");
      const content = document.getElementById("selectDropdownContent");
      const selectedValue = document.getElementById("selectedValue");
      const hiddenInput = document.getElementById("hiddenSelectValue");
      const options = content.querySelectorAll(".select-option");

      btn?.addEventListener("click", () => this.toggleDropdown(content));

      options.forEach(option => {
        option.addEventListener("click", (e) => {
          e.preventDefault();
          selectedValue.textContent = option.textContent;
          hiddenInput.value = option.getAttribute("data-value");
          content.classList.remove("show");
        });
      });

      window.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && content.classList.contains("show")) {
          content.classList.remove("show");
        }
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && content.classList.contains("show")) {
          content.classList.remove("show");
        }
      });
    },
    async showOrderDetailsPopup(orderId) {
      this.isDialogVisible = true;
      this.loading = true;
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`https://massagebackend.webenia.org/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.data.status && res.data.data.original.success) {
          this.selectedOrder = res.data.data.original.orders.find(o => o.id === orderId);

        } else {
          this.$toast.error(res.data.message || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        this.$toast.error(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    
    this.fetchOrders();
    this.setupDropdown();
    window.addEventListener('currency-changed', this.updateCurrency);
  },
  beforeUnmount() {
    window.removeEventListener('currency-changed', this.updateCurrency);
  }
};
</script>


<style scoped>
.items {
  height: 255px;
  overflow-y: auto;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: scale(1.01);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.card-body ul {
  padding-left: 0;
  margin-bottom: 1rem;
}

.card-body ul li {
  margin-bottom: 0.25rem;
}

.order-card {
  border: 1px solid #eee;
  transition: box-shadow 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.order-card img {
  border: 1px solid #ddd;
}


.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f6f6f6;
  border-radius: 50px;
  padding: 10px;
  text-align: center;
  gap: 10px;
}

.order-stage {
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #333;
  border-radius: 50px;
  width: 100%;
  padding: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.order-stage.active {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #8b6b3d;
}

.order-stage.active .num {
  color: #fff;
  background-color: #8b6b3d;
}

.num {
  background-color: #fff;
  aspect-ratio: 1 / 1;
  padding: 0.15rem 0.5rem;
  text-align: center;
  vertical-align: middle;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 0.8rem !important;
}

.orders-header h3 {
  margin: 0;
  font-size: 1rem !important;
}

.order-card {
  border: 1px solid #eee;
  transition: box-shadow 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.badge {
  font-size: 0.8rem;
  padding: 0.5em 0.8em;
  font-weight: 500;
  text-transform: capitalize;
}


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1050;
  backdrop-filter: blur(2px);
  padding: 1rem;
}

.cart-modal {
  max-width: 80%;
  height: 90vh;
  overflow: hidden;
  animation: fadeInUp 0.3s ease-in-out;
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.cart-content {
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.cart-content::-webkit-scrollbar {
  width: 6px;
}

.cart-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 5px;
}

.dropdown-container {
  position: relative;
  display: inline-block;
  text-align: left;
  margin-bottom: 2rem;
  display: none;
}

.dropdown-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.dropdown-button {
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 0.5rem 1rem;
  background-color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  outline: none;
}

.dropdown-button:hover {
  background-color: #f9fafb;
}

.dropdown-button:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5), 0 0 #0000;
  border-color: #6366f1;
}

.dropdown-button svg {
  margin-left: 0.5rem;
  margin-right: -0.25rem;
  height: 1.25rem;
  width: 1.25rem;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  width: 14rem;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  outline: none;
  z-index: 10;
  opacity: 0;
  transform: scale(0.9);
  transform-origin: top left;
  visibility: hidden;
  transition: opacity 0.2s ease-out, transform 0.2s ease-out,
    visibility 0s linear 0.2s;
}

.dropdown-content.show {
  visibility: visible;
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.2s ease-out, transform 0.2s ease-out,
    visibility 0s linear;
}

.dropdown-content .menu-item {
  display: block;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

.dropdown-content .menu-item:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.select-dropdown-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 14rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 0.5rem 1rem;
  background-color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  outline: none;
}

.select-dropdown-button:hover {
  background-color: #f9fafb;
}

.select-dropdown-button:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5), 0 0 #0000;
  border-color: #6366f1;
}

.select-dropdown-button .selected-value {
  flex-grow: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-dropdown-button svg {
  margin-left: 0.5rem;
  height: 1.25rem;
  width: 1.25rem;
}

.select-dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  width: 14rem;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  outline: none;
  z-index: 10;
  opacity: 0;
  transform: scale(0.9);
  transform-origin: top left;
  visibility: hidden;
  transition: opacity 0.2s ease-out, transform 0.2s ease-out,
    visibility 0s linear 0.2s;
}

.select-dropdown-content.show {
  visibility: visible;
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.2s ease-out, transform 0.2s ease-out,
    visibility 0s linear;
}

.select-dropdown-content .select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  text-decoration: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

.select-dropdown-content .select-option:hover {
  background-color: #f3f4f6;
  color: #111827;
}

@media (max-width: 768px) {
  .orders-header{
    display: none;
  }

  .dropdown-container {
    display: block;
  }
}
</style>
