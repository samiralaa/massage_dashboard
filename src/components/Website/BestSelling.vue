<template>
  <div class="products-section">
    <div class="container">
      <div class="title mt-5">
        <fa class="fa-icon" :icon="['fas', 'star']"></fa>
        <h2>{{ $t('home.best-selling') }}</h2>
      </div>
      <div class="row g-4">
        <el-col v-for="product in products" :key="product.id" :xs="24" :sm="24" :md="12" :lg="12">
          <div class="card my-3 p-sm-4">
            <div class="img-container rounded position-relative">
              <router-link :to="`/read/products/${product.id}`">
                <img v-if="product.images.length" :src="getImageUrl(product.images[0].path)" :alt="product.name_en"
                  class="product-img card-img bg-light" />
              </router-link>
              <div v-if="!product.is_available" class="sale-badge">{{ $t('products.outOfStock') }}</div>
            </div>
            <div class="body-container">
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
              <div class="product-actions d-flex justify-content-center flex-wrap gap-2">
                <router-link :to="`/read/products/${product.id}`" class="btn btn-light rounded-circle shadow-sm"
                  title="View">
                  <fa icon="eye" />
                </router-link>
                <button :disabled="!product.is_available" @click="addToCart(product)"
                  class="btn btn-light shadow-sm rounded-circle">
                  <fa icon="cart-plus" />
                </button>
                <button @click="addToFavorites(product)" class="btn rounded-circle shadow-sm btn-light"
                  :class="isInFavorites(product.id) ? 'text-danger' : ''"
                  :title="isInFavorites(product.id) ? 'Remove from favorites' : 'Add to favorites'">
                  <fa :icon="isInFavorites(product.id) ? 'fas fa-heart' : 'far fa-heart'" />
                </button>
              </div>
            </div>
          </div>

        </el-col>
      </div>
    </div>
    <el-dialog v-model="showSuccessDialog" title="🎉 Success" width="30%"
      :before-close="() => (showSuccessDialog = false)" :center="true" :close-on-click-modal="false"
      :show-close="false">
      <span>{{ successMessage }}</span>
      <template #footer>
        <el-button type="primary" @click="showSuccessDialog = false">OK</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElNotification } from 'element-plus';
import { useFavoritesStore } from '@/store/favorites'
import { useCartStore } from '@/store/cart'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'
const products = ref([]);
const showSuccessDialog = ref(false);
const successMessage = ref('');
const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()
const { locale, t } = useI18n();
const currencies = ref([])
const selectedCurrency = ref({ code: 'USD' })

const fetchProducts = async () => {
  try {
    const selectedCurrency =
      JSON.parse(localStorage.getItem('selectedCurrency')) || { code: 'USD' }
    const response = await axios.get(
      'https://massagebackend.webenia.org/api/website/best-selling/products',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          Currency: selectedCurrency.code,
        }
      }
    )

    if (response.data.status && response.data.data) {
      products.value = response.data.data;
      // Fetch favorites after getting products
      await fetchFavorites();
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    ElNotification({
      title: 'Error',
      message: 'Failed to load products.',
      type: 'error',
    })
  }
};

const fetchFavorites = async () => {
  try {
    const response = await axios.get('https://massagebackend.webenia.org/api/favorites', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (response.data.status && response.data.data) {
      // Update favorites store with the fetched favorites
      favoritesStore.setFavorites(response.data.data)
    }
  } catch (error) {
    console.error('Error fetching favorites:', error)
  }
}

const getImageUrl = (path) => {
  return `https://massagebackend.webenia.org/public/storage/${path}`;
};

const isInFavorites = (productId) => {
  return favoritesStore.favorites.some(favorite => favorite.product_id === productId)
}

const getFavoriteId = (productId) => {
  const favorite = favoritesStore.favorites.find(favorite => favorite.product_id === productId)
  return favorite ? (favorite.favorite_id || favorite.id) : null
}

const addToFavorites = async (product) => {
  try {
    // Check if product is already in favorites
    if (isInFavorites(product.id)) {
      // Get the favorite ID and remove from favorites
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
      // Add to favorites
      const response = await favoritesStore.addToFavorites(product.id)
      ElNotification({
        title: t('success'),
        message: response.message || t('favorite_added') || 'Product added to favorites',
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
};

const addToCart = async (product) => {
  try {
    // Calculate the price to send: discounted if discount is active, else regular
    let priceToSend = 0;
    if (product.discount && product.discount.is_active) {
      const discountValue = parseFloat(product.discount.discount_value);
      const originalPrice = parseFloat(product.price); // Use original price only
      priceToSend = originalPrice - originalPrice * (discountValue / 100);
    } else {
      priceToSend = parseFloat(product.price); // Use original price only
    }

    const userId = localStorage.getItem('user_id');
    const response = await axios.post(
      'https://massagebackend.webenia.org/api/cart-items',
      {
        product_id: product.id,
        quantity: 1,
        price: priceToSend,
        user_id: userId
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );

    if (response.data.status) {
      ElNotification({
        title: t('success'),
        message: response.data.message,
        type: 'success'
      })
      cartStore.incrementCount();
      await cartStore.fetchCartCount();
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
};

const calculateDiscountedPrice = (product) => {
  if (product.discount && product.discount.is_active) {
    const discountValue = parseFloat(product.discount.discount_value)
    const originalPrice = parseFloat(product.converted_price || product.price)
    const discountedPrice = originalPrice - originalPrice * (discountValue / 100)
    return discountedPrice.toFixed(2)
  }
  return product.converted_price || product.price
};

const getDiscountPercentage = (product) => {
  if (product.discount && product.discount.is_active) {
    const discountValue = parseFloat(product.discount.discount_value)
    return Math.round(discountValue)
  }
  return 0
}

onMounted(() => {
  fetchProducts();
  window.addEventListener('currency-changed', () => {
    fetchProducts()
  })
});
</script>
<style scoped>
.products-section {
  padding-bottom: 2rem;
}

.title {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8b6b3d;
}

.fa-icon {
  font-size: 1.2rem;
  background-color: #8b6b3d;
  border-radius: 50%;
  padding: 8px;
  color: #fff;
}

.card {
  flex-direction: row;
  align-items: center;
  border-radius: 20px;
  overflow: hidden;
  border: none;
  transition: all 0.3s ease;
}

.body-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}


.img-container {
  width: 400px;
  /* height: 400px; */
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.img-container img {
  width: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .img-container img {
  transform: scale(1.05);
}

.btn[disabled] {
  cursor: no-drop;
}



.card-title {
  font-size: 1.2rem;
  color: #a67c52;
}

.card-text {
  font-size: 1rem;
  color: #444;
}


.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  width: 100%;
}

.product-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
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

.love-btn.active {
  background-color: #ff4d4d;
  color: white;
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

@media (max-width: 768px) {
  .card {
    flex-direction: row;
  }

  .img-container {
    width: 100%;
    height: auto;
  }

  .img-container img {
    height: auto;
  }

  .card-btns {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .body-container {
    flex-direction: column;
  }

  .product-actions {
    flex-direction: row;
  }

  .img-container {
    width: 100%;
    height: auto;
  }

  .img-container img {
    height: auto;
  }

  .card-body {
    align-items: center;
    padding: 0 0.5rem 0.5rem;
  }

  .btn {
    padding: 0.25rem 0.5rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-text {
    font-size: 0.9rem;
  }

  .card-price {
    font-size: 0.8rem;
  }
}

.price-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.discount-badge {
  background-color: #ff4d4d;
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
