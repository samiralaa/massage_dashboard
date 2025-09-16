<template>
  <div class="loader-svg-wrapper">
    <!-- New CSS Loader -->
    <div class="loader"></div>
  </div>
</template>

<script>
export default {
  name: 'Loader'
}
</script>

<style scoped>
.loader-svg-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffffc5;
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

/* New CSS Loader Styles */
.loader {
  width: 50px;
  aspect-ratio: 1;
  display: grid;
}
.loader::before,
.loader::after {
  content: "";
  grid-area: 1/1;
  --c: no-repeat radial-gradient(farthest-side, #25b09b 92%, #0000);
  background:
    var(--c) 50% 0,
    var(--c) 50% 100%,
    var(--c) 100% 50%,
    var(--c) 0 50%;
  background-size: 12px 12px;
  animation: l12 1s infinite;
}
.loader::before {
  margin: 4px;
  filter: hue-rotate(45deg);
  background-size: 8px 8px;
  animation-timing-function: linear
}

@keyframes l12 {
  100% {
    transform: rotate(.5turn)
  }
}

/* Removed old loader styles */
</style>
