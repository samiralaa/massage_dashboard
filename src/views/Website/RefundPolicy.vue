<template>
<Header />
    
<div class=" policy-container" >
  <div class="row mb-4">
    <div class="col-md-8">
      <h2 class="gold-text">{{ $t('refundPlice.REFUNDPOLICY') }}</h2>
      <p class="fw-bold">
        {{ $t('refundPlice.description') }} 
     </p>
    </div>
    <div class="col-md-4 text-center">
      <img src="@/assets/images/EleganceLogo.png" alt="Logo" style="max-height: 80px;" class="mb-2">
    </div>
  </div>

  <div>
    <h5 class="section-title">{{ $t('refundPlice.ELIGIBILITY.ELIGIBILITY-FOR-REFUND') }}</h5>
    <ul>
      <li>{{ $t('refundPlice.ELIGIBILITY.sub1') }}</li>
      <li>{{ $t('refundPlice.ELIGIBILITY.sub2') }}</li>

    </ul>

    <h5 class="section-title">{{ $t('refundPlice.TIMEFRAME.TIMEFRAME-FOR-REFUND') }}</h5>
    <ul>
      <li>{{ $t('refundPlice.TIMEFRAME.sub1') }}</li>
      <li>{{ $t('refundPlice.TIMEFRAME.sub2') }}</li>
    </ul>

    <h5 class="section-title">{{ $t('refundPlice.NON-REFUNDABLE-ITEMS.NON-REFUNDABLE-ITEMS') }}</h5>
    <ul>
      <li>{{ $t('refundPlice.NON-REFUNDABLE-ITEMS.sub1') }}</li>
      <li>{{ $t('refundPlice.NON-REFUNDABLE-ITEMS.sub2') }}</li>
    </ul>

    <h5 class="section-title">{{ $t('refundPlice.STORE-CREDIT.STORE-CREDIT') }}</h5>
    <ul>
      <li>{{ $t('refundPlice.STORE-CREDIT.sub1') }}</li>
      <li>{{ $t('refundPlice.STORE-CREDIT.sub2') }}</li>
    </ul>
  </div>
</div>

   
<Footer />
  
</template>

<script>
import Header from '@/components/Website/Header.vue'
import Footer from '@/components/Website/Footer.vue'
import i18n from '@/i18n.js'
export default {
  name: 'RefundPolicy',
  components: {
    Header,
    Footer
  },
  data() {
    return {
      direction: i18n.global.locale === 'ar' ? 'rtl' : 'ltr'
    };
  }
};
</script>

<style scoped>
.section-title {
      color: #c19f45;
      font-weight: bold;
      margin-top: 2rem;
    }
    .logo-text {
      font-size: 2rem;
      font-weight: bold;
      color: #1a1a2e;
    }
    .gold-text {
      color: #c19f45;
    }
    .policy-container {
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