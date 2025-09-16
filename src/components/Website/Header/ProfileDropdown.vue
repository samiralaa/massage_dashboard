<template>
  <div class="profile-dropdown">
    <button class="profile-btn" @click="toggleProfileMenu">
      <span class="user-name me-2">{{ userName }}</span>
      <fa icon="user" />
    </button>
    <div v-if="showProfileMenu" class="dropdown-menu show">
      <router-link to="/profile" class="dropdown-item">{{ $t('header.profile') }}</router-link>
      <router-link to="/orders/user" class="dropdown-item">{{ $t('header.orders') }}</router-link>
      <button class="dropdown-item" @click="handleLogout" :disabled="isLoggingOut">
        <span v-if="isLoggingOut" class="spinner-border spinner-border-sm me-2" role="status"></span>
        {{ $t('header.logout') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileDropdown',
  props: {
    userName: {
      type: String,
      required: true
    },
    isLoggingOut: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showProfileMenu: false
    }
  },
  methods: {
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    handleLogout() {
      this.$emit('logout');
    }
  },
  emits: ['logout']
}
</script>

<style scoped>
.profile-dropdown {
  position: relative;
}

.profile-btn {
  background: transparent;
  border: none;
  color: #8b6b3d;
  cursor: pointer;
  padding: 0.5em;
}

.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  background: none;
  border: none;
  width: 100%;
  text-align: start;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #8b6b3d;
}

.dropdown-item:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

[dir="rtl"] .dropdown-menu {
  right: auto;
  left: 0;
}
</style> 