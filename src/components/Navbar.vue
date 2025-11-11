<template>
  <header class="dashboard-header d-flex justify-content-between align-items-center w-100 position-sticky top-0 right-0 py-5" style="z-index: 999998;background-color: #eae5df;">
    <!-- Toggle Sidebar (mobile) -->
    <button class="menu-toggle" @click="$emit('toggle-sidebar')" v-show="isMobile">
      <el-icon><Menu /></el-icon>
    </button>

    <div class="header-actions d-flex align-items-center justify-content-end w-100">
      <LanguageSwitcher class="header-item" />

      <!-- Notifications -->
    

      <!-- User Menu -->
      <el-dropdown @command="$emit('navigate', $event)" trigger="click">
        <div class="user-menu">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile"><el-icon><User /></el-icon> {{ $t('common.menu.profile') }}</el-dropdown-item>
            <el-dropdown-item command="settings"><el-icon><Setting /></el-icon> {{ $t('common.menu.settings') }}</el-dropdown-item>
            <el-dropdown-item divided command="logout"><el-icon><SwitchButton /></el-icon> {{ $t('common.menu.logout') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script>
import LanguageSwitcher from './LanguageSwitcher.vue'

export default {
  name: 'Navbar',
  props: {
    isMobile: Boolean,
    userName: String,
    userRole: String,
    userInitials: String,
    unreadNotifications: Number,
  },
  components: { LanguageSwitcher }
}
</script>
