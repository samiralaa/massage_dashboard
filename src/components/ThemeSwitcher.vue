<template>
  <el-dropdown @command="handleCommand" trigger="click">
    <el-button type="primary" size="small">
      <el-icon><Setting /></el-icon>
      {{ $t('common.theme') }}
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="theme-light">
          <el-icon><Sunny /></el-icon>
          {{ $t('common.themes.light') }}
        </el-dropdown-item>
        <el-dropdown-item command="theme-dark">
          <el-icon><Moon /></el-icon>
          {{ $t('common.themes.dark') }}
        </el-dropdown-item>
        <el-dropdown-item divided command="direction-ltr">
          <el-icon><ArrowRight /></el-icon>
          {{ $t('common.directions.ltr') }}
        </el-dropdown-item>
        <el-dropdown-item command="direction-rtl">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('common.directions.rtl') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { Sunny, Moon, Setting, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import { setTheme, setDirection } from '../utils/theme'

const { locale } = useI18n()

const handleCommand = (command) => {
  switch (command) {
    case 'theme-light':
      setTheme('light')
      break
    case 'theme-dark':
      setTheme('dark')
      break
    case 'direction-ltr':
      locale.value = setDirection('ltr')
      break
    case 'direction-rtl':
      locale.value = setDirection('rtl')
      break
  }
}
</script>

<style scoped>
.el-dropdown {
  margin: 0 8px;
}

.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 