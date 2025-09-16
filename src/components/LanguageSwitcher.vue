<template>
  <div class="language-switcher">
    <div class="button-group">
      <a 
        v-if="locale !== 'en'"
        :class="['lang-btn', { active: locale === 'en' }, 'text-uppercase text-center']"
        @click="switchLanguage('en')"
      >
        <!-- <span class="lang-code">EN</span> -->
        <span class="lang-name ">English</span>
      </a>
      <a 
        v-if="locale !== 'ar'"
        :class="['lang-btn', { active: locale === 'ar' }, 'text-uppercase text-center']"
        @click="switchLanguage('ar')"
      >
        <!-- <span class="lang-code">ع</span> -->
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
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 5px 20px 5px 10px;
  text-decoration: none;
  color: #fff;
  width: 150px;
  border-radius: 5px;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
  position: relative;
  overflow: hidden;
}

a.lang-btn:hover {
  background-color: #00000066;
  border-color: #fff;
  padding-left: 20px;
  width: 130px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  letter-spacing: 2px;
  cursor: pointer;
}

a.lang-btn::after {
  content: "";
  display: inline-block;
  width: 10px;
  height: 100px;
  background-color: #fcba68;
  position: absolute;
  top: 0px;
  left: -10px;
  transition: left 0.5s;
}

a.lang-btn:hover::after {
  left: 0px;
}


.lang-code {
  font-weight: bold;
  font-size: 0.9em;
  margin: 0 5px;
}

.lang-name {
  font-size: 0.9em;
}

.button-group a {
  color: #fff;
}
@media (max-width: 576px ) {
  a.lang-btn {
    width: 100px;
  }
  a.lang-btn:hover {
    width: 100%;
    padding-left: 20px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }
  a.lang-btn::after {
    left: -10px;
  }

  .lang-code {
    font-size: 0.8em;
  }
  .lang-name {
    font-size: 0.8em;
  }
  .button-group a {
    width: 100%;
  }

}
</style>