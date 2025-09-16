<template>
  <div class="products-section">
    <div class="container">
      <div class="title section-header d-flex align-items-center mb-4">
        <fa class="fa-icon me-2" :icon="['fas', 'shopping-basket']" />
        <h2 class="mb-0">{{ $t('home.products') }}</h2>
      </div>
      <div v-if="loading" class="text-center my-4">Loading products...</div>
      <div v-else>
        <div class="row g-3">
          <div v-for="product in products" :key="product.id" class="col-sm-6 col-md-4 col-lg-3">
            <div class="product-card card border-0 h-100">
              <div class="position-relative overflow-hidden bg-light">
                <router-link :to="`/read/products/${product.id}`">
                  <img v-if="product.images && product.images.length" :src="getImageUrl(product.images[0].path)"
                    :alt="product.name_en" class="card-img-top product-img" />
                </router-link>
                <div v-if="!product.is_available" class="sale-badge">
                  {{ $t('products.outOfStock') }}
                </div>
                <!-- Action Buttons -->
                <div class="product-actions d-flex justify-content-center gap-2 w-100">
                  <router-link :to="`/read/products/${product.id}`" class="btn btn-light rounded-circle shadow-sm" title="View">
                    <fa icon="eye" />
                  </router-link>
                  <button @click="addToCart(product)" class="btn btn-light shadow-sm disable" :class="{ disabled: !product.is_available }" :disabled="!product.is_available">
                    {{ $t('home.add-to-cart') }}
                  </button>
                  <button @click="addToCart(product)" class="d-none btn rounded-circle shadow-sm btn-light enable">
                    <fa icon="shopping-cart" />
                  </button>
                  <button @click="addToFavorites(product)" class="btn rounded-circle shadow-sm btn-light"
                    :class="isInFavorites(product.id) ? 'text-danger' : ''"
                    :title="isInFavorites(product.id) ? 'Remove from favorites' : 'Add to favorites'">
                    <fa :icon="isInFavorites(product.id) ? 'fas fa-heart' : 'far fa-heart'" />
                  </button>
                </div>
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ locale === 'ar' ? product.name_ar : product.name_en }}</h5>
                <div class="price-container">
                  <span v-if="product.discount && product.discount.is_active" class="discount-badge">
                    {{ getDiscountPercentage(product) }}% OFF
                  </span>
                  <span v-if="product.discount && product.discount.is_active" class="price-old" dir="ltr">
                    {{ product.converted_price }} {{ product.currency_code }}
                  </span>
                  <span class="card-text card-price" dir="ltr">
                    {{ calculateDiscountedPrice(product) }} {{ product.currency_code }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-center mt-4">
          <button class="btn view-all-btn" @click="goToAllProducts">
            {{ $t('home.view-all-products') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElNotification } from 'element-plus'
import { useFavoritesStore } from '@/store/favorites'
import { useCartStore } from '@/store/cart'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const products = ref([])
const currencies = ref([])
const loading = ref(false)

const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()
const { locale, t } = useI18n()
const router = useRouter()

const getImageUrl = (path) =>
  `https://massagebackend.webenia.org/public/storage/${path}`

const fetchCurrencies = async () => {
  try {
    const response = await axios.get('https://massagebackend.webenia.org/api/currencies')
    if (response.data.currencies) {
      currencies.value = response.data.currencies
    }
  } catch (error) {
    console.error('Error fetching currencies:', error)
  }
}

const fetchProducts = async () => {
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
      await fetchFavorites()
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

const fetchFavorites = async () => {
  try {
    const response = await axios.get('https://massagebackend.webenia.org/api/favorites', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      }
    })
    if (response.data.status && response.data.data) {
      favoritesStore.setFavorites(response.data.data)
    }
  } catch (error) {
    console.error('Error fetching favorites:', error)
  }
}

const isInFavorites = (productId) => {
  return favoritesStore.favorites.some((fav) => fav.product_id === productId)
}

const getFavoriteId = (productId) => {
  return favoritesStore.favorites.find((fav) => fav.product_id === productId)?.favorite_id || favoritesStore.favorites.find((fav) => fav.product_id === productId)?.id
}

const addToFavorites = async (product) => {
  try {
    if (isInFavorites(product.id)) {
      const favoriteId = getFavoriteId(product.id)
      if (favoriteId) {
        await favoritesStore.removeFromFavorites(favoriteId)
        ElNotification({
          title: t('success'),
          message: t('favorite_removed') || 'Product removed from favorites',
          type: 'success',
        })
      }
    } else {
      const response = await favoritesStore.addToFavorites(product.id)
      ElNotification({
        title: t('success'),
        message: t('favorite_added') ,
        type: 'success',
      })
    }
  } catch (error) {
    if (error.response?.data?.message === 'Unauthenticated.') {
      ElNotification({
        title: t('error'),
        message: t('unauthenticated'),
        type: 'warning',
        duration: 4000
      })
    
      return
    }
    ElNotification({
      title: t('error'),
      message: error.response?.data?.message || t('login_required_favorite') || 'Login required to favorite product',
      type: 'error',
    })
  }
}

const addToCart = async (product) => {
  try {
    // Calculate the price to send: discounted if discount is active, else regular
    let priceToSend = 0;
    if (product.discount && product.discount.is_active) {
      const discountValue = parseFloat(product.discount.discount_value);
      const originalPrice = parseFloat(product.price); // Always use product.price
      priceToSend = originalPrice - originalPrice * (discountValue / 100);
    } else {
      priceToSend = parseFloat(product.price); // Always use product.price
    }

    const response = await axios.post(
      'https://massagebackend.webenia.org/api/cart-items',
      {
        product_id: product.id,
        quantity: 1,
        price: priceToSend,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    )

    if (response.data.status) {
      ElNotification({
      title: t('success'),
      message: t('cart.added_to_cart'),
      type: 'success',
    })
      cartStore.incrementCount();
      await cartStore.fetchCartCount();
    } else {
      ElNotification.error(response.data.message)
    }
  } catch (error) {
    if (error.response?.data?.message === 'Unauthenticated.') {
      ElNotification({
        title: t('error'),
        message: t('unauthenticated'),
        type: 'warning',
        duration: 4000
      })
      return
    }
    ElNotification.error(
      error.response?.data?.message || 'Error adding product to cart'
    )
  }
}

const calculateDiscountedPrice = (product) => {
  if (product.discount && product.discount.is_active) {
    const discountValue = parseFloat(product.discount.discount_value)
    const originalPrice = parseFloat(product.converted_price || product.price)
    const discountedPrice = originalPrice - originalPrice * (discountValue / 100)
    return discountedPrice.toFixed(2)
  }
  return product.converted_price || product.price
}

const getDiscountPercentage = (product) => {
  if (product.discount && product.discount.is_active) {
    const discountValue = parseFloat(product.discount.discount_value)
    return Math.round(discountValue)
  }
  return 0
}

const goToAllProducts = () => {
  router.push('/product-listing')
}


onMounted(async () => {
  await fetchCurrencies()
  await fetchProducts()
  window.addEventListener('currency-changed', () => {
    fetchProducts()
  })
})
</script>

<style scoped>
.section-header {
  font-size: 1.6rem;
  font-weight: 600;
  color: #8b6b3d;
}

.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 1rem;
  overflow: hidden;
  background-color: #fff;
  padding: 0 !important;
}

.product-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.product-img {
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-actions {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
  transition: all 0.3s ease-in-out;
  z-index: 10;
  pointer-events: auto;
}

.product-card:hover .product-actions {
  transform: translateX(-50%) translateY(-30%);
  opacity: 1;
  pointer-events: auto;
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.card-price {
  background-color: #e8f5e9;
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.95rem;
  text-align: center;
}

.price-old {
  text-decoration: line-through;
  color: #aaa;
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.95rem;
  text-align: center;
}

.sale-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ff4c4c;
  color: white;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 5px;
}

.btn {
  font-size: 1.1rem;
}

.card-title {
  color: #8b6b3d;
  transition: all 0.2s ease-in;
  font-weight: 600;
  font-size: 1.2rem;
}

.view-all-btn {
  background-color: #8b6b3d;
  color: #fff;
  border: none;
  padding: 0.6rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 999px;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 2px 8px rgba(139, 107, 61, 0.08);
}
.view-all-btn:hover, .view-all-btn:focus {
  background-color: #a07a47;
  color: #fff;
}

@media (max-width: 1200px) {
  .disable {
    display: none;
  }

  .enable {
    display: block !important;
  }

  .product-actions {
    position: absolute;
    bottom: 7%;
    left: 0%;
    opacity: 1;
    transform: translateX(0) translateY(0);
    z-index: 10;
  }

  .product-card:hover .product-actions {
    transform: translateX(0) translateY(0);
  }

  .card-body {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .card-title {
    font-size: 1.1rem;
  }

  .card-text {
    font-size: 0.95rem;
  }

  .btn {
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: 1rem 0.5rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-text {
    font-size: 0.8rem;
  }
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.discount-badge {
  background-color: #ff4d4f;
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
}

.btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
