<template>
  <div class="country-select">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <select
      :id="id"
      v-model="selectedValue"
      class="form-select"
      :class="{ 'is-invalid': error }"
      :disabled="loading"
      @change="handleChange"
    >
      <option value="">{{ placeholder }}</option>
      <option
        v-for="country in countriesForSelect"
        :key="country.value"
        :value="country.value"
      >
        {{ isArabic ? country.label_ar : country.label }}
      </option>
    </select>
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
    <div v-if="loading" class="form-text">Loading countries...</div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CountrySelect',
  props: {
    value: {
      type: [Number, String],
      default: ''
    },
    label: {
      type: String,
      default: 'Country'
    },
    placeholder: {
      type: String,
      default: 'Select a country'
    },
    id: {
      type: String,
      default: 'country-select'
    },
    isArabic: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedValue: this.value
    }
  },
  computed: {
    ...mapGetters('countries', [
      'getCountriesForSelect',
      'getCountriesLoading',
      'getCountriesError'
    ]),
    countriesForSelect() {
      return this.getCountriesForSelect
    },
    loading() {
      return this.getCountriesLoading
    },
    error() {
      return this.getCountriesError
    }
  },
  watch: {
    value(newValue) {
      this.selectedValue = newValue
    }
  },
  methods: {
    ...mapActions('countries', ['fetchCountries', 'setSelectedCountry']),
    handleChange(event) {
      const selectedCountry = this.countriesForSelect.find(
        country => country.value === this.selectedValue
      )
      this.setSelectedCountry(selectedCountry)
      this.$emit('input', this.selectedValue)
      this.$emit('change', selectedCountry)
    }
  },
  created() {
    this.fetchCountries()
  }
}
</script>

<style scoped>
.country-select {
  margin-bottom: 1rem;
}
</style> 