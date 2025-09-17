<template>
  <div class="language-switcher">
    <div class="button-group">
      <a 
        v-if="locale !== 'en'"
        :class="['lang-btn', { active: locale === 'en' }, 'text-uppercase text-center']"
        @click="switchLanguage('en')"
      >
        <span class="lang-name">English</span>
      </a>
      <a 
        v-if="locale !== 'ar'"
        :class="['lang-btn', { active: locale === 'ar' }, 'text-uppercase text-center']"
        @click="switchLanguage('ar')"
      >
        <span class="lang-name">العربية</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { setDirection } from '../utils/theme'

const { locale } = useI18n()

const switchLanguage = (lang) => {
  const direction = lang === 'ar' ? 'rtl' : 'ltr'
  setDirection(direction)
  locale.value = lang
  localStorage.setItem('lang', lang)
}
</script>

<style scoped>
.language-switcher {
  margin: 0 8px;
}

a.lang-btn {
  display: inline-block;
  border: 1px solid #b9b9b9; /* رمادي فاتح زي الأيقونات */
  padding: 6px 18px;
  text-decoration: none;
  color: #333; /* نص غامق قريب من الأسود */
  background-color: #eae5df; /* نفس خلفية الـ nav */
  border-radius: 6px;
  font-size: 0.9em;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

a.lang-btn:hover {
  background-color: #d6d2cc; /* أغمق سنة عند hover */
  border-color: #000;
  color: #000;
  letter-spacing: 1px;
  cursor: pointer;
}

a.lang-btn.active {
  background-color: #fcba68; /* اللون البرتقالي للـ active */
  border-color: #fcba68;
  color: #000;
  font-weight: bold;
}

a.lang-btn::after {
  content: "";
  display: inline-block;
  width: 8px;
  height: 100%;
  background-color: #fcba68;
  position: absolute;
  top: 0;
  left: -10px;
  transition: left 0.3s ease;
}

a.lang-btn:hover::after {
  left: 0;
}

.lang-name {
  font-size: 0.9em;
}

@media (max-width: 576px) {
  a.lang-btn {
    width: 100%;
    text-align: center;
    padding: 6px 12px;
  }
}
</style>
