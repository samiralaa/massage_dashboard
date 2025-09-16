<template>
  <div class="home">
    <Loader v-if="loading" />
    <Header />

    <!-- Countdown Timer Section -->
  
    <verify-otp-popup
      v-if="showVerifyOtp || showVerifyOtpPopup"
      :user="user"
      :token="token"
      @close="handleCloseOtp"
    />


    <!-- Hero Section with Ramadan Theme -->


    <section class="hero-section">
      <div class="hero-background">
        <!-- Countdown Timer Overlay -->
        <div class="countdown-overlay" dir="ltr">
          <h2>عداد التوقيت</h2>
          <div class="countdown-flex">
            <div class="countdown-box">
              <div class="countdown-number">{{ countdown.days }}</div>
              <div class="countdown-label">يوم</div>
            </div>
            <div class="countdown-box">
              <div class="countdown-number">{{ countdown.hours }}</div>
              <div class="countdown-label">ساعة</div>
            </div>
            <div class="countdown-box">
              <div class="countdown-number">{{ countdown.minutes }}</div>
              <div class="countdown-label">دقيقة</div>
            </div>
            <div class="countdown-box">
              <div class="countdown-number">{{ countdown.seconds }}</div>
              <div class="countdown-label">ثانية</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Categories />
    <HomeBrands v-if="showBrand" />
    <Products v-if="showOurProducts" />
    <LatestProducts v-if="showLatestProducts" />
    <BestSelling v-if="showBestSelling" />
    <WhyChooseUs />
    <Footer />

  </div>
</template>

<script>
import Header from '@/components/Website/Header.vue'
import Categories from '@/components/Website/Categories.vue'
import HomeBrands from '@/components/Website/HomeBrands.vue'
import Products from '@/components/Website/ProductSection.vue'
import BestSelling from '@/components/Website/BestSelling.vue'
import WhyChooseUs from '@/components/Website/WhyChooseUs.vue'
import LatestProducts from '@/components/Website/LatestProducts.vue'
import i18n from '@/i18n.js'
import Footer from '@/components/Website/Footer.vue'
import Loader from '@/components/Loader.vue'
import VerifyOtpPopup from '@/components/verifyOtpPopup.vue'

