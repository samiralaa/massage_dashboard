<template>
  <button class="favorite-btn" @click="handleClick">
    <fa icon="heart" />
    <span v-if="favoritesStore.count > 0" class="favorite-count">{{ favoritesStore.count }}</span>
    <span class="title">{{ $t('favorites.title') }}</span>
  </button>
</template>

<script>
import { useFavoritesStore } from '@/store/favorites';
import { onMounted } from 'vue';

export default {
  name: 'FavoriteButton',
  emits: ['show'],
  setup(props, { emit }) {
    const favoritesStore = useFavoritesStore();

    const handleClick = () => {
      if (!localStorage.getItem('auth_token')) {
        window.location.href = '/Account/Login';
        return;
      }
      emit('show');
    };

    onMounted(async () => {
      await favoritesStore.fetchFavorites();
    });

    return {
      favoritesStore,
      handleClick
    };
  }
}
</script>

<style scoped>
.title {
  display: none;
}

.favorite-btn {
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

.favorite-btn:hover {
  color: #6b4d2d;
}

.favorite-count {
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