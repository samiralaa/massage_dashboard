<template>
  <div class="cart-button" @click="$emit('show')">
    <fa icon="shopping-cart" />
    <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
    <span class="title">{{ $t('cart.title') }}</span>
  </div>
</template>

<script>
import { useCartStore } from '@/store/cart'
import { storeToRefs } from 'pinia'

export default {
  name: 'CartButton',
  emits: ['show'],
  setup() {
    const cartStore = useCartStore()
    const { cartCount } = storeToRefs(cartStore)
    
    // Fetch cart count when component is mounted
    if (localStorage.getItem('auth_token')) {
      cartStore.fetchCartCount()
    }
    
    return { cartCount }
  }
}
</script>

<style scoped>
.title {
  display: none;
}

.cart-button {
  position: relative;
  border: none;
  cursor: pointer;
  isolation: isolate;
  background-color: transparent;
  overflow: hidden;
  padding: 16px;
  color: #a07840;
  transition: all 0.3s ease;
}

.cart-button:hover {
  color: #6b4d2d;
}

.cart-count {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ff0000;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
  transition: all 0.3s ease;
}

</style> 