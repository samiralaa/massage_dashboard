<template>
  <Header />
  <div class="brand-detail">
    <!-- Brand Header -->
    <div class="brand-header">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-3">
            <img :src="getBrandImage(brand)" :alt="currentLang === 'ar' ? brand.name_ar : brand.name_en"
              class="brand-logo">
          </div>
          <div class="col-md-9">
            <h1 class="brand-name">{{ currentLang === 'ar' ? brand.name_ar : brand.name_en }}</h1>
            <p class="brand-description">{{ currentLang === 'ar' ? brand.description_ar : brand.description_en }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Section -->
    <div class="all-categories py-5">
      <div class="container">
        <div class="title">
          <i class="fas fa-th-large fa-icon"></i>
          <h2 class="section-title mb-0">{{ $t('categories.title') }}</h2>
        </div>

        <div class="slider-wrapper">
          <div class="slider row slick-track p-4">
            <div v-for="category in brand.categories" :key="category.id" class="col-md-4 col-lg-3">
              <router-link :to="`/category/${category.id}`" class="card text-decoration-none">
                <div class="category-content">
                  <img :src="getCategoryImage(category)"
                    :alt="currentLang === 'ar' ? category.name_ar : category.name_en" />
                  <p>{{ currentLang === 'ar' ? category.name_ar : category.name_en }}</p>
                  <span class="product-count"> {{ $t('Products.Products') }} : {{ category.products.length }}</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Section -->
    <div class="products-section py-5">
      <div class="container">
        <h2 class="section-title mb-4">{{ $t('Products.Products') }}</h2>
        <div v-for="category in brand.categories" :key="category.id">
          <div v-if="category.products.length > 0" class="category-products mb-5">
            <h3 class="category-title mb-4">{{ currentLang === 'ar' ? category.name_ar : category.name_en }}</h3>
            <div class="products-grid">
              <div v-for="product in category.products" :key="product.id" class="product-card">
                <div class="image-container mb-3 bg-light rounded">
                  <router-link :to="`/read/products/${product.id}`" class="product-link">
                    <img :src="getProductImage(product)"
                      :alt="currentLang === 'ar' ? product.name_ar : product.name_en" />

                  </router-link>

                  <div v-if="!product.is_available" class="sale-badge">{{ $t('products.outOfStock') }}</div>
                  <div class="product-actions d-flex justify-content-center gap-5 w-100">
                    <router-link :to="`/read/products/${product.id}`" class="btn btn-light rounded-circle shadow-sm"
                      title="View">
                      <fa icon="eye" />
                    </router-link>
                    <button @click="addToFavorites(product)" class="btn rounded-circle shadow-sm btn-light"
                      :class="isInFavorites(product.id) ? 'text-danger' : ''"
                      :title="isInFavorites(product.id) ? 'Remove from favorites' : 'Add to favorites'">
                      <fa :icon="isInFavorites(product.id) ? 'fas fa-heart' : 'far fa-heart'" />
                    </button>
                  </div>

                  <div v-if="product.discount" class="sale-badge">{{ $t('Sale') }}</div>
                </div>

                <div class="card-body">
                  <h5 class="card-title">{{ currentLang === 'ar' ? product.name_ar : product.name_en }}</h5>
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
                <div class="addToCart-btn">
                  <button :disabled="!product.is_available" @click="addToCart(product)" class="btn">
                    {{ $t('products.addToCart') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElNotification } from 'element-plus'

import Header from '@/components/Website/Header.vue'
import Footer from '@/components/Website/Footer.vue'
import { API_URL } from '@/store/index.js'
import { useFavoritesStore } from '@/store/favorites'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/store/cart' // Adjust path as needed


const route = useRoute()
const brand = ref({ categories: [] })
const loading = ref(true)
const error = ref(null)
const showSuccessDialog = ref(false)
const successMessage = ref('')
const { t } = useI18n()


const { locale } = useI18n()

const currentLang = computed(() => localStorage.getItem('lang') || 'en')

const favoritesStore = useFavoritesStore()
const cartStore = useCartStore() // If using Pinia or similar

onMounted(() => {
  fetchBrandDetails()
  window.addEventListener('currency-changed', () => {
    fetchBrandDetails()
  })
})

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      loading.value = true
      await fetchBrandDetails()
    }
  }
)

const fetchBrandDetails = async () => {
  try {
    const brandId = route.params.id
    const response = await axios.get(
      `${API_URL}/api/website/brands/${brandId}`
    )
    brand.value = response.data.data
  } catch (err) {
    console.error('Error fetching brand details:', err)
    error.value = 'Failed to load brand details'
  } finally {
    loading.value = false
  }
}


const getBrandImage = (brandObj) => {
  return brandObj?.images?.[0]?.path
    ? `${API_URL}/public/storage/${brandObj.images[0].path}`
    : '/placeholder-image.jpg'
}

const getCategoryImage = (category) => {
  return category?.images?.[0]?.path
    ? `${API_URL}/public/storage/${category.images[0].path}`
    : '/placeholder-image.jpg'
}

const getProductImage = (product) => {
  return product?.images?.[0]?.path
    ? `${API_URL}/public/storage/${product.images[0].path}`
    : '/placeholder-image.jpg'
}

const isInFavorites = (productId) => {
  return favoritesStore.favorites.some(fav => fav.product_id === productId)
}

const getFavoriteId = (productId) => {
  const fav = favoritesStore.favorites.find(f => f.product_id === productId)
  return fav ? (fav.favorite_id || fav.id) : null
}

