<template>
  <el-switch
    v-model="isRTL"
    :active-text="$t('common.rtl')"
    :inactive-text="$t('common.ltr')"
    @change="handleDirectionChange"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { initializeDirection, setDirection } from '../utils/direction'

const { locale } = useI18n()
const isRTL = ref(document.documentElement.dir === 'rtl')

const handleDirectionChange = (value) => {
  const newLang = setDirection(value ? 'rtl' : 'ltr')
  locale.value = newLang
}

onMounted(() => {
  const initialLang = initializeDirection()
  locale.value = initialLang
  isRTL.value = document.documentElement.dir === 'rtl'
})
</script>

<style scoped>
.el-switch {
  margin: 0 8px;
}
</style> 