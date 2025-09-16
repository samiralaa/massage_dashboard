<template>
  <div class="products-section container">
    <div v-if="loading" class="text-center my-4">
      Loading products...
    </div>
    <div v-else class="row g-3">
      <div
        v-for="product in products"
        :key="product.id"
        class="col-6 col-md-4 col-lg-3"
      >
        <div class="card h-100">
          <img
            v-if="product.images && product.images.length"
            :src="getImageUrl(product.images[0].path)"
            :alt="product.name_en"
            class="card-img-top"
          />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ product.name_en }}</h5>
            <p class="card-text mb-2">
              {{ product.converted_price }} {{ product.currency_code }}
            </p>
            <button
              class="btn btn-primary mt-auto"
              :disabled="!product.is_available"
              @click="addToCart(product)"
            >
              {{ product.is_available ? 'Add to Cart' : 'Out of Stock' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElNotification } from 'element-plus'

const products = ref([])
const loading = ref(false)

const getImageUrl = (path) => `https://massagebackend.webenia.org/public/storage/${path}`

const fetchProducts = async () => {
  loading.value = true
  try {
    const selectedCurrency =
      JSON.parse(localStorage.getItem('selectedCurrency')) || { code: 'USD' }

    const response = await axios.get(
      'https://massagebackend.webenia.org/api/website/products/section',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          Currency: selectedCurrency.code,
        },
      }
    )
    if (response.data.status) {
      products.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    ElNotification({
      title: 'Error',
      message: 'Failed to load products.',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

const addToCart = async (product) => {
  try {
    const response = await axios.post(
      'https://massagebackend.webenia.org/api/cart-items',
      {
        product_id: product.id,
        quantity: 1,
        price: parseFloat(product.price), // Always use product.price
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    )
    if (response.data.status) {
      ElNotification({
        title: 'Success',
        message: response.data.message || 'Product added to cart',
        type: 'success',
      })
    } else {
      ElNotification({
        title: 'Error',
        message: response.data.message || 'Failed to add product',
        type: 'error',
      })
    }
  } catch (error) {
    console.error('Add to cart error:', error)
    ElNotification({
      title: 'Error',
      message: error.response?.data?.message || 'Something went wrong',
      type: 'error',
    })
  }
}

window.addEventListener('currency-changed', () => {
  fetchProducts()
})

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-section {
  margin-top: 2rem;
}

.card {
  border-radius: 1rem;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-img-top {
  object-fit: cover;
  height: 180px;
}

.card-title {
  font-weight: 600;
  color: #333;
}

.btn {
  width: 100%;
}
</style> 