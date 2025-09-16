<template>
  <Header />

  <div class="product-show" :dir="direction">
    <div class="container">
      <el-row :gutter="20" class="product-container full-height-row flex-md-row flex-column-reverse">
        <el-col :xs="24" :sm="24" :md="12" :lg="14">
          <div class="product-details">
            <h1 class="product-title">{{ locale === 'ar' ? product.name_ar : product.name_en }}</h1>
            
              <ul v-if="formattedDescription.length" class="description">
      <li v-for="(chunk, index) in formattedDescription" :key="index">
       <p v-for="(line, i) in chunk" :key="i">{{ line }}</p>
  </li>
   </ul>
           
            
            <div class="price-block">
              <div class="d-flex">
                <span class="price-old" v-if="product.discount && product.discount.is_active" dir="ltr">
                  {{ currentPrice }} {{ product.currency_code }}
                </span>
                <span class="discount-badge" v-if="product.discount && product.discount.is_active" dir="ltr">
                  -{{ product.discount.discount_value }}%
                </span>
              </div>
              <span class="price-new" dir="ltr">{{ discountedPriceToShow || 0 }} {{ product.currency_code }}</span>

              <button @click="toggleFavorite(product)" class="love-btn btn rounded-circle shadow-sm btn-light"
                :class="isInFavorites(product.id) ? 'text-danger' : ''"
                :title="isInFavorites(product.id) ? 'Remove from favorites' : 'Add to favorites'">
                <fa :icon="isInFavorites(product.id) ? 'fas fa-heart' : 'far fa-heart'" size="xl" />
              </button>
            </div>
            <div class="product-actions">
              <div v-if="!product.is_available" class="sale-badge">{{ $t('products.outOfStock') }}</div>
            </div>

            <div class="weight" v-if="product.amounts && product.amounts.length > 0">
              <h1 class="weight-title">{{ $t('amount.weight') }}</h1>
              <!-- <div class="reset" @click="resetActive">
                <fa icon="rotate-right"></fa>
                <a>{{ $t('amount.reset') }}</a>
              </div> -->
              <div class="weight-container ">
                <div class="row g-4 ">
                  <div v-for="(amount, index) in product.amounts" :key="amount.id" class="weight-item p-0 "
                    :class="{ active: selectedAmountIndex === index }" @click="setActive(index, amount)">
                    <p>{{ direction === 'rtl' ? amount.weight + '' + amount.unit.name_en : amount.weight + ' ' +
                      amount.unit.name_en }} For {{ amount.converted_price }} {{ product.currency_code }}</p>
                  </div>
                </div>
              </div>
              <div v-if="selectedAmount" class="amount-details" style="margin-top: 1rem;">
                <p>
                  <strong>{{ $t('amount.selected') }}:</strong>
                  {{ direction === 'rtl' ? selectedAmount.weight + "" + selectedAmount.unit.name_en :
                    selectedAmount.weight + ' ' + selectedAmount.unit.name_en }} -
                  {{ selectedAmount.converted_price }} {{ product.currency_code }}
                </p>
                <!-- Add more details here if needed -->
              </div>
              <div v-else>
                <p>{{ $t('amount.noAmount') }}</p>
              </div>
            </div>

            <div class="buttons-section">
              <el-button class="add-to-cart btn" :disabled="!product.is_available" type="primary" size="large" round
                @click="addToCart">{{ $t('products.addToCart')
                }}</el-button>

              <div class="quantity-section" v-if="product.is_available">
                <div class="quantity-control">
                  <el-button size="small" @click="decreaseQty" :disabled="quantity <= minQuantity" class="qty-btn">
                    <fa icon="minus" />
                  </el-button>
                  <input dir="ltr" class="form-control qty-number" type="number" min="1" max="99"
                    v-model.number="quantity" @input="quantity = Math.min(quantity)">
                  <el-button size="small" @click="increaseQty" :disabled="quantity >= maxQuantity" class="qty-btn">
                    <fa icon="plus" />
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="10" class="image-col">
          <div class="image-wrapper" ref="main">
            <div v-for="(image, index) in product.images" :key="image.id" class="slide">
              <img :src="getImageUrl(selectedImage)" class="main-image" @error="handleImageError" />
            </div>

          </div>
          <div class="slider-wrapper">
            <button class="btn nav-button left" @click="scrollLeft" v-if="numberOfSlides > 1">
              <fa icon="arrow-left"></fa>
            </button>
            <div class="slider-container" :class="{ 'centered-slides': slidesToShow < 3 }">
              <div class="slider" ref="slider">
                <div v-for="(image, index) in product.images" :key="image.id" class="slide"
                  @click="setSelectedImage(image.path)">
                  <img :src="getImageUrl(image.path)" :class="{ active: selectedImage === image.path }"
                    @error="handleImageError" />
                </div>
              </div>
            </div>
            <button class="btn nav-button right" @click="scrollRight" v-if="numberOfSlides > 1">
              <fa icon="arrow-right"></fa>
            </button>
          </div>
        </el-col>


      </el-row>

      <!-- Children Products Section -->
      <div v-if="product.children && product.children.length > 0" class="children-products-section">
        <div class="title section-header d-flex align-items-center mb-4">
          <fa class="fa-icon me-2" :icon="['fas', 'shopping-basket']" />
          <h2 class="mb-0">{{ t('products.relatedProducts') }}</h2>
        </div>
        <div class="row g-3">
          <div class="col-6 col-md-4 col-lg-3" v-for="child in product.children" :key="child.id">
            <div class="product-card card border-0 h-100">
              <div class="position-relative overflow-hidden bg-light">
                <router-link :to="`/read/products/${child.id}`">
                  <img :src="child.images?.length ? getImageUrl(child.images[0].path) : placeholder"
                    :alt="locale === 'ar' ? child.name_ar : child.name_en" class="card-img-top product-img" />
                </router-link>
                <div v-if="!child.is_available" class="sale-badge">{{ $t('products.outOfStock') }}</div>
                <!-- Action Buttons -->
                <div class="product-actions d-flex justify-content-center gap-2 w-100">
                  <router-link :to="`/read/products/${child.id}`" class="btn btn-light rounded-circle shadow-sm"
                    title="View">
                    <fa icon="eye" />
                  </router-link>
                  <button @click="addChildToCart(child)" class="btn btn-light shadow-sm disable"
                    :class="{ 'disabled': !child.is_available }" :disabled="!child.is_available">
                    {{ $t('home.add-to-cart') }}
                  </button>
                  <button @click="addChildToCart(child)" class="d-none btn rounded-circle btn-light shadow-sm enable"
                    :class="{ 'disabled': !child.is_available }" :disabled="!child.is_available">
                    <fa icon="cart-plus" />
                  </button>
                  <button @click="toggleChildFavorite(child)" class="btn rounded-circle shadow-sm btn-light"
                    :class="isChildFavorite(child) ? 'text-danger' : ''"
                    :title="isChildFavorite(child) ? 'Remove from favorites' : 'Add to favorites'">
                    <fa :icon="isChildFavorite(child) ? 'fas fa-heart' : 'far fa-heart'" />
                  </button>
                </div>
              </div>

              <div class="card-body">
                <h5 class="card-title">{{ locale === 'ar' ? child.name_ar : child.name_en }}</h5>
                <div class="price-container">
                  <span v-if="child.discount && child.discount.is_active" class="discount-badge">
                    -{{ child.discount.discount_value }}%
                  </span>
                  <span v-if="child.discount && child.discount.is_active" class="price-old" dir="ltr">
                    {{ child.converted_price || child.price }} {{ child.currency_code || 'UAE' }}
                  </span>
                  <span class="card-text card-price" dir="ltr">
                    {{ calculateDiscountedPrice(child) }} {{ child.currency_code || 'UAE' }}
                  </span>
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
import Header from "@/components/Website/Header.vue";
import Footer from "@/components/Website/Footer.vue";
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { ElNotification } from 'element-plus';
import $ from 'jquery';
import 'slick-carousel/slick/slick.min.js';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useFavoritesStore } from '@/store/favorites';
import { useCartStore } from '@/store/cart';