const addToFavorites = async (product) => {
  try {
    if (isInFavorites(product.id)) {
      const favId = getFavoriteId(product.id)
      if (favId) {
        await favoritesStore.removeFromFavorites(favId)
        ElNotification({
          title: t('success'),
          message: t('favorite_removed') || 'Product removed from favorites',
          type: 'success',
        })
      }
    } else {
      const res = await favoritesStore.addToFavorites(product.id)
      ElNotification({
        title: t('success'),
        message: res.message || t('favorite_added') || 'Product added to favorites',
        type: 'success',
      })
    }
  } catch (err) {
    console.error('Favorite error:', err)
    ElNotification({
      title: t('error'),
      message: err.response?.data?.message || t('login_required_favorite') || 'Login required to favorite product',
      type: 'error',
    })
  }
}

const addToCart = async (product) => {
  try {
    let priceToSend = 0;
    if (product.discount && product.discount.is_active) {
      const discountValue = parseFloat(product.discount.discount_value);
      const originalPrice = parseFloat(product.price || product.price);
      priceToSend = originalPrice - originalPrice * (discountValue / 100);
    } else {
      priceToSend = parseFloat(product.price || product.price);
    }

    const payload = {
      product_id: product.id,
      quantity: 1,
      price: priceToSend,
    }

    if (product.amounts) {
      payload.amount_id = product.amount_id
    }

    const response = await axios.post(
      `${API_URL}/api/cart-items`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    )

    if (response.data.status) {
      ElNotification({
        title: t('success'),
        message: response.data.message,
        type: 'success'
      })
      await cartStore.fetchCartCount() // <-- Update cart count in real-time
    } else {
      ElNotification({
        title: t('error'),
        message: response.data.message,
        type: 'error'
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
      message: error.response?.data?.message,
      type: 'error'
    })
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

watch(locale, () => {
  fetchBrandDetails()
})
</script>

<style scoped>
.brand-header {
  background-color: #f8f9fa;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.brand-logo {
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: contain;
}

.brand-name {
  color: #8B6B3D;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.brand-description {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
}

.section-title {
  color: #8B6B3D;
  font-size: 2rem;
  font-weight: 600;
}

.slider-wrapper {
  position: relative;
  overflow: hidden;
  padding: 16px 0;
}

.slick-track {
  width: 100%;
  overflow: hidden !important;
}

.nav-button {
  background-color: #8b6b3d;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.nav-button:hover {
  background-color: #725932;
}

.slider {
  display: flex !important;
}

.card {
  background-color: #f7f7f7;
  border: none;
  padding: 12px;
  margin: 15px;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
  width: 100%;
}

.card::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background-color: #8b6b3d;
  border-radius: 8px;
  transform: translate(-50%, -50%) scale(0);
  z-index: -1;
  transition: transform 0.3s ease;
}

.card:hover {
  color: #fff;
  transform: scale(1.1);
  z-index: 1;
}

.product-count {
  background-color: rgba(139, 107, 61, 0.8);
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #fff;
  transition: color 0.3s ease;
}

.card:hover::after {
  transform: translate(-50%, -50%) scale(1);
}

.category-content img {
  border-radius: 8px;
  width: 100%;
  height: auto;
}

.category-content p {
  margin-top: 8px;
  font-weight: bold;
}

@media (max-width: 1200px) {
  .scrollers {
    display: flex;
  }
}

@media (max-width: 768px) {
  .card:hover {
    transform: scale(1);
    color: #333 !important;
  }

  .card:hover::after {
    transform: translate(-50%, -50%) scale(0);
  }
}

@media (max-width: 576px) {
  .nav-button {
    font-size: 1.1rem;
  }
}

.products-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  position: relative;
  background: #fff;
  text-align: center;
  transition: box-shadow 0.3s;
  height: fit-content;
}

.image-container {
  position: relative;
  background: #f9f9f9;
  overflow: hidden;
  border-radius: 5px;
}

.image-container img {
  width: 100%;
  height: auto;
  transition: transform 0.3s ease;
}

.product-card:hover .image-container img {
  transform: scale(1.1);
}

.product-actions {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
  transition: all 0.3s ease-in-out;
  z-index: 10;
}

.product-card:hover .product-actions {
  transform: translateX(-50%) translateY(-30%);
  opacity: 1;
}

.btn {
  font-size: 1.5rem;
}

.action-btn {
  border: none;
  border-radius: 10px;
  width: 100%;
  height: 45px;
  display: flex;
  margin: 1rem;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon {
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.action-btn:hover .icon {
  transform: scale(1.2);
}

.cart-btn {
  background-color: #fff;
  color: #8b6b3d;
}

.love-btn {
  background-color: #8b6b3d;
  color: #fff;
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
  margin-bottom: 10px;
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

.card-title {
  color: #8b6b3d;
  transition: all 0.2s ease-in;
  font-weight: 600;
  font-size: 1.2rem;
}

.addToCart-btn {
  display: flex;
  justify-content: end;
  align-items: center;
  width: 100%;
}

.addToCart-btn button {
  position: relative;
  padding: 0.75rem 1.5rem;
  color: #8b6b3d;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  overflow: hidden;
  z-index: 0;
  border-radius: 0;
  background-color: #fff;
}

.addToCart-btn button::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #8b6b3d;
  transition: height 0.3s ease;
  z-index: -1;
}

.addToCart-btn button:hover {
  color: #fff;
  border-radius: 6px;
}

.addToCart-btn button:hover::before {
  height: 100%;
}

@media (max-width: 1200px) {
  .product-actions {
    position: absolute;
    bottom: 5%;
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
</style>