<template>
  <div class="checkout-step">

    <!-- Saved Addresses Section -->
    <p>test</p>
    <div class="saved-addresses" v-if="savedAddresses.length">
      <h3>{{ $t('checkout.savedAddresses') }}</h3>
      <div class="address-list">
        <div v-for="address in savedAddresses" :key="address.id" class="address-card" @click="selectAddress(address)">
          <div class="address-info">
            <p><strong>{{ address.fullName }}</strong></p>
            <p>{{ address.address }}</p>
            <p>{{ address.city }}, {{ address.postalCode }}</p>
            <p>{{ address.phone }}</p>
          </div>
          <button class="btn-select" :class="{ 'selected': selectedAddressId === address.id }">
            {{ selectedAddressId === address.id ? $t('checkout.selected') : $t('checkout.select') }}
          </button>
        </div>
      </div>
    </div>

    <div class="form-divider">
      <span>{{ $t('checkout.or') }}</span>
    </div>

    <form @submit.prevent="nextStep" class="shipping-form">
      <div class="form-group">
        <label for="fullName">{{ $t('checkout.fullName') }}</label>
        <input type="text" id="fullName" v-model="shippingDetails.fullName" required>
      </div>
      <div class="form-group">
        <label for="address">{{ $t('checkout.address') }}</label>
        <textarea id="address" v-model="shippingDetails.address" required></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="city">{{ $t('checkout.city') }}</label>
          <input type="text" id="city" v-model="shippingDetails.city" required>
        </div>
        <div class="form-group">
          <label for="postalCode">{{ $t('checkout.postalCode') }}</label>
          <input type="text" id="postalCode" v-model="shippingDetails.postalCode" required>
        </div>
      </div>
      <div class="form-group">
        <label for="phone">{{ $t('checkout.phone') }}</label>
        <input type="tel" id="phone" v-model="shippingDetails.phone" required>
      </div>
      <div class="form-group">
        <label for="buildingName">{{ $t('checkout.buildingName') }}</label>
        <input type="text" id="buildingName" v-model="shippingDetails.buildingName" required>
      </div>
      <!-- <div class="form-group">
        <label for="floorNumber">{{ $t('checkout.floorNumber') }}</label>
        <input type="text" id="floorNumber" v-model="shippingDetails.floorNumber" required>
      </div> -->
      <div class="form-group">
        <label for="apartmentNumber">{{ $t('checkout.apartmentNumber') }}</label>
        <input type="text" id="apartmentNumber" v-model="shippingDetails.apartmentNumber" required>
      </div>
      <div class="form-group">
        <label for="landmark">{{ $t('checkout.landmark') }}</label>
        <input type="text" id="landmark" v-model="shippingDetails.landmark" required>
      </div>
      <div class="form-group">
        <label for="street">{{ $t('checkout.street') }}</label>
        <input type="text" id="street" v-model="shippingDetails.street" required>
      </div>
      <div class="form-group">
        <label for="country">{{ $t('checkout.country') }}</label>
        <el-select v-model="shippingDetails.country" :placeholder="$t('checkout.country')" :loading="countryLoading" filterable required>
          <el-option v-for="country in countries" :key="country.id" :label="country.name_en || country.name_ar" :value="country.name_en || country.name_ar" />
        </el-select>
      </div>
      <div class="button-group">
        <button type="button" class="btn-secondary" @click="previousStep">
          {{ $t('checkout.back') }}
        </button>
        <button type="submit" class="btn-primary">
          {{ $t('checkout.continueToPayment') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { ElSelect, ElOption } from 'element-plus';

export default {
  name: 'ShippingDetails',
  components: {
    ElSelect,
    ElOption
  },
  props: {
    shippingDetails: Object
  },
  data() {
    return {
      savedAddresses: [],
      selectedAddressId: null,
      loading: false,
      error: null,
      countries: [],
      countryLoading: false
    };
  },
  methods: {
    async fetchSavedAddresses() {
      this.loading = true;
      try {
        const response = await axios.get('https://massagebackend.webenia.org/api/address');
        this.savedAddresses = response.data;
      } catch (error) {
        console.error('Error fetching addresses:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchCountries() {
      this.countryLoading = true;
      try {
        const response = await axios.get('https://massagebackend.webenia.org/api/countries');
        this.countries = response.data?.data || [];
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        this.countryLoading = false;
      }
    },
    selectAddress(address) {
      this.selectedAddressId = address.id;
      // Update shipping details with selected address
      Object.assign(this.shippingDetails, {
        fullName: address.fullName,
        address: address.address,
        city: address.city,
        postalCode: address.postalCode,
        phone: address.phone,
        buildingName: address.buildingName,
        floorNumber: address.floorNumber,
        apartmentNumber: address.apartmentNumber,
        landmark: address.landmark,
        street: address.street,
        country: address.country
      });
    },
    nextStep() {
      this.$emit('next-step');
    },
    previousStep() {
      this.$emit('previous-step');
    }
  },
  mounted() {
    this.fetchSavedAddresses();
    this.fetchCountries();
  }
};
</script>

<style scoped>
.checkout-step {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.shipping-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #ccc;
}

.btn-primary {
  background-color: #8b6b3d;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #6b4b2d;
}

.saved-addresses {
  margin-bottom: 2rem;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.address-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-card:hover {
  border-color: #8b6b3d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.address-info {
  flex: 1;
}

.address-info p {
  margin: 0.25rem 0;
  color: #666;
}

.btn-select {
  padding: 0.5rem 1rem;
  border: 1px solid #8b6b3d;
  background: transparent;
  color: #8b6b3d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-select.selected {
  background: #8b6b3d;
  color: white;
}

.form-divider {
  text-align: center;
  margin: 2rem 0;
  position: relative;
}

.form-divider::before,
.form-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #ddd;
}

.form-divider::before {
  left: 0;
}

.form-divider::after {
  right: 0;
}

.form-divider span {
  background: white;
  padding: 0 1rem;
  color: #666;
  position: relative;
  z-index: 1;
}
</style>