// Setup
const { locale, t } = useI18n();
const direction = computed(() => (locale.value === "ar" ? "rtl" : "ltr"));
const route = useRoute();
const router = useRouter();
const favoritesStore = useFavoritesStore();
const cartStore = useCartStore();
// Product data
const product = ref({});
const quantity = ref(1);
const minQuantity = 1;
const maxQuantity = 99;
const placeholder = "/default-image.jpg";
const selectedImage = ref(null);
const currentSlideIndex = ref(0);
const description = ref("");
// Slider Ref
const slider = ref(null);
const main = ref(null);
const slidesToShow = ref(3);
const numberOfSlides = ref(3);

// --- FAVORITES LOGIC (main product) ---
const isInFavorites = (productId) => {
  return favoritesStore.favorites.some((fav) => fav.product_id === productId);
};

const getFavoriteId = (productId) => {
  return favoritesStore.favorites.find((fav) => fav.product_id === productId)?.favorite_id || favoritesStore.favorites.find((fav) => fav.product_id === productId)?.id;
};
const addToFavorites = async (product) => {
  try {
    if (isInFavorites(product.id)) {
      const favoriteId = getFavoriteId(product.id)
      if (favoriteId) {
        await favoritesStore.removeFromFavorites(favoriteId)
      }
      ElNotification({
        title: t('success'),
        message: t('favorite_removed') || 'Product removed from favorites',
        type: 'success',
      })
    } else {
      const response = await favoritesStore.addToFavorites(product.id)
      ElNotification({
        title: t('success'),
        message: response.message || t('favorite_added') || 'Product added to favorites',
        type: 'success',
      })
    }
  } catch (error) {
    console.error('Favorite error:', error)
    ElNotification({
      title: t('error'),
      message: error.response?.data?.message || t('login_required_favorite') || 'Login required to favorite product',
      type: 'error',
    })
  }
}
const toggleFavorite = async (productObj) => {
  try {
    if (isInFavorites(productObj.id)) {
      const favoriteId = getFavoriteId(productObj.id);
      if (favoriteId) {
        await favoritesStore.removeFromFavorites(favoriteId);
        ElNotification({
          title: t('success'),
          message: t('favorite_removed') || 'Product removed from favorites',
          type: 'success',
        });
      }
    } else {
      const response = await favoritesStore.addToFavorites(productObj.id);
      ElNotification({
        title: t('success'),
        message: response.message || t('favorite_added') || 'Product added to favorites',
        type: 'success',
      });
    }
  } catch (error) {
    console.error('Favorite error:', error);
    ElNotification({
      title: t('error'),
      message: error.response?.data?.message || t('login_required_favorite') || 'Login required to favorite product',
      type: 'error',
    });
  }
};

