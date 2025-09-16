<template>
  <div class="join-us-container">
    <div class="banner-section">
      <!-- <img src="@/assets/images/perfume-banner.svg" alt="Elegance Perfume" class="banner-image"> -->
    </div>
    <div class="join-us-content">
      <div class="form-header">
        <h1 class="elegant-title">{{ $t('header.register') }}</h1>
        <p class="elegant-description">{{ $t('header.register') }}</p>
      </div>
      <form @submit.prevent="handleRegister" class="join-form">
        <div class="form-group">
          <label for="fullName">{{ $t('header.fullName') }}</label>
          <input type="text" id="fullName" v-model="formData.fullName" :placeholder="$t('header.fullNamePlaceholder')"
            :class="{ 'error': errors.fullName, 'valid': formData.fullName && !errors.fullName }" required>
          <span class="error-message" v-if="errors.fullName">{{ errors.fullName }}</span>
        </div>

        <div class="form-group">
          <label for="email">{{ $t('header.email') }}</label>
          <input type="email" id="email" v-model="formData.email" :placeholder="$t('header.emailPlaceholder')"
            :class="{ 'error': errors.email, 'valid': formData.email && !errors.email }" required>
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">{{ $t('header.password') }}</label>
          <div class="password-input-container">
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="formData.password"
              :placeholder="$t('header.passwordPlaceholder')"
              :class="{ 'error': errors.password, 'valid': formData.password && !errors.password }" required
              @copy.prevent @cut.prevent @paste.prevent>
            <button type="button" class="show-password-btn" @click="togglePassword">
              {{ showPassword ? $t('joinUs.hidePassword') : $t('joinUs.showPassword') }}
            </button>
            <button type="button" class="copy-password-btn" @click="copyPassword(formData.password)">

            </button>
          </div>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">{{ $t('header.confirmPassword') }}</label>
          <div class="password-input-container">
            <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
              v-model="formData.confirmPassword" :placeholder="$t('register.confirmPasswordPlaceholder')"
              :class="{ 'error': errors.confirmPassword, 'valid': formData.confirmPassword && !errors.confirmPassword }"
              required @copy.prevent @cut.prevent @paste.prevent>
            <button type="button" class="show-password-btn" @click="toggleConfirmPassword">
              {{ showConfirmPassword ? $t('joinUs.hidePassword') : $t('joinUs.showPassword') }}
            </button>
          </div>
          <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-group">
          <label for="country">{{ $t('register.country') }}</label>
          <el-select v-model="formData.country_id" class="country-select"
            :placeholder="$t('register.countryPlaceholder')" :loading="loading" filterable
            :filter-method="filterCountries" :remote-method="filterCountries" :remote="false" required>
            <el-option v-for="country in filteredCountries" :key="country.id" :label="getCountryName(country)"
              :value="country.id">
              <div class="country-option">
                <span class="country-name">{{ getCountryName(country) }}</span>
                <span class="country-code">+{{ getCountryCode(country.id) }}</span>
              </div>
            </el-option>
          </el-select>
          <span class="error-message" v-if="errors.country_id">{{ errors.country_id }}</span>
        </div>

        <div class="form-group">
          <label for="phoneNumber">{{ $t('register.phoneNumber') }}</label>
          <div class="phone-input-container">
            <div class="country-code-input">
              <span class="plus">+</span>
              <input type="text" v-model="countryCode" class="country-code-field" readonly
                :placeholder="selectedCountryDialCode || 'Code'" />
            </div>
            <input type="tel" id="phoneNumber" v-model="phoneNumber"
              :placeholder="$t('register.phoneNumberPlaceholder')"
              :class="{ 'error': errors.phoneNumber, 'valid': phoneNumber && !errors.phoneNumber }" required
              minlength="8" maxlength="18" @input="formatPhoneNumber">
          </div>
          <span class="error-message" v-if="errors.phoneNumber">{{ errors.phoneNumber }}</span>
        </div>

        <button type="submit" class="submit-btn">{{ $t('register.submit') }}</button>

        <div class="register-section">
          <p>{{ $t('register.alreadyHaveAccount') }}
            <router-link to="/account/login" class="link">{{ $t('register.loginHere') }}</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import axios from 'axios'

const API_URL = 'https://massagebackend.webenia.org/api'

