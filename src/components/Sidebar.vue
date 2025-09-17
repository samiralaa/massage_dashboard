<template>
  <aside class="dashboard-sidebar vh-100 overflow-auto" style="z-index: 999999;" :class="{ open: isOpen }">
    <!-- Brand -->
    <div class="brand-section d-flex justify-content-between align-items-center py-5">
      <div class="brand-logo">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="brand-text fs-6">
          <span class="brand-name">Message</span>
          <span class="brand-tagline">{{ $t('common.brand.tagline') }}</span>
        </div>
      </div>
      <button class="btn btn-sm btn-outline-light" @click="$emit('toggle-sidebar')" v-show="isMobile">x</button>
    </div>

    <!-- Menu -->
    <nav class="sidebar-menu flex-nowrap nav overflow-visible flex-column text-black" style="background-color: #D9D9D933;color: black !important;">
        <template v-for="item in mainMenuItems" :key="item.path || item.name">
        <!-- With Children -->
        <div v-if="item.children" class="menu-item-group mb-2">
            <div
            class="menu-item nav-link d-flex justify-content-between align-items-center"
            @click="toggleDropdown(item)"
            :class="{ active: isDropdownOpen(item) }"
            >
            <div :to="item.path"
            class="menu-item dropdown nav-link px-0 w-100"
            :class="{ active: currentRoute === item.path }"
            >
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ $t(item.name) }}</span>
            </div>
            <el-icon class="dropdown-icon" :class="{ 'rotate-180': isDropdownOpen(item) }">
                <ArrowDown />
            </el-icon>
            </div>
            <transition name="fade">
            <div v-show="isDropdownOpen(item)" class="submenu nav flex-column">
                <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="submenu-item menu-item mb-0 nav-link"
                :class="{ active: currentRoute === child.path }"
                >
                <el-icon><component :is="child.icon" /></el-icon>
                {{ $t(child.name) }}
                </router-link>
            </div>
            </transition>
        </div>

        <!-- Without Children -->
        <router-link
            v-else
            :to="item.path"
            class="menu-item nav-link"
            :class="{ active: currentRoute === item.path }"
        >
            <el-icon class="me-2"><component :is="item.icon" /></el-icon>
            <span>{{ $t(item.name) }}</span>
        </router-link>
        </template>

        <!-- Divider -->
        <hr class="bg-secondary my-3" />

        <!-- Secondary Menu -->
        <router-link
        v-for="item in secondaryMenuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item nav-link"
        :class="{ active: currentRoute === item.path }"
        >
        <el-icon class="me-2"><component :is="item.icon" /></el-icon>
        {{ $t(item.name) }}
        </router-link>
    </nav>
  </aside>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Sidebar',
  props: {
    isOpen: Boolean,
    isMobile: Boolean,
    mainMenuItems: Array,
    secondaryMenuItems: Array,
    currentRoute: String,
  },
  setup() {
    const openDropdowns = ref(new Set())
    const toggleDropdown = (item) => {
      if (openDropdowns.value.has(item.name)) openDropdowns.value.delete(item.name)
      else openDropdowns.value.add(item.name)
    }
    const isDropdownOpen = (item) => openDropdowns.value.has(item.name)
    return { toggleDropdown, isDropdownOpen }
  }
}
</script>

<style>
.dropdown::before{
    height: 0 !important;
    width: 0 !important;
}
.dropdown:hover{
    background-color: transparent !important;
}
.dashboard-sidebar{
    scrollbar-width: thin;
    scrollbar-color: var(--primary-gold) var(--dark-brown);
}
</style>