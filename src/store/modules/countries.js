export default {
  namespaced: true,
  state: {
    countries: [],
    selectedCountry: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_COUNTRIES(state, countries) {
      state.countries = countries
    },
    SET_SELECTED_COUNTRY(state, country) {
      state.selectedCountry = country
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchCountries({ commit }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const response = await this._vm.$axios.get('/api/countries')
        const countries = response.data.data || []
        
        commit('SET_COUNTRIES', countries)
        return countries
      } catch (error) {
        console.error('Fetch countries error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch countries'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    setSelectedCountry({ commit }, country) {
      commit('SET_SELECTED_COUNTRY', country)
    }
  },
  getters: {
    getCountries: state => state.countries,
    getSelectedCountry: state => state.selectedCountry,
    getCountriesLoading: state => state.loading,
    getCountriesError: state => state.error,
    getCountriesForSelect: state => {
      return state.countries.map(country => ({
        value: country.id,
        label: country.name_en,
        label_ar: country.name_ar
      }))
    }
  }
} 