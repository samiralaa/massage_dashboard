<template>
  <button class="search-btn" @click="$emit('toggle')">
    <fa icon="search" />
    <span class="title">{{ $t('search.search') }}</span>
  </button>
</template>

<script>
export default {
  name: 'SearchButton',
  emits: ['toggle']
}
</script>

<style scoped>
.title {
  display: none;
}

.search-btn {
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


.search-btn:hover {
  color: #6b4d2d;
}
</style> 