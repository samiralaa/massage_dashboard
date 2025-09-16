<template>
  <div class="modal-overlay d-flex justify-content-center align-items-center">
    <div class="favorites-modal bg-white rounded-4 shadow p-4 position-relative">
      <!-- Close Button -->
      <button type="button" class="close btn-close position-absolute top-0 m-3" @click="$emit('close')" aria-label="Close"></button>

      <!-- Title -->
      <h4 class="mb-3">❤️ {{ $t('favorites.title') }}</h4>

      <!-- Favorites List -->
      <div class="favorites-content overflow-auto" style="max-height: 60vh;">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t('favorites.loading') }}</span>
          </div>
        </div>
        <ul v-else-if="favorites && favorites.length" class="list-unstyled">
          <li v-for="favorite in favorites" :key="favorite.favorite_id" class="favorite-item d-flex align-items-center border-bottom py-3 gap-3">
            <img 
              :src="getProductImage(favorite)" 
              :alt="currentLang === 'ar' ? favorite.name_ar : favorite.name_en" 
              class="product-image" 
            />

            <div class="flex-grow-1">
              <h6 class="mb-1">{{ currentLang === 'ar' ? favorite.name_ar : favorite.name_en }}</h6>
              <p class="text-muted mb-2 small">{{ currentLang === 'ar' ? favorite.description_ar : favorite.description_en }}</p>

              
              <!-- Price -->
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  
                  <span v-if="isDiscountActive(favorite) && getOldPrice(favorite)" class="price-old" dir="ltr">
                    {{ getOldPrice(favorite) }} {{ favorite.currency_code || 'AUD' }}
                  </span>
                  <span class="price" dir="ltr">
                    {{ calculateDiscountedPrice(favorite) }} {{ favorite.currency_code || 'AUD' }}
                  </span>
                </div>
                <div class="d-flex gap-2">
                 
                 <div class="cart-button-parent" :style="{
                      cursor:  !favorite.is_available ? 'not-allowed' : 'pointer',
                    }">
                  <button 
                    class="btn btn-sm btn-outline-primary" 
                    @click="addToCart(favorite)"
                    :disabled="isLoading || !favorite.is_available"
                    
                  >
                    <fa icon="shopping-cart" />
                  </button>
                 </div> 
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="removeFavorite(favorite.favorite_id)"
                    :disabled="isLoading"
                  >
                    <fa icon="trash" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <div v-else class="text-center text-muted py-4">
          ❤️ {{ $t('favorites.emptyFavoritesMessage') }}
        </div>
      </div>

      <!-- Footer -->
      <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-outline-secondary" @click="$emit('close')">
          {{ $t('favorites.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { API_URL } from '@/store/index.js';
import { ElNotification } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import axios from 'axios';
import { useFavoritesStore } from '@/store/favorites';
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/store/cart';

export default {
  name: 'FavoritesModal',
  components: {
    fa: FontAwesomeIcon
  },
  props: {
    currentLang: {
      type: String,
      default: 'en'
    }
  },
  setup() {
    const { t } = useI18n();
    const favoritesStore = useFavoritesStore();
    const { favorites, isLoading } = storeToRefs(favoritesStore);
    const cartStore = useCartStore();

    return { 
      t,
      favorites,
      isLoading,
      favoritesStore,
      cartStore
    };
  },
  async created() {
    await this.favoritesStore.fetchFavorites();
    
    
  },
  methods: {
    getProductImage(favorite) {
      if (!favorite.images || !favorite.images[0]) {
        return '/placeholder-image.jpg';
      }
      const imageUrl = favorite.images[0];
      const publicStorageBase = `${API_URL}/public/storage/`;
      if (imageUrl.startsWith(publicStorageBase)) {
        return imageUrl;
      }
      if (imageUrl.startsWith(API_URL)) {
        const relativePath = imageUrl.substring(API_URL.length);
        return `${publicStorageBase}${relativePath.startsWith('/') ? relativePath.substring(1) : relativePath}`;
      }
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      return `${publicStorageBase}${imageUrl}`;
    },
    async removeFavorite(favoriteId) {
      try {
        await this.favoritesStore.removeFromFavorites(favoriteId);
        ElNotification({
          title: this.t('success'),
          message: this.t('favorite_removed'),
          type: 'success',
        });
        this.$emit('favorite-removed', favoriteId);
      } catch (error) {
        console.error('Error removing favorite:', error);
        ElNotification({
          title: this.t('error'),
          message: error.response?.data?.message || this.t('remove_favorite_error'),
          type: 'error',
        });
      }
    },
    async addToCart(favorite) {
      if (!favorite || !favorite.price) {
        ElNotification({
          title: this.t('error'),
          message: this.t('invalid_product'),
          type: 'error',
        });
        return;
      }
      try {
        let priceToSend = 0;
        if (this.isDiscountActive(favorite)) {
          const discountValue = this.getDiscountPercentage(favorite);
          const originalPrice = parseFloat(favorite.price); // Use original price only
          priceToSend = originalPrice - (originalPrice * (discountValue / 100));
        } else {
          priceToSend = parseFloat(favorite.price); // Use original price only
        }
        const response = await axios.post(`${API_URL}/api/cart-items`, {
          product_id: favorite.product_id,
          quantity: 1,
          price: priceToSend
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.data.status) {
          ElNotification({
            title: this.t('success'),
            message: this.t('cart.added_to_cart'),
            type: 'success',
          });
          await this.cartStore.incrementCount();
          await this.cartStore.fetchCartCount();
          this.$emit('close');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        const errorMessage = error.response?.data?.message || this.t('add_to_cart_error');
        ElNotification({
          title: this.t('error'),
          message: errorMessage,
          type: 'error',
        });
      }
    },
    isDiscountActive(favorite) {
      if (!favorite.discount) return false;
      if (Array.isArray(favorite.discount)) {
        return favorite.discount.length > 0 && !!favorite.discount[0].discount_value && (favorite.discount[0].is_active === undefined || favorite.discount[0].is_active);
      }
      return !!favorite.discount.value && (favorite.discount.is_active === undefined || favorite.discount.is_active);
    },
    getDiscountPercentage(favorite) {
      if (!favorite.discount) return 0;
      if (Array.isArray(favorite.discount)) {
        return favorite.discount.length > 0 ? Math.round(parseFloat(favorite.discount[0].discount_value)) : 0;
      }
      return Math.round(parseFloat(favorite.discount.value));
    },
    getOldPrice(favorite) {
      return favorite.converted_price || favorite.price;
    },
    calculateDiscountedPrice(favorite) {
      if (this.isDiscountActive(favorite)) {
        const discountValue = this.getDiscountPercentage(favorite);
        const originalPrice = parseFloat(this.getOldPrice(favorite));
        const discountedPrice = originalPrice - (originalPrice * (discountValue / 100));
        return discountedPrice.toFixed(2);
      }
      return (favorite.converted_price || favorite.price).toFixed(2);
    }
  },
  emits: ['close', 'favorite-removed']
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1050;
  backdrop-filter: blur(2px);
  padding: 1rem;
}

.favorites-modal {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
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

.close{
  right: 0;
}

[dir="rtl"] .close{
  left: 0;
  right: auto;
}

.favorites-content {
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.favorites-content::-webkit-scrollbar {
  width: 6px;
}

.favorites-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 5px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.favorite-item {
  transition: background-color 0.3s ease;
}

.favorite-item:hover {
  background-color: #f8f9fa;
}

.price {
  font-weight: 600;
  color: #8B6B3D;
}

.btn-outline-danger {
  border-color: #dc3545;
  color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.btn-outline-primary {
  border-color: #8B6B3D;
  color: #8B6B3D;
}

.btn-outline-primary:hover {
  background-color: #8B6B3D;
  color: white;

}

.btn-outline-primary:disabled {
  opacity: 0.65;
 
}


@media (max-width: 768px) {
  .product-image {
    width: 60px;
    height: 60px;
  }
  
  .favorite-item {
    padding: 0.75rem 0;
  }
}

.discount-badge {
  background-color: #ff4d4d;
  color: white;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 1.1rem;
  font-weight: 700;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(255,76,76,0.15);
  margin-right: 0.5rem;
}
.price-old {
  text-decoration: line-through;
  color: #aaa;
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.95rem;
  text-align: center;
  margin-right: 0.5rem;
}
</style>