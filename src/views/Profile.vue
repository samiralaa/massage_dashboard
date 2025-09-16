<template>
  <Header />
  <div class="profile-outer container my-5">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center py-5">
      <span class="loader mb-2"></span>
      <span>{{ $t('profile.loading') }}</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-danger">
      <span>{{ error }}</span>
    </div>

    <!-- Profile Card -->
    <div v-else class="card p-4 shadow w-75">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="avatar bg-primary text-white rounded-circle d-flex justify-content-center align-items-center"
            style="width: 60px; height: 60px; font-size: 24px;">
            {{ user.name ? user.name.charAt(0).toUpperCase() : '?' }}
          </div>
          <div class="user-info  ">
            <h5 class="mb-0 fw-bold">{{ user.name }}</h5>
            <small class="text-muted">{{ user.email }}</small>
          </div>
        </div>
        <button class="btn btn-outline-secondary d-flex align-items-center gap-1" @click="showResetPasswordModal = true"
          aria-label="Reset Password">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-6a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ $t('profile.resetPassword') }}
        </button>
      </div>

      <!-- Reset Password Modal -->
      <div v-if="showResetPasswordModal" class="modal-overlay">
        <div class="modal-dialog-centered">
          <div class="modal-content bg-white p-4 rounded shadow w-100">
            <h5 class="mb-4">{{ $t('profile.resetPassword') }}</h5>
            <form @submit.prevent="resetPassword" class="d-flex flex-column gap-3">
              <div class="form-group">
                <label>{{ $t('profile.newPassword') }}</label>
                <input type="password" v-model="password" class="form-control" required />
              </div>
              <div class="form-group">
                <label>{{ $t('profile.confirmPassword') }}</label>
                <input type="password" v-model="password_confirmation" class="form-control" required />
              </div>
              <div v-if="resetPasswordError" class="alert alert-danger">{{ resetPasswordError }}</div>
              <div v-if="resetPasswordSuccess" class="alert alert-success">{{ resetPasswordSuccess }}</div>
              <div class="d-flex justify-content-end gap-2 mt-2">
                <button type="submit" class="btn btn-primary" :disabled="resetPasswordLoading">
                  <span v-if="resetPasswordLoading" class="spinner-border spinner-border-sm"></span>
                  {{ $t('profile.submit') }}
                </button>
                <button type="button" class="btn btn-secondary" @click="showResetPasswordModal = false">
                  {{ $t('profile.cancel') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Basic Details -->
      <div class="d-flex flex-column gap-3">
        
        
        <div class="d-flex justify-content-between border-bottom pb-2">
          <strong>{{ $t('profile.phone') }} :</strong>
          <span>{{ user.phone }} </span>
        </div>
      </div>

      <!-- Address -->
      <div class="d-flex justify-content-between align-items-center my-3">
        <h5 class="mb-0 text-dark">
          <fa :icon="['fas', 'map-marker-alt']" class="me-2 text-primary" />
          {{ $t('profile.address') }}
        </h5>
        <button class="btn btn-outline-info btn-sm" @click="openEditDialog()">
          <fa :icon="['fas', 'plus']" class="me-1" />
          {{ $t('profile.addAddress') }}
        </button>
      </div>
      <div v-if="user.address?.length" class="mt-4 d-flex justify-content-start flex-wrap gap-4" >
        <!-- Header with Icon -->

        <!-- Address List -->
    
          

          
<div class="card shadow-sm  bg-light p-3   col-12 col-md-5 rounded-3 mx-auto"  v-for="(addr, idx) in user.address" :key="addr.id || idx">
  <div class="p-1">
    <h6 class="card-title fw-bold mb-2">{{ this.$i18n.locale === 'ar'?addr.country.name_ar : addr.country.name_en }}</h6>
    <p class="mb-1">{{ this.$i18n.locale === 'ar'?addr.city.name_ar : addr.city.name_en }}</p>

    <p class="mb-1"><strong>Postal Code</strong> <span class="text-muted">{{ addr.postal_code }}</span></p>
    <p class="mb-3"><strong>Building Name</strong> <span class="text-muted">{{ addr.building_name }}</span></p>

    <div class="d-flex gap-2">
      <button class="btn btn-outline-danger btn-sm d-flex align-items-center"  @click="openDeleteDialog(addr)" >
        <fa :icon="['fas','fa-trash-alt']"  class=" me-2"/> {{ $t('profile.deleteAddress') }}
      </button>
      <button class="btn btn-outline-dark btn-sm d-flex align-items-center" @click="openEditDialog(addr);getAddress(addr.country_id)" >
        <fa :icon="['fas','fa-pen']" class=" me-2"/> {{ $t('profile.editAddress') }}
      </button>
     
    </div>
  </div>
</div>
      </div>
      

    



    </div>

    <!-- Edit Address Modal -->
    <div v-if="showAddressDialog" class="modal-overlay">
      <div class="modal-dialog-centered">
        <div class="modal-content bg-white p-4 rounded shadow w-100">
          <h5 class="mb-4">Edit Address</h5>
          <form @submit.prevent="saveAddress(editingAddressId)" class="d-flex flex-column gap-3">
            <div class="form-group">
              <label>Building Name</label>
              <input v-model="addressForm.building_name" class="form-control" placeholder="Building Name" />
            </div>
            <div class="form-group">
              <label>Floor Number</label>
              <input v-model="addressForm.floor_number" class="form-control" placeholder="Floor Number" />
            </div>
            <div class="form-group">
              <label>Apartment Number</label>
              <input v-model="addressForm.apartment_number" class="form-control" placeholder="Apartment Number" />
            </div>
            <div class="form-group">
              <label>Postal Code</label>
              <input v-model="addressForm.postal_code" class="form-control" placeholder="Postal Code" />
            </div>
            <div class="form-group">
              <label>Landmark</label>
              <input v-model="addressForm.landmark" class="form-control" placeholder="Landmark" />
            </div>
            <div class="form-group">
              <label for="country">country</label>
              <select id="country" class="form-control" v-model="addressForm.country_id" required
                @change="fetchCities(addressForm.country_id)">
                <option v-if="countryLoading" disabled>Loading...</option>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ country.name_en || country.name_ar }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="city">{{ $t('checkout.city') }}</label>
              <select id="city" class="form-select" v-model="addressForm.city_id" required>
                <option v-for="city in cities" :key="city.id" :value="city.id" selected>
                  {{ $i18n.locale === 'ar' ? city.name_ar : city.name_en }}
                </option>
              </select>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-2">
              <button type="submit" class="btn btn-primary">{{$t('profile.save') }}</button>
              <button type="button" class="btn btn-secondary" @click="closeEditDialog">{{$t('profile.cancel') }}</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Dialog -->
  <div v-if="showDeleteDialog" class="modal-overlay">
    <div class="modal-dialog-centered">
      <div class="modal-content bg-white p-4 rounded shadow w-100">
        <h5 class="mb-3">{{ $t('profile.confirmDeleteAddress') || 'Are you sure you want to delete this address?' }}
        </h5>
        <div class="d-flex justify-content-end gap-2 mt-2">
          <button class="btn btn-danger" @click="confirmDeleteAddress">{{ $t('profile.deleteAddress') }}</button>
          <button class="btn btn-secondary" @click="showDeleteDialog = false">{{ $t('profile.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Success Message Dialog -->
  <div v-if="showDeleteSuccess" class="modal-overlay">
    <div class="modal-dialog-centered">
      <div class="modal-content bg-white p-4 rounded shadow w-100 text-center">
        <h5 class="mb-3 text-success">{{ $t('profile.addressDeleted') || 'Address deleted successfully' }}</h5>
        <button class="btn btn-primary" @click="showDeleteSuccess = false">OK</button>
      </div>
    </div>
    
  </div>
  
</template>

<script >
import axios from 'axios';
import Header from '@/components/Website/Header.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ElNotification } from 'element-plus';
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t } = useI18n()

    return {
      t
    }
  },
  components: { Header, fa: FontAwesomeIcon },
  data() {
    return {
      cities: [],
      countries: [],
      countryLoading: false,
      loading: true,
      error: null,
      user: {},
      showAddressDialog: false,
      editingAddressId: null,
      addressForm: {
        building_name: '',
        floor_number: '',
        apartment_number: '',
        postal_code: '',
        landmark: '',
        city_id: '',
        country_id: ''
      },
      addressSuccess: false,
      showResetPasswordModal: false,
      password: '',
      password_confirmation: '',
      resetPasswordLoading: false,
      resetPasswordError: null,
      resetPasswordSuccess: null,
      showDeleteDialog: false,
      addressToDelete: null,
      showDeleteSuccess: false,
    };
  },
  methods: {

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    },
    goToResetPassword() {
      this.$router.push({ name: 'ResetPassword', query: { email: this.user.email } });
    },
    // Format address as one line, skipping empty fields
    formatAddress(addr) {
      // Get country name from nested country object if available
      let countryName = '';
      if (addr.country) {
        countryName = this.$i18n && this.$i18n.locale === 'ar' ? addr.country.name_ar : addr.country.name_en;
      } else if (addr.country_id) {
        countryName = addr.country_id;
        
      }
      let cityName = '';
      if (addr.city) {
        cityName = this.$i18n && this.$i18n.locale === 'ar' ? addr.city.name_ar : addr.city.name_en;
      } else if (addr.city_id) {
        cityName = addr.city_id;
      }
      
      return [
        addr.building_name,
        addr.floor_number,
        addr.apartment_number,
        addr.postal_code,
        addr.landmark,
        cityName,
        countryName
      ].filter(Boolean).join(', ');
    },
    
    getAddress(id) {
    // this.addressForm.country_id = id;
    this.fetchCities(id);
   
    
  },
    openEditDialog(addr = null) {

      if (addr) {
        this.editingAddressId = addr?.id;
        this.addressForm = { ...addr };
        this.showAddressDialog = true;

      } else {
        this.showAddressDialog = true;
        this.addressForm = { ...addr };


      }
    },
    closeEditDialog() {
      this.showAddressDialog = false;
      this.editingAddressId = null;
      this.addressForm = {
        building_name: '',
        floor_number: '',
        apartment_number: '',
        postal_code: '',
        landmark: '',
        city_id: '',
        country_id: ''
      };
    },
    async saveAddress(addressId) {
      
      if (addressId == null || addressId == undefined) { 
          this.addAddress()
          return;
      }
      try {
        
        
        const response = await axios.post(`api/address/${addressId}`, this.addressForm, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
         ElNotification({
          title: this.$t('success'),
          message: this.$t('profile.editAddressSuccess'),
          type: 'success',
        })
         // Re-fetch the user profile for full sync
        await this.fetchUserProfile();

        // Wait a short moment to ensure UI updates, then close the dialog
          this.closeEditDialog();
        
        this.addressSuccess = true;
        
        
        
        // const updatedAddress = response.data.data;
        // const idx = this.user.address.findIndex(a => a.id === addressId);

        // if (idx !== -1) {
        //   // Update existing address
        //   this.$set(this.user.address, idx, updatedAddress);
        // } else {
        //   // Add new address
        //   this.user.address.push(updatedAddress);
        // }

        

       
      } catch (err) {
       
         ElNotification({
          title: this.$t('error'),
          message:this.$t('profile.errorEditing'),
          type: 'error',
        })
        this.closeEditDialog();
      }
    },
    async addAddress(){
      
      try{
    
        const addressData ={
          user_id: this.user.id,
          building_name: this.addressForm.building_name,
        floor_number: this.addressForm.floor_number,
        apartment_number: this.addressForm.apartment_number,
        postal_code: this.addressForm.postal_code,
        landmark: this.addressForm.landmark,
        city_id: this.addressForm.city_id,
        country_id: this.addressForm.country_id
        };
       
        const response = await axios.post('https://massagebackend.webenia.org/api/address', addressData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        this.closeEditDialog();
         ElNotification({
          title: this.$t('success'),
          message: this.$t('profile.addSuccess'),
          type: 'success',
        })
        this.fetchUserProfile();
      }catch(error){
         ElNotification({
          title: this.$t('error'),
          message:this.$t('profile.errorAdding'),
          type: 'error',
        })
        throw error;
        
      }


    },

    async resetPassword() {
      this.resetPasswordError = null;
      this.resetPasswordSuccess = null;

      if (this.password !== this.password_confirmation) {
        this.resetPasswordError = this.$t('profile.passwordsDoNotMatch');
        return;
      }
      if (this.password.length < 8) {
        this.resetPasswordError = this.$t('profile.passwordTooShort');
        return;
      }

      this.resetPasswordLoading = true;
      try {
        const response = await axios.post('api/reset-password', {
          email: this.user.email,
          password: this.password,
          password_confirmation: this.password_confirmation
        });

        if (response.data.status && response.data.data) {
          this.resetPasswordSuccess = response.data.message || this.$t('profile.passwordResetSuccess');
          setTimeout(() => {
            this.showResetPasswordModal = false;
            this.password = '';
            this.password_confirmation = '';
          }, 1500);
        } else {
          this.resetPasswordError = response.data.message || this.$t('profile.passwordResetFailed');
        }
      } catch (err) {
        this.resetPasswordError = err.response?.data?.message || this.$t('profile.passwordResetFailed');
      } finally {
        this.resetPasswordLoading = false;
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


    async fetchCities(id) {
     
      this.countryLoading = true;
      try {
        const response = await axios.get(`https://massagebackend.webenia.org/api/countries/${id}`);

        this.cities = response.data.data.original.data.cities;
    
     
       

      } catch (error) {
        console.error('Failed to fetch cities:', error);

        this.cities = [];
        this.countryLoading = false;
      }
      finally {
        this.countryLoading = false;
      }

    },
    async fetchUserProfile() {
      try {
        const response = await axios.get('api/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        this.user = response.data.data.user;
       
        
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch profile';
      } finally {
        this.loading = false;
      }
    },
    openDeleteDialog(addr) {
      this.addressToDelete = addr;
      this.showDeleteDialog = true;
    },
    async confirmDeleteAddress() {
      if (!this.addressToDelete) return;
      try {
        await axios.delete(`api/address/${this.addressToDelete.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        this.user.address = this.user.address.filter(a => a.id !== this.addressToDelete.id);
        this.showDeleteDialog = false;
        this.showDeleteSuccess = true;
        this.addressToDelete = null;
      } catch (err) {
        const errorMessage = err?.response?.data?.message || this.$t('profile.errorDeletingAddress') || 'Failed to delete address';
        this.$toast?.error(errorMessage);
        this.showDeleteDialog = false;
        this.addressToDelete = null;
      }
    },

  },


  async created() {
    // Fetch user profile data
    await this.fetchUserProfile();

    // Fetch countries for address form
    await this.fetchCountries();
    await this.fetchCities(this.user.country_id);
   
 
   
    // If user has address, fetch cities for the first country
    // if (this.user.address && this.user.address.length > 0) {
    //   const firstCountryId = this.user.address[0].country_id || this.user.address[0].country?.id;
    //   if (firstCountryId) {
    //     await this.fetchCities(firstCountryId);
    //   }
    // } else {
    //   this.cities = [];
    // }


  },
  
  async mounted() {
    // Fetch countries when component is mounted
    // await this.fetchCountries();

    
  }
};
</script>

<style scoped>
.profile-outer {
  min-height: 100vh;
  background: var(--background-color-base, #F4F4F8);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.profile-loading,
.profile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  color: var(--el-color-primary, #232946);
  font-size: 1.2em;
}

.loader {
  border: 4px solid #eee;
  border-top: 4px solid var(--el-color-primary, #232946);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow-y: auto;
  height: 100vh;
}

.modal-dialog-centered {
  max-width: 600px;
  width: 100%;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.profile-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(35, 41, 70, 0.08);
  max-width: 480px;
  width: 100%;
  padding: 32px 28px 28px 28px;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--el-color-primary-light-9, #B8C1EC);
  padding-bottom: 18px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9, #B8C1EC);
  color: var(--el-color-primary, #232946);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2em;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(35, 41, 70, 0.08);
}

.user-info h1 {
  margin: 0;
  font-size: 1.5em;
  color: var(--el-color-primary, #232946);
}

.user-role {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 14px;
  background: var(--el-accent-color, #E9B949);
  color: #fff;
  border-radius: 12px;
  font-size: 0.95em;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.reset-password-btn {
  margin-left: auto;
  background: var(--el-color-primary, #232946);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.reset-password-btn:hover {
  background: var(--el-color-primary-dark, #121629);
}

.profile-details {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 1.05em;
}

.detail-row span:first-child {
  color: var(--el-text-color-secondary, #4A4E69);
  font-weight: 500;
}

.detail-row span:last-child {
  color: var(--el-text-color-primary, #232946);
}

.address-block {
  margin-top: 18px;
  background: var(--el-color-primary-light-9, #B8C1EC);
  border-radius: 10px;
  padding: 14px 16px;
}

.address-block h3 {
  margin: 0 0 10px 0;
  color: var(--el-color-primary, #232946);
  font-size: 1.1em;
  font-weight: 600;
}

.address-details .detail-row {
  border-bottom: none;
  padding: 4px 0;
  font-size: 0.98em;
}

/* Modal styles for address editing */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2em;
  border-radius: 10px;
  min-width: 300px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.edit-btn {
  margin-left: 1em;
  background: #eee;
  border: none;
  border-radius: 4px;
  padding: 2px 10px;
  cursor: pointer;
}

.edit-btn:hover {
  background: #ccc;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.3em;
  color: #232946;
}

.form-group input {
  padding: 0.5em 0.7em;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  background: #f8f9fa;
  transition: border 0.2s;
}

.form-group input:focus {
  border-color: #8b6b3d;
  outline: none;
}

.modal-actions {
  display: flex;
  gap: 1em;
  margin-top: 1em;
  justify-content: flex-end;
}

.btn-primary {
  background: #8b6b3d;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5em 1.5em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #725932;
}

.btn-secondary {
  background: #fff;
  color: #8b6b3d;
  border: 1px solid #8b6b3d;
  border-radius: 4px;
  padding: 0.5em 1.5em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-secondary:hover {
  background: #f8f9fa;
  color: #725932;
}

.success-message {
  display: flex;
  align-items: center;
  color: #28a745;
  font-weight: 500;
  margin-top: 1em;
  font-size: 1.1em;
  justify-content: center;
}

@media (max-width: 600px) {
  .profile-outer {
    padding: 16px 0;
  }

  .profile-card {
    max-width: 100%;
    padding: 18px 8px 16px 8px;
    margin-top: 16px;
    border-radius: 10px;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding-bottom: 10px;
  }

  .avatar {
    width: 48px;
    height: 48px;
    font-size: 1.3em;
  }

  .user-info h1 {
    font-size: 1.1em;
  }

  .reset-password-btn {
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
    justify-content: center;
    padding: 8px 0;
  }

  .profile-details {
    gap: 6px;
  }

  .detail-row {
    font-size: 0.98em;
    flex-direction: column;
    gap: 2px;
    padding: 6px 0;
  }

  .address-block {
    padding: 8px 6px;
    border-radius: 6px;
  }

  .address-block h3 {
    font-size: 1em;
  }
}

@media (max-width: 400px) {
  .profile-card {
    padding: 8px 2px 8px 2px;
  }
}
</style>
