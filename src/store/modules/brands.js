import axios from 'axios'


const API_URL = 'https://backend.msgperfumes.com'
const IMAGE_BASE_URL = 'https://backend.msgperfumes.com'


const state = {
  items: [],
  loading: false,
  error: null
}

const mutations = {
  SET_BRANDS(state, brands) {
    state.items = brands
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ADD_BRAND(state, brand) {
    state.items.push(brand)
  },
  UPDATE_BRAND(state, updatedBrand) {
    const index = state.items.findIndex(b => b.id === updatedBrand.id)
    if (index !== -1) {
      state.items.splice(index, 1, updatedBrand)
    }
  },
  REMOVE_BRAND(state, brandId) {
    state.items = state.items.filter(b => b.id !== brandId)
  }
}

const actions = {
  async fetchBrands({ commit, rootState }) {
    try {
      if (!rootState.token) {
        throw new Error('Authentication required')
      }

      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const tokenData = JSON.parse(localStorage.getItem('tokenData'))
      if (tokenData?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
      }
      
      const response = await axios.get(`${API_URL}/api/brands`)
      
      if (response.data?.status && response.data?.data) {
        const transformedBrands = response.data.data.map(brand => ({
          id: brand.id,
          name: brand.name_en,
          name_ar: brand.name_ar,
          description: brand.description_en,
          description_ar: brand.description_ar,
          logo: brand.images?.[0]?.path ? `${IMAGE_BASE_URL}/${brand.images[0].path}` : null,
          created_at: brand.created_at,
          updated_at: brand.updated_at,
          deleted_at: brand.deleted_at
        }))
        
        commit('SET_BRANDS', transformedBrands)
        return transformedBrands
      } else {
        throw new Error(response.data?.message || 'Failed to fetch brands')
      }
    } catch (error) {
      console.error('Fetch brands error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch brands'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createBrand({ commit, rootState }, brandData) {
    try {
      if (!rootState.token) {
        throw new Error('Authentication required')
      }

      commit('SET_LOADING', true)
      const formData = new FormData()
      formData.append('name_en', brandData.name)
      formData.append('name_ar', brandData.name_ar)
      formData.append('description_en', brandData.description)
      formData.append('description_ar', brandData.description_ar)
      if (brandData.logo) {
        formData.append('logo', brandData.logo)
      }
      
      const response = await axios.post(`${API_URL}/api/brands`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data?.status && response.data?.data) {
        const transformedBrand = {
          id: response.data.data.id,
          name: response.data.data.name_en,
          name_ar: response.data.data.name_ar,
          description: response.data.data.description_en,
          description_ar: response.data.data.description_ar,
          logo: response.data.data.images?.[0]?.path ? `${IMAGE_BASE_URL}/${response.data.data.images[0].path}` : null,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
          deleted_at: response.data.data.deleted_at
        }
        
        commit('ADD_BRAND', transformedBrand)
        return transformedBrand
      } else {
        throw new Error(response.data?.message || 'Failed to create brand')
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateBrand({ commit, rootState }, { id, ...brandData }) {
    try {
      if (!rootState.token) {
        throw new Error('Authentication required')
      }

      commit('SET_LOADING', true)
      const formData = new FormData()
      formData.append('name_en', brandData.name)
      formData.append('name_ar', brandData.name_ar)
      formData.append('description_en', brandData.description)
      formData.append('description_ar', brandData.description_ar)
      if (brandData.logo) {
        formData.append('logo', brandData.logo)
      }
      
      const response = await axios.put(`${API_URL}/api/brands/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data?.status && response.data?.data) {
        const transformedBrand = {
          id: response.data.data.id,
          name: response.data.data.name_en,
          name_ar: response.data.data.name_ar,
          description: response.data.data.description_en,
          description_ar: response.data.data.description_ar,
          logo: response.data.data.images?.[0]?.path ? `${IMAGE_BASE_URL}/${response.data.data.images[0].path}` : null,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
          deleted_at: response.data.data.deleted_at
        }
        
        commit('UPDATE_BRAND', transformedBrand)
        return transformedBrand
      } else {
        throw new Error(response.data?.message || 'Failed to update brand')
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteBrand({ commit, rootState }, brandId) {
    try {
      if (!rootState.token) {
        throw new Error('Authentication required')
      }

      commit('SET_LOADING', true)
      const response = await axios.delete(`${API_URL}/api/brands/${brandId}`)
      
      if (response.data?.status) {
        commit('REMOVE_BRAND', brandId)
      } else {
        throw new Error(response.data?.message || 'Failed to delete brand')
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  getBrands: state => state.items,
  isLoading: state => state.loading,
  getError: state => state.error
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}