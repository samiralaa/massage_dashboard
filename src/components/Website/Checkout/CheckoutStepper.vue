<template>
  <div class="stepper">
    <div class="step" :class="{ active: step >= 1, completed: step > 1 }">
      <div class="step-number">1</div>
      <div class="step-label">{{ $t('checkout.cart') }}</div>
    </div>
    <div class="step-line" :class="{ active: step > 1 }"></div>
    <div class="step" :class="{ active: step >= 2, completed: step > 2 }">
      <div class="step-number">2</div>
      <div class="step-label">{{ $t('checkout.shipping') }}</div>
    </div>
    <div class="step-line" :class="{ active: step > 2 }"></div>
    <div class="step" :class="{ active: step >= 3 }">
      <div class="step-number">3</div>
      <div class="step-label">{{ $t('checkout.payment') }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckoutStepper',
  props: {
    step: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: #8b6b3d;
}

.step-line {
  width: 100px;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 1rem;
  transition: all 0.3s ease;
}

.step-line.active {
  background-color: #8b6b3d;
}

@media (max-width: 768px) {
  .stepper {
    flex-direction: column;
    gap: 1rem;
  }

  .step-line {
    width: 2px;
    height: 30px;
  }
}
</style> 