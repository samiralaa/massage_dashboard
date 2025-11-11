import axios from 'axios'


const API_URL = 'https://backend.msgperfumes.com'
const IMAGE_BASE_URL = 'https://backend.msgperfumes.com'


const state = {
  items: [],
  loading: false,
  error: null
}

const mutations = {
  SET_CATEGORIES(state, categories) {
    state.items = categories
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async fetchWebsiteCategories({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      const response = await axios.get(`${API_URL}/api/categories/website/homepage`)

      if (response.data?.status && response.data?.data) {
        const categories = Array.isArray(response.data.data) ? response.data.data : [response.data.data]
        const transformedCategories = categories.map(category => ({
          id: category.id,
          name: category.name_en,
          name_ar: category.name_ar,
          description: category.description_en,
          description_ar: category.description_ar,
          image: category.images?.[0]?.path ? `${IMAGE_BASE_URL}/${category.images[0].path}` : null,
          created_at: category.created_at,
          updated_at: category.updated_at
        }))

        commit('SET_CATEGORIES', transformedCategories)
        return transformedCategories
      } else {
        throw new Error(response.data?.message || 'Failed to fetch website categories')
      }
    } catch (error) {
      console.error('Fetch website categories error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch website categories'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  getWebsiteCategories: state => state.items,
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