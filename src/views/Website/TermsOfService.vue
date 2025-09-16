<template>
  <Header />

  <div class="content">
    <div class="row mb-4">
      <div class="col-md-8">
        <h2 class='title' >{{ $t('terms.title') }}</h2>

        <h5 class="section-title ">{{ $t('terms.general-title') }}</h5>
        <p>
         <strong>{{ $t('terms.modification') }}</strong>
        {{ $t('terms.general-modification') }}
        </p>

        <h5 class="section-title ">{{ $t('terms.usage-title') }}</h5>
        <p>
          <strong>{{ $t('terms.Product-information') }}</strong> 
          {{ $t('terms.usage-productInformation') }}
        </p>
        <p>
          <strong>{{ $t('terms.Purchases') }}</strong> 
          {{ $t('terms.usage-purchases') }}
        </p>
        <p>
          <strong>{{ $t('terms.Pricing') }}</strong> 
          {{ $t('terms.usage-pricing') }}
        </p>
        <p>
          <strong>{{ $t('terms.Availability') }}</strong>
          {{ $t('terms.usage-availability') }}
        </p>

        <h5 class="section-title">{{ $t('terms.shipping-title') }}</h5>
        <p>
          <strong>{{ $t('terms.Shipping') }}</strong> 
          {{ $t('terms.shipping-shipping') }}
        </p>
        <p>
          <strong>{{ $t('terms.Customs') }}</strong>
          {{ $t('terms.shipping-customs') }}
        </p>
        <p>
          <strong>{{ $t('terms.Delivery') }}</strong>
          {{ $t('terms.shipping-delivery') }}
        </p>
        <p>
          <strong>{{ $t('terms.Returns') }}</strong>
          {{ $t('terms.shipping-returns') }}
        </p>
        <h5 class="section-title ">{{ $t('terms.usage-oud-title') }}</h5>
        <p>
          <strong>{{ $t('terms.Fragrance') }}</strong>
          {{ $t('terms.usage-oud-testing') }}
        </p>
        <p>
          <strong>{{ $t('terms.Variations') }}</strong>
          {{ $t('terms.usage-oud-variations') }}
        </p>
        <h5 class="section-title ">{{ $t('terms.intellectualProperty-title') }}</h5>
        <p>
          <strong>{{ $t('terms.Ownership') }}</strong>
          {{ $t('terms.intellectualProperty-ownership') }}
        </p>
        <h5 class="section-title ">{{ $t('terms.limitation-title') }}</h5>
        <p>
          <strong>{{ $t('terms.Disclaimer') }}</strong>
          {{ $t('terms.limitation-disclaimer') }}
        </p>
        <p>
          <strong>{{ $t('terms.Liability') }}</strong>
          {{ $t('terms.limitation-limitation') }}
        </p>
        <p class="fw-bold mt-5">{{ $t('terms.endNote') }}</p>
      </div>

      <div class="col-md-4 text-center">
        <img
          src="@/assets/images/EleganceLogo.png"
          alt="Logo"
          class="logo mb-2"
        />
      </div>
    </div>
  </div>

  <Footer />
</template>

<script>
import Header from "@/components/Website/Header.vue";
import Footer from "@/components/Website/Footer.vue";
import i18n from "@/i18n.js";
export default {
  name: "termsOfService",
  components: {
    Header,
    Footer,
  },
  data() {
    return {
      direction: i18n.global.locale === "ar" ? "rtl" : "ltr",
    };
  },
};
</script>

<style scoped>
.title {
  color: #c19f45;
  font-weight: bold;
  margin-bottom: 2rem;
}

.section-title {
  color: #c19f45;
  font-weight: bold;
  margin-top: 2rem;
}

.logo {
  max-height: 80px;
}

.brand-text {
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a2e;
}

.subtitle {
  text-transform: uppercase;
  font-size: 0.9rem;
}

.content {
  /* max-width: 1000px; */
  /* margin: auto; */
  padding: 3rem;
}
 h5{
      text-align: left;
    }
   [dir='rtl'] h5{
      text-align: right;
    }
</style>
