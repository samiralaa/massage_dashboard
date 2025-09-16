<template>
  <section class="our-brands py-5">
    <div class="container">
      <!-- Title -->
      <div class="title">
        <fa class="fa-icon" :icon="['fas', 'tag']"></fa>
        <h2>{{ $t('home.brands') }}</h2>
      </div>

      <!-- Brands Flex Row -->
      <div class="d-flex flex-wrap justify-content-center gap-4">
        <div
          v-for="brand in brands"
          :key="brand.id"
          class="brand-card d-flex align-items-center justify-content-center"
        >
          <router-link :to="`/brand/${brand.id}`" class="brand-link text-decoration-none">
            
            <img
              v-if="brand.images.length"
              :src="getImageUrl(brand.images[0].path)"
              :alt="brand.name_en"
              class="brand-image"
              loading="lazy"
            />
            <div v-else class="no-image">No Image</div>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "axios";

export default {
  name: "HomeBrands",
  data() {
    return {
      brands: [],
    };
  },
  created() {
    this.fetchBrands();
  },
  methods: {
    async fetchBrands() {
      try {
        const response = await axios.get("https://massagebackend.webenia.org/api/website/brands/section");
        this.brands = response.data.data;
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    },
    getImageUrl(path) {
      return `https://massagebackend.webenia.org/public/storage/${path}`;
    },
  },
};
</script>

<style scoped>
.our-brands {
  background-color: #f9f9f9;
  margin-bottom: 10px;
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

.brand-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  width: 160px;
  height: 160px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 12px;
}

.brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.brand-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-image {
  font-size: 0.9rem;
  color: #999;
}
</style>