export default {
  name: 'Register',
  components: {
    ElSelect,
    ElOption
  },
  data() {
    return {
      formData: {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        country_id: '',
        phoneNumber: ''
      },
      countryCode: '',
      phoneNumber: '',
      errors: {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        country_id: ''
      },
      countries: [],
      filteredCountries: [],
      loading: false,
      showPassword: false,
      showConfirmPassword: false,
      countryCodes: {
        1: '93', // Afghanistan
        2: '355', // Albania
        3: '213', // Algeria
        4: '376', // Andorra
        5: '244', // Angola
        6: '973', // Bahrain
        7: '880', // Bangladesh
        8: '32', // Belgium
        9: '55', // Brazil
        10: '1', // Canada
        11: '86', // China
        12: '20', // Egypt
        13: '33', // France
        14: '49', // Germany
        15: '30', // Greece
        16: '91', // India
        17: '62', // Indonesia
        18: '98', // Iran
        19: '964', // Iraq
        20: '353', // Ireland
        21: '39', // Italy
        22: '81', // Japan
        23: '962', // Jordan
        24: '7', // Kazakhstan
        25: '254', // Kenya
        26: '965', // Kuwait
        27: '961', // Lebanon
        28: '218', // Libya
        29: '60', // Malaysia
        30: '52', // Mexico
        31: '212', // Morocco
        32: '977', // Nepal
        33: '31', // Netherlands
        34: '64', // New Zealand
        35: '234', // Nigeria
        36: '968', // Oman
        37: '92', // Pakistan
        38: '970', // Palestine
        39: '974', // Qatar
        40: '7', // Russia
        41: '966', // Saudi Arabia
        42: '65', // Singapore
        43: '27', // South Africa
        44: '82', // South Korea
        45: '34', // Spain
        46: '249', // Sudan
        47: '46', // Sweden
        48: '41', // Switzerland
        49: '963', // Syria
        50: '886', // Taiwan
        51: '255', // Tanzania
        52: '66', // Thailand
        53: '216', // Tunisia
        54: '90', // Turkey
        55: '256', // Uganda
        56: '380', // Ukraine
        57: '971', // UAE
        58: '44', // UK
        59: '1', // USA
        60: '998', // Uzbekistan
        61: '84', // Vietnam
        62: '967', // Yemen
        63: '263' // Zimbabwe
      }
    }
  },
  computed: {
    selectedCountryDialCode() {
      if (!Array.isArray(this.countries)) return '';
      const country = this.countries.find(c => c.id === this.formData.country_id);
      return country ? this.getCountryCode(country.id) : '';
    },
    currentLocale() {
      return this.$i18n?.locale || 'en'
    }
  },
  created() {
    this.fetchCountries()
  },
  watch: {
    'formData.fullName'(value) {
      this.validateFullName(value)
    },
    'formData.email'(value) {
      this.validateEmail(value)
    },
    'formData.password'(value) {
      this.validatePassword(value)
      if (this.formData.confirmPassword) {
        this.validateConfirmPassword(this.formData.confirmPassword)
      }
    },
    'formData.confirmPassword'(value) {
      this.validateConfirmPassword(value)
    },
    'formData.phoneNumber'(value) {
      this.validatePhoneNumber(value)
    },
    'formData.country_id': {
      immediate: true,
      handler(newValue) {
        this.validateCountry(newValue);
        if (newValue) {
          this.countryCode = this.getCountryCode(newValue);
          if (this.phoneNumber) {
            this.updateFullPhoneNumber();
          }
        } else {
          this.countryCode = '';
        }
      }
    },
    phoneNumber: {
      handler(newValue) {
        this.updateFullPhoneNumber();
      }
    }
  },
  methods: {
    getCountryName(country) {
      return this.currentLocale === 'ar' ? country.name_ar : country.name_en
    },
    getCountryCode(countryId) {
      return this.countryCodes[countryId] || '';
    },
    filterCountries(query) {
      if (query) {
        const searchQuery = query.toLowerCase();
        this.filteredCountries = this.countries.filter(country => {
          const nameEn = country.name_en?.toLowerCase() || '';
          const nameAr = country.name_ar?.toLowerCase() || '';
          const phoneCode = this.getCountryCode(country.id) || '';
          return nameEn.includes(searchQuery) ||
            nameAr.includes(searchQuery) ||
            phoneCode.includes(searchQuery);
        });
      } else {
        this.filteredCountries = this.countries;
      }
    },
    async fetchCountries() {
      try {
        this.loading = true;
        const response = await axios.get(`${API_URL}/countries`);
      
        const countriesArray = response.data?.data || [];
        this.countries = Array.isArray(countriesArray) ? countriesArray : [];
        this.filteredCountries = this.countries;
        if (this.formData.country_id) {
          this.countryCode = this.getCountryCode(this.formData.country_id);
          this.updateFullPhoneNumber();
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        this.$toast?.error?.(this.$t?.('register.errorFetchingCountries') || 'Failed to fetch countries');
      } finally {
        this.loading = false;
      }
    },
    validateFullName(value) {
      if (!value) {
        this.errors.fullName = this.$t('register.validation.fullNameRequired')
      } else if (value.length < 3) {
        this.errors.fullName = this.$t('register.validation.fullNameMinLength')
      } else if (value.length > 255) {
        this.errors.fullName = this.$t('register.validation.fullNameMaxLength')
      } else if (!/^[\p{L}\s'-]+$/u.test(value)) {
        this.errors.fullName = this.$t('register.validation.fullNameInvalid')
      } else {
        this.errors.fullName = ''
      }
    },
    validateEmail(value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) {
        this.errors.email = this.$t('register.validation.emailRequired')
      } else if (!emailRegex.test(value)) {
        this.errors.email = this.$t('register.validation.emailInvalid')
      } else {
        this.errors.email = ''
      }
    },
    validatePassword(value) {
      if (!value) {
        this.errors.password = this.$t('register.validation.passwordRequired')
      } else if (value.length < 8) {
        this.errors.password = this.$t('register.validation.passwordMinLength')
      } else {
        this.errors.password = ''
      }
    },
    validateConfirmPassword(value) {
      if (!value) {
        this.errors.confirmPassword = this.$t('register.validation.confirmPasswordRequired')
      } else if (value !== this.formData.password) {
        this.errors.confirmPassword = this.$t('register.validation.confirmPasswordMatch')
      } else {
        this.errors.confirmPassword = ''
      }
    },
    validatePhoneNumber(value) {
      if (!value) {
        this.errors.phoneNumber = this.$t('register.validation.phoneRequired');
      } else if (!this.countryCode) {
        this.errors.phoneNumber = this.$t('register.validation.countryRequired');
      } else if (value.length < 6 || value.length > 18) {
        this.errors.phoneNumber = this.$t('register.validation.phoneLength');
      } else if (!/^\d+$/.test(value)) {
        this.errors.phoneNumber = this.$t('register.validation.phoneInvalid');
      } else {
        this.errors.phoneNumber = '';
      }
    },
    validateCountry(value) {
      if (!value) {
        this.errors.country_id = this.$t('register.validation.countryRequired')
      } else if (!this.countries.some(country => country.id === value)) {
        this.errors.country_id = this.$t('register.validation.countryInvalid')
      } else {
        this.errors.country_id = ''
      }
    },
    async handleRegister() {
      // Validate all fields
      this.validateFullName(this.formData.fullName)
      this.validateEmail(this.formData.email)
      this.validatePassword(this.formData.password)
      this.validateConfirmPassword(this.formData.confirmPassword)
      this.validatePhoneNumber(this.formData.phoneNumber)
      this.validateCountry(this.formData.country_id)

      // Check if there are any errors
      if (Object.values(this.errors).some(error => error)) {
        return
      }

      try {
        const response = await axios.post(`${API_URL}/clients/register`, {
          name: this.formData.fullName,
          email: this.formData.email,
          password: this.formData.password,
          password_confirmation: this.formData.confirmPassword,
          country_id: this.formData.country_id,
          phone: this.formData.phoneNumber,
          role: 'user', // Default role
          dialing_code: this.selectedCountryDialCode // Send the selected country's dialing code
        })

        // Check if we have the expected response structure
        if (response.data && response.data.data) {
          // Store user data
          localStorage.setItem('user', JSON.stringify(response.data.data.user))
          localStorage.setItem('auth_token', response.data.data.token)

          this.$toast?.success?.(response.data.message || 'Registration successful')

          // Redirect to OTP page
          this.$router.push('/otp')
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.error('Registration error:', error)
        // Backend error message mapping
        const backendErrorMap = {
          "رقم الهاتف غير صالح لهذا الرمز.": "رقم الهاتف غير صالح لهذا الرمز.",
          "The phone number is not valid for this code.": "رقم الهاتف غير صالح لهذا الرمز."
        }
        if (error.response?.data?.errors) {
          // Handle validation errors from backend
          const backendErrors = error.response.data.errors
          Object.keys(backendErrors).forEach(field => {
            let backendMsg = backendErrors[field][0]
            // Map backend 'phone' to local 'phoneNumber'
            if (field === 'phone') {
              const translationKey = backendErrorMap[backendMsg]
              this.errors.phoneNumber = translationKey ? this.$t(translationKey) : backendMsg
            } else if (this.errors.hasOwnProperty(field)) {
              const translationKey = backendErrorMap[backendMsg]
              this.errors[field] = translationKey ? this.$t(translationKey) : backendMsg
            }
          })
          // Handle top-level message
          if (error.response.data.message) {
            const msg = error.response.data.message
            const translationKey = backendErrorMap[msg]
            this.$toast?.error?.(translationKey ? this.$t(translationKey) : msg)
          }
        } else {
          const errorMessage = error.response?.data?.message || this.$t?.('register.error') || 'Registration failed'
          this.$toast?.error?.(errorMessage)
        }
      }
    },
    updateFullPhoneNumber() {
      // Only update if we have a country code
      if (this.countryCode) {
        this.formData.phoneNumber = this.phoneNumber;
      } else {
        this.formData.phoneNumber = this.phoneNumber;
      }
    },
    formatPhoneNumber(event) {
      let value = event.target.value;

      // Remove any non-numeric characters
      value = value.replace(/\D/g, '');

      // Update the phone number
      this.phoneNumber = value;
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    copyPassword(password) {
      if (!password) return;
      navigator.clipboard.writeText(password)
        .then(() => {
          this.$toast?.success?.(this.$t('joinUs.passwordCopied') || 'Password copied!');
        })
        .catch(() => {
          this.$toast?.error?.(this.$t('joinUs.copyFailed') || 'Failed to copy password.');
        });
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/fonts.css';

.join-us-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background: #fff;
}

.banner-section {
  background: linear-gradient(to bottom, #F5E6D3, #9b7c1f);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-shadow: inset 0 0 50px rgba(155, 124, 31, 0.2);
}

.banner-image {
  max-width: 100%;
  height: auto;
}

.join-us-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  background: #fff;
}

.form-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.elegant-title {
  color: #9b7c1f;
  margin-bottom: 1.5rem;
  font-size: 3rem;
  font-weight: 700;
  font-family: var(--font-heading);
  letter-spacing: 0.5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.elegant-description {
  color: #666;
  font-size: 1.2rem;
  line-height: 1.8;
  font-family: var(--font-body);
  font-weight: 300;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #333;
  font-weight: 500;
}

input,
.el-select {
  padding: 1.2rem;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.4s ease;
  width: 100%;
  font-family: var(--font-body);
  background-color: rgba(255, 255, 255, 0.8);
}

input:focus,
.el-select:focus {
  outline: none;
  border-color: #9b7c1f;
  box-shadow: 0 0 0 4px rgba(155, 124, 31, 0.15);
  background-color: #fff;
}

input.error {
  border-color: #ef4444;
}

input.valid {
  border-color: #10b981;
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.password-input-container {
  position: relative;
  width: 100%;
}

.show-password-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9b7c1f;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.show-password-btn:hover {
  color: #826618;
}

.copy-password-btn {
  position: absolute;
  right: 6rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9b7c1f;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.copy-password-btn:hover {
  color: #826618;
}

.phone-input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.country-code-input {
  display: flex;
  align-items: center;
  background-color: #f3f4f6;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  padding: 0 1rem;
  min-width: 100px;
}

.plus {
  color: #374151;
  font-size: 1.1rem;
  margin-right: 4px;
}

.country-code-field {
  background: transparent;
  border: none;
  padding: 1.2rem 0;
  font-size: 1.1rem;
  color: #374151;
  width: 100%;
  text-align: center;
}

.country-code-field:focus {
  outline: none;
  box-shadow: none;
}

.country-code-field::placeholder {
  color: #9CA3AF;
}

.submit-btn {
  background-color: #9b7c1f;
  color: #fff;
  padding: 1.25rem;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  width: 100%;
  margin-top: 1.5rem;
  font-family: var(--font-body);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.submit-btn:hover {
  background-color: #826618;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(155, 124, 31, 0.3);
}

.register-section {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.link {
  color: #9b7c1f;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.link:hover {
  color: #826618;
  text-decoration: underline;
}

/* RTL */
[dir="rtl"] .join-form {
  text-align: right;
}

[dir="rtl"] .show-password-btn {
  right: auto;
  left: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .join-us-container {
    grid-template-columns: 1fr;
  }

  .banner-section {
    display: none;
  }

  .join-us-content {
    padding: 2rem;
  }
}

.country-select {
  width: 100%;
}

.country-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.country-name {
  font-size: 1rem;
  color: #374151;
}

.country-code {
  font-size: 0.9rem;
  color: #6B7280;
  margin-left: 8px;
}

/* RTL Support */
[dir="rtl"] .country-code {
  margin-left: 0;
  margin-right: 8px;
}

/* Element Plus Overrides */
:deep(.el-select-dropdown__item) {
  padding: 0 20px;
}

:deep(.el-select-dropdown__item.selected) {
  color: #9b7c1f;
  font-weight: 600;
}

:deep(.el-select .el-input__wrapper) {
  padding: 1.2rem;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #9b7c1f;
  box-shadow: 0 0 0 4px rgba(155, 124, 31, 0.15);
}

:deep(.el-select .el-input__inner) {
  font-size: 1.1rem;
  color: #374151;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: #9CA3AF;
}
</style>
