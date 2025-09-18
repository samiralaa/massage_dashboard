<template>
  <div v-if="isAuthenticated" class="dashboard-container" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    
    <!-- Sidebar -->
    <Sidebar
      :is-open="isSidebarOpen"
      :is-mobile="isMobile"
      :main-menu-items="mainMenuItems"
      :secondary-menu-items="secondaryMenuItems"
      :current-route="currentRoute"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Area -->
    <main>
      <!-- Navbar -->
      <Navbar
        :is-mobile="isMobile"
        :user-name="userName"
        :user-role="userRole"
        :user-initials="userInitials"
        :unread-notifications="unreadNotifications"
        @toggle-sidebar="toggleSidebar"
        @navigate="handleCommand"
      />

      <!-- Content -->
      <div class="dashboard-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>

  <router-view v-else />
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'

export default {
  name: 'Dashboard',
  components: { Sidebar, Navbar },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const isSidebarOpen = ref(false)
    const isMobile = ref(window.innerWidth <= 768)

    // Menu Items
    const mainMenuItems = [
      { path: '/dashboard', name: 'common.menu.dashboard', icon: 'Monitor' },
      { path: '/products', name: 'common.menu.products', icon: 'Goods' },
      { path: '/brands', name: 'common.menu.brands', icon: 'Trophy' },
      { path: '/categories', name: 'common.menu.categories' , icon: 'Folder' },
      {
        name: 'common.menu.input',
        icon: 'Location',
        children: [
          { path: '/units', name: 'common.menu.units', icon: 'List' },
          { path: 'currencies', name: 'common.menu.currencies', icon: 'Coin' }
        ]
      },
      { path: '/orders', name: 'common.menu.orders', icon: 'ShoppingCartFull' },
      { path: '/customers', name: 'common.menu.customers', icon: 'User' },
    ]

    const secondaryMenuItems = [
      { path: '/profile', name: 'common.menu.profile', icon: 'User' },
      { path: '/log', name: 'common.menu.log', icon: 'Document' },
    ]

    // Auth & User
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const userName = computed(() => store.state.user?.name || 'User')
    const userRole = computed(() => store.state.user?.role || 'Admin')
    const userInitials = computed(() =>
      userName.value.split(' ').map(n => n[0]).join('').toUpperCase()
    )
    const currentRoute = computed(() => route.path)
    const unreadNotifications = computed(() => store.state.notifications?.unread || 0)

    // Actions
    const handleCommand = async (command) => {
      switch (command) {
        case 'profile': router.push('/profile'); break
        case 'settings': router.push('/settings'); break
        case 'logout': 
          await store.dispatch('logout')
          router.push('/login')
          break
      }
    }

    const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768
      if (!isMobile.value) isSidebarOpen.value = false
    }

    onMounted(() => window.addEventListener('resize', handleResize))
    onUnmounted(() => window.removeEventListener('resize', handleResize))

    return {
      isSidebarOpen, isMobile, mainMenuItems, secondaryMenuItems,
      isAuthenticated, userName, userRole, userInitials,
      currentRoute, unreadNotifications,
      toggleSidebar, handleCommand
    }
  }
}
</script>
