<template>
  <section class="all-categories py-4">
    <div class="container">
      <div class="title">
        <fa class="fa-icon" :icon="['fas', 'cubes']"></fa>
        <h2>{{ $t('home.categories') }}</h2>
      </div>
      <div class="slider-wrapper">
        <div class="scrollers ms-3 mb-2">
          <button class="btn nav-button left" @click="scrollLeft">
            <fa icon="arrow-left"></fa>
          </button>
          <button class="btn nav-button right" @click="scrollRight">
            <fa icon="arrow-right"></fa>
          </button>
        </div>
        <div class="slider" ref="slider">
          <a v-for="category in categories" :key="category.id" class="card" :href="`/category/${category.id}`">
            <div class="category-content">
              <img :src="getProductImage(category)" />
              <p :class="{ 'rtl': $i18n.locale === 'ar' }">
                {{ $i18n.locale === 'ar' ? category.name_ar : category.name }}
              </p>
            </div>
          </a>

        </div>
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { nextTick } from 'vue'
import $ from 'jquery'
import 'slick-carousel/slick/slick.min.js'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { API_URL } from '@/store/index.js';
export default {
  name: 'WebsiteCategories',
  computed: {
    ...mapState('websiteCategories', {
      categories: state => state.items,
      loading: state => state.loading,
      error: state => state.error
    })
  },
  created() {
    this.loadCategories()
  },
  methods: {
    ...mapActions('websiteCategories', {
      fetchCategories: 'fetchWebsiteCategories'
    }),

    getProductImage(category) {
      if (!category.image) {
        return '/placeholder-image.jpg';
      }

      const imageUrl = category.image;
      const publicStorageBase = `${API_URL}/public/storage/`;

      // If the image URL is already a full URL and contains the public storage path, return as is.
      if (imageUrl.startsWith(publicStorageBase)) {
        return imageUrl;
      }

      // If the image URL is an absolute URL but from the same domain as API_URL
      // and is missing the /public/storage/ segment, then construct the correct URL.
      if (imageUrl.startsWith(API_URL)) {
        const relativePath = imageUrl.substring(API_URL.length);
        return `${publicStorageBase}${relativePath.startsWith('/') ? relativePath.substring(1) : relativePath}`;
      }

      // If it's an external URL that doesn't match API_URL, return as is.
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }

      // If it's a relative path (e.g., "images/category/...")
      return `${publicStorageBase}${imageUrl}`;
    },


    async loadCategories() {
      try {
        await this.fetchCategories()
        await nextTick()

        const slider = $(this.$refs.slider)

        // Destroy existing slick instance if it exists
        if (slider.hasClass('slick-initialized')) {
          slider.slick('unslick')
        }

        // Initialize Slick Carousel
        slider.slick({
          slidesToShow: 7,
          slidesToScroll: 1,
          // infinite: true,
          rtl: this.$i18n.locale === 'ar',
          responsive: [
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: 5
              }
            },
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 4
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 3
              }
            },
            {
              breakpoint: 576,
              settings: {
                slidesToShow: 2
              }
            },
            {
              breakpoint: 400,
              settings: {
                slidesToShow: 1
              }
            }
          ]
        })

      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    },
    scrollLeft() {
      const slider = $(this.$refs.slider)
      if (slider.length && slider.hasClass('slick-initialized')) {
        slider.slick('slickPrev')
      }
    },
    scrollRight() {
      const slider = $(this.$refs.slider)
      if (slider.length && slider.hasClass('slick-initialized')) {
        slider.slick('slickNext')
      }
    },
    getAlt(category) {
      return this.$i18n.locale === 'ar' ? category.name_ar : category.name
    }
  },
  beforeUnmount() {
    const slider = $(this.$refs.slider)
    if (slider.length && slider.hasClass('slick-initialized')) {
      slider.slick('unslick')
    }
  }
}
</script>

<style scoped>

.all-categories .container {
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  color: #e74c3c;
  padding: 1rem;
  margin-top: 1rem;
}


.title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #8b6b3d;
}

.fa-icon {
  font-size: 1.8rem;
}

.slider-wrapper {
  overflow: hidden;
  padding: 16px 0;
}

.scrollers {
  display: none;
  justify-content: flex-end;
  margin-bottom: 8px;
  position: absolute;
  right: 5px;
  top: 0;
}

[dir="rtl"] .scrollers {
  left: 5px;
  right: auto;
  margin-right: 0;
  margin-left: 8px;
  flex-direction: row-reverse;
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

.nav-button.left {
  margin-right: 10px;
}

.nav-button.right {
  margin-left: 10px;
}

.slider {
  display: block !important;
  overflow: hidden !important;
}

.card {
  background-color: #f7f7f7;
  border: none;
  padding: 12px;
  margin: 15px;
  transition: all 0.3s ease;
  text-align: center !important;
  text-decoration: none;
  width: 100%;

}

.card .category-content {
  text-align: center !important;
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
</style>