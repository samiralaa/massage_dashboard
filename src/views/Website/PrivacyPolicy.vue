<template>
<Header />
    
<div class=" policy-container">
  <div class="row mb-4">
    <div class="col-md-8">
      <h2 class="gold-text">{{ $t('privacyPolicy.title') }}</h2>
      <p class="fw-bold">
        {{ $t('privacyPolicy.intro') }} 
     </p>
    </div>
    <div class="col-md-4 text-center">
      <img src="@/assets/images/EleganceLogo.png" alt="Logo" style="max-height: 80px;" class="mb-2">
    </div>
  </div>

  <div>
    <h5 class="section-title">{{ $t('privacyPolicy.sections.informationWeCollect.title') }}</h5>
    <ul>
        <li>{{ $t('privacyPolicy.sections.informationWeCollect.content.0') }}</li>
        <li>{{ $t('privacyPolicy.sections.informationWeCollect.content.1') }}</li>
        <li>{{ $t('privacyPolicy.sections.informationWeCollect.content.2') }}</li>
        <li>{{ $t('privacyPolicy.sections.informationWeCollect.content.3') }}</li>
        <li>{{ $t('privacyPolicy.sections.informationWeCollect.content.4') }}</li>
    </ul>

    <h5 class="section-title">{{ $t('privacyPolicy.sections.useOfPersonalInformation.title') }}</h5>
    <ul>
        <li>{{ $t('privacyPolicy.sections.useOfPersonalInformation.content.0') }}</li>
        <li>{{ $t('privacyPolicy.sections.useOfPersonalInformation.content.1') }}</li>
        <li>{{ $t('privacyPolicy.sections.useOfPersonalInformation.content.2') }}</li>
        <li>{{ $t('privacyPolicy.sections.useOfPersonalInformation.content.3') }}</li>
        <li>{{ $t('privacyPolicy.sections.useOfPersonalInformation.content.4') }}</li>
        <li>{{ $t('privacyPolicy.sections.useOfPersonalInformation.content.5') }}</li>
    </ul>

    <h5 class="section-title">{{ $t('privacyPolicy.sections.sharingInformation.title') }}</h5>
    <ul>
        <li>{{ $t('privacyPolicy.sections.sharingInformation.content.0') }}</li>
        <li>{{ $t('privacyPolicy.sections.sharingInformation.content.1') }}</li>
        <li>{{ $t('privacyPolicy.sections.sharingInformation.content.2') }}</li>
    </ul>

    <h5 class="section-title">{{ $t('privacyPolicy.sections.security.title') }}</h5>
    <p>{{ $t('privacyPolicy.sections.security.content') }}</p>
    
    <h5 class="section-title">{{ $t('privacyPolicy.sections.cookies.title') }}</h5>
    <p>{{ $t('privacyPolicy.sections.cookies.content') }}</p>
   
    <h5 class="section-title">{{ $t('privacyPolicy.sections.thirdParty.title') }}</h5>
    <p>{{ $t('privacyPolicy.sections.thirdParty.content') }}</p>

    <h5 class="section-title">{{ $t('privacyPolicy.sections.children.title') }}</h5>
    <p>{{ $t('privacyPolicy.sections.children.content') }}</p>
   
    <h5 class="section-title">{{ $t('privacyPolicy.sections.rights.title') }}</h5>
    <p>{{ $t('privacyPolicy.sections.rights.content') }}</p>

    <h5 class="section-title">{{ $t('privacyPolicy.sections.changes.title') }}</h5>
    <p>{{ $t('privacyPolicy.sections.changes.content') }}</p>

    
    <h5 class="section-title">{{ $t('privacyPolicy.sections.contact.title') }}</h5>
    <p>{{ $t('privacyPolicy.sections.contact.content') }}</p>

    <p class="fw-bold mt-5">{{ $t('privacyPolicy.consent') }}</p>

  </div>
</div>

   
<Footer />
  
</template>

<script>
import Header from '@/components/Website/Header.vue'
import Footer from '@/components/Website/Footer.vue'
import i18n from '@/i18n.js'
export default {
  name: 'privacyPolicy',
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