// --- ADD TO CART LOGIC (main product) ---
const addToCart = async () => {
  try {
    let priceToSend = 0;
    if (selectedAmount.value) {
      priceToSend = parseFloat(selectedAmount.value?.price);
    } else {
      priceToSend = parseFloat(product.value.price);
    }
    // Apply discount if active
    if (product.value.discount && product.value.discount.is_active) {
      const discountValue = parseFloat(product.value.discount.discount_value);
      priceToSend = priceToSend - (priceToSend * (discountValue / 100));
    }
    const payload = {
      product_id: product.value.id,
      quantity: quantity.value,
      price: priceToSend,
    };
    if (selectedAmount.value) {
      payload.amount_id = selectedAmount.value.id;
    }


    const response = await axios.post(
      'https://massagebackend.webenia.org/api/cart-items',
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );
    if (response.data.status) {

      ElNotification({
        title: t('success'),
        message: t('Products.addedSussess'),
        type: 'success',
      })
      cartStore.incrementCount();
      await cartStore.fetchCartCount();
    } else {
      ElNotification.error(response.data.message);
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

// Helper methods
const getImageUrl = (path) => {
  if (!path) return placeholder;
  return `https://massagebackend.webenia.org/public/storage/${path}`;
};

const handleImageError = (e) => {
  e.target.src = placeholder;
};

const setSelectedImage = (path) => {
  selectedImage.value = path;
  // Force update the main image
  nextTick(() => {
    const mainImage = document.querySelector('.main-image');
    if (mainImage) {
      mainImage.src = getImageUrl(path);
    }
  });
};

// Fetch product
const fetchProduct = async () => {
  try {
    const selectedCurrency =
      JSON.parse(localStorage.getItem('selectedCurrency')) || { code: 'USD' }
    const res = await axios.get(
      `https://massagebackend.webenia.org/api/website/show/products/${route.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          Currency: selectedCurrency.code,
        },
      }
    );
    if (res.data.status) {
      product.value = res.data.data;
  
   
      product.value._original_price = product.value.converted_price;
      if (product.value.images?.length) {
        // Set initial image
        selectedImage.value = product.value.images[0].path;
        // Initialize slider after data is loaded
        nextTick(() => {
          initializeSlick();
          checkFavoriteStatus();
        });
      }
    }
  } catch (err) {
    console.error("Error fetching product:", err);
  }
};

const navigateToProduct = (productId) => {
  router.push(`${productId}`);
};

const addChildToCart = async (childProduct) => {
  try {
    let priceToSend = 0;
    if (childProduct.discount && childProduct.discount.is_active) {
      const discountValue = parseFloat(childProduct.discount.discount_value);
      const originalPrice = parseFloat(childProduct.price); // Use childProduct.price
      priceToSend = originalPrice - (originalPrice * (discountValue / 100));
    } else {
      priceToSend = parseFloat(childProduct.price); // Use childProduct.price
    }
    const payload = {
      product_id: childProduct.id,
      quantity: 1,
      price: priceToSend,
    };
    const userId = JSON.parse(localStorage.getItem('auth_user'))?.id;

    if (userId) {
      payload.user_id = userId;
    }

    if (childProduct.amounts) {
      payload.amount_id = childProduct.amount_id;
    }

    const response = await axios.post('https://massagebackend.webenia.org/api/cart-items', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (response.data.message) {
      ElNotification({
        title: t('success'),
        message: response.data.message,
        type: 'success',
      });
      cartStore.incrementCount();
      await cartStore.fetchCartCount();
    }
  } catch (error) {
    console.error('Error adding child product to cart:', error);
    ElNotification({
      title: '❌',
      message: error.response?.data?.message || t('add_to_cart_error') || 'Login required to add to cart',
      type: 'error',
    });
  }
};

// Track selected index
const selectedAmountIndex = ref(null); // null means no amount selected

// Set active item
const setActive = (index, amount) => {
  selectedAmountIndex.value = index;
  product.value.amount_id = amount.id;
  product.value.price = amount.price;
  if (amount.converted_price !== undefined) {
    product.value.converted_price = amount.converted_price;
  } else {
    product.value.converted_price = amount.price;
  }
};

const resetActive = () => {
  selectedAmountIndex.value = 0;
  product.value.amount_id = null;
  product.value.price = product.value._original_price !== undefined
    ? product.value._original_price
    : product.value.price;
  product.value.converted_price = undefined;
};

// Slick Carousel Logic
const initializeSlick = () => {
  const $slider = $(slider.value);
  const $main = $(main.value);

  // Destroy existing instance if exists
  if ($slider.hasClass('slick-initialized')) {
    $slider.slick('unslick');
  }
  if ($main.hasClass('slick-initialized')) {
    $main.slick('unslick');
  }

  // Count the number of slides after they've been rendered
  const numSlides = product.value.images?.length || 0;
  numberOfSlides.value = numSlides;

  // Set slidesToShow dynamically
  slidesToShow.value = numSlides >= 4 ? 3 : 1;

  // Init slick for thumbnail slider
  $slider.slick({
    dots: false,
    centerMode: true,
    centerPadding: '0px',
    slidesToShow: slidesToShow.value,
    slidesToScroll: 1,
    infinite: numSlides > 1,
    focusOnSelect: true,
    rtl: locale.value === 'ar',
    asNavFor: $main,
    afterChange: function (currentSlide) {
      const currentImage = product.value.images[currentSlide];
      if (currentImage) {
        setSelectedImage(currentImage.path);
      }
    }
  });

  $main.slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: numSlides > 1,
    fade: true,
    arrows: false,
    dots: false,
    centerMode: true,
    rtl: locale.value === 'ar',
    asNavFor: $slider,
    afterChange: function (currentSlide) {
      const currentImage = product.value.images[currentSlide];
      if (currentImage) {
        setSelectedImage(currentImage.path);
      }
    }
  });
};

const scrollLeft = () => {
  const $slider = $(slider.value);
  const $main = $(main.value);
  if ($slider.length && $slider.hasClass('slick-initialized')) {
    $slider.slick('slickPrev');
    $main.slick('slickPrev');
    updateSelectedImage();
  }
};

const scrollRight = () => {
  const $slider = $(slider.value);
  const $main = $(main.value);
  if ($slider.length && $slider.hasClass('slick-initialized')) {
    $slider.slick('slickNext');
    $main.slick('slickNext');
    updateSelectedImage();
  }
};

const updateSelectedImage = () => {
  const $slider = $(slider.value);
  if ($slider.length && $slider.hasClass('slick-initialized')) {
    const currentSlide = $slider.find('.slick-current');
    const imagePath = currentSlide.find('img').attr('src').replace('https://massagebackend.webenia.org/public/storage/', '');
    setSelectedImage(imagePath);
  }
};

// Lifecycle Hooks
onMounted(async () => {
  await fetchProduct();
  if (product.value?.amounts?.length) {
    setActive(0, product.value.amounts[0]);
  }
  nextTick(() => {
    initializeSlick();
    checkFavoriteStatus();
  });

  window.addEventListener('currency-changed', fetchProduct);
});

watch(() => route.params.id, async (newId) => {
  await fetchProduct();
  if (product.value?.amounts?.length) {
    setActive(0, product.value.amounts[0]);
  }
  descriptionText();
  nextTick(() => {
    initializeSlick();
    checkFavoriteStatus();
  });
});

// Cleanup on unmount
onBeforeUnmount(() => {
  const $main = $(main.value);
  const $slider = $(slider.value);

  if ($main.hasClass('slick-initialized')) $main.slick('unslick');
  if ($slider.hasClass('slick-initialized')) $slider.slick('unslick');
});

// Add these new functions for child products
const isChildFavorite = (child) => {
  return favoritesStore.isInFavorites(child.id);
};

const toggleChildFavorite = async (child) => {
  try {
    if (isChildFavorite(child)) {
      // If already favorite, remove it
      const favoriteItem = favoritesStore.favorites.find(fav => fav.product_id === child.id);
      if (favoriteItem) {
        const favoriteId = favoriteItem.favorite_id || favoriteItem.id;
        await favoritesStore.removeFromFavorites(favoriteId);
        // No need to update local state, store handles it
        ElNotification({
          title: t('success'),
          message: t('favorite_removed') || 'Product removed from favorites',
          type: 'success',
        });
      }
    } else {
      // If not favorite, add it
      const response = await favoritesStore.addToFavorites(child.id);
      // Assuming store action returns a truthy value on success
      if (response) {
        // No need to update local state, store handles it
        ElNotification({
          title: t('success'),
          message: response.message || t('favorite_added') || 'Product added to favorites',
          type: 'success',
        });
      }
    }
  } catch (error) {
    console.error('Error toggling child favorites:', error);
    ElNotification({
      title: t('error'),
      message: error.response?.data?.message || t('login_required_favorite') || 'Login required to favorite product',
      type: 'error',
    });
  }
};

const increaseQty = () => {
  if (quantity.value < maxQuantity) {
    quantity.value++;
  } else {
    ElNotification({
      title: t('warning'),
      message: t('max_quantity_reached'),
      type: 'warning',
    });
  }
};

const decreaseQty = () => {
  if (quantity.value > minQuantity) {
    quantity.value--;
  } else {
    ElNotification({
      title: t('warning'),
      message: t('min_quantity_reached'),
      type: 'warning',
    });
  }
};

// Check if product is in favorites
const checkFavoriteStatus = () => {
  isInFavorites(product.value.id);
};

const calculateDiscountedPrice = (product) => {
  if (product.discount && product.discount.is_active) {
    const discountValue = parseFloat(product.discount.discount_value)
    const originalPrice = parseFloat(product.converted_price)
    const discountedPrice = originalPrice - (originalPrice * (discountValue / 100))
    return discountedPrice.toFixed(2)
  }
  return product.converted_price
};

const currentPrice = computed(() => {
  if (selectedAmount.value) {
    return selectedAmount.value.converted_price !== undefined
      ? selectedAmount.value.converted_price
      : selectedAmount.value.price;
  }
  return product.value.converted_price !== undefined
    ? product.value.converted_price
    : product.value.price;
});

const discountedPrice = computed(() => {
  if (product.value.discount && product.value.discount.is_active) {
    const discountValue = parseFloat(product.value.discount.discount_value);
    const originalPrice = parseFloat(currentPrice.value);
    const discounted = originalPrice - (originalPrice * (discountValue / 100));
    return discounted.toFixed(2);
  }
  return currentPrice.value;
});

const selectedAmount = computed(() => {
  if (
    product.value.amounts &&
    product.value.amounts.length > 0 &&
    selectedAmountIndex.value !== null
  ) {
    return product.value.amounts[selectedAmountIndex.value];
  }
  return null;
});

// Add this computed property for discount logic
const discountedPriceToShow = computed(() => {
  let basePrice;
  basePrice = selectedAmount.value ? parseFloat(selectedAmount.value?.converted_price) : parseFloat(product.value.converted_price);

  if (product.value.discount && product.value.discount.is_active) {
    const discountValue = parseFloat(product.value.discount.discount_value);

    basePrice = basePrice - (basePrice * (discountValue / 100))

    return basePrice.toFixed(2);
  }

  return basePrice;
});

const descriptionText = computed(() => {
   return  locale.value === 'ar' ?  product.value.description_ar : product.value.description_en;


})
// Format description into chunks of 3 lines
const formattedDescription = computed(() => {
  if (!descriptionText.value) return [];
   const lines = descriptionText.value.split('\n').filter(line => line.trim() !== '');
   console.log('lines',lines);
   
   const chunks = [];
   for (let i = 0; i < lines.length; i += 3) {
      chunks.push(lines.slice(i, i + 3));
    }
  return chunks;
 
});


</script>

<style scoped>
.product-show {
  padding: 40px;
  font-family: "Tajawal", sans-serif;
  min-height: 100vh;
}

.product-container {
  background-color: transparent;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.product-details {
  position: relative;
  padding: 30px;
  border-radius: 15px;
  height: 100%;
}

.product-title {
  font-size: 50px;
  font-weight: bold;
  color: #a3852c;
  margin-bottom: 25px;
  line-height: 1.3;
}

.price-block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: baseline;
  gap: 15px;
  margin: 20px 0;
}

.price-new {
  font-size: 28px;
  color: #a3852c;
  font-weight: 700;
}

.price-old {
  color: #7f7f7f;
  text-decoration: line-through;
  font-size: 28px;
  font-weight: 700;
  margin-right: 10px;
}

.description {
  color: #7f7f7f;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  margin: 20px 0;
}

.weight {
  position: relative;
}

.weight-container .row {
  display: flex;
  gap: 0 30px;

}

.weight-title {
  font-size: 20px;
  font-weight: 700;
  color: #a3852c;
  margin-bottom: 10px;
}

.reset {
  position: absolute;
  top: 0;
  left: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #7f7f7f;
  font-size: 16px;
}

.reset a {
  background-color: transparent;
  color: #7f7f7f;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
}

.weight-item {
  width: calc(100% / 3 - 30px);
  color: #333;
  padding: 10px;
  text-align: center;
  font-weight: 700;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.weight-item p {
  margin: 0;
  padding: 0;

  transition: all 0.3s ease;

}

.weight-item::after {
  content: "";
  position: absolute;
  width: 0;
  left: 50%;
  height: 0px;
  background-color: #a3852c;
  bottom: -5px;
  transition: all 0.3s ease;
}

.weight-item.active:after {
  content: "";
  position: absolute;
  width: 100%;
  left: 0;
  height: 3px;
  background-color: #a3852c;
  bottom: -5px;
}

.quantity-section {
  margin: 20px 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f8f8f8;
  padding: 5px;
  border-radius: 8px;
  width: fit-content;
}

.qty-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  color: #a3852c;
  transition: all 0.3s ease;
}

.qty-btn:hover:not(:disabled) {
  background-color: #a3852c;
  color: #fff;
  border-color: #a3852c;
}

.qty-btn:disabled {
  background-color: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.qty-number {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  min-width: 40px;
  text-align: center;
  padding: 0 10px;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.buttons-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.add-to-cart {
  background-color: #a3852c;
  border: none;
  color: white;
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  transition: all 0.3s ease;
}

.add-to-cart:hover {
  background-color: #8b7024;
  transform: translateY(-2px);
}

.favorite-btn {
  position: absolute;
  right: 0;
  top: 0;
  width: 48px;
  height: 48px;
  background-color: #fff;
  border: 2px solid #eee;
  color: #a3852c;
  margin: 30px;
  transition: all 0.3s ease;
  font-size: 24px;
}

.favorite-btn:hover {
  background-color: #fff5e6;
  border-color: #a3852c;
  transform: translateY(-2px);
}

.image-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  padding: 20px;
  height: fit-content;
}

.main-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
}

.image-wrapper:hover .main-image {
  transform: scale(1.1);
}

.sale-badge {
  background-color: #e74c3c;
  color: white;
  padding: 8px 15px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(231, 76, 60, 0.3);
  z-index: 1;
}

.thumbs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 10px;
}

.thumb {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  padding: 3px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.thumb:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.thumb.active {
  border-color: #a3852c;
  box-shadow: 0 4px 15px rgba(163, 133, 44, 0.2);
}

.slider-wrapper {
  position: relative;
  display: flex;
}


.nav-button {
  color: #c9c9c9;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 2rem;
}

.slider-container {
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.slider {
  background-color: #f1f1f1;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  width: 100%;
  padding: 0 20px;
}

.slide {
  text-align: center;
  padding: 10px;
}

.image-wrapper .slide {
  padding: 0;
}

.slide img {
  width: 100%;
  height: auto;
  object-fit: contain;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-wrapper .slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.image-wrapper .slick-list) {
  border-radius: 15px;
}

.slider .slide img {
  max-height: 100px !important;
}

.slide img.active {
  border-radius: 8px;
}

.slide img:hover {
  transform: scale(1.05);
}

.slider .slide.slick-current {
  position: relative;
}

.slider .slide::after {
  content: "";
  position: absolute;
  width: 0;
  bottom: 0;
  left: 50%;
  height: 0;
  border-radius: 3px;
}

.slider .slide.slick-current::after {
  content: "";
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: #a3852c;
  transition: all 0.4s ease-in-out;
  transition-delay: 0.4s;
}

:deep(.slick-dots) {
  left: 0;
  bottom: -20px;
}

:deep(.slick-dots .slick-active button::before) {
  color: #a3852c;
}

:deep(.slick-track) {
  display: flex;
  align-items: center;
  justify-content: center !important;

}


:deep(.centered-slides.slider-container .slider .slide img) {
  max-height: 120px;
  width: auto;
  margin-left: auto;
  margin-right: auto;
}

:deep(.centered-slides.slider-container .slider .slide) {
  width: auto !important;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 1024px) {
  :deep(.product-container) {
    flex-direction: row !important;
  }

}

@media (max-width: 1024px) {
  :deep(.product-container) {
    flex-direction: column-reverse !important;
  }

  .weight-item {
    font-size: 16px;

  }

  :deep(.centered-slides.slider-container .slider .slide img) {
    max-height: 90px;
  }
}

@media (max-width: 768px) {
  .product-show {
    padding: 20px;
  }

  .product-details {
    padding: 20px;
    margin-top: 20px;
  }

  .product-title {
    font-size: 24px;
  }

  .price-new {
    font-size: 24px;
  }

  .buttons-section {
    flex-direction: column;
  }

  .quantity-control {
    width: 100%;
    justify-content: center;
  }

  .qty-number {
    width: 50px;
  }
}

@media (max-width: 425px) {
  .weight-item {
    font-size: 12px;

  }

  :deep(.centered-slides.slider-container .slider .slide img) {
    max-height: 40px;
  }
}

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
  flex-direction: column;
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

.love-btn {
  position: absolute;
  top: 10px;
  left: 10px;
}

[dir="ltr"] .love-btn {
  left: auto;
  right: 10px;
}

[dir="ltr"] .reset {
  left: auto;
  right: 10px;
}
</style>
