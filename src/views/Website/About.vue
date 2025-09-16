<template>
    <div class="home">
      <Header />
        <section class="about">
                <div class="title">
                    <div class="container">
                        <h2>{{ $t('about.title') }}</h2>
                    </div>
                </div>
                <div class="about-content">
                    <div class="container">
                        <div class="discription">
                            <h4>{{ $t('about.descriptionTitle') }}</h4>
                            <p>{{ $t('about.description') }}</p>
                        </div>
                        <div class="about-img">
                            <img src="@/assets/images/about.png" alt="About Us" class="img-fluid" />
                        </div>
                    </div>
                </div>
        </section>
      <Footer />
  
    </div>
</template>
  
<script>
  import Header from '@/components/Website/Header.vue'
  import i18n from '@/i18n.js'
  import Footer from '@/components/Website/Footer.vue'
  
  export default {
    name: 'About',
    components: {
      Header,
      Footer,
    },
    computed: {
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
  
      };
    },
    mounted() {
      this.fetchSettings();
    },
    methods: {
  
  
      async fetchSettings() {
        try {
          const response = await fetch('/api/settings');
          const result = await response.json();
  
          const settings = result.data;
  
          const findSetting = key => {
            const setting = settings.find(s => s.key === key);
            return setting && setting.value === "1";
          };
  
        } catch (error) {
          console.error('Failed to fetch settings:', error);
        }
      },
    }
  
  
  };
</script>
  
<style scoped>
.about {
    padding: 100px 0 0 0;
    height:fit-content;
}
.title {
    margin-bottom: 30px;
    color: #8b6b3d;
}
.about-content{

    background-color: #F8F8F8;
}
.about-content .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: fit-content;
    width: 100%;
    margin-bottom: 50px;
}
.discription {
    width: 50%;
    padding: 0 20px;
    padding-top: 50px;
}
.discription p{
    color: #7c7c7c;
}
.about-img {
    width: 50%;
    padding: 0 20px;
}  
@media (max-width: 768px) {
    .about-content .container {
        flex-direction: column;
        padding: 50px 0;
    }
    .discription {
        width: 100%;
    }
    .about-img {
        width: 100%;
        padding: 0;
    }
} 

</style>