export default {
  name: 'Home',
  components: {
    Header,
    Categories,
    HomeBrands,
    LatestProducts,
    Products,
    BestSelling,
    WhyChooseUs,
    Footer,
    Loader,
    VerifyOtpPopup,
  },
  computed: {
    showVerifyOtp() {
      return this.user && !this.user.is_verified;
    },
    direction() {
      return i18n.global.locale === 'ar' ? 'rtl' : 'ltr';
    }
  },
  data() {
    return {
      showBrand: false,
      showOurProducts: false,
      showLatestProducts: false,
      showBestSelling: false,
      loading: true,
      user: null,
      token: null,
      showVerifyOtpPopup: false,
      countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      countdownTarget: new Date('2025-08-30T00:00:00'), // Change target date as needed
      countdownInterval: null
    };
  },
  mounted() {
    this.fetchSettings();
    if (localStorage.getItem('showVerifyOtpPopup') === 'true') {
      this.showVerifyOtpPopup = true;
      localStorage.removeItem('showVerifyOtpPopup');
    }
    this.startCountdown();
  },
  methods: {
    startCountdown() {
      this.updateCountdown();
      this.countdownInterval = setInterval(this.updateCountdown, 1000);
    },
    updateCountdown() {
      const now = new Date();
      const target = this.countdownTarget;
      const diff = target - now;
      if (diff > 0) {
        this.countdown.days = Math.floor(diff / (1000 * 60 * 60 * 24));
        this.countdown.hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        this.countdown.minutes = Math.floor((diff / (1000 * 60)) % 60);
        this.countdown.seconds = Math.floor((diff / 1000) % 60);
      } else {
        this.countdown.days = 0;
        this.countdown.hours = 0;
        this.countdown.minutes = 0;
        this.countdown.seconds = 0;
        clearInterval(this.countdownInterval);
      }
    },


    async fetchSettings() {
      try {
     
        const response = await fetch('https://massagebackend.webenia.org/api/settings');
        const result = await response.json();
        const settings = result.data;
        const findSetting = key => {
          const setting = settings.find(s => s.key === key);
          return setting && setting.value === "1";
        };
        this.showBrand = findSetting('show_brand');
        this.showOurProducts = findSetting('show_our_products');
        this.showLatestProducts = findSetting('show_latest_products');
        this.showBestSelling = findSetting('show_best_selling_products');
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 3000);
      }
    },
    scrollLeft() {
      const width = window.innerWidth;
      const card = this.$refs.slider.querySelector('.card');
      const cardWidth = card.offsetWidth;

      if (width <= 440) {
        const gap = 26;
        this.$refs.slider.scrollBy({ left: -(cardWidth * 2 + gap), behavior: 'smooth' });
      } else if (width <= 768) {
        const gap = 50;
        this.$refs.slider.scrollBy({ left: -(cardWidth * 3 + gap), behavior: 'smooth' });
      } else if (width <= 1200) {
        const gap = 50;
        this.$refs.slider.scrollBy({ left: -(cardWidth * 4 + gap), behavior: 'smooth' });
      } else {
        const gap = 30;
        this.$refs.slider.scrollBy({ left: -(cardWidth * 7 + gap), behavior: 'smooth' });
      }
    },

    scrollRight() {
      const width = window.innerWidth;
      const card = this.$refs.slider.querySelector('.card');
      const cardWidth = card.offsetWidth;

      if (width <= 440) {
        const gap = 26;
        this.$refs.slider.scrollBy({ left: cardWidth * 2 + gap, behavior: 'smooth' });
      } else if (width <= 768) {
        const gap = 50;
        this.$refs.slider.scrollBy({ left: cardWidth * 3 + gap, behavior: 'smooth' });
      } else if (width <= 1200) {
        const gap = 50;
        this.$refs.slider.scrollBy({ left: cardWidth * 4 + gap, behavior: 'smooth' });
      } else {
        const gap = 30; // optional for bigger screens
        this.$refs.slider.scrollBy({ left: cardWidth * 7 + gap, behavior: 'smooth' });
      }
    },
    handleCloseOtp() {
      this.showVerifyOtpPopup = false;
      this.user.is_verified = true;
    }
  },

  created() {
    const savedUser = localStorage.getItem('auth_user')
    const savedToken = localStorage.getItem('token')

    if (savedUser) {
      this.user = JSON.parse(savedUser)
    }

    if (savedToken) {
      this.token = savedToken
    }
  }
};

</script>

<style scoped>
.home {
  min-height: 100vh;
}
:deep(.el-notification.right){
  top: 150px !important;
}


.hero-section {
  position: relative;
  width: 100%;
  height: 400px;
  margin-bottom: 30px;
}
.hero-background {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url('@/assets/images/Hero/ls.png');
  animation: heroSlider 16s infinite linear;
  position: relative;
}
@keyframes heroSlider {
  0%   { background-image: url('@/assets/images/Hero/ls.png'); }
}
.countdown-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.5);
  color: #fff;
  padding: 30px 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}
.countdown-overlay h2 {
  margin-bottom: 24px;
  font-size: 2.2rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.countdown-flex {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
}
.countdown-box {
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 18px 24px;
  min-width: 80px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.countdown-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.countdown-label {
  font-size: 1.1rem;
  color: #fff;
  font-weight: 500;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .hero-section {
    height: 300px;
  }
  .countdown-overlay {
    padding: 20px 25px;
  }
  .countdown-overlay h2 {
    font-size: 1.8rem;
    margin-bottom: 18px;
  }
  .countdown-flex {
    gap: 16px;
  }
  .countdown-box {
    min-width: 60px;
    padding: 14px 18px;
  }
  .countdown-number {
    font-size: 2rem;
    margin-bottom: 6px;
  }
  .countdown-label {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    height: 250px;
  }
  .countdown-overlay {
    padding: 15px 20px;
  }
  .countdown-overlay h2 {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }
  .countdown-flex {
    gap: 12px;
  }
  .countdown-box {
    min-width: 50px;
    padding: 10px 14px;
  }
  .countdown-number {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }
  .countdown-label {
    font-size: 0.9rem;
  }
}
